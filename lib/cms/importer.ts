import type { Article } from "@/types/article";
import type { CmsArticle } from "@/types/cms";
import { demoArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { isValidSlug } from "@/lib/input-validation";
import { isDatabaseConfigured, withTransaction, query } from "@/lib/cms/db";
import { cmsRepository, getRepositoryType } from "@/lib/cms/repository";

export interface ImportOptions {
  dryRun?: boolean;
  target?: "postgres" | "memory" | "auto";
  sourceArticles?: Article[];
  existingSlugs?: Set<string>;
}

export interface ImportItemResult {
  sourceId: string;
  slug: string;
  title: string;
  status: "imported" | "skipped" | "invalid";
  reason?: string;
  cmsRecord?: CmsArticle;
}

export interface ImportReport {
  dryRun: boolean;
  storageEngine: "postgres" | "memory";
  totalInspected: number;
  importedCount: number;
  skippedCount: number;
  invalidCount: number;
  generatedAt: string;
  items: ImportItemResult[];
  notes: string[];
}

/**
 * Transforms an existing demo article into an unpublished CMS draft record.
 * Strict invariants enforced:
 * 1. Status is ALWAYS forced to "draft".
 * 2. Active breaking news flag is ALWAYS forced to false (breaking: false)
 *    so demo alerts never manifest as active public breaking news.
 * 3. Never deletes original source demo data.
 * 4. Idempotent: Skips any slugs already present in existingSlugs set.
 */
export function transformDemoArticleToCmsDraft(
  source: Article,
  existingSlugs: Set<string> = new Set()
): { valid: boolean; reason?: string; record?: CmsArticle } {
  // Validate required fields
  if (!source.id || !source.title || !source.slug || !source.categorySlug || !source.body) {
    return { valid: false, reason: "Missing required core fields (id, title, slug, categorySlug, or body)." };
  }

  // Validate slug structure
  if (!isValidSlug(source.slug)) {
    return { valid: false, reason: `Malformed slug "${source.slug}". Must match safe slug format.` };
  }

  // Deduplication check
  if (existingSlugs.has(source.slug)) {
    return { valid: false, reason: `Duplicate slug "${source.slug}" already exists in CMS repository.` };
  }

  const categoryObj = categories.find((c) => c.slug === source.categorySlug);
  const categoryId = categoryObj ? categoryObj.id : `cat-${source.categorySlug}`;
  const categoryName = categoryObj ? categoryObj.name : source.categoryName || "ޚަބަރު";

  const now = new Date().toISOString();

  const draftRecord: CmsArticle = {
    id: `cms-imported-${source.id}`,
    slug: source.slug,
    title: source.title,
    englishTitle: source.englishTitle,
    summary: source.summary || "",
    englishSummary: undefined,
    body: source.body,
    categoryId,
    categorySlug: source.categorySlug,
    categoryName,
    authorId: `auth-${source.author.slug}`,
    author: {
      name: source.author.name,
      englishName: source.author.englishName,
      slug: source.author.slug,
      role: source.author.role,
      avatar: source.author.avatar,
    },
    // STRICT RULE: Force status to "draft" and breaking to false
    status: "draft",
    featured: Boolean(source.featured),
    breaking: false,
    image: source.image
      ? {
          src: source.image.src,
          alt: source.image.alt,
          caption: source.image.caption,
          credit: source.image.credit,
        }
      : undefined,
    video: source.video,
    tags: Array.isArray(source.tags) ? [...source.tags] : [],
    readTimeMinutes: source.readTimeMinutes || 3,
    isOpinion: Boolean(source.isOpinion),
    seoTitle: source.englishTitle ? `${source.title} | ${source.englishTitle}` : source.title,
    seoDescription: source.summary,
    createdAt: source.publishedAt || now,
    updatedAt: now,
    scheduledFor: undefined,
    publishedAt: undefined, // Cleared because it is an unpublished draft
    createdBy: "demo-migration-importer",
    lastEditor: "demo-migration-importer",
    revisionCount: 1,
  };

  return { valid: true, record: draftRecord };
}

/**
 * Runs the demo articles importer with persistent PostgreSQL support, dry-run mode, and detailed reporting.
 */
export async function importDemoArticles(options: ImportOptions = {}): Promise<ImportReport> {
  const isDryRun = options.dryRun ?? true;
  const sourceList = options.sourceArticles ?? demoArticles;

  let storageEngine: "postgres" | "memory";
  if (options.target === "postgres") {
    if (!isDatabaseConfigured()) {
      throw new Error(
        "DATABASE_REQUIRED: Cannot target PostgreSQL importer. DATABASE_URL is not configured."
      );
    }
    storageEngine = "postgres";
  } else if (options.target === "memory") {
    storageEngine = "memory";
  } else {
    storageEngine = isDatabaseConfigured() ? "postgres" : "memory";
  }

  // 1. Determine existing slugs from target storage engine for idempotency
  const processedSlugs = new Set<string>(options.existingSlugs || []);

  if (storageEngine === "postgres" && isDatabaseConfigured()) {
    try {
      const existingRes = await query<{ slug: string }>("SELECT slug FROM articles;");
      existingRes.rows.forEach((r) => processedSlugs.add(r.slug));
    } catch {
      // If table doesn't exist yet, continue with processedSlugs
    }
  }

  const results: ImportItemResult[] = [];
  const recordsToInsert: CmsArticle[] = [];
  let importedCount = 0;
  let skippedCount = 0;
  let invalidCount = 0;

  for (const article of sourceList) {
    if (processedSlugs.has(article.slug)) {
      skippedCount++;
      results.push({
        sourceId: article.id,
        slug: article.slug,
        title: article.title,
        status: "skipped",
        reason: `Article with slug "${article.slug}" already exists in ${storageEngine} repository.`,
      });
      continue;
    }

    const { valid, reason, record } = transformDemoArticleToCmsDraft(article, processedSlugs);

    if (!valid || !record) {
      invalidCount++;
      results.push({
        sourceId: article.id,
        slug: article.slug,
        title: article.title,
        status: "invalid",
        reason,
      });
      continue;
    }

    importedCount++;
    processedSlugs.add(article.slug);
    recordsToInsert.push(record);
    results.push({
      sourceId: article.id,
      slug: article.slug,
      title: article.title,
      status: "imported",
      cmsRecord: record,
    });
  }

  // 2. If --execute is specified, write to target repository within a transaction
  if (!isDryRun && recordsToInsert.length > 0) {
    if (storageEngine === "postgres") {
      await withTransaction(async (client) => {
        // Ensure categories exist
        for (const cat of categories) {
          await client.query(
            `INSERT INTO categories (slug, name, english_name, description, sort_order, is_active)
             VALUES ($1, $2, $3, $4, $5, TRUE)
             ON CONFLICT (slug) DO NOTHING;`,
            [cat.slug, cat.name, cat.englishName, cat.description || "", cat.order]
          );
        }

        // Ensure unique authors exist
        const uniqueAuthors = new Map<string, { name: string; englishName?: string; slug: string; role?: string }>();
        sourceList.forEach((a) => {
          if (!uniqueAuthors.has(a.author.slug)) {
            uniqueAuthors.set(a.author.slug, a.author);
          }
        });

        for (const au of uniqueAuthors.values()) {
          await client.query(
            `INSERT INTO authors (slug, name, english_name, role, is_active)
             VALUES ($1, $2, $3, $4, TRUE)
             ON CONFLICT (slug) DO NOTHING;`,
            [au.slug, au.name, au.englishName || au.name, au.role || "ރިޕޯޓަރ"]
          );
        }

        // Insert articles strictly as drafts with breaking: false
        for (const rec of recordsToInsert) {
          const catRes = await client.query<{ id: string }>(
            "SELECT id FROM categories WHERE slug = $1 LIMIT 1;",
            [rec.categorySlug]
          );
          const authRes = await client.query<{ id: string }>(
            "SELECT id FROM authors WHERE slug = $1 LIMIT 1;",
            [rec.author.slug]
          );

          const categoryId = catRes.rows[0]?.id;
          const authorId = authRes.rows[0]?.id;

          if (!categoryId || !authorId) {
            continue;
          }

          const insertRes = await client.query<{ id: string }>(
            `INSERT INTO articles (
              slug, title, english_title, summary, english_summary,
              body, category_id, author_id, status, featured, breaking,
              image, video, tags, read_time_minutes, is_opinion,
              seo_title, seo_description, revision_count, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, 'draft', $9, FALSE,
              $10, $11, $12, $13, $14,
              $15, $16, 1, NOW(), NOW()
            )
            ON CONFLICT (slug) DO NOTHING
            RETURNING id;`,
            [
              rec.slug,
              rec.title,
              rec.englishTitle || null,
              rec.summary,
              rec.englishSummary || null,
              JSON.stringify(rec.body || []),
              categoryId,
              authorId,
              Boolean(rec.featured),
              rec.image ? JSON.stringify(rec.image) : null,
              rec.video ? JSON.stringify(rec.video) : null,
              rec.tags || [],
              rec.readTimeMinutes || 3,
              Boolean(rec.isOpinion),
              rec.seoTitle || null,
              rec.seoDescription || null,
            ]
          );

          if (insertRes.rows[0]?.id) {
            await client.query(
              `INSERT INTO article_revisions (
                article_id, revision_number, title, summary, body, status, change_note
              ) VALUES ($1, 1, $2, $3, $4, 'draft', 'Imported as draft from demo dataset');`,
              [
                insertRes.rows[0].id,
                rec.title,
                rec.summary,
                JSON.stringify(rec.body || []),
              ]
            );
          }
        }
      });
    } else {
      // Memory repository execution
      for (const rec of recordsToInsert) {
        await cmsRepository.createArticle(
          {
            ...rec,
          },
          {
            id: "system-importer",
            email: "admin@oceaneditorial.mv",
            name: "Migration Importer",
            role: "admin",
            isActive: true,
            createdAt: new Date().toISOString(),
          }
        );
      }
    }
  }

  return {
    dryRun: isDryRun,
    storageEngine,
    totalInspected: sourceList.length,
    importedCount,
    skippedCount,
    invalidCount,
    generatedAt: new Date().toISOString(),
    items: results,
    notes: [
      "All imported articles are strictly set to 'draft' status.",
      "Active breaking news flags were cleared (breaking: false) to prevent false alerts.",
      `Target storage engine: ${storageEngine.toUpperCase()}.`,
      isDryRun
        ? "DRY RUN: No database write operations were executed. Re-run with --execute to write."
        : "EXECUTE: Records inserted into target repository within an atomic transaction.",
    ],
  };
}
