/**
 * Audit Logging Service for Ocean Editorial CMS
 *
 * Implements centralized security and editorial event tracking:
 * - Records sign-in, sign-out, role assignments, workflow transitions, and unauthorized attempts.
 * - Enforces zero-credential logging: Never logs passwords, tokens, or private secrets.
 * - Dual persistence: Persists to PostgreSQL when configured, with bounded in-memory buffer fallback.
 */

import { isDatabaseConfigured, query } from "@/lib/cms/db";

export type AuditEventType =
  | "AUTH_SIGN_IN"
  | "AUTH_SIGN_OUT"
  | "AUTH_FAILED"
  | "ROLE_CHANGED"
  | "WORKFLOW_TRANSITION"
  | "ARTICLE_CREATED"
  | "ARTICLE_UPDATED"
  | "ARTICLE_DELETED"
  | "UNAUTHORIZED_ACCESS";

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  targetId?: string;
  outcome: "SUCCESS" | "DENIED" | "FAILURE";
  details?: Record<string, string | number | boolean | null | undefined>;
}

// Bounded in-memory audit log ring buffer (last 200 events)
const MAX_AUDIT_EVENTS = 200;
const auditEvents: AuditEvent[] = [];

/**
 * Strips any sensitive keywords from details before logging.
 */
function sanitizeDetails(
  details?: Record<string, unknown>
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (!details) return undefined;

  const sanitized: Record<string, string | number | boolean | null | undefined> = {};
  const sensitiveKeys = ["token", "secret", "password", "cookie", "key", "authorization"];

  for (const [key, value] of Object.entries(details)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "[REDACTED]";
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      sanitized[key] = value;
    } else {
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

export function logAuditEvent(
  event: Omit<AuditEvent, "id" | "timestamp" | "details"> & {
    details?: Record<string, unknown>;
  }
): AuditEvent {
  const auditRecord: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    eventType: event.eventType,
    userId: event.userId,
    userEmail: event.userEmail,
    userRole: event.userRole,
    action: event.action,
    targetId: event.targetId,
    outcome: event.outcome,
    details: sanitizeDetails(event.details),
  };

  auditEvents.unshift(auditRecord);

  // Bound array size
  if (auditEvents.length > MAX_AUDIT_EVENTS) {
    auditEvents.pop();
  }

  // Safe structured console output
  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[CMS_AUDIT] ${auditRecord.timestamp} | ${auditRecord.eventType} | ${auditRecord.outcome} | ${auditRecord.userEmail || "anonymous"} | ${auditRecord.action}`
    );
  }

  // Persist to PostgreSQL if configured (non-blocking)
  if (isDatabaseConfigured()) {
    const insertSql = `
      INSERT INTO security_audit_logs (
        event_type, user_email, user_role, action, target_id, outcome, details, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    query(insertSql, [
      auditRecord.eventType,
      auditRecord.userEmail || null,
      auditRecord.userRole || null,
      auditRecord.action,
      auditRecord.targetId || null,
      auditRecord.outcome,
      auditRecord.details ? JSON.stringify(auditRecord.details) : null,
      new Date(auditRecord.timestamp),
    ]).catch((err) => {
      // Non-fatal: do not crash caller if audit table is pending migration
      console.warn("[CMS_AUDIT_DB_WARN] Could not persist audit event to PostgreSQL:", err.message);
    });
  }

  return auditRecord;
}

export async function getRecentAuditLogs(limit: number = 50): Promise<AuditEvent[]> {
  if (isDatabaseConfigured()) {
    try {
      const sql = `
        SELECT
          id, timestamp, event_type, user_id, user_email,
          user_role, action, target_id, outcome, details
        FROM security_audit_logs
        ORDER BY timestamp DESC
        LIMIT $1;
      `;
      const res = await query<{
        id: string;
        timestamp: Date;
        event_type: AuditEventType;
        user_id: string | null;
        user_email: string | null;
        user_role: string | null;
        action: string;
        target_id: string | null;
        outcome: "SUCCESS" | "DENIED" | "FAILURE";
        details: Record<string, string | number | boolean | null | undefined> | null;
      }>(sql, [limit]);

      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          timestamp: new Date(r.timestamp).toISOString(),
          eventType: r.event_type,
          userId: r.user_id || undefined,
          userEmail: r.user_email || undefined,
          userRole: r.user_role || undefined,
          action: r.action,
          targetId: r.target_id || undefined,
          outcome: r.outcome,
          details: r.details || undefined,
        }));
      }
    } catch {
      // Fallback to in-memory audit logs if table is pending migration
    }
  }

  return auditEvents.slice(0, Math.min(limit, MAX_AUDIT_EVENTS));
}
