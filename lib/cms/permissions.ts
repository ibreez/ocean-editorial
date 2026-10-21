import type { EditorialRole, CmsArticleStatus, EditorialUser, CmsArticle } from "@/types/cms";
import { canTransitionWorkflow } from "@/types/cms";

export type CmsPermission =
  | "articles:create"
  | "articles:edit_own"
  | "articles:edit_any"
  | "articles:submit_review"
  | "articles:publish"
  | "articles:archive"
  | "articles:delete"
  | "articles:set_breaking"
  | "articles:set_featured"
  | "users:view"
  | "users:manage"
  | "users:assign_role"
  | "audit:view";

export const ROLE_PERMISSIONS: Record<EditorialRole, Set<CmsPermission>> = {
  admin: new Set([
    "articles:create",
    "articles:edit_own",
    "articles:edit_any",
    "articles:submit_review",
    "articles:publish",
    "articles:archive",
    "articles:delete",
    "articles:set_breaking",
    "articles:set_featured",
    "users:view",
    "users:manage",
    "users:assign_role",
    "audit:view",
  ]),
  editor: new Set([
    "articles:create",
    "articles:edit_own",
    "articles:edit_any",
    "articles:submit_review",
    "articles:publish",
    "articles:archive",
    "articles:set_breaking",
    "articles:set_featured",
    "users:view",
  ]),
  journalist: new Set([
    "articles:create",
    "articles:edit_own",
    "articles:submit_review",
  ]),
};

/**
 * Checks if a specific role possesses a required permission.
 */
export function hasPermission(role: EditorialRole, permission: CmsPermission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.has(permission) : false;
}

export interface WorkflowAuthorizationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Enforces role-based rules on editorial workflow state transitions.
 * - Journalists: can transition draft -> in_review only; cannot publish or archive.
 * - Editors: can review, schedule, publish, or archive.
 * - Admins: full transition authority adhering to valid state machine rules.
 */
export function authorizeWorkflowTransition(
  role: EditorialRole,
  currentStatus: CmsArticleStatus,
  targetStatus: CmsArticleStatus,
  options?: { isCreator?: boolean; isBreakingRequested?: boolean }
): WorkflowAuthorizationResult {
  // 1. Check if the transition is structurally valid in the state machine
  if (!canTransitionWorkflow(currentStatus, targetStatus)) {
    return {
      allowed: false,
      reason: `ޤަވާޢިދާ ޚިލާފު ޙާލަތު ބަދަލުވުމެއް: "${currentStatus}" އިން "${targetStatus}" އަށް ބަދަލެއް ނުކުރެވޭނެ.`,
    };
  }

  const isCreator = options?.isCreator ?? true;
  const isBreakingRequested = options?.isBreakingRequested ?? false;

  // 2. Role-specific constraints
  if (role === "journalist") {
    // Journalists cannot edit articles they do not own
    if (!isCreator) {
      return {
        allowed: false,
        reason: "އެހެން ލިޔުންތެރިންގެ ޚަބަރުތަކަށް ބަދަލު ގެނައުމުގެ ހުއްދައެއް ނޫސްވެރިޔާއަކަށް ނޯންނާނެއެވެ.",
      };
    }

    // Journalists cannot directly publish
    if (targetStatus === "published") {
      return {
        allowed: false,
        reason: "ޚަބަރު ސީދާ ޝާއިޢުކުރުމުގެ ހުއްދަ ނޫސްވެރިންނަކަށް ނޯންނާނެއެވެ. އެޑިޓަރުންގެ ރިވިއުއަށް ފޮނުއްވާށެވެ.",
      };
    }

    // Journalists cannot schedule or archive
    if (targetStatus === "scheduled" || targetStatus === "archived") {
      return {
        allowed: false,
        reason: "ޚަބަރު ޝެޑިއުލް ނުވަތަ އާކައިވް ކުރެވޭނީ ހަމައެކަނި އެޑިޓަރުންނާއި އެޑްމިނިސްޓްރޭޓަރުންނަށެވެ.",
      };
    }

    // Journalists cannot toggle breaking news
    if (isBreakingRequested) {
      return {
        allowed: false,
        reason: "ބްރޭކިންގ ނިއުސް ކަނޑައެޅުމުގެ ހުއްދަ ނޫސްވެރިންނަކަށް ނޯންނާނެއެވެ.",
      };
    }

    return { allowed: true };
  }

  if (role === "editor") {
    // Editors have authority over review, scheduled, published, and archived states
    return { allowed: true };
  }

  if (role === "admin") {
    return { allowed: true };
  }

  return { allowed: false, reason: "ހުއްދަ ނެތް ރޯލެއް." };
}

/**
 * Determines whether a user is authorized to view a specific article in the CMS.
 * - Admin & Editor: Full visibility across all editorial content.
 * - Journalist: Can view articles they created, plus published articles.
 */
export function canUserViewArticle(user: EditorialUser, article: CmsArticle): boolean {
  if (!user.isActive) return false;
  if (user.role === "admin" || user.role === "editor") return true;
  if (user.role === "journalist") {
    return article.createdBy === user.id || article.status === "published";
  }
  return false;
}

/**
 * Determines whether a user is authorized to edit a specific article in the CMS.
 * - Admin: Can edit any article in any state.
 * - Editor: Can edit any article.
 * - Journalist: Can only edit articles they created, and only when in draft or in_review state.
 */
export function canUserEditArticle(user: EditorialUser, article: CmsArticle): boolean {
  if (!user.isActive) return false;
  if (user.role === "admin" || user.role === "editor") return true;
  if (user.role === "journalist") {
    return (
      article.createdBy === user.id &&
      (article.status === "draft" || article.status === "in_review")
    );
  }
  return false;
}
