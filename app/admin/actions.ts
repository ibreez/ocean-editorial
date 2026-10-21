"use server";

import { cookies } from "next/headers";
import { requireServerAuth, getServerAuthSession } from "@/lib/cms/auth-boundary";
import { cmsRepository } from "@/lib/cms/repository";
import { isValidSlug } from "@/lib/input-validation";
import { authorizeWorkflowTransition, canUserEditArticle } from "@/lib/cms/permissions";
import {
  createSessionToken,
  verifySessionToken,
  CMS_SESSION_COOKIE,
  getCmsCookieOptions,
  getCmsClearCookieOptions,
  revokeSession,
  revokeAllUserSessions,
} from "@/lib/cms/session";
import { authRateLimiter } from "@/lib/cms/rate-limiter";
import { logAuditEvent, getRecentAuditLogs, type AuditEvent } from "@/lib/cms/audit";
import { authenticateOidcToken } from "@/lib/cms/oidc";
import type { CmsArticleStatus, EditorialRole, EditorialUser, CmsArticle, CmsArticleRevision } from "@/types/cms";

export interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  message: string;
  data?: T;
}

/**
 * Server Action: Sign in to newsroom CMS
 *
 * Production Invariants:
 * - In production, strictly requires a verified identity provider (OIDC/OAuth/SSO).
 * - Passwordless/unverified email simulation is strictly disabled in production.
 * - In staging/development, allowed only if ALLOW_STAGING_AUTH_BYPASS !== "false".
 * - Bounded rate limiting and security audit event logging.
 * - Issues cryptographically signed session cookie restricted to /admin.
 */
export async function signInAction(email: string): Promise<ActionResult<EditorialUser>> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return {
      success: false,
      error: "INVALID_EMAIL",
      message: "އީމެއިލް އެޑްރެސް ލިޔުއްވާށެވެ.",
    };
  }

  // 1. Production Fail-Closed Identity Verification Guard
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    logAuditEvent({
      eventType: "AUTH_FAILED",
      userEmail: cleanEmail,
      action: "signIn",
      outcome: "DENIED",
      details: {
        reason: "AUTH_PROVIDER_UNCONFIGURED",
        note: "Production requires an authorized identity provider (OIDC/OAuth/SSO) or verified credentials. Email-only simulation is strictly prohibited in production.",
      },
    });
    return {
      success: false,
      error: "AUTH_PROVIDER_UNCONFIGURED",
      message:
        "ޕްރޮޑަކްޝަން އެންވަޔަރަންމަންޓުގައި ސެކިއުރިޓީ އައިޑެންޓިޓީ ޕްރޮވައިޑަރ އެއް (OIDC/OAuth/SSO) ކޮންފިގަރ ކުރުން ލާޒިމެވެ. އީމެއިލް އެކަނި ޖަހައިގެން ލޮގިންވުމަކީ ޕްރޮޑަކްޝަންގައި މަނާކުރެވިފައިވާ ކަމެކެވެ.",
    };
  }

  // Staging bypass check
  if (process.env.ALLOW_STAGING_AUTH_BYPASS === "false") {
    return {
      success: false,
      error: "STAGING_AUTH_DISABLED",
      message: "ސްޓޭޖިންގ އޮތެންޓިކޭޝަން ބައިޕާސް ވަނީ ބަންދުކުރެވިފައި.",
    };
  }

  // 2. Rate Limiting Check (Defend against brute-force / credential stuffing)
  const rateLimitStatus = authRateLimiter.checkLimit(cleanEmail);
  if (!rateLimitStatus.allowed) {
    logAuditEvent({
      eventType: "AUTH_FAILED",
      userEmail: cleanEmail,
      action: "signIn",
      outcome: "DENIED",
      details: {
        reason: "RATE_LIMITED",
        retryAfterSeconds: rateLimitStatus.retryAfterSeconds,
      },
    });
    return {
      success: false,
      error: "RATE_LIMITED",
      message: `ގިނަ ފަހަރަށް ނާކާމިޔާބު މަސައްކަތްތަކެއް ކޮށްފައިވާތީ ވަގުތީގޮތުން ބަންދުކުރެވިއްޖެ. ${rateLimitStatus.retryAfterSeconds} ސިކުންތު ފަހުން އަލުން މަސައްކަތްކުރައްވާށެވެ.`,
    };
  }

  // 3. Lookup User in active repository
  const user = await cmsRepository.getEditorialUserByEmail(cleanEmail);
  if (!user || !user.isActive) {
    authRateLimiter.recordFailure(cleanEmail);
    logAuditEvent({
      eventType: "AUTH_FAILED",
      userEmail: cleanEmail,
      action: "signIn",
      outcome: "FAILURE",
      details: {
        reason: !user ? "ACCOUNT_NOT_FOUND" : "USER_DEACTIVATED",
      },
    });
    return {
      success: false,
      error: "ACCOUNT_NOT_FOUND",
      message: "އެޑިޓޯރިއަލް އެކައުންޓެއް ނުފެނުނު ނުވަތަ މި އެކައުންޓް ވަނީ ބަންދުކުރެވިފައި.",
    };
  }

  // 4. Reset rate limiter on success, create token with unique JTI, and set secure cookie
  authRateLimiter.recordSuccess(cleanEmail);
  const token = createSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(CMS_SESSION_COOKIE, token, getCmsCookieOptions());

  logAuditEvent({
    eventType: "AUTH_SIGN_IN",
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: "signIn",
    outcome: "SUCCESS",
    details: { mode: "STAGING_SIMULATION" },
  });

  return {
    success: true,
    message: "ކާމިޔާބުކަމާއެކު ލޮގިންވެއްޖެ.",
    data: user,
  };
}

/**
 * Server Action: Sign in using an authenticated OpenID Connect ID token
 * Enforces cryptographic verification of token claims against the configured OIDC provider.
 */
export async function signInWithOidcAction(
  idToken: string
): Promise<ActionResult<EditorialUser>> {
  if (!idToken || typeof idToken !== "string" || !idToken.trim()) {
    return {
      success: false,
      error: "INVALID_TOKEN",
      message: "އައިޑީ ޓޯކަން ފެންނާކަށް ނެތެވެ.",
    };
  }

  try {
    const user = await authenticateOidcToken(idToken.trim());

    // Issue signed session cookie
    const token = createSessionToken(user);
    const cookieStore = await cookies();
    cookieStore.set(CMS_SESSION_COOKIE, token, getCmsCookieOptions());

    logAuditEvent({
      eventType: "AUTH_SIGN_IN",
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: "signInWithOidc",
      outcome: "SUCCESS",
      details: {
        provider: "OIDC",
        issuer: process.env.AUTH_PROVIDER_ISSUER_URL,
      },
    });

    return {
      success: true,
      message: "ކާމިޔާބުކަމާއެކު SSO މެދުވެރިކޮށް ލޮގިންވެއްޖެ.",
      data: user,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "OIDC authentication failed";
    logAuditEvent({
      eventType: "AUTH_FAILED",
      action: "signInWithOidc",
      outcome: "DENIED",
      details: { reason: errorMsg },
    });

    return {
      success: false,
      error: "OIDC_AUTH_FAILED",
      message: `SSO މެދުވެރިކޮށް ލޮގިންނުވެވުނު: ${errorMsg}`,
    };
  }
}

/**
 * Server Action: Sign out of newsroom CMS
 * Explicitly revokes the session JTI and clears the cookie.
 */
export async function signOutAction(): Promise<ActionResult> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(CMS_SESSION_COOKIE)?.value;

  if (rawToken) {
    const payload = verifySessionToken(rawToken);
    if (payload?.jti) {
      revokeSession(payload.jti);
    }
  }

  const session = await getServerAuthSession();
  if (session.user) {
    logAuditEvent({
      eventType: "AUTH_SIGN_OUT",
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      action: "signOut",
      outcome: "SUCCESS",
    });
  }

  cookieStore.set(CMS_SESSION_COOKIE, "", getCmsClearCookieOptions());
  return {
    success: true,
    message: "ކާމިޔާބުކަމާއެކު ސައިން އައުޓްވެއްޖެ.",
  };
}

/**
 * Server Action: Save or Update Article Draft
 *
 * Full Server-Side Security & RBAC Enforcement:
 * 1. Checks verified caller session via requireServerAuth().
 * 2. Checks granular role permissions (articles:create, articles:publish, etc.).
 * 3. Enforces ownership: Journalists cannot edit other authors' drafts.
 * 4. Enforces workflow transitions: Journalists cannot publish directly.
 * 5. Validates input values (slug uniqueness, required titles).
 * 6. Logs workflow transitions and editorial edits to audit log.
 */
export async function saveArticleDraftAction(
  formData: FormData
): Promise<ActionResult<{ articleId: string }>> {
  // 1. Session verification & Base Role Check
  let caller: EditorialUser;
  try {
    caller = await requireServerAuth("saveArticleDraft", "articles:create");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Authentication required";
    logAuditEvent({
      eventType: "UNAUTHORIZED_ACCESS",
      action: "saveArticleDraft",
      outcome: "DENIED",
      details: { reason: errorMsg },
    });
    return {
      success: false,
      error: "AUTH_REQUIRED",
      message: `ރައްކާތެރިކަމުގެ ސަބަބުން މި އޮޕަރޭޝަން ވަނީ ބަންދުކުރެވިފައި: ${errorMsg}`,
    };
  }

  // 2. Extract inputs
  const articleId = (formData.get("articleId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const englishTitle = (formData.get("englishTitle") as string)?.trim() || undefined;
  const slug = (formData.get("slug") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const categorySlug = (formData.get("categorySlug") as string)?.trim();
  const authorSlug = (formData.get("authorSlug") as string)?.trim();
  const requestedStatus = (formData.get("status") as CmsArticleStatus) || "draft";
  const featured = formData.get("featured") === "true";
  const breaking = formData.get("breaking") === "true";
  const bodyText = (formData.get("bodyText") as string) || "";

  // 3. Validation
  if (!title) {
    return { success: false, error: "VALIDATION_ERROR", message: "ޚަބަރުގެ ސުރުޚީ ލިޔުއްވަންވާނެއެވެ." };
  }

  if (!isValidSlug(slug)) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      message: "ސްލަގް (Slug) ގައި ހިމެނޭނީ ހަމައެކަނި އިނގިރޭސި އަކުރާއި، ނަންބަރާއި، ހައިފަން އެކަންޏެވެ.",
    };
  }

  if (!summary) {
    return { success: false, error: "VALIDATION_ERROR", message: "ޚަބަރުގެ ޚުލާޞާ ލިޔުއްވަންވާނެއެވެ." };
  }

  // Split paragraphs for structured blocks
  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const bodyBlocks = paragraphs.map((text) => ({
    type: "paragraph" as const,
    text,
  }));

  // Resolve category and author
  const categoriesList = await cmsRepository.getCategories();
  const category = categoriesList.find((c) => c.slug === categorySlug) || categoriesList[0];

  const authorsList = await cmsRepository.getAuthors();
  const author = authorsList.find((au) => au.slug === authorSlug) || authorsList[0];

  // 4. Update vs Create Flow
  if (articleId) {
    // Editing Existing Article
    const existing = await cmsRepository.getArticleById(articleId);
    if (!existing) {
      return { success: false, error: "NOT_FOUND", message: "ޚަބަރު ފެންނާކަށް ނެތެވެ." };
    }

    const isCreator = existing.createdBy === caller.id;

    // RBAC: Check ownership and editability (Journalists can only edit own drafts/in-review articles)
    if (!canUserEditArticle(caller, existing)) {
      logAuditEvent({
        eventType: "UNAUTHORIZED_ACCESS",
        userId: caller.id,
        userEmail: caller.email,
        userRole: caller.role,
        action: "editArticleDraft",
        targetId: articleId,
        outcome: "DENIED",
        details: { reason: "OWNERSHIP_OR_STATUS_FORBIDDEN" },
      });
      return {
        success: false,
        error: "PERMISSION_DENIED",
        message: "މި ޚަބަރަށް ބަދަލު ގެނައުމުގެ ހުއްދައެއް ނެތެވެ.",
      };
    }

    // RBAC: Authorize workflow transition
    const authResult = authorizeWorkflowTransition(caller.role, existing.status, requestedStatus, {
      isCreator,
      isBreakingRequested: breaking,
    });

    if (!authResult.allowed) {
      logAuditEvent({
        eventType: "WORKFLOW_TRANSITION",
        userId: caller.id,
        userEmail: caller.email,
        userRole: caller.role,
        action: "transitionWorkflow",
        targetId: articleId,
        outcome: "DENIED",
        details: {
          currentStatus: existing.status,
          requestedStatus,
          reason: authResult.reason,
        },
      });
      return {
        success: false,
        error: "PERMISSION_DENIED",
        message: authResult.reason || "ޙާލަތު ބަދަލުކުރުމުގެ ހުއްދައެއް ނެތެވެ.",
      };
    }

    const updated = await cmsRepository.updateArticle(
      articleId,
      {
        title,
        englishTitle,
        slug,
        summary,
        body: bodyBlocks.length > 0 ? bodyBlocks : existing.body,
        categoryId: category.id,
        categorySlug: category.slug,
        categoryName: category.name,
        authorId: author.id,
        author: {
          name: author.name,
          englishName: author.englishName,
          slug: author.slug,
          role: author.role,
        },
        status: requestedStatus,
        featured: caller.role === "journalist" ? existing.featured : featured,
        breaking: caller.role === "journalist" ? existing.breaking : breaking,
        publishedAt: requestedStatus === "published" ? (existing.publishedAt || new Date().toISOString()) : undefined,
        revisionCount: existing.revisionCount,
      },
      caller,
      `Updated by ${caller.name} (${caller.role})`
    );

    logAuditEvent({
      eventType: existing.status !== requestedStatus ? "WORKFLOW_TRANSITION" : "ARTICLE_UPDATED",
      userId: caller.id,
      userEmail: caller.email,
      userRole: caller.role,
      action: "updateArticle",
      targetId: updated.id,
      outcome: "SUCCESS",
      details: {
        fromStatus: existing.status,
        toStatus: requestedStatus,
        slug: updated.slug,
      },
    });

    return {
      success: true,
      message: "ޚަބަރު ކާމިޔާބުކަމާއެކު އަދާހަމަކުރެވިއްޖެ.",
      data: { articleId: updated.id },
    };
  } else {
    // Creating New Article
    // Journalists cannot create articles directly in "published" status or with breaking news
    if (caller.role === "journalist") {
      if (requestedStatus === "published") {
        logAuditEvent({
          eventType: "UNAUTHORIZED_ACCESS",
          userId: caller.id,
          userEmail: caller.email,
          userRole: caller.role,
          action: "directPublish",
          outcome: "DENIED",
        });
        return {
          success: false,
          error: "PERMISSION_DENIED",
          message: "ސީދާ ޝާއިޢުކުރުމުގެ ހުއްދަ ނޫސްވެރިންނަކަށް ނޯންނާނެއެވެ. ޑްރާފްޓެއްގެ ގޮތުގައި ސޭވްކުރައްވާށެވެ.",
        };
      }
      if (breaking) {
        logAuditEvent({
          eventType: "UNAUTHORIZED_ACCESS",
          userId: caller.id,
          userEmail: caller.email,
          userRole: caller.role,
          action: "setBreakingNews",
          outcome: "DENIED",
        });
        return {
          success: false,
          error: "PERMISSION_DENIED",
          message: "ބްރޭކިންގ ނިއުސް ކަނޑައެޅުމުގެ ހުއްދަ ނޫސްވެރިންނަކަށް ނޯންނާނެއެވެ.",
        };
      }
    }

    const newArticle = await cmsRepository.createArticle(
      {
        slug,
        title,
        englishTitle,
        summary,
        englishSummary: undefined,
        body: bodyBlocks,
        categoryId: category.id,
        categorySlug: category.slug,
        categoryName: category.name,
        authorId: author.id,
        author: {
          name: author.name,
          englishName: author.englishName,
          slug: author.slug,
          role: author.role,
        },
        status: requestedStatus,
        featured: caller.role === "journalist" ? false : featured,
        breaking: caller.role === "journalist" ? false : breaking,
        tags: [],
        readTimeMinutes: Math.max(1, Math.round(paragraphs.join(" ").length / 500)),
        isOpinion: false,
        createdBy: caller.id,
        lastEditor: caller.id,
        publishedAt: requestedStatus === "published" ? new Date().toISOString() : undefined,
      },
      caller
    );

    logAuditEvent({
      eventType: "ARTICLE_CREATED",
      userId: caller.id,
      userEmail: caller.email,
      userRole: caller.role,
      action: "createArticle",
      targetId: newArticle.id,
      outcome: "SUCCESS",
      details: {
        status: requestedStatus,
        slug: newArticle.slug,
      },
    });

    return {
      success: true,
      message: "އައު ޑްރާފްޓް ކާމިޔާބުކަމާއެކު އުފެއްދިއްޖެ.",
      data: { articleId: newArticle.id },
    };
  }
}

/**
 * Server Action: Permanently Delete Article (Admin only)
 */
export async function deleteArticleAction(articleId: string): Promise<ActionResult> {
  let caller: EditorialUser;
  try {
    caller = await requireServerAuth("deleteArticle", "articles:delete");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Authentication required";
    logAuditEvent({
      eventType: "UNAUTHORIZED_ACCESS",
      action: "deleteArticle",
      targetId: articleId,
      outcome: "DENIED",
      details: { reason: errorMsg },
    });
    return {
      success: false,
      error: "PERMISSION_DENIED",
      message: `މި އޮޕަރޭޝަން ކުރުމުގެ ހުއްދައެއް ނެތެވެ: ${errorMsg}`,
    };
  }

  const success = await cmsRepository.deleteArticle(articleId, caller);
  logAuditEvent({
    eventType: "ARTICLE_DELETED",
    userId: caller.id,
    userEmail: caller.email,
    userRole: caller.role,
    action: "deleteArticle",
    targetId: articleId,
    outcome: success ? "SUCCESS" : "FAILURE",
  });

  return {
    success,
    message: success ? "ޚަބަރު ކާމިޔާބުކަމާއެކު ފޮހެލެވިއްޖެ." : "ޚަބަރު ފޮހެނުލެވުނު.",
  };
}

/**
 * Server Action: Assign User Role (Admin only)
 * Defends against privilege escalation: Administrators cannot demote themselves.
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: EditorialRole
): Promise<ActionResult<EditorialUser>> {
  let caller: EditorialUser;
  try {
    caller = await requireServerAuth("updateUserRole", "users:assign_role");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Authentication required";
    logAuditEvent({
      eventType: "UNAUTHORIZED_ACCESS",
      action: "updateUserRole",
      targetId: targetUserId,
      outcome: "DENIED",
      details: { reason: errorMsg },
    });
    return {
      success: false,
      error: "PERMISSION_DENIED",
      message: `ހުއްދަ ނެތް އޮޕަރޭޝަނެއް: ${errorMsg}`,
    };
  }

  // Prevent admin from demoting their own account
  if (caller.id === targetUserId && newRole !== "admin") {
    logAuditEvent({
      eventType: "ROLE_CHANGED",
      userId: caller.id,
      userEmail: caller.email,
      userRole: caller.role,
      action: "selfDemoteAttempt",
      targetId: targetUserId,
      outcome: "DENIED",
      details: { reason: "CANNOT_DEMOTE_SELF" },
    });
    return {
      success: false,
      error: "PRIVILEGE_VIOLATION",
      message: "އެޑްމިނިސްޓްރޭޓަރުންނަށް އަމިއްލަ އެކައުންޓުގެ ރޯލް ދަށްކުރުމުގެ ހުއްދައެއް ނޯންނާނެއެވެ.",
    };
  }

  try {
    const updatedUser = await cmsRepository.updateUserRole(targetUserId, newRole, caller);
    // Promptly revoke any active sessions for the user so role changes take effect immediately
    revokeAllUserSessions(targetUserId);

    logAuditEvent({
      eventType: "ROLE_CHANGED",
      userId: caller.id,
      userEmail: caller.email,
      userRole: caller.role,
      action: "updateUserRole",
      targetId: targetUserId,
      outcome: "SUCCESS",
      details: { newRole },
    });
    return {
      success: true,
      message: `ޔޫޒަރގެ ރޯލް ${newRole} އަށް ބަދަލުކުރެވިއްޖެ.`,
      data: updatedUser,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: "UPDATE_FAILED",
      message: err instanceof Error ? err.message : "ރޯލް ބަދަލުނުކުރެވުނު.",
    };
  }
}

/**
 * Server Action: Toggle User Active Status (Admin only)
 * Defends against self-deactivation lockout and immediately revokes deactivated sessions.
 */
export async function toggleUserStatusAction(
  targetUserId: string,
  isActive: boolean
): Promise<ActionResult<EditorialUser>> {
  let caller: EditorialUser;
  try {
    caller = await requireServerAuth("toggleUserStatus", "users:manage");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Authentication required";
    return {
      success: false,
      error: "PERMISSION_DENIED",
      message: `ހުއްދަ ނެތް އޮޕަރޭޝަނެއް: ${errorMsg}`,
    };
  }

  if (caller.id === targetUserId && !isActive) {
    return {
      success: false,
      error: "PRIVILEGE_VIOLATION",
      message: "އެޑްމިނިސްޓްރޭޓަރުންނަށް އަމިއްލަ އެކައުންޓް ބަންދު (Deactivate) އެއް ނުކުރެވޭނެއެވެ.",
    };
  }

  try {
    const updatedUser = await cmsRepository.updateUserStatus(targetUserId, isActive, caller);

    // If deactivated, immediately revoke all existing sessions to terminate access
    if (!isActive) {
      revokeAllUserSessions(targetUserId);
    }

    logAuditEvent({
      eventType: "ROLE_CHANGED",
      userId: caller.id,
      userEmail: caller.email,
      userRole: caller.role,
      action: isActive ? "activateUser" : "deactivateUser",
      targetId: targetUserId,
      outcome: "SUCCESS",
      details: { isActive },
    });
    return {
      success: true,
      message: isActive ? "އެކައުންޓް އެކްޓިވޭޓް ކުރެވިއްޖެ." : "އެކައުންޓް ބަންދުކުރެވިއްޖެ.",
      data: updatedUser,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: "UPDATE_FAILED",
      message: err instanceof Error ? err.message : "ސްޓޭޓަސް ބަދަލުނުކުރެވުނު.",
    };
  }
}

/**
 * Server Action: Retrieve Recent Audit Logs (Admin only)
 * Enforces dedicated "audit:view" permission.
 */
export async function getAuditLogsAction(): Promise<ActionResult<AuditEvent[]>> {
  try {
    await requireServerAuth("getAuditLogs", "audit:view");
    const logs = await getRecentAuditLogs(50);
    return {
      success: true,
      message: "އޮޑިޓް ލޮގްސް ލިބިއްޖެ.",
      data: logs,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
      message: err instanceof Error ? err.message : "ހުއްދަ ނެތް.",
    };
  }
}

/**
 * Server Action: Retrieve Article Revision History
 * Enforces caller authentication and journalist ownership restrictions.
 */
export async function getArticleRevisionsAction(
  articleId: string
): Promise<ActionResult<CmsArticleRevision[]>> {
  let caller: EditorialUser;
  try {
    caller = await requireServerAuth("getArticleRevisions");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Authentication required";
    return {
      success: false,
      error: "AUTH_REQUIRED",
      message: errorMsg,
    };
  }

  try {
    const revisions = await cmsRepository.getArticleRevisions(articleId, caller);
    return {
      success: true,
      message: "ރިވިޝަން ތާރީޚް ލިބިއްޖެ.",
      data: revisions,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
      message: err instanceof Error ? err.message : "ރިވިޝަންތައް ބެލުމުގެ ހުއްދައެއް ނެތެވެ.",
    };
  }
}

/**
 * Server Action: Check Slug Uniqueness (Safe query)
 */
export async function checkSlugAvailabilityAction(
  slug: string,
  excludeId?: string
): Promise<{ isAvailable: boolean; isValid: boolean }> {
  if (!isValidSlug(slug)) {
    return { isAvailable: false, isValid: false };
  }

  const isAvailable = await cmsRepository.isSlugAvailable(slug, excludeId);
  return { isAvailable, isValid: true };
}
