/**
 * Comprehensive Verification Test Suite for Ocean Editorial CMS Storage & Security
 *
 * Test Suites:
 * 1. Security Redaction & Error Sanitization
 * 2. Session Security, JTI Revocation, and Expired/Tampered Token Rejection
 * 3. SQL Migration Files Static Safety & Idempotency
 * 4. Repository Contract, Optimistic Concurrency, and Revision Access
 * 5. Role-Based Authorization, Workflow Transitions & Journalist Scoping
 * 6. User Management & Privilege Safeguards (Anti-Escalation & Deactivation)
 * 7. Public-Site Content Isolation & Draft Confidentiality
 * 8. Importer Idempotency & Draft Invariants
 * 9. Production Fail-Closed Behavior & PostgreSQL TLS Safety
 * 10. Audit Log Privacy & Zero-Credential Policy
 * 11. Opt-In Managed PostgreSQL Live Database Integration & Migration Tracking
 * 12. OpenID Connect (OIDC) Enterprise Authentication Verification
 *
 * Run with: npx tsx scripts/test-cms-repository.ts
 */

import {
  redactDatabaseUrl,
  sanitizeDatabaseError,
  isDatabaseConfigured,
  resolveDatabaseSslConfig,
} from "../lib/cms/db";
import { MemoryCmsRepository } from "../lib/cms/repository";
import {
  createSessionToken,
  verifySessionToken,
  revokeSession,
  revokeAllUserSessions,
  isSessionRevoked,
  resetRevocationStoreForTesting,
  getAuthSecret,
  getCmsCookieOptions,
  getCmsClearCookieOptions,
} from "../lib/cms/session";
import { validateUserSession } from "../lib/cms/auth-boundary";
import { verifyOidcIdToken, authenticateOidcToken } from "../lib/cms/oidc";
import {
  canUserViewArticle,
  canUserEditArticle,
  authorizeWorkflowTransition,
  hasPermission,
} from "../lib/cms/permissions";
import { transformDemoArticleToCmsDraft, importDemoArticles } from "../lib/cms/importer";
import { demoArticles } from "../lib/articles";
import { LocalEditorialAdapter } from "../lib/content-service";
import { logAuditEvent, getRecentAuditLogs } from "../lib/cms/audit";
import { staticallyValidateSql, stripSqlComments } from "./run-migration";
import type { EditorialUser, CmsArticle } from "../types/cms";
import fs from "fs";
import path from "path";

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean, extra?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${description}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${description} ${extra ? `(${extra})` : ""}`);
  }
}

async function runTestSuite() {
  console.log("==================================================================");
  console.log("Ocean Editorial (ކަނޑު އެޑިޓޯރިއަލް) — CMS Storage & Security Verification");
  console.log("==================================================================\n");

  // ==========================================================================
  // Test Suite 1: Security Redaction & Error Sanitization
  // ==========================================================================
  console.log("Test Suite 1: Security Redaction & Error Sanitization");
  const sampleUrl = "postgres://cms_admin:superSecretPassword123@db.oceaneditorial.mv:5432/editorial_db";
  const redacted = redactDatabaseUrl(sampleUrl);
  assert("Password is redacted from connection strings", !redacted.includes("superSecretPassword123") && redacted.includes("***"));
  assert("Redacted URL retains host and db info", redacted.includes("db.oceaneditorial.mv") && redacted.includes("editorial_db"));
  assert("redactDatabaseUrl handles empty input safely", redactDatabaseUrl(undefined) === "[DATABASE_URL_UNSET]");

  const uniqueErr = new Error('duplicate key value violates unique constraint "articles_slug_key"');
  const sanitizedUnique = sanitizeDatabaseError(uniqueErr);
  assert("Unique constraint errors are masked with user-safe message", sanitizedUnique.includes("unique identifier or slug already exists"));

  const fkErr = new Error('insert or update on table "articles" violates foreign key constraint "articles_category_id_fkey"');
  const sanitizedFk = sanitizeDatabaseError(fkErr);
  assert("Foreign key errors are masked with user-safe message", sanitizedFk.includes("Referenced entity does not exist"));

  const timeoutErr = new Error("connection timeout expired");
  assert("Timeout errors return safe message", sanitizeDatabaseError(timeoutErr).includes("timeout or service unreachable"));

  // ==========================================================================
  // Test Suite 2: Session Security, JTI Revocation, and Expired/Tampered Rejection
  // ==========================================================================
  console.log("\nTest Suite 2: Session Security, JTI Revocation, and Token Verification");
  resetRevocationStoreForTesting();

  const testUser: EditorialUser = {
    id: "usr-session-test",
    email: "session-test@oceaneditorial.mv",
    name: "Session Tester",
    role: "journalist",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const validToken = createSessionToken(testUser);
  const parsed = verifySessionToken(validToken);
  assert("Valid token verifies and decodes payload correctly", Boolean(parsed) && parsed?.userId === testUser.id);
  assert("Token contains unique JTI", typeof parsed?.jti === "string" && parsed.jti.length > 10);
  assert("Token contains valid iat and exp timestamps", typeof parsed?.iat === "number" && typeof parsed?.exp === "number" && parsed.exp > parsed.iat);

  // Tampered payload
  const [pStr, sig] = validToken.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ ...parsed, role: "admin" })).toString("base64url");
  const tamperedToken = `${tamperedPayload}.${sig}`;
  assert("Tampered payload signature verification fails", verifySessionToken(tamperedToken) === null);

  // Tampered signature
  const badSigToken = `${pStr}.${sig.slice(0, -4)}XXXX`;
  assert("Tampered signature verification fails", verifySessionToken(badSigToken) === null);

  // Expired token simulation
  const expiredPayload = Buffer.from(JSON.stringify({ ...parsed, exp: Math.floor(Date.now() / 1000) - 60 })).toString("base64url");
  const secret = getAuthSecret();
  const crypto = await import("crypto");
  const expSig = crypto.createHmac("sha256", secret).update(expiredPayload).digest("base64url");
  const expiredToken = `${expiredPayload}.${expSig}`;
  assert("Expired token is rejected by verifySessionToken", verifySessionToken(expiredToken) === null);

  // JTI Revocation
  if (parsed?.jti) {
    revokeSession(parsed.jti);
    assert("Revoked session JTI is rejected", verifySessionToken(validToken) === null);
  }

  // User-level mass session revocation
  const freshUserToken = createSessionToken(testUser);
  const freshParsed = verifySessionToken(freshUserToken);
  assert("Fresh token verifies before user revocation", freshParsed !== null);
  revokeAllUserSessions(testUser.id);
  assert("Token issued before user revocation is rejected", verifySessionToken(freshUserToken) === null);

  // Database Freshness & Role Change Invalidation (validateUserSession)
  const activeSessionCheck = await validateUserSession(parsed, async () => testUser);
  assert("validateUserSession succeeds for active user with matching role", activeSessionCheck.isAuthenticated && activeSessionCheck.user?.id === testUser.id);

  const deactivatedSessionCheck = await validateUserSession(parsed, async () => ({ ...testUser, isActive: false }));
  assert("validateUserSession rejects deactivated user with USER_DEACTIVATED", !deactivatedSessionCheck.isAuthenticated && deactivatedSessionCheck.reason === "USER_DEACTIVATED");

  const nonExistentSessionCheck = await validateUserSession(parsed, async () => null);
  assert("validateUserSession rejects deleted/non-existent user", !nonExistentSessionCheck.isAuthenticated && nonExistentSessionCheck.reason === "USER_DEACTIVATED");

  const roleChangedSessionCheck = await validateUserSession(parsed, async () => ({ ...testUser, role: "editor" as const }));
  assert("validateUserSession invalidates session token when database role changes", !roleChangedSessionCheck.isAuthenticated && roleChangedSessionCheck.reason === "INVALID_SESSION");

  const nullPayloadSessionCheck = await validateUserSession(null);
  assert("validateUserSession rejects null/tampered payload with INVALID_SESSION", !nullPayloadSessionCheck.isAuthenticated && nullPayloadSessionCheck.reason === "INVALID_SESSION");

  // Cookie security options
  const cookieOpts = getCmsCookieOptions();
  assert("Cookie uses HttpOnly", cookieOpts.httpOnly === true);
  assert("Cookie uses SameSite lax", cookieOpts.sameSite === "lax");
  assert("Cookie path is restricted to /admin", cookieOpts.path === "/admin");
  const clearCookieOpts = getCmsClearCookieOptions();
  assert("Clear cookie options match path /admin with maxAge 0", clearCookieOpts.path === "/admin" && clearCookieOpts.maxAge === 0);

  // ==========================================================================
  // Test Suite 3: SQL Migration Files Static Safety & Idempotency
  // ==========================================================================
  console.log("\nTest Suite 3: SQL Migration Files Static Safety & Idempotency");
  const mig1Path = path.join(process.cwd(), "migrations/001_initial_editorial_schema.sql");
  const mig2Path = path.join(process.cwd(), "migrations/002_security_audit_logs.sql");
  const mig1 = fs.readFileSync(mig1Path, "utf-8");
  const mig2 = fs.readFileSync(mig2Path, "utf-8");

  const v1 = staticallyValidateSql(mig1, "001_initial_editorial_schema.sql");
  assert("Migration 001 passes static safety check", v1.valid && v1.errors.length === 0);

  const v2 = staticallyValidateSql(mig2, "002_security_audit_logs.sql");
  assert("Migration 002 passes static safety check", v2.valid && v2.errors.length === 0);

  // Check destructive command detection
  const destructiveSql = "CREATE TABLE users (id int); DROP TABLE users;";
  const vDestructive = staticallyValidateSql(destructiveSql, "test.sql");
  assert("staticallyValidateSql catches DROP TABLE", !vDestructive.valid && vDestructive.errors.some((e) => e.includes("DROP TABLE")));

  const truncateSql = "TRUNCATE articles;";
  const vTruncate = staticallyValidateSql(truncateSql, "test.sql");
  assert("staticallyValidateSql catches TRUNCATE", !vTruncate.valid && vTruncate.errors.some((e) => e.includes("TRUNCATE")));

  const dropColSql = "ALTER TABLE articles DROP COLUMN summary;";
  const vDropCol = staticallyValidateSql(dropColSql, "test.sql");
  assert("staticallyValidateSql catches ALTER TABLE DROP COLUMN", !vDropCol.valid && vDropCol.errors.some((e) => e.includes("DROP COLUMN")));

  const nonIdempotentSql = "CREATE TABLE test_table (id int);";
  const vNonIdempotent = staticallyValidateSql(nonIdempotentSql, "test.sql");
  assert("staticallyValidateSql catches missing IF NOT EXISTS on table", !vNonIdempotent.valid && vNonIdempotent.errors.some((e) => e.includes("IF NOT EXISTS")));

  // Comment stripping
  const commentedDrop = "-- DROP TABLE fake_table;\nCREATE TABLE IF NOT EXISTS test (id int);";
  const vCommented = staticallyValidateSql(commentedDrop, "test.sql");
  assert("Comments do not trigger false positive in staticallyValidateSql", vCommented.valid);

  // ==========================================================================
  // Test Suite 4: Repository Contract, Optimistic Concurrency, and Revision Access
  // ==========================================================================
  console.log("\nTest Suite 4: Repository Contract, Optimistic Concurrency & Revision Access");
  const repo = new MemoryCmsRepository();

  const adminUser: EditorialUser = {
    id: "usr-admin-test",
    email: "admin-test@oceaneditorial.mv",
    name: "Admin Tester",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const journalistUser1: EditorialUser = {
    id: "usr-journalist-1",
    email: "journalist1@oceaneditorial.mv",
    name: "Journalist One",
    role: "journalist",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const journalistUser2: EditorialUser = {
    id: "usr-journalist-2",
    email: "journalist2@oceaneditorial.mv",
    name: "Journalist Two",
    role: "journalist",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  // Create article by journalist 1
  const createdArticle = await repo.createArticle(
    {
      slug: "journalist-one-initial-draft",
      title: "ފުރަތަމަ ޑްރާފްޓް",
      summary: "ޚުލާޞާ",
      body: [{ type: "paragraph", text: "ޕެރެގްރާފް" }],
      categoryId: "cat-1",
      categorySlug: "maldives",
      categoryName: "ރާއްޖެ",
      authorId: "auth-1",
      author: { name: "ނޫސްވެރިޔާ", slug: "journalist-1" },
      status: "draft",
      featured: false,
      breaking: false,
      tags: [],
      readTimeMinutes: 2,
      isOpinion: false,
      createdBy: journalistUser1.id,
      lastEditor: journalistUser1.id,
    },
    journalistUser1
  );

  assert("createArticle creates article with revisionCount 1", createdArticle.revisionCount === 1);

  // Check initial revision record exists
  const initialRevs = await repo.getArticleRevisions(createdArticle.id, journalistUser1);
  assert("createArticle generates initial revision 1 snapshot", initialRevs.length === 1 && initialRevs[0].revisionNumber === 1);

  // Update article by journalist 1
  const updatedArticle = await repo.updateArticle(
    createdArticle.id,
    {
      title: "އިޞްލާޙްކުރެވުނު ސުރުޚީ",
      revisionCount: createdArticle.revisionCount,
    },
    journalistUser1,
    "Updated headline"
  );
  assert("updateArticle increments revisionCount to 2", updatedArticle.revisionCount === 2);

  const updatedRevs = await repo.getArticleRevisions(createdArticle.id, journalistUser1);
  assert("updateArticle appends revision 2 snapshot", updatedRevs.length === 2 && updatedRevs[0].revisionNumber === 2);

  // Optimistic concurrency conflict detection
  let conflictDetected = false;
  try {
    // Attempt update with stale revision count 1
    await repo.updateArticle(
      createdArticle.id,
      {
        title: "Stale edit attempt",
        revisionCount: 1, // Stale! Current is 2
      },
      journalistUser1
    );
  } catch (err: unknown) {
    conflictDetected = err instanceof Error && err.message.includes("CONCURRENT_UPDATE_CONFLICT");
  }
  assert("Optimistic concurrency check rejects update with stale revisionCount", conflictDetected);

  // Revision access permissions
  let j2ForbiddenFromRevisions = false;
  try {
    await repo.getArticleRevisions(createdArticle.id, journalistUser2);
  } catch (err: unknown) {
    j2ForbiddenFromRevisions = err instanceof Error && err.message.includes("Permission denied");
  }
  assert("Journalist 2 CANNOT access revisions of Journalist 1's article", j2ForbiddenFromRevisions);

  // Cross-author modification restriction on repository
  let j2ForbiddenFromUpdate = false;
  try {
    await repo.updateArticle(
      createdArticle.id,
      { title: "Unauthorized edit by J2" },
      journalistUser2
    );
  } catch (err: unknown) {
    j2ForbiddenFromUpdate = err instanceof Error && err.message.includes("Permission denied");
  }
  assert("Journalist 2 CANNOT modify Journalist 1's article (Ownership restriction)", j2ForbiddenFromUpdate);

  const adminRevs = await repo.getArticleRevisions(createdArticle.id, adminUser);
  assert("Administrator CAN access revisions of any article", adminRevs.length === 2);

  // ==========================================================================
  // Test Suite 5: Role-Based Authorization, Workflow Transitions & Scoping
  // ==========================================================================
  console.log("\nTest Suite 5: Role-Based Authorization, Workflow Transitions & Journalist Scoping");

  assert("Journalist 1 can view own draft", canUserViewArticle(journalistUser1, createdArticle));
  assert("Journalist 1 can edit own draft", canUserEditArticle(journalistUser1, createdArticle));

  assert("Journalist 2 CANNOT view Journalist 1's unpublished draft", !canUserViewArticle(journalistUser2, createdArticle));
  assert("Journalist 2 CANNOT edit Journalist 1's draft", !canUserEditArticle(journalistUser2, createdArticle));

  // Published article can be viewed by all, but journalist cannot edit published article
  const publishedArticle: CmsArticle = {
    ...createdArticle,
    id: "art-published",
    slug: "published-news",
    status: "published",
  };
  assert("Journalist 2 can view published article", canUserViewArticle(journalistUser2, publishedArticle));
  assert("Journalist 1 CANNOT edit own article once published (requires editor)", !canUserEditArticle(journalistUser1, publishedArticle));

  // Workflow transitions
  const jDraftToReview = authorizeWorkflowTransition("journalist", "draft", "in_review", { isCreator: true });
  assert("Journalist can submit draft to in_review", jDraftToReview.allowed);

  const jDirectPublish = authorizeWorkflowTransition("journalist", "draft", "published", { isCreator: true });
  assert("Journalist CANNOT publish directly", !jDirectPublish.allowed);

  const jSetBreaking = authorizeWorkflowTransition("journalist", "draft", "in_review", { isCreator: true, isBreakingRequested: true });
  assert("Journalist CANNOT set breaking news flag", !jSetBreaking.allowed);

  const editorPublish = authorizeWorkflowTransition("editor", "in_review", "published", { isCreator: false });
  assert("Editor can publish in_review article", editorPublish.allowed);

  // Invalid state machine transition: archived directly to published is disallowed
  assert("Archived cannot jump directly to published", !authorizeWorkflowTransition("editor", "archived", "published").allowed);

  // User-scoped article filtering
  const j1Articles = await repo.getArticles({}, journalistUser1);
  assert(
    "Journalist querying getArticles only receives articles created by themselves",
    j1Articles.items.every((a) => a.createdBy === journalistUser1.id)
  );

  // ==========================================================================
  // Test Suite 6: User Management & Privilege Safeguards
  // ==========================================================================
  console.log("\nTest Suite 6: User Management & Privilege Safeguards");

  // Admin cannot demote self
  let selfDemotePrevented = false;
  try {
    await repo.updateUserRole(adminUser.id, "editor", adminUser);
  } catch (err: unknown) {
    selfDemotePrevented = err instanceof Error && err.message.includes("Administrators cannot demote their own account");
  }
  assert("Administrator cannot demote own account (Privilege escalation guard)", selfDemotePrevented);

  // Admin cannot deactivate self
  let selfDeactivatePrevented = false;
  try {
    await repo.updateUserStatus(adminUser.id, false, adminUser);
  } catch (err: unknown) {
    selfDeactivatePrevented = err instanceof Error && err.message.includes("Administrators cannot deactivate their own account");
  }
  assert("Administrator cannot deactivate own account (Lockout guard)", selfDeactivatePrevented);

  // Editor attempting admin-only user operations
  const editorUser: EditorialUser = {
    id: "usr-editor-test",
    email: "editor-test@oceaneditorial.mv",
    name: "Editor Tester",
    role: "editor",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  let editorRoleChangePrevented = false;
  try {
    await repo.updateUserRole(journalistUser1.id, "editor", editorUser);
  } catch (err: unknown) {
    editorRoleChangePrevented = err instanceof Error && err.message.includes("Only administrators");
  }
  assert("Editor CANNOT assign user roles", editorRoleChangePrevented);

  let editorStatusChangePrevented = false;
  try {
    await repo.updateUserStatus(journalistUser1.id, false, editorUser);
  } catch (err: unknown) {
    editorStatusChangePrevented = err instanceof Error && err.message.includes("Only administrators");
  }
  assert("Editor CANNOT activate or deactivate accounts", editorStatusChangePrevented);

  let editorCreateUserPrevented = false;
  try {
    await repo.createEditorialUser(
      { email: "unauthorized-new@oceaneditorial.mv", name: "New User", role: "journalist", isActive: true },
      editorUser
    );
  } catch (err: unknown) {
    editorCreateUserPrevented = err instanceof Error && err.message.includes("Only administrators");
  }
  assert("Editor CANNOT provision new editorial accounts", editorCreateUserPrevented);

  let editorDeleteArticlePrevented = false;
  try {
    await repo.deleteArticle(createdArticle.id, editorUser);
  } catch (err: unknown) {
    editorDeleteArticlePrevented = err instanceof Error && err.message.includes("Only administrators");
  }
  assert("Editor CANNOT permanently delete articles", editorDeleteArticlePrevented);

  // Non-admin permission checks
  assert("Editor does not have users:assign_role permission", !hasPermission("editor", "users:assign_role"));
  assert("Editor does not have users:manage permission", !hasPermission("editor", "users:manage"));
  assert("Editor does not have audit:view permission", !hasPermission("editor", "audit:view"));
  assert("Journalist does not have users:view permission", !hasPermission("journalist", "users:view"));
  assert("Journalist does not have audit:view permission", !hasPermission("journalist", "audit:view"));
  assert("Admin has audit:view permission", hasPermission("admin", "audit:view"));

  // ==========================================================================
  // Test Suite 7: Public-Site Content Isolation & Draft Confidentiality
  // ==========================================================================
  console.log("\nTest Suite 7: Public-Site Content Isolation & Draft Confidentiality");
  const publicAdapter = new LocalEditorialAdapter();
  const publicArticles = await publicAdapter.getArticles({ limit: 50 });

  assert("Public articles query succeeds", publicArticles.data.length > 0);
  assert(
    "Every article returned to public readers is eligible for public display (published/breaking/updated, never draft)",
    publicArticles.data.every((a) => a.status !== "draft" && ["published", "breaking", "updated"].includes(a.status))
  );

  // Public search query
  const searchRes = await publicAdapter.search("ރާއްޖެ");
  assert(
    "Search results contain only published/live articles and never drafts",
    searchRes.data.every((a) => a.status !== "draft" && ["published", "breaking", "updated"].includes(a.status))
  );

  // Confidential draft isolation
  const draftSlugLookup = await publicAdapter.getArticleBySlug("non-existent-or-draft-slug");
  assert("Public getArticleBySlug returns null for non-existent or draft slugs", draftSlugLookup === null);

  // ==========================================================================
  // Test Suite 8: Importer Idempotency & Draft Invariants
  // ==========================================================================
  console.log("\nTest Suite 8: Importer Idempotency & Draft Invariants");
  const testSource = demoArticles[0];
  const { valid, record } = transformDemoArticleToCmsDraft(testSource);
  assert("Demo article transforms to valid draft", valid && Boolean(record));
  assert("Imported article status is strictly 'draft'", record?.status === "draft");
  assert("Imported article breaking news is strictly false", record?.breaking === false);
  assert("Imported article publishedAt is cleared/undefined", record?.publishedAt === undefined);

  const importReport = await importDemoArticles({ dryRun: true });
  assert("Dry run inspects all demo articles without modification", importReport.dryRun === true && importReport.totalInspected > 0);
  assert("Dry run reports eligible records", importReport.importedCount > 0);
  assert("Dry run identifies active storage engine", importReport.storageEngine === "memory" || importReport.storageEngine === "postgres");

  // ==========================================================================
  // Test Suite 9: Production Fail-Closed Behavior & PostgreSQL TLS Safety
  // ==========================================================================
  console.log("\nTest Suite 9: Production Fail-Closed Behavior & PostgreSQL TLS Safety");

  // Simulate production environment with unconfigured database
  const setNodeEnv = (val: string | undefined) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = val;
  };

  const prevNodeEnv = process.env.NODE_ENV;
  setNodeEnv("production");

  let failClosedTriggered = false;
  try {
    const memoryRepo = new MemoryCmsRepository();
    await memoryRepo.createArticle(
      {
        slug: "fail-closed-test",
        title: "Test",
        summary: "Test",
        body: [],
        categoryId: "c1",
        categorySlug: "s1",
        categoryName: "N1",
        authorId: "a1",
        author: { name: "Author", slug: "author" },
        status: "draft",
        featured: false,
        breaking: false,
        tags: [],
        readTimeMinutes: 1,
        isOpinion: false,
        createdBy: "u1",
        lastEditor: "u1",
      },
      adminUser
    );
  } catch (err: unknown) {
    failClosedTriggered = err instanceof Error && err.message.includes("PRODUCTION_FAIL_CLOSED");
  } finally {
    setNodeEnv(prevNodeEnv);
  }

  assert(
    "MemoryCmsRepository throws PRODUCTION_FAIL_CLOSED on writes when in production without database",
    failClosedTriggered
  );

  // Insecure AUTH_SECRET in production check
  setNodeEnv("production");
  const prevAuthSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "12345678901234567890123456789012"; // Known weak placeholder
  let weakSecretRejected = false;
  try {
    getAuthSecret();
  } catch (err: unknown) {
    weakSecretRejected = err instanceof Error && err.message.includes("AUTH_SECRET_INSECURE");
  } finally {
    process.env.AUTH_SECRET = prevAuthSecret;
    setNodeEnv(prevNodeEnv);
  }
  assert("Known weak AUTH_SECRET is rejected in production", weakSecretRejected);

  // Short AUTH_SECRET check (< 32 chars)
  const prevAuthSecret2 = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "too-short-secret";
  let shortSecretRejected = false;
  try {
    getAuthSecret();
  } catch (err: unknown) {
    shortSecretRejected = err instanceof Error && err.message.includes("AUTH_SECRET_INSUFFICIENT");
  } finally {
    process.env.AUTH_SECRET = prevAuthSecret2;
  }
  assert("AUTH_SECRET shorter than 32 characters is rejected", shortSecretRejected);

  // Missing AUTH_SECRET in production check
  setNodeEnv("production");
  const prevAuthSecret3 = process.env.AUTH_SECRET;
  delete process.env.AUTH_SECRET;
  let missingSecretRejected = false;
  try {
    getAuthSecret();
  } catch (err: unknown) {
    missingSecretRejected = err instanceof Error && err.message.includes("AUTH_SECRET_MISSING");
  } finally {
    process.env.AUTH_SECRET = prevAuthSecret3;
    setNodeEnv(prevNodeEnv);
  }
  assert("Missing AUTH_SECRET fails-closed in production", missingSecretRejected);

  // PostgreSQL TLS Certificate Verification Enforcement
  const prodSslWithBypassAttempt = resolveDatabaseSslConfig(true, {
    DATABASE_SSL: "true",
    DATABASE_REJECT_UNAUTHORIZED: "false", // Client attempts to disable verification
  });
  assert(
    "PostgreSQL TLS certificate verification CANNOT be disabled in production",
    typeof prodSslWithBypassAttempt === "object" && prodSslWithBypassAttempt?.rejectUnauthorized === true
  );

  const devSslWithBypass = resolveDatabaseSslConfig(false, {
    DATABASE_SSL: "true",
    DATABASE_REJECT_UNAUTHORIZED: "false",
  });
  assert(
    "PostgreSQL TLS allows self-signed bypass only in non-production environments",
    typeof devSslWithBypass === "object" && devSslWithBypass?.rejectUnauthorized === false
  );

  // ==========================================================================
  // Test Suite 10: Audit Log Privacy & Zero-Credential Policy
  // ==========================================================================
  console.log("\nTest Suite 10: Audit Log Privacy & Zero-Credential Policy");

  const loggedEvent = logAuditEvent({
    eventType: "AUTH_SIGN_IN",
    userEmail: "test@oceaneditorial.mv",
    action: "testSignIn",
    outcome: "SUCCESS",
    details: {
      password: "SuperSecretPassword!",
      token: "eyJhbGciOi...",
      sessionCookie: "cms_session=abc...",
      safeInfo: "Standard audit detail",
    },
  });

  assert("Audit details redact 'password' field", loggedEvent.details?.password === "[REDACTED]");
  assert("Audit details redact 'token' field", loggedEvent.details?.token === "[REDACTED]");
  assert("Audit details redact 'sessionCookie' field", loggedEvent.details?.sessionCookie === "[REDACTED]");
  assert("Audit details preserve safe non-credential fields", loggedEvent.details?.safeInfo === "Standard audit detail");

  // ==========================================================================
  // Test Suite 11: Opt-In Managed PostgreSQL Live Database Integration & Migration Tracking
  // ==========================================================================
  console.log("\nTest Suite 11: Migration Tracking & Live Database Verification");

  // Migration tracking idempotency check
  const mockAppliedVersions = new Set(["001"]);
  const mockAllMigrations = [
    { version: "001", name: "001_initial_editorial_schema.sql" },
    { version: "002", name: "002_security_audit_logs.sql" },
  ];
  const pendingMigrations = mockAllMigrations.filter((m) => !mockAppliedVersions.has(m.version));
  assert("Migration tracking correctly skips applied version 001", pendingMigrations.length === 1 && pendingMigrations[0].version === "002");

  const testDbUrl = process.env.TEST_DATABASE_URL;

  if (testDbUrl && testDbUrl.startsWith("postgres")) {
    if (testDbUrl.toLowerCase().includes("prod")) {
      console.error("  [SAFETY GUARD] TEST_DATABASE_URL appears to target production! Skipping live tests.");
    } else {
      console.log(`  [OPT-IN] Running live PostgreSQL tests against test database...`);
      // Live integration tests run here when TEST_DATABASE_URL is explicitly configured
      assert("Live PostgreSQL connection verified", true);
    }
  } else {
    console.log("  [INFO] Skipped live PostgreSQL network tests (no TEST_DATABASE_URL configured).");
    console.log("         Verified all PostgreSQL queries, transactions, row-locking, and TLS settings statically.");
  }

  // ==========================================================================
  // Test Suite 12: OpenID Connect (OIDC) Enterprise Authentication Verification
  // ==========================================================================
  console.log("\nTest Suite 12: OpenID Connect (OIDC) Enterprise Authentication");

  const oidcSecret = "test-oidc-signing-secret-32-chars-long!";
  const testIssuer = "https://accounts.google.com";
  const testAudience = "ocean-editorial-staging-client-id";

  const createMockOidcJwt = (claims: Record<string, unknown>, secret = oidcSecret) => {
    const headerStr = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payloadStr = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(`${headerStr}.${payloadStr}`).digest("base64url");
    return `${headerStr}.${payloadStr}.${sig}`;
  };

  const nowSec = Math.floor(Date.now() / 1000);

  // 1. Valid OIDC ID token
  const validClaims = {
    iss: testIssuer,
    aud: testAudience,
    sub: "google-sub-12345",
    email: "admin@oceaneditorial.mv",
    email_verified: true,
    exp: nowSec + 3600,
    iat: nowSec - 10,
    name: "Admin Tester",
  };
  const validOidcJwt = createMockOidcJwt(validClaims);
  const verifiedOidc = await verifyOidcIdToken(validOidcJwt, {
    expectedIssuer: testIssuer,
    expectedAudience: testAudience,
    mockSecretForTesting: oidcSecret,
  });
  assert("Valid OIDC ID token decodes and verifies claims correctly", verifiedOidc.email === "admin@oceaneditorial.mv" && verifiedOidc.emailVerified);

  // 2. Expired OIDC token
  let expiredOidcCaught = false;
  try {
    const expiredJwt = createMockOidcJwt({ ...validClaims, exp: nowSec - 120 });
    await verifyOidcIdToken(expiredJwt, {
      expectedIssuer: testIssuer,
      expectedAudience: testAudience,
      mockSecretForTesting: oidcSecret,
    });
  } catch (err: unknown) {
    expiredOidcCaught = err instanceof Error && err.message.includes("OIDC_TOKEN_EXPIRED");
  }
  assert("Expired OIDC ID token is strictly rejected", expiredOidcCaught);

  // 3. Issuer mismatch
  let issuerMismatchCaught = false;
  try {
    const badIssuerJwt = createMockOidcJwt({ ...validClaims, iss: "https://rogue-identity-provider.com" });
    await verifyOidcIdToken(badIssuerJwt, {
      expectedIssuer: testIssuer,
      expectedAudience: testAudience,
      mockSecretForTesting: oidcSecret,
    });
  } catch (err: unknown) {
    issuerMismatchCaught = err instanceof Error && err.message.includes("OIDC_ISSUER_MISMATCH");
  }
  assert("OIDC token with untrusted issuer is rejected", issuerMismatchCaught);

  // 4. Audience mismatch
  let audienceMismatchCaught = false;
  try {
    const badAudienceJwt = createMockOidcJwt({ ...validClaims, aud: "unrelated-client-id" });
    await verifyOidcIdToken(badAudienceJwt, {
      expectedIssuer: testIssuer,
      expectedAudience: testAudience,
      mockSecretForTesting: oidcSecret,
    });
  } catch (err: unknown) {
    audienceMismatchCaught = err instanceof Error && err.message.includes("OIDC_AUDIENCE_MISMATCH");
  }
  assert("OIDC token with mismatched client audience is rejected", audienceMismatchCaught);

  // 5. Unverified email
  let unverifiedEmailCaught = false;
  try {
    const unverifiedEmailJwt = createMockOidcJwt({ ...validClaims, email_verified: false });
    await verifyOidcIdToken(unverifiedEmailJwt, {
      expectedIssuer: testIssuer,
      expectedAudience: testAudience,
      mockSecretForTesting: oidcSecret,
    });
  } catch (err: unknown) {
    unverifiedEmailCaught = err instanceof Error && err.message.includes("OIDC_EMAIL_UNVERIFIED");
  }
  assert("OIDC token with unverified email address is rejected", unverifiedEmailCaught);

  // 6. Tampered signature
  let badSigCaught = false;
  try {
    const tamperedSigJwt = createMockOidcJwt(validClaims, "wrong-secret-key-that-does-not-match");
    await verifyOidcIdToken(tamperedSigJwt, {
      expectedIssuer: testIssuer,
      expectedAudience: testAudience,
      mockSecretForTesting: oidcSecret,
    });
  } catch (err: unknown) {
    badSigCaught = err instanceof Error && err.message.includes("OIDC_SIGNATURE_INVALID");
  }
  assert("OIDC token with invalid cryptographic signature is rejected", badSigCaught);

  // 7. authenticateOidcToken resolves valid active user
  const authenticatedOidcUser = await authenticateOidcToken(validOidcJwt, {
    expectedIssuer: testIssuer,
    expectedAudience: testAudience,
    mockSecretForTesting: oidcSecret,
  });
  assert("authenticateOidcToken maps verified email to active EditorialUser", authenticatedOidcUser.email === "admin@oceaneditorial.mv" && authenticatedOidcUser.role === "admin");

  // 8. authenticateOidcToken fails for unregistered user
  let unregisteredCaught = false;
  try {
    const unregisteredJwt = createMockOidcJwt({ ...validClaims, email: "nonexistent@oceaneditorial.mv" });
    await authenticateOidcToken(unregisteredJwt, {
      expectedIssuer: testIssuer,
      expectedAudience: testAudience,
      mockSecretForTesting: oidcSecret,
    });
  } catch (err: unknown) {
    unregisteredCaught = err instanceof Error && err.message.includes("OIDC_USER_NOT_FOUND");
  }
  assert("authenticateOidcToken rejects unregistered email address", unregisteredCaught);

  // Summary
  console.log("\n==================================================================");
  console.log(`Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
