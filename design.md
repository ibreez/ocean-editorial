# Dhivehi Digital Newsroom — Design System

## 1. Context and Goals

### Product Vision
Create a premium, modern, mobile-first online news platform for the Maldives, designed primarily for Dhivehi readers and built around trustworthy journalism, compelling storytelling, and effortless reading.

The platform must feel distinctly Maldivian without relying on predictable tropical imagery, decorative island motifs, or generic news-site templates.

### Design Direction
**Design concept:** Contemporary Maldivian Editorial (Working brand: **Ocean Editorial** / ކަނޑު އެޑިޓޯރިއަލް).

The visual identity combines the authority of a newspaper, the immersion of a digital magazine, and the speed of a modern news application.

Core characteristics:
- Editorial typography with bold, unmistakable headlines.
- Right-to-left layouts designed for native Dhivehi reading (`dir="rtl" lang="dv"`).
- Warm, restrained surfaces with high-contrast editorial accents.
- Large, purposeful photography and cinematic lead-story compositions.
- Compact information architecture with generous reading space.
- Clear separation between breaking news, developing stories, analysis, and features.
- Smooth, subtle interactions without sacrificing performance or readability.

---

## 2. Design Tokens and Foundations

### 2.1 Color Tokens
- `color.brand.primary`: `#123B3A` (Ocean-ink brand, primary navigation)
- `color.brand.secondary`: `#0F766E` (Secondary accents and selected states)
- `color.brand.accent`: `#D94343` (Breaking news and high-priority editorial emphasis)
- `color.brand.accent-hover`: `#B92F35` (Hover and pressed accent treatments)
- `color.text.primary`: `#182624` (Headlines and primary body text)
- `color.text.secondary`: `#53635F` (Metadata and secondary content)
- `color.text.muted`: `#687671` (Supporting information)
- `color.text.inverse`: `#FFFFFF` (Text on dark surfaces)
- `color.surface.page`: `#F7F7F2` (Main warm editorial background)
- `color.surface.card`: `#FFFFFF` (Article cards and elevated content)
- `color.surface.subtle`: `#EDF2EF` (Muted sections and secondary panels)
- `color.surface.inverse`: `#123B3A` (Dark editorial panels)
- `color.border.default`: `#DCE4DF` (Standard dividers and component borders)
- `color.border.strong`: `#AAB9B2` (Emphasized borders)
- `color.state.success`: `#216E4E`
- `color.state.warning`: `#8A5700`
- `color.state.error`: `#B42318`
- `color.state.info`: `#155E9A`

### 2.2 Typography Scale
- `font.size.xs`: 12px / 18px (Compact metadata)
- `font.size.sm`: 14px / 22px (Captions, timestamps)
- `font.size.base`: 16px / 28px (Default body text)
- `font.size.lg`: 18px / 31px (Featured excerpts)
- `font.size.xl`: 20px / 33px (Secondary headlines)
- `font.size.2xl`: 24px / 38px (Article section headings)
- `font.size.3xl`: 30px / 44px (Featured article headings)
- `font.size.4xl`: 38px / 54px (Major editorial headlines)
- `font.size.5xl`: 48px / 64px (Desktop hero headlines)

Fonts:
- Dhivehi: Primary editorial font `Faruma` (`/public/fonts/Faruma.ttf`), secondary/display `Faseyha` (`/public/fonts/Faseyha.ttf`), fallbacks `MV Boli`, `A_Faseyha`, sans-serif.
- Latin: `Inter`, system sans-serif

### 2.3 Layout & Containers
- `layout.container.max`: 1280px (Main editorial container)
- `layout.container.reading`: 720px (Article reading column)
- `layout.container.narrow`: 560px
- `layout.sidebar.width`: 300px
- `layout.header.height.desktop`: 76px
- `layout.header.height.mobile`: 60px
- `layout.page.gutter.mobile`: 16px
- `layout.page.gutter.tablet`: 24px
- `layout.page.gutter.desktop`: 32px

### 2.4 Breakpoints
- Mobile: 480px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px

### 2.5 Radii and Shadows
- `radius.sm`: 6px
- `radius.md`: 10px
- `radius.lg`: 16px
- `shadow.card`: `0 2px 10px rgba(18, 59, 58, 0.06)`
- `shadow.overlay`: `0 12px 36px rgba(18, 59, 58, 0.16)`

---

## 3. Mandatory RTL & Bidirectional Rules
1. Document root: `<html lang="dv" dir="rtl">`.
2. Use CSS logical properties (`margin-inline-start`, `padding-inline-end`, `border-inline-start`).
3. Directional icons reviewed for RTL correctness.
4. Bidirectional isolation with `<bdi>` or `dir="ltr"` for Latin names, URLs, phone numbers, and codes.
5. Never mirror media controls, timelines, or numerical charts indiscriminately.
6. Clean unboxed metadata with subtle typographic separators (`·`, `/`).

---

## 4. Editorial CMS Architecture, Authentication, and RBAC

### 4.1 Server-Side Authentication
- Cryptographically signed session tokens: `payload_base64url.signature_base64url` using HMAC-SHA256 (`AUTH_SECRET`).
- Secure HTTP-only cookies (`cms_session`) with `SameSite: "lax"`, `path: "/"`, `maxAge: 28800` (8 hours), and `Secure` flag in production.
- Constant-time verification (`crypto.timingSafeEqual`) to mitigate timing attacks.
- Fail-closed session checking: Every protected route and server action validates current database/repository user status (`isActive`, `role`) on the server.
- Zero plaintext password storage and zero fake client-side credentials.

### 4.2 Editorial Role-Based Access Control (RBAC)
- **Administrator (`admin`)**:
  - Full management of editorial users and role assignments (`/admin/users`).
  - Authority to permanently delete articles (`deleteArticleAction`).
  - Access to full security audit logs and workflow oversight.
- **Editor (`editor`)**:
  - Full review, copyediting, and publishing authority (`draft`, `in_review`, `scheduled`, `published`, `archived`).
  - Authority to toggle breaking-news and featured-story banners.
  - Access to newsroom overview and review tools.
- **Journalist (`journalist`)**:
  - Author and edit own drafts (`articles:create`, `articles:edit_own`).
  - Submit drafts for editorial review (`articles:submit_review`).
  - View-scoping: Journalists only view content they are authorized to access (`createdBy` scoped in dashboard and detail views).
  - Explicitly forbidden from direct publishing, scheduling, archiving, breaking-news toggling, or editing other journalists' work.

### 4.3 Privilege Escalation & Security Hardening
- **Self-Demotion & Lockout Defense**: Administrators are forbidden from demoting or deactivating their own account.
- **Brute-Force & Credential Stuffing Defense**: Sliding-window rate limiter in `lib/cms/rate-limiter.ts` locking out accounts after 5 failed attempts within 15 minutes.
- **Zero-Credential Audit Trail**: Immutable event logging in `lib/cms/audit.ts` automatically redacting tokens, keys, cookies, and secret parameters.

---

## 5. Managed PostgreSQL Integration & Persistent Storage Architecture

### 5.1 Storage Engine Strategy
- **Provider-Neutral Driver**: Implemented using standard `pg` connection pooling (`Pool`), allowing deployment on any managed PostgreSQL service (Neon, Supabase, Google Cloud SQL, AWS RDS) without proprietary vendor lock-in.
- **Dynamic Repository Provider**:
  - Automatically activates `PostgresCmsRepository` when `DATABASE_URL` is set and starts with `postgres://` or `postgresql://`.
  - Automatically falls back to `MemoryCmsRepository` in local development / preview staging when `DATABASE_URL` is unconfigured.
  - Transparent UI indicator in the admin dashboard informs editorial staff whether the system is connected to persistent PostgreSQL or staging memory.
- **Production Fail-Closed Enforcement**:
  - In `production` (`process.env.NODE_ENV === "production"`), if `DATABASE_URL` is unconfigured, all CMS mutations throw `PRODUCTION_FAIL_CLOSED` rather than silently saving to ephemeral memory. This guarantees zero silent data loss.

### 5.2 Schema Mapping & Data Invariants
- **Relational Entities**:
  - `editorial_users`: UUID PK, role check constraint (`admin`, `editor`, `journalist`), `is_active` status.
  - `categories`: UUID PK, unique slug, Dhivehi and English display names, sort order.
  - `authors`: UUID PK, unique slug, Dhivehi name, English name, editorial title/role, avatar URL.
  - `articles`: UUID PK, unique slug, Dhivehi title, Dhivehi summary, structured JSONB body blocks, foreign keys to categories and authors with `ON DELETE RESTRICT`. Workflow status check constraint (`draft`, `in_review`, `scheduled`, `published`, `archived`).
  - `article_revisions`: Versioned snapshots with `(article_id, revision_number)` compound uniqueness, recording author, title, summary, JSONB body, and change notes.
  - `security_audit_logs`: Centralized security and editorial action logs with timestamps and outcomes (`SUCCESS`, `DENIED`, `FAILURE`).
- **Data Invariants**:
  - Demo articles imported into CMS are strictly forced to `status = 'draft'` and `breaking = false`.
  - Public readers access content strictly through `lib/content-service.ts`, guaranteeing unpublished drafts never appear on public routes, RSS, sitemaps, or structured data.

### 5.3 Connection Pooling & Security Safeguards
- **Serverless Pooling**: Bounded connection pool (default 10, max 30) with 30s idle timeout and 5s connection timeout.
- **TLS/SSL Certificate Verification**:
  - In production (`process.env.NODE_ENV === "production"`), TLS certificate verification (`rejectUnauthorized: true`) is strictly and unconditionally enforced regardless of environment variables.
  - In non-production local development only, self-signed test certificates may be tolerated if `DATABASE_REJECT_UNAUTHORIZED="false"`. Custom CA certificates are supported via `DATABASE_CA_CERT`.
- **Parameterized SQL**: All dynamic inputs passed via positional parameters (`$1, $2, ...`) to eliminate SQL injection.
- **Error & Log Redaction**: Connection strings are stripped of passwords (`redactDatabaseUrl`), and database errors returned to client actions are sanitized (`sanitizeDatabaseError`) to hide database internal schema details.
- **Atomic Concurrency**: Article updates use transactions with `SELECT ... FOR UPDATE` row locks to prevent write-write race conditions.

---

## 6. Authentication Hardening & Identity Verification Architecture

### 6.1 Identity Verification & Session Token Lifecycle
- **Cryptographic Signatures**: Session cookies use HMAC-SHA256 signatures (`payload.signature`) signed with a high-entropy `AUTH_SECRET` (minimum 32 characters).
- **Zero-Trust Identity**: Browser-supplied IDs, roles, or emails are never trusted. Identity is resolved strictly server-side through `requireServerAuth()` and verified against persistent storage.
- **Production Fail-Closed Auth**: In production, email-only sign-in simulation is strictly blocked (`AUTH_PROVIDER_UNCONFIGURED`). Production deployment requires an authorized enterprise identity provider (OIDC/OAuth 2.0 / SSO) with verified claims.
- **Production Secret Validation**: Production environments reject missing or known weak placeholder `AUTH_SECRET` keys (e.g. `12345678901234567890123456789012`).
- **Session Revocation (JTI & User-Level)**:
  - Every session token is provisioned with a cryptographically unique `jti` (UUID).
  - Explicit sign-out revokes the specific `jti` in the revocation store.
  - User deactivation and role updates trigger `revokeAllUserSessions(userId)`, invalidating all existing tokens issued prior to the revocation timestamp.
- **Database Role Freshness Guard**:
  - `validateUserSession()` conducts fresh lookups against persistent storage on every protected request.
  - Deactivated users (`!user.isActive`) are immediately blocked with `USER_DEACTIVATED`.
  - If a user's role was changed in the database, any existing token carrying the stale role is invalidated with `INVALID_SESSION`.
- **Hardened Cookie Policy**:
  - `httpOnly: true` (inaccessible to browser JavaScript/XSS).
  - `secure: true` in production or HTTPS environments.
  - `sameSite: "lax"` (mitigates CSRF).
  - `path: "/admin"` (restricted strictly to admin newsroom routes).
  - Explicit deletion matches exact path `/admin` with `maxAge: 0`.

### 6.2 Granular RBAC & Defense-in-Depth Authorization
- **Server-Side Enforcement**: All CMS mutations (`createArticle`, `updateArticle`, `deleteArticle`, `updateUserRole`, `updateUserStatus`, `getAuditLogsAction`) verify authorization on the server, not solely through UI state.
- **Journalist Ownership Invariant**:
  - Journalists can only view and edit drafts they created (`createdBy === caller.id`).
  - Repository-level enforcement in both `MemoryCmsRepository` and `PostgresCmsRepository` rejects cross-author updates and revision inspection.
  - Journalists cannot directly publish, schedule, archive, or set breaking news flags.
- **Editor & Administrator Boundaries**:
  - Editors can review, schedule, publish, archive, and manage breaking news, but cannot access user-management mutations or security audit logs.
  - Administrators are protected against self-demotion and self-deactivation lockout.
- **Audit Logging**:
  - Sensitive operations (`AUTH_SIGN_IN`, `AUTH_SIGN_OUT`, `ARTICLE_CREATED`, `ARTICLE_UPDATED`, `ARTICLE_DELETED`, `WORKFLOW_TRANSITION`, `ROLE_CHANGED`) are recorded.
  - Log details sanitize credentials (`password`, `token`, `sessionCookie`, database URLs) using `[REDACTED]` masks.

### 6.3 Public-Site Content Isolation & Draft Confidentiality
- **Reader Boundary**: Public site readers access content exclusively through `editorialContentService` (`lib/content-service.ts`).
- **Draft Isolation Invariant**:
  - `LocalEditorialAdapter.getArticles()` and `LocalEditorialAdapter.search()` strictly filter out `status === "draft"`.
  - `LocalEditorialAdapter.getArticleBySlug()` returns `null` for draft articles.
  - Unpublished revisions and private editorial metadata are never exposed in public JSON responses, metadata, or RSS feeds.

### 6.4 Operational Runbooks & Migration Safety
- **Safe Migration Runner**:
  - Dry-run mode (`npx tsx scripts/run-migration.ts --dry-run`) inspects SQL migration files without executing.
  - Schema tracking table `schema_migrations` tracks applied versions and skips them idempotently.
  - Atomic transactions (`BEGIN ... COMMIT`) roll back completely if any migration statement fails.
  - Static safety checks inspect clean SQL (with stripped comments) to catch destructive commands (`DROP TABLE`, `TRUNCATE`, `DROP COLUMN`) and non-idempotent table definitions.
- **Verification Test Suite**:
  - Run all 93 verification assertions with: `npx tsx scripts/test-cms-repository.ts`.
  - Opt-in live database verification via `TEST_DATABASE_URL` (safeguarded to prevent targeting production databases).

---

## 7. Controlled Staging Architecture, Verification Gates, and Operational Runbook

### 7.1 Staging Environment Invariants & Safeguards
- **Database Isolation**: Staging MUST target an explicitly configured, dedicated staging database. Connection strings containing `prod` or ambiguous cluster identifiers are strictly rejected by test scripts and safety guards.
- **Enforced TLS Certificate Verification**: Staging connections enforce TLS certificate verification (`rejectUnauthorized: true`). The TLS certificate verification bypass is restricted to local development environments and strictly prohibited in staging/production.
- **Enterprise OIDC Authentication**: In staging and production, authentication relies on trusted OpenID Connect (OIDC) identity providers with verified cryptographic signatures, strict issuer matching (`AUTH_PROVIDER_ISSUER_URL`), client audience validation (`AUTH_PROVIDER_CLIENT_ID`), verified emails, and fresh account status lookups in persistent storage.
- **Zero-Secret Disclosure Policy**: System logs, test outputs, error responses, and audit records never print or expose database connection credentials, private signing keys (`AUTH_SECRET`), or OIDC client secrets.

### 7.2 Staging Verification Gates
Before authorizing any live database migrations or demo content imports, all four prerequisite gates must be satisfied:
1. **Gate 1: Static Code & Cryptographic Verification (PASSED)**
   - All 93 automated unit, security, and contract verification checks in `scripts/test-cms-repository.ts` pass cleanly (0 failures).
   - SQL migration files statically validated against dangerous DDL/DML statements.
   - OIDC claims parser, clock-skew boundaries, and cryptographic signature verifiers verified.
2. **Gate 2: Database Connectivity & Schema Tracking (DEFERRED / READY)**
   - Requires provisioned staging PostgreSQL connection string configured via `DATABASE_URL` or `TEST_DATABASE_URL`.
   - Migration runner confirms target database identity (`redactDatabaseUrl`) before execution.
   - Migrations `001_initial_editorial_schema.sql` and `002_security_audit_logs.sql` applied transactionally with `schema_migrations` tracking.
3. **Gate 3: Remote Identity Provider Live Handshake (DEFERRED / READY)**
   - Requires remote OIDC identity provider credentials (`AUTH_PROVIDER_ISSUER_URL`, `AUTH_PROVIDER_CLIENT_ID`, `AUTH_PROVIDER_CLIENT_SECRET`).
   - Live test accounts mapped to pre-registered newsroom staff roles in `editorial_users`.
4. **Gate 4: Demo Importer Invariant Protection (PASSED DRY-RUN)**
   - Dry-run verification confirms 18/18 demo articles transformed with `status = 'draft'`, `breaking = false`, and cleared publish timestamps.
   - No records modified without explicit execution flag and verified database readiness.


