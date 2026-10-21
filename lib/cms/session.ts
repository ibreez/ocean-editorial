import crypto from "crypto";
import type { EditorialRole, EditorialUser } from "@/types/cms";

export interface SessionPayload {
  jti: string; // Cryptographically unique session identifier for revocation
  userId: string;
  email: string;
  name: string;
  dhivehiName?: string;
  role: EditorialRole;
  iat: number;
  exp: number;
}

export const CMS_SESSION_COOKIE = "cms_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

// Known insecure placeholder keys that MUST NEVER be accepted in production
const INSECURE_AUTH_SECRETS = new Set([
  "ocean-editorial-dev-auth-secret-key-32chars-min!!",
  "12345678901234567890123456789012",
  "change-me-to-a-secure-32-char-secret-in-production",
  "00000000000000000000000000000000",
  "abcdefghijklmnopqrstuvwxyz123456",
]);

/**
 * Validates and retrieves the HMAC secret key.
 * Strictly enforces that production environments have a dedicated, uncompromised 32+ char key.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (secret) {
    if (secret.length < 32) {
      throw new Error("AUTH_SECRET_INSUFFICIENT: AUTH_SECRET must be at least 32 characters long.");
    }
    if (isProduction && INSECURE_AUTH_SECRETS.has(secret)) {
      throw new Error(
        "AUTH_SECRET_INSECURE: Production cannot use default or known placeholder AUTH_SECRET values. Generate a high-entropy 32+ character key."
      );
    }
    return secret;
  }

  // Fail-closed in production
  if (isProduction) {
    throw new Error(
      "AUTH_SECRET_MISSING: AUTH_SECRET must be configured with at least 32 characters in production."
    );
  }

  return "ocean-editorial-dev-auth-secret-key-32chars-min!!";
}

// ============================================================================
// Session Revocation Store
// ============================================================================

// Revoked session tokens (jti) with revocation timestamp
const revokedJtis = new Map<string, number>();

// User-level revocation timestamp: any token issued BEFORE this timestamp is revoked
const userRevocationTimestamps = new Map<string, number>();

/**
 * Revokes a specific session by its unique JTI.
 */
export function revokeSession(jti: string): void {
  if (!jti) return;
  revokedJtis.set(jti, Date.now());

  // Prevent unbounded memory growth by pruning tokens older than max session age
  if (revokedJtis.size > 2000) {
    const cutoff = Date.now() - SESSION_MAX_AGE_SECONDS * 1000;
    for (const [id, ts] of revokedJtis.entries()) {
      if (ts < cutoff) revokedJtis.delete(id);
    }
  }
}

/**
 * Revokes ALL active sessions for a user (e.g. on deactivation, role change, or security alert).
 */
export function revokeAllUserSessions(userId: string): void {
  if (!userId) return;
  userRevocationTimestamps.set(userId, Math.floor(Date.now() / 1000));
}

/**
 * Checks whether a session token has been revoked.
 */
export function isSessionRevoked(jti: string, userId: string, iat: number): boolean {
  if (revokedJtis.has(jti)) {
    return true;
  }
  const userCutoff = userRevocationTimestamps.get(userId);
  if (userCutoff && iat <= userCutoff) {
    return true;
  }
  return false;
}

/**
 * Resets revocation stores (used for testing).
 */
export function resetRevocationStoreForTesting(): void {
  revokedJtis.clear();
  userRevocationTimestamps.clear();
}

/**
 * Creates a cryptographically signed session token:
 * payload_base64url.signature_base64url
 */
export function createSessionToken(user: EditorialUser): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID();

  const payload: SessionPayload = {
    jti,
    userId: user.id,
    email: user.email,
    name: user.name,
    dhivehiName: user.dhivehiName,
    role: user.role,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies the integrity, signature, revocation, and expiration of a session token.
 * Returns null if the token is missing, invalid, tampered, expired, or revoked.
 */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  if (!payloadStr || !signature) return null;

  try {
    const secret = getAuthSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadStr)
      .digest("base64url");

    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );

    // Validate payload fields
    if (!payload.userId || !payload.email || !payload.role || !payload.exp || !payload.iat) {
      return null;
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired session
    }

    // Check revocation (if token has jti)
    if (payload.jti && isSessionRevoked(payload.jti, payload.userId, payload.iat)) {
      return null; // Revoked session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns standardized, security-hardened cookie configuration.
 * Restricts cookie path strictly to `/admin`.
 */
export function getCmsCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction || process.env.COOKIE_SECURE === "true",
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Returns deletion cookie options matching the path and security domain.
 */
export function getCmsClearCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction || process.env.COOKIE_SECURE === "true",
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: 0,
  };
}
