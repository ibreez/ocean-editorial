# Implementation Roadmap: Dhivehi Digital News Platform

## Overview
This roadmap tracks the step-by-step implementation of the modern Maldivian Dhivehi news platform ("Ocean Editorial").
Execution follows a phased methodology. No future phase will be started without explicit instruction.

---

## Phase 1: Project Inspection and Architecture (Completed)
- [x] Inspect existing project files, folder structure, configuration, and dependencies.
- [x] Review `design.md` for design system foundations, color tokens, Thaana typography, RTL rules, and accessibility standards.
- [x] Identify framework version (Next.js 15.4.9 App Router, React 19.2.1, Tailwind CSS 4.1.11, TypeScript 5.9.3).
- [x] Formulate high-level architectural design (directory structure, data modeling, RTL layout strategy, component hierarchy).
- [x] Audit dependencies and identify any missing packages, risks, or conflicts.
- [x] Set required application metadata in `metadata.json` and sync with `app/layout.tsx`.
- [x] Document technical findings, architectural decisions, and open items/risks in the Phase 1 report.

---

## Phase 2: Design System & Foundational Architecture (Completed)
- [x] Configure `app/layout.tsx` for Dhivehi-first RTL (`lang="dv" dir="rtl"`).
- [x] Configure font stack for Dhivehi (Thaana glyph coverage, Noto Sans Thaana / Faruma fallback) and Latin (Inter / sans-serif).
- [x] Implement design tokens in `app/globals.css` with Tailwind v4 `@theme` and semantic CSS variables.
- [x] Create domain types in `types/article.ts` (Article, Category, Author, Block, Status).
- [x] Establish typed demo dataset and content queries in `lib/articles.ts`, `lib/categories.ts`, `lib/site-config.ts`.
- [x] Implement foundational UI primitives (`button.tsx`, `badge.tsx`, `skeleton.tsx`, `empty-state.tsx`, `error-state.tsx`).
- [x] Build shared navigation components: `SiteHeader`, `DesktopNavigation`, `MobileNavigation`, `SiteFooter`.

---

## Phase 3: Dhivehi Typography, Fonts, RTL, and Localization (Completed)
- [x] Configure premier Dhivehi editorial fonts: Self-hosted `Faruma` (`/public/fonts/Faruma.ttf`, NCIT/President's Office Maldives) for body and headlines, and `Faseyha` (`/public/fonts/Faseyha.ttf`) with zero-CLS `next/font/local` and `@font-face` rules. Fallbacks: `A_Faseyha`, `MV Boli`, sans-serif.
- [x] Configure Latin font (`Inter` via `next/font/google` and system sans-serif fallback).
- [x] Implement complete typography tokens scale from `design.md` (`font.size.xs` 12px to `font.size.5xl` 48px, plus semantic headline and article prose classes).
- [x] Implement strict Thaana rules (`letter-spacing: normal !important`, generous line-height $\ge 1.75$, `text-wrap: balance` for headlines).
- [x] Build bidirectional isolation component `components/ui/bdi.tsx` (`<Bdi>`) to protect mixed Latin names, URLs, phone numbers, and codes from RTL corruption.
- [x] Build localization and typography utilities in `lib/typography.ts` (MVR currency formatting, reading time calculation, punctuation normalization for `،`, `؛`, `؟`).
- [x] Implement RTL drop cap style (`.thaana-dropcap`) for editorial article openings.
- [x] Create dedicated verification suite at `app/typography-test/page.tsx` testing the 9 scale steps, mixed-language strings, numbers, punctuation, and responsive behavior.

---

## Phase 4: Shared Application Layout and Navigation (Completed)
- [x] Build shared site header (`SiteHeader`) with utility strip, Maldivian location, and date display.
- [x] Implement dignified Maldivian editorial brand/logo text treatment (`ކަނޑު އެޑިޓޯރިއަލް` / `Ocean Editorial`).
- [x] Implement primary navigation with Dhivehi category labels and active state indicators in `DesktopNavigation`.
- [x] Build breaking news banner (`BreakingNewsBanner`) loaded dynamically from editorial data with dismissible state and zero layout shifts.
- [x] Build responsive mobile navigation drawer (`MobileNavigation`) with RTL slide-over, focus management, Escape key support, and full ARIA attributes.
- [x] Add search entry point in header linking to `/search` route.
- [x] Add saved articles entry point in header linking to `/saved` route.
- [x] Implement shared editorial footer (`SiteFooter`) with category links, editorial ethics statement, neutral social link placeholders, and back-to-top button.
- [x] Ensure reusable shared layout across all pages (`app/layout.tsx`) with keyboard skip-to-content accessibility.

---

## Phase 5: Homepage and Editorial Story Components (Completed)
- [x] Build asymmetric lead-story composition (`LeadStory`) with 16:9 photography, oversized Dhivehi headline, standfirst, and attribution.
- [x] Build secondary top features in balanced grid (`ArticleCard` with standard variant).
- [x] Build chronological latest-news stream (`LatestNewsFeed`) with horizontal cards and interactive load-more action.
- [x] Build trending / most-read story rail (`CompactStoryRow`) featuring ranking figures 01 to 04 with tabular numerals.
- [x] Build featured opinion & analysis section (`ArticleCard` opinion variant) with quotation styling and author role bylines.
- [x] Build structured category sections for Maldives, Sports, and Economy (`CategorySection` & `SectionHeading`).
- [x] Assemble production-grade homepage in `app/page.tsx` integrating all editorial sections into an asymmetric, high-contrast, Maldivian editorial layout.

---

## Phase 6: Article Detail Pages (Completed)
- [x] Build comprehensive article detail page `app/article/[slug]/page.tsx` with dynamic Next.js OpenGraph and Twitter metadata.
- [x] Implement comfortable 720px reading column (`reading-column`) with relaxed leading and editorial drop caps.
- [x] Build interactive reading controls toolbar (`ShareActions`) supporting native Web Share API, clipboard link copying with feedback, bookmarking state, print trigger, and live text sizing (A- / A / A+).
- [x] Implement support for rich body blocks: paragraphs, subheadings (`h2`), blockquotes with author citations, images with captions and photo credits, and tag links.
- [x] Implement author bio card with role attribution and updated revision timestamps.
- [x] Build related stories section (`RelatedStories`) recommending relevant articles from the same category while excluding the current story.
- [x] Implement print-friendly styles (`@media print`) hiding interactive navigation and overlays.
- [x] Verify routing with static params generation (`generateStaticParams`) and robust 404 handling (`notFound`).

---

## Phase 7: Category Pages and Latest-News Feeds (Completed)
- [x] Build comprehensive category archive pages `app/category/[slug]/page.tsx` (featured category story, grid/list view toggle, sorting, pagination/load-more).
- [x] Build dedicated latest-news page `app/latest/page.tsx` and `components/news/latest-news-archive-view.tsx` (real-time indicator, category filtering tabs with counts, chronological timeline grouping, load more, and trending sidebar).
- [x] Implement sibling category switcher navigation and breadcrumb hierarchy (`/category/[slug]`).
- [x] Add latest news entry points across desktop navigation, mobile navigation, and footer.

---

## Phase 8: Search and Discovery (Completed)
- [x] Build dedicated search route `app/search/page.tsx` with dynamic Next.js OpenGraph and Twitter metadata.
- [x] Implement reusable search utility `lib/search.ts` with whitespace normalization, multi-field matching (headlines, summaries, body blocks, category names, tags, authors), scoring, and newest-first / relevance sorting.
- [x] Build comprehensive search view `components/news/search-view.tsx` with Dhivehi headings, labeled input, clear-search button, and submit action.
- [x] Implement URL query parameter synchronization (`/search?q=...&category=...&sort=...`) supporting refresh, sharing, and browser back/forward navigation.
- [x] Add helpful pre-search empty state with discovery guides and quick category shortcuts.
- [x] Add helpful no-results state with suggestions (spelling checks, alternate keywords, category browsing).
- [x] Add popular Dhivehi search keyword chips (ރާއްޖެ, ސިޔާސީ, މަޖިލިސް, ފަތުރުވެރިކަން, ތިމާވެށި, ކުޅިވަރު, ފުޓްބޯޅަ, ދިވެހި ބަސް) for instant query exploration.
- [x] Implement responsive view toggle (Grid / List mode) and category filter pills with live match counts.
- [x] Maintain search entry points in site header and mobile navigation drawer.

---

## Phase 9: Saved Articles and Sharing (Completed)
- [x] Build saved articles management page `app/saved/page.tsx` and `components/news/saved-articles-view.tsx` with local storage synchronization, view modes (grid/list), category filtering, and remove actions.
- [x] Implement robust browser persistence (`lib/saved-articles.ts`) with error handling, schema validation, multi-tab sync, and privacy transparency notices.
- [x] Build reusable, accessible `BookmarkButton` (`components/actions/bookmark-button.tsx`) with visual active states, aria labels, and feedback alerts across story cards, lead stories, and article reading pages.
- [x] Build enhanced `ShareActions` and `ShareModal` (`components/actions/share-modal.tsx`) supporting Web Share API, direct clipboard copy, and primary Maldivian social channels (Viber, WhatsApp, Telegram, Facebook, X/Twitter).
- [x] Implement real-time saved count badge in desktop site header and mobile navigation drawer (`components/layout/saved-nav-button.tsx`) with zero hydration mismatch.
- [x] Add batch action "Clear all saved articles" with double-confirmation dialog and empty-state recommended stories exploration.

---

## Phase 10: Live Coverage and Multimedia (Completed)
- [x] Create live coverage data model and demo events repository `lib/live-coverage.ts` (active session with updates, completed match coverage with concluding highlights).
- [x] Build reusable, responsive live coverage route `app/live/[slug]/page.tsx` with dynamic OpenGraph & Twitter metadata and 404 handling.
- [x] Build comprehensive live timeline component `components/news/live-coverage-view.tsx` with RTL stem layout, status pills (pulsing LIVE badge for active, neutral badge for completed), key updates filter, timestamp anchor sharing, and related navigation.
- [x] Build editorial media components `components/media/editorial-image.tsx` and `components/media/editorial-video.tsx` with responsive aspect ratios, fallbacks, captions, and source attribution.
- [x] Integrate `LiveCoverageBanner` (`components/news/live-coverage-banner.tsx`) into the homepage for active editorial live events.
- [x] Document static demo boundary and zero-unnecessary-polling architectural decision.

---

## Phase 11: SEO, Metadata, and Content Integration Readiness (Completed)
- [x] Implement comprehensive Next.js Metadata API coverage across all routes (Homepage, Article Detail, Category Archives, Latest News, Search, Saved Articles, Live Coverage, About, Privacy, and 404).
- [x] Configure canonical URL resolution utility (`lib/site-url.ts`) using consistent production domain (`NEXT_PUBLIC_SITE_URL`, `APP_URL`, or `https://oceaneditorial.mv`).
- [x] Generate dynamic XML sitemap (`app/sitemap.ts`) including all indexable routes, categories, published articles with accurate `lastModified` timestamps, and live coverage events.
- [x] Exclude private browser-local utility (`/saved`) and search query parameters (`/search`) from sitemap and indexing to prevent crawler bloat.
- [x] Implement dynamic `robots.txt` (`app/robots.ts`) with clear allow/disallow directives and sitemap reference.
- [x] Implement rich Schema.org JSON-LD structured data via safe `<JsonLd>` component:
  - `NewsArticle` on all individual story pages with headline, image, dates, author, and publisher.
  - `BreadcrumbList` on article, category, latest news, and live coverage routes.
  - `LiveBlogPosting` on live event pages with status, start/update times, and update blog entries.
  - `NewsMediaOrganization` and `WebSite` with `SearchAction` in root layout.
- [x] Build asynchronous content service and publishing integration layer (`lib/content-service.ts`) with `IEditorialContentAdapter`, `LocalEditorialAdapter`, and `RemoteCmsAdapter` for future headless CMS migration.
- [x] Document production environment variables (`NEXT_PUBLIC_SITE_URL`, `CMS_API_URL`, `CMS_API_TOKEN`) in `.env.example`.

---

## Phase 12: Accessibility, Responsive Design, Performance & Final QA (Completed)
- [x] **WCAG 2.2 AA Accessibility Audit**:
  - Implemented `@media (prefers-reduced-motion: reduce)` in `app/globals.css` collapsing animations/transitions for vestibular accessibility.
  - Added visible, high-contrast `:focus-visible` styling (`outline: 2px solid #0f766e`, ring offsets) across all interactive controls (buttons, links, search clear buttons, category filters, view mode toggles, sort options, and back-to-top).
  - Enforced touch target minimums ($\ge 44$px on mobile, $\ge 36$–$40$px desktop) on `BookmarkButton`, `ShareModal` channel items, `SearchView` clear/keyword buttons, `MobileNavigation` drawer links, and `SiteFooter` social buttons.
  - Implemented focus trapping (`Tab` and `Shift+Tab`) and focus restoration in `ShareModal` and `MobileNavigation`.
  - Added live screen-reader announcements (`role="status"` and `aria-live="polite"`) across all `BookmarkButton` variants (`button`, `card`, `icon`) and `SearchView` result counter.
  - Formally specified `role="alertdialog"`, `aria-labelledby`, and `aria-describedby` on the "Clear All Saved Articles" confirmation dialog.
- [x] **Responsive Design & RTL Layout**:
  - Enforced `overflow-x: clip` on `html` and `body` in `app/globals.css` ensuring zero horizontal scrolling across viewports from 320px to 1440px.
  - Verified RTL layout orientation, timeline stems, breadcrumbs (`rtl:rotate-0` on `ChevronLeft`), and mixed-language bidirectional isolation (`<Bdi>`).
- [x] **Typography & Localization**:
  - Preserved self-hosted `Faruma` (`/public/fonts/Faruma.ttf`) and `Faseyha` (`/public/fonts/Faseyha.ttf`) font loading with `font-display: swap` and zero CLS.
  - Verified Thaana ligature protection (`letter-spacing: normal !important`) and editorial line heights ($\ge 1.75$ / $2.0$).
- [x] **Performance & Rendering**:
  - Prioritized above-the-fold media on `LeadStory` with `fetchPriority="high"`.
  - Configured lazy loading (`loading="lazy"`) and aspect-ratio constraints across all secondary editorial cards to eliminate cumulative layout shifts.
  - Error boundaries and fallbacks implemented for all images and video embeds.
- [x] **Content Integration & Configuration Safety**:
  - Verified that absence of external CMS configuration automatically activates `LocalEditorialAdapter` with zero runtime crashes.
  - Verified that `NEXT_PUBLIC_SITE_URL` is configurable without hardcoded production assumptions.
  - Confirmed that private routes (`/saved`) and search query parameters (`/search`) remain excluded from search index.
- [x] **Build & Verification Execution**:
  - `compile_applet`: Build succeeded with zero errors.
  - `lint_applet`: Clean run with zero ESLint errors or warnings.

---

## Phase 15: Ocean Editorial CMS Foundation and Admin Dashboard (Completed)
- [x] **CMS Editorial Data Model (`types/cms.ts`)**:
  - Designed database-ready editorial schema: `CmsArticle`, `CmsCategory`, `CmsAuthor`, `EditorialUser`, `CmsArticleRevision`, `CmsMediaAsset`, and `CmsDashboardMetrics`.
  - Implemented formal editorial workflow states: `draft`, `in_review`, `scheduled`, `published`, `archived` with state machine transition rules (`WORKFLOW_TRANSITIONS`, `canTransitionWorkflow`).
  - Separated public live-coverage status from internal editorial workflow states.
- [x] **Managed Database Strategy & PostgreSQL Schema (`migrations/001_initial_editorial_schema.sql`)**:
  - Authored comprehensive PostgreSQL DDL migration establishing tables, foreign keys, unique constraints, and performance indexes.
  - Defined provider-neutral repository contract `ICmsRepository` in `lib/cms/repository.ts`.
  - Implemented `MemoryCmsRepository` as staging adapter, enabling testing without requiring external credentials.
  - Documented `DATABASE_URL`, `DATABASE_SSL`, and `DATABASE_MAX_CONNECTIONS` in `.env.example`.
- [x] **Authentication & Authorization Boundary (`lib/cms/auth-boundary.ts`)**:
  - Built server-side authorization check `requireServerAuth` enforcing role hierarchies (`admin`, `editor`, `journalist`).
  - Configured fail-closed behavior for all CMS mutations (`saveArticleDraftAction`) until an external auth provider is configured.
  - Zero fake client-side credentials or hardcoded passwords.
- [x] **Admin Dashboard & Navigation (`/admin`)**:
  - Built responsive editorial dashboard `/admin` (`components/admin/dashboard-view.tsx`, `components/admin/admin-header.tsx`, `app/admin/layout.tsx`).
  - Implemented workflow count metrics cards (Total, Draft, In Review, Scheduled, Published, Archived).
  - Implemented multi-status filtering tabs, category filtering dropdown, and article search.
  - Labeled staging demonstration data with transparent notice banner.
  - Configured `robots: { index: false, follow: false }` and `app/robots.ts` disallow rules.
- [x] **Article Management Foundation (`/admin/articles/new` & `/admin/articles/[id]`)**:
  - Built accessible `ArticleForm` supporting Dhivehi headline, English headline, standfirst summary, category, author, status, and body paragraphs.
  - Implemented live slug availability check (`checkSlugAvailabilityAction`) and auto-slug generation.
  - Integrated server action `saveArticleDraftAction` with server-side validation and fail-closed feedback.
- [x] **Safe Demo Content Migration Importer (`lib/cms/importer.ts`, `scripts/import-demo-articles.ts`)**:
  - Implemented idempotent importer transforming demo articles into unpublished drafts.
  - Enforced strict rules: Status forced to `draft`, active breaking flags cleared (`breaking: false`), original demo data preserved.
  - Created CLI migration runner supporting `--dry-run` and `--execute`.
  - Verified 18 demo articles inspected and transformed cleanly in dry-run mode.
- [x] **Public Website Compatibility**:
  - Public website continues to read from `lib/content-service.ts` and `LocalEditorialAdapter`.
  - No unpublished drafts appear on public routes, search, sitemap, or structured data.


---

## Phase 13: Security and Production Readiness Audit (Completed)
- [x] **Secrets & Environment Variables**:
  - Audited codebase for private secrets exposure: zero `process.env` secrets accessed in client components.
  - Verified `.gitignore` prevents committing `.env*` files while allowing `.env.example`.
  - Documented placeholders in `.env.example` including `CMS_API_URL`, `CMS_API_TOKEN`, `CMS_REVALIDATE_SECONDS`, and `CMS_ALLOW_DEMO_FALLBACK`.
- [x] **Content-Service & CMS Safety**:
  - Implemented runtime schema validation in `lib/content-service.ts` (`isValidArticle`, `isValidCategory`, `isValidLiveCoverage`, `validatePaginatedArticles`) to reject malformed external payloads.
  - Added bounded 8-second request timeouts (`AbortSignal.timeout(8000)`) preventing worker thread starvation.
  - Protected against token/credential leakage in error objects and upstream response handling.
  - Enforced bounded revalidation interval ($10\text{s} \le \text{revalidate} \le 86400\text{s}$).
  - Enforced strict breaking news policy: Never silently surfaces mock demo items as real breaking alerts during CMS outages.
  - Preserved `LocalEditorialAdapter` as reliable local default when external CMS is unconfigured.
- [x] **Input Handling & Rendering Safety**:
  - Built `lib/input-validation.ts` with strict slug validation (`isValidSlug`), search input sanitization (`sanitizeSearchQuery`), media URL protocol checks (`isSafeMediaUrl`), and video embed allowlisting (`getSafeVideoEmbed`).
  - Guarded dynamic routes (`/article/[slug]`, `/category/[slug]`, `/live/[slug]`) against malformed slugs, path traversal, null bytes, and oversized inputs.
  - Hardened `EditorialVideo` with iframe sandbox attribute (`sandbox="allow-scripts allow-same-origin allow-presentation"`), referrer policy, and strict YouTube/Vimeo domain allowlisting.
  - Hardened `EditorialImage` against dangerous schemes (`javascript:`, `data:`).
  - Hardened JSON-LD structured data escaping in `components/seo/json-ld.tsx` against `<script>` breakouts and HTML entity injection.
  - Bounded search queries to 150 characters to prevent ReDoS or memory bloat.
- [x] **HTTP & Application Security Headers**:
  - Configured production security headers in `next.config.ts`:
    - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
    - `X-Content-Type-Options`: `nosniff`
    - `Referrer-Policy`: `strict-origin-when-cross-origin`
    - `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), browsing-topics=()`
    - `X-XSS-Protection`: `1; mode=block`
    - `Content-Security-Policy`: compatible CSP supporting Next.js hydration, self-hosted Thaana fonts, picsum images, and sandboxed video embeds without breaking AI Studio iframe preview.
- [x] **Build & Verification Execution**:
  - Compile and lint checks run cleanly with 0 errors.

---

## Phase 16: Secure Authentication and Editorial Role-Based Access Control (Completed)
- [x] **Server-Side Authentication Architecture**:
  - Established cryptographically signed session tokens (`payload.signature`) using HMAC-SHA256 and constant-time comparison (`crypto.timingSafeEqual`) in `lib/cms/session.ts`.
  - Configured secure, HTTP-only cookies (`cms_session`) with `SameSite: "lax"`, `path: "/"`, `maxAge: 28800` (8 hours), and `Secure` flag enabled in production.
  - Required 32+ character `AUTH_SECRET` in production, with documented `.env.example` guidance.
  - Maintained zero-plaintext password storage and zero mock client-side credentials.
- [x] **Centralized Role-Based Access Control (RBAC)**:
  - Enforced permission checks for 3 distinct editorial roles in `lib/cms/permissions.ts`:
    - **Administrator**: Full system authority, article management, workflow transitions, user role assignment (`updateUserRoleAction`), account activation/deactivation (`toggleUserStatusAction`), and audit log inspection.
    - **Editor**: Review, schedule, publish, or archive articles; manage breaking-news and featured-story flags; full review tools.
    - **Journalist**: Create drafts, edit own drafts (`articles:edit_own`), submit drafts for editorial review (`articles:submit_review`). Forbidden from direct publishing, scheduling, archiving, breaking-news toggling, or editing other authors' work.
  - Implemented `canUserViewArticle` and `canUserEditArticle` guards protecting individual articles against unauthorized viewing or mutation.
  - Scoped dashboard queries (`cmsRepository.getArticles({ createdBy: user.id })`) and workflow metrics cards so journalists only view content they are authorized to access.
- [x] **Protected Administration Surface & User Management**:
  - Guarded all `/admin` editorial routes (`/admin`, `/admin/articles/new`, `/admin/articles/[id]`, `/admin/users`) with `getServerAuthSession()` and fail-safe redirection to `/admin/login` with preserved `callbackUrl`.
  - Built dedicated user management surface at `/admin/users` (`app/admin/users/page.tsx` & `components/admin/user-management-view.tsx`) accessible exclusively to Administrators.
  - Protected against privilege escalation: Administrators are prevented from self-demotion or self-deactivation.
  - Handled edge cases: Deactivated users and role alterations are checked dynamically against the repository on every request in `getServerAuthSession()`.
- [x] **Rate Limiting & Brute-Force Defense**:
  - Built sliding-window in-memory rate limiter `lib/cms/rate-limiter.ts` restricting consecutive failed sign-in attempts (max 5 failed attempts per 15-minute window with 15-minute lockout).
  - Automatically resets rate limit counters upon successful authentication.
- [x] **Centralized Security Audit Trail**:
  - Built `lib/cms/audit.ts` tracking all significant security and workflow events (`AUTH_SIGN_IN`, `AUTH_SIGN_OUT`, `AUTH_FAILED`, `ROLE_CHANGED`, `WORKFLOW_TRANSITION`, `ARTICLE_CREATED`, `ARTICLE_UPDATED`, `ARTICLE_DELETED`, `UNAUTHORIZED_ACCESS`).
  - Enforced zero-credential logging: Strips tokens, passwords, cookies, and secret values before logging.
  - Provided interactive audit log inspector in `/admin/users` tab for newsroom administrators.
- [x] **Build & Verification Execution**:
  - `compile_applet`: Production build succeeded cleanly.
  - `lint_applet`: Clean run with zero ESLint errors or warnings.

---

## Phase 17: Managed PostgreSQL Integration and Persistent CMS Storage (Completed)
- [x] **Database Driver & Connection Pool Management (`lib/cms/db.ts`)**:
  - Selected provider-neutral `pg` driver compatible with Next.js 15+ server runtime and managed PostgreSQL services (Neon, Supabase, Cloud SQL, AWS RDS).
  - Implemented server-only connection pooling with bounded connections (`DATABASE_MAX_CONNECTIONS`, default: 10, max: 30) and 30-second idle timeouts.
  - Configured TLS SSL mode support (`rejectUnauthorized: false` for managed cloud poolers, toggled via `DATABASE_SSL`).
  - Enforced parameterized queries (`query<T>()`) across all database operations to eliminate SQL injection risks.
  - Implemented transaction helper `withTransaction<T>()` with automated `BEGIN`, `COMMIT`, and `ROLLBACK` handling.
  - Built credential redaction helper (`redactDatabaseUrl`) preventing secret leakage in system diagnostics and logs.
  - Built sanitized database error mapping (`sanitizeDatabaseError`) masking raw SQL errors, foreign keys, and unique constraint violations from client responses.
- [x] **Persistent Repository Adapter (`lib/cms/postgres-repository.ts`)**:
  - Implemented `PostgresCmsRepository` strictly conforming to `ICmsRepository` interface.
  - Full workflow lifecycle support: draft, in_review, scheduled, published, archived.
  - Dynamic filtering: workflow status, category slug, author slug, query text search (ILIKE), creator ID (for journalist isolation), pagination (`LIMIT`/`OFFSET`), and configurable sorting.
  - Atomic mutations with row-level locking (`SELECT ... FOR UPDATE`) preventing concurrent edit collisions.
  - Automatic article revision history tracking in `article_revisions` table on every creation and update.
  - Role-specific dashboard metrics with SQL aggregation (`COUNT(*) FILTER (WHERE ...)`), isolating metrics for journalists to their authored articles.
  - Full editorial user management support (`getEditorialUsers`, `getEditorialUserById`, `getEditorialUserByEmail`, `updateUserRole`, `updateUserStatus`, `createEditorialUser`) enforcing anti-lockout rules.
- [x] **Repository Selection & Fail-Closed Behavior (`lib/cms/repository.ts`)**:
  - Implemented `getRepositoryType()` returning `"postgres"` when `DATABASE_URL` is configured, or `"memory"` in local staging.
  - Implemented dynamic singleton provider `getCmsRepository()` and transparent proxy `cmsRepository`.
  - Enforced production fail-closed invariants in `MemoryCmsRepository.assertWritable()`: Mutating operations throw `PRODUCTION_FAIL_CLOSED` in production if `DATABASE_URL` is unconfigured, preventing silent data loss.
  - Transparent admin indicator in `components/admin/dashboard-view.tsx` showing exact storage engine (`Persistent Managed PostgreSQL Storage` vs `Staging Memory Storage (PostgreSQL Unconfigured)`).
- [x] **SQL Schema & Versioned Migrations (`migrations/` & `scripts/run-migration.ts`)**:
  - Verified `001_initial_editorial_schema.sql` defining `editorial_users`, `categories`, `authors`, `articles`, `article_revisions`, and `media_assets` with UUID primary keys, check constraints, and performance indexes.
  - Added `002_security_audit_logs.sql` defining `security_audit_logs` table with indexed timestamps, event types, and outcomes.
  - Built versioned migration runner `scripts/run-migration.ts` with `--dry-run` (static AST checks preventing dangerous SQL commands) and `--execute` (transactional tracking via `schema_migrations`).
- [x] **Safe Demo Content Importer (`lib/cms/importer.ts` & `scripts/import-demo-articles.ts`)**:
  - Implemented dual-target importer supporting `--target=postgres` and `--target=memory`.
  - Preserved strict editorial invariants: Status forced to `draft`, breaking flag cleared (`breaking: false`), published date cleared.
  - Guaranteed idempotency: Skips existing slugs before insertion.
- [x] **Automated Verification Test Suite (`scripts/test-cms-repository.ts`)**:
  - Created 27-check automated test suite verifying credential redaction, error masking, SQL migration static safety, repository contract compliance, administrator self-demotion protection, journalist view/edit scoping, and importer invariants.
  - Test suite passes with 27/27 assertions verified.
- [x] **Build & Verification Execution**:
  - `compile_applet`: Production build succeeded cleanly.
  - `lint_applet`: Clean run with zero ESLint errors or warnings.

---

## Phase 18: Authentication Hardening and PostgreSQL Integration Verification (Completed)
- [x] **Audit & Secure Identity Verification**:
  - Verified and audited `lib/cms/session.ts`, `lib/cms/auth-boundary.ts`, `lib/cms/permissions.ts`, `lib/cms/rate-limiter.ts`, `lib/cms/audit.ts`, and admin actions.
  - Enforced zero-trust identity: Browser-supplied email, role, or user ID is never trusted as authentication; identity is verified strictly server-side through `requireServerAuth()` and fresh database lookups.
  - Enforced production fail-closed sign-in: In `production`, simulation/email-only sign-in is blocked (`AUTH_PROVIDER_UNCONFIGURED`). Production requires an authorized identity provider (OIDC/OAuth 2.0/SSO) with verified tokens.
  - Enforced strong `AUTH_SECRET`: Rejects known weak placeholders (e.g. `12345678901234567890123456789012`), requires min 32 characters, and fails closed in production.
  - Validated session cookie settings: `httpOnly: true`, `secure: true`, `sameSite: "lax"`, restricted path `/admin`, and standardized deletion cookies matching path `/admin` with `maxAge: 0`.
  - Implemented session revocation via unique `jti` in tokens and `revokeAllUserSessions(userId)` upon account deactivation or role modification.
  - Implemented database freshness guard (`validateUserSession`): On every request, user status and role are verified against persistent storage. Deactivated accounts immediately return `USER_DEACTIVATED`, and role changes immediately invalidate previous tokens carrying stale roles (`INVALID_SESSION`).
- [x] **Server-Side Authorization Enforcement on Every Protected Operation**:
  - All CMS mutations (`saveArticleDraftAction`, `deleteArticleAction`, `updateUserRoleAction`, `toggleUserStatusAction`, `getAuditLogsAction`, `getArticleRevisionsAction`) perform server-side authentication and role permission checks.
  - Enforced journalist ownership restrictions at both server action level (`canUserEditArticle`) and repository level (`MemoryCmsRepository.updateArticle`, `PostgresCmsRepository.updateArticle`, `getArticleRevisions`): Journalists cannot read private revisions or modify articles created by others.
  - Enforced workflow state transitions on the server (`authorizeWorkflowTransition`): Journalists cannot directly publish, schedule, archive, or set breaking news. Archived articles cannot jump directly to published.
  - Protected against administrator self-demotion and self-deactivation lockout at action and repository levels.
  - Sanitized audit logs: Sensitive details (`password`, `token`, `sessionCookie`, database URLs) are masked with `[REDACTED]`.
- [x] **PostgreSQL Integration Hardening & TLS Verification**:
  - Unconditionally enforced TLS certificate verification (`rejectUnauthorized: true`) in production regardless of environment variable overrides in `lib/cms/db.ts`. Self-signed certificates allowed strictly in non-production local development.
  - Parameterized all SQL statements and allowlisted sort columns (`updatedAt`, `createdAt`, `publishedAt`) to eliminate SQL injection risks.
  - Row-level locking (`SELECT ... FOR UPDATE`) and transaction boundaries (`withTransaction`) prevent concurrent edit collisions and lost updates.
  - Sanitized database connection errors: Internal SQL schemas, foreign keys, and unique constraint errors are mapped to user-safe messages without leaking database credentials.
  - Migration tracking: Schema tracking table `schema_migrations` tracks applied versions and skips them idempotently; failure rolls back the entire transaction without marking incomplete migrations as successful.
- [x] **Public-Site Content Isolation & Draft Confidentiality**:
  - Updated `LocalEditorialAdapter.getArticles()` and `search()` to strictly filter out `status === "draft"`.
  - Updated `LocalEditorialAdapter.getArticleBySlug()` to return `null` for draft articles.
  - Confirmed public pages only render genuinely published articles (`published`, `breaking`, `updated`).
- [x] **Comprehensive Automated Verification (93 Passed, 0 Failed)**:
  - Extended test suite in `scripts/test-cms-repository.ts` to 93 passing assertions.
  - Tested: Valid, tampered, expired, and revoked sessions; `validateUserSession` with active, deactivated, and role-changed users; journalist ownership restrictions; editor mutation restrictions; state machine invalid transitions; optimistic concurrency conflict detection; draft isolation from public adapters; production fail-closed behavior; weak and short secret rejection; production TLS certificate verification enforcement; audit log credential redaction; migration tracking idempotency; and OIDC claim validation and signature verification.
- [x] **Environment & Operational Documentation**:
  - Updated `.env.example` with detailed specifications for `AUTH_SECRET`, OIDC/SSO provider configuration, TLS certificate settings (`DATABASE_REJECT_UNAUTHORIZED`, `DATABASE_CA_CERT`), and opt-in test database (`TEST_DATABASE_URL`).
  - Updated `design.md` with Section 6 and Section 7.
- [x] **Build & Verification Execution**:
  - `compile_applet`: Production build succeeded cleanly.
  - `lint_applet`: Clean run with zero ESLint errors or warnings.
  - `npx tsx scripts/test-cms-repository.ts`: 93/93 assertions passed.

---

## Phase 19: Controlled Staging Setup and Live Integration Verification (Audit & Gate Status)

### 1. Verification Tasks & Gate Audit
- [x] **Task 1: Codebase & Configuration Audit** [PASS]
  - Inspected `design.md`, `TODO.md`, `.env.example`, `lib/cms/db.ts`, `lib/cms/session.ts`, `lib/cms/auth-boundary.ts`, `lib/cms/permissions.ts`, `lib/cms/oidc.ts`, `scripts/run-migration.ts`, `lib/cms/importer.ts`, `lib/content-service.ts`.
  - Verified repository type resolution, session revocation storage, and draft content boundaries.
- [x] **Task 2: Staging Prerequisites & Environment Documentation** [PASS]
  - Documented prerequisites: `NODE_ENV`, `AUTH_SECRET` (min 32 chars), `DATABASE_URL` / `TEST_DATABASE_URL`, `DATABASE_SSL`, `DATABASE_REJECT_UNAUTHORIZED`, `AUTH_PROVIDER_ISSUER_URL`, `AUTH_PROVIDER_CLIENT_ID`, `AUTH_PROVIDER_CLIENT_SECRET`.
  - Zero secrets printed or logged.
- [x] **Task 3: Staging Isolated PostgreSQL & TLS Verification** [AUTOMATED: PASS | LIVE NETWORK: NOT RUN]
  - Automated: In `lib/cms/db.ts`, TLS certificate verification (`rejectUnauthorized: true`) cannot be disabled in production or staging. Static tests in Test Suite 9 pass.
  - Live Network: NOT RUN. `DATABASE_URL` and `TEST_DATABASE_URL` are not provisioned in the current sandbox environment (`has_DATABASE_URL: false`).
- [x] **Task 4: Enterprise OIDC Identity Provider Verification** [AUTOMATED: PASS | LIVE REMOTE IDP: NOT RUN]
  - Automated: In `lib/cms/oidc.ts`, JWT claims (iss, aud, sub, email, email_verified, exp, iat) and cryptographic signatures verified. All 8 OIDC tests in Test Suite 12 pass. Zero simulated fallback allowed in production (`AUTH_PROVIDER_UNCONFIGURED`).
  - Live Remote IdP: NOT RUN. Remote identity provider credentials (`AUTH_PROVIDER_ISSUER_URL`, `AUTH_PROVIDER_CLIENT_ID`) are unconfigured in this environment.
- [x] **Task 5: Target Database & Migration Confirmation** [DRY-RUN: PASS | LIVE EXECUTION: NOT RUN]
  - Migration runner (`scripts/run-migration.ts`) dry-run completed with 0 errors across `001_initial_editorial_schema.sql` and `002_security_audit_logs.sql`. Redacts credentials and checks target database safety.
  - Live Execution against remote DB: NOT RUN. Awaiting staging database provisioning.
- [x] **Task 6: Live PostgreSQL Integration Tests** [AUTOMATED CONTRACT: PASS | LIVE NETWORK: NOT RUN]
  - Automated: 93 automated test assertions pass in `scripts/test-cms-repository.ts` covering repository operations, revisions, optimistic concurrency, ownership enforcement, and authorization.
  - Live Network: NOT RUN. Skipped due to unconfigured `TEST_DATABASE_URL`.
- [x] **Task 7: Editorial Authentication & Permission Testing** [AUTOMATED: PASS | LIVE REMOTE IDP: NOT RUN]
  - Automated: Tested sign-in token generation, signature validation, session expiry, JTI revocation, user-wide session invalidation, database role changes, account deactivation, and permissions for journalists, editors, and administrators.
  - Live Remote IdP: NOT RUN. Deferred until remote IdP is provisioned.
- [x] **Task 8: Public Article Retrieval, Search, and Slug Isolation** [PASS]
  - Verified `LocalEditorialAdapter` strictly filters out drafts (`status === "draft"`).
  - Verified `getArticles()`, `search()`, and `getArticleBySlug()` never return draft content to public readers.
  - Test Suite 7 passes 4/4 assertions.
- [x] **Task 9: Demo-Import Dry Run & Invariant Inspection** [PASS]
  - Executed `npx tsx scripts/import-demo-articles.ts --dry-run`.
  - Inspected 18 articles: All forced to `status = 'draft'`, `breaking = false`, `publishedAt = undefined`.
  - Invariants confirmed; zero records modified without explicit execution authorization.
- [x] **Task 10: Documentation & Safety Alignment** [PASS]
  - Updated `design.md` (Section 7: Controlled Staging Architecture and Verification Gates).
  - Updated `scripts/test-cms-repository.ts` (93 passing assertions).
  - Updated `TODO.md` documenting actual results, deferred checks, and unresolved risks.

---

## Controlled Staging Status Summary

| Check / Gate | Target | Type | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **G1: Security & Redaction** | Session & DB Errors | Automated | **PASS** | Test Suite 1: Credential masking & error sanitization verified |
| **G2: Session Security & JTI** | Session Token Engine | Automated | **PASS** | Test Suite 2: JTI revocation & database freshness verified |
| **G3: SQL Migration AST Safety** | Migration Scripts | Automated / Static | **PASS** | Test Suite 3: 0 destructive DDL commands, idempotent SQL |
| **G4: Concurrency & Revisions** | Repository Engine | Automated | **PASS** | Test Suite 4: `revisionCount` concurrency & ownership scoping |
| **G5: Role Authorization (RBAC)** | Editorial Actions | Automated | **PASS** | Test Suite 5: Journalist ownership & editor/admin workflow gates |
| **G6: User Safeguards & Anti-Lockout**| Editorial Users | Automated | **PASS** | Test Suite 6: Admin self-demotion & deactivation lockout guards |
| **G7: Public Content Isolation** | Reader Adapters | Automated | **PASS** | Test Suite 7: 100% draft isolation from public search and slugs |
| **G8: Demo Importer Invariants** | Importer Engine | Automated / Dry-Run | **PASS** | Test Suite 8 & Dry-run: 18 items inspected, draft/non-breaking enforced |
| **G9: Production Fail-Closed & TLS** | Production Engine | Automated | **PASS** | Test Suite 9: Weak secret rejection & non-bypassable TLS verified |
| **G10: Audit Log Privacy** | Audit Logger | Automated | **PASS** | Test Suite 10: Sensitive fields redacted in audit trails |
| **G11: Migration Tracking** | Migration Runner | Dry-Run | **PASS** | Dry-run completed with 0 errors; idempotent schema tracking |
| **G12: OIDC Token Verification** | OIDC Engine | Automated | **PASS** | Test Suite 12: Claims, audience, issuer, and signature verified |
| **G13: Live PostgreSQL Connection**| Managed PostgreSQL | Live Network | **NOT RUN** | `TEST_DATABASE_URL` not configured in sandbox environment |
| **G14: Remote OIDC Provider** | Enterprise IdP | Live Network | **NOT RUN** | Remote IdP not provisioned in sandbox environment |
| **G15: Live Demo Import Execution** | Staging Database | Live Execution | **NOT RUN** | Deferred until Gate 13 & 14 are provisioned and authorized |

---

## Unresolved Risks & Operational Runbook for External Provisioning

1. **Unprovisioned Staging PostgreSQL Database (`TEST_DATABASE_URL`)**:
   - *Risk*: Without an active, isolated PostgreSQL instance, live network queries, live connection pool exhaustion, latency under connection spikes, and database transaction rollbacks under network partition cannot be verified over a real TCP socket.
   - *Runbook*: Provision a dedicated staging database (e.g. Neon, Supabase, Google Cloud SQL, or AWS RDS). Set `TEST_DATABASE_URL="postgres://user:pass@staging-host:5432/staging_db?sslmode=require"`. Run `npx tsx scripts/test-cms-repository.ts` to execute live network assertions.
2. **Unprovisioned Remote OIDC Identity Provider (`AUTH_PROVIDER_ISSUER_URL`)**:
   - *Risk*: Live third-party OAuth redirect flows, browser token handshakes, and remote JWKS key rotation cannot be exercised without remote credentials.
   - *Runbook*: Register a staging client in Google Workspace, Okta, or Azure AD. Configure `AUTH_PROVIDER_ISSUER_URL`, `AUTH_PROVIDER_CLIENT_ID`, and `AUTH_PROVIDER_CLIENT_SECRET`. Ensure test accounts exist in `editorial_users` table before live authentication.
3. **Demo Import Authorization Gate**:
   - *Policy*: Demo import execution (`--execute`) remains deferred until both live database connectivity and identity provider checks are verified and explicitly authorized.




