import { cookies } from "next/headers";
import type { EditorialUser, EditorialRole } from "@/types/cms";
import type { CmsPermission } from "@/lib/cms/permissions";
import { hasPermission } from "@/lib/cms/permissions";
import { CMS_SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/cms/session";
import { cmsRepository } from "@/lib/cms/repository";

export interface AuthSession {
  isAuthenticated: boolean;
  user: EditorialUser | null;
  reason?: "NO_SESSION" | "INVALID_SESSION" | "USER_DEACTIVATED" | "INSUFFICIENT_PERMISSIONS";
}

export class AuthRequiredError extends Error {
  constructor(
    message: string = "އޮތެންޓިކޭޝަން ބޭނުންވެއެވެ. ލޮގިންވެވަޑައިގަންނަވާށެވެ."
  ) {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class PermissionDeniedError extends Error {
  constructor(
    message: string = "މި އޮޕަރޭޝަން ފުރިހަމަކުރުމުގެ ހުއްދައެއް ތިޔަ ރޯލަކަށް ނެތެވެ."
  ) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

/**
 * Pure session verification and database freshness guard.
 * Verifies that the user exists in persistent storage, is active, and that
 * the session token claims match the fresh database role.
 */
export async function validateUserSession(
  payload: SessionPayload | null,
  userLookup: (userId: string) => Promise<EditorialUser | null> = (id) => cmsRepository.getEditorialUserById(id)
): Promise<AuthSession> {
  if (!payload) {
    return {
      isAuthenticated: false,
      user: null,
      reason: "INVALID_SESSION",
    };
  }

  // Verify user exists and is active in repository
  const user = await userLookup(payload.userId);
  if (!user || !user.isActive) {
    return {
      isAuthenticated: false,
      user: null,
      reason: "USER_DEACTIVATED",
    };
  }

  // Role freshness check: If the user's role was changed in the database,
  // the previous session token carrying the stale role is promptly invalidated.
  if (payload.role !== user.role) {
    return {
      isAuthenticated: false,
      user: null,
      reason: "INVALID_SESSION",
    };
  }

  return {
    isAuthenticated: true,
    user,
  };
}

/**
 * Validates the caller's server-side session from secure HTTP-only cookies.
 * Does not trust any client-supplied parameters or flags.
 */
export async function getServerAuthSession(): Promise<AuthSession> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      return {
        isAuthenticated: false,
        user: null,
        reason: "NO_SESSION",
      };
    }

    const payload = verifySessionToken(sessionCookie);
    return await validateUserSession(payload);
  } catch {
    // If called outside request context (e.g. build time or non-request environment)
    return {
      isAuthenticated: false,
      user: null,
      reason: "NO_SESSION",
    };
  }
}

/**
 * Server-Side Authorization Guard
 * Enforces identity verification and granular permission checks.
 * Throws AuthRequiredError or PermissionDeniedError on failure.
 */
export async function requireServerAuth(
  actionName: string,
  requiredPermission?: CmsPermission
): Promise<EditorialUser> {
  const session = await getServerAuthSession();

  if (!session.isAuthenticated || !session.user) {
    throw new AuthRequiredError(
      `Cannot execute "${actionName}": Server-side authentication is required. Please sign in to access editorial tools.`
    );
  }

  if (requiredPermission && !hasPermission(session.user.role, requiredPermission)) {
    throw new PermissionDeniedError(
      `Permission denied for "${actionName}": Role "${session.user.role}" does not hold the "${requiredPermission}" permission.`
    );
  }

  return session.user;
}

export function isCmsMutationPermitted(user: EditorialUser | null, permission: CmsPermission): boolean {
  if (!user || !user.isActive) return false;
  return hasPermission(user.role, permission);
}
