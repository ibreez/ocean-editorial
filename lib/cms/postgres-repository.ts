import type {
  CmsArticle,
  CmsArticleRevision,
  CmsCategory,
  CmsAuthor,
  CmsDashboardMetrics,
  EditorialUser,
  EditorialRole,
} from "@/types/cms";
import type {
  ICmsRepository,
  CmsArticleFilterOptions,
  CmsPaginatedResult,
} from "@/lib/cms/repository";
import { query, withTransaction, sanitizeDatabaseError } from "@/lib/cms/db";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  english_title: string | null;
  summary: string;
  english_summary: string | null;
  body: unknown;
  category_id: string;
  category_slug: string;
  category_name: string;
  author_id: string;
  author_slug: string;
  author_name: string;
  author_english_name: string;
  author_role: string;
  author_avatar: string | null;
  status: string;
  featured: boolean;
  breaking: boolean;
  image: unknown;
  video: unknown;
  tags: string[];
  read_time_minutes: number;
  is_opinion: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: Date;
  updated_at: Date;
  scheduled_for: Date | null;
  published_at: Date | null;
  created_by: string | null;
  last_editor: string | null;
  revision_count: number;
}

function mapArticleRowToCmsArticle(row: ArticleRow): CmsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    englishTitle: row.english_title || undefined,
    summary: row.summary,
    englishSummary: row.english_summary || undefined,
    body: Array.isArray(row.body) ? (row.body as any) : [],
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    authorId: row.author_id,
    author: {
      name: row.author_name,
      englishName: row.author_english_name,
      slug: row.author_slug,
      role: row.author_role,
      avatar: row.author_avatar || undefined,
    },
    status: row.status as CmsArticle["status"],
    featured: Boolean(row.featured),
    breaking: Boolean(row.breaking),
    image: row.image ? (row.image as any) : undefined,
    video: row.video ? (row.video as any) : undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    readTimeMinutes: row.read_time_minutes || 3,
    isOpinion: Boolean(row.is_opinion),
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    scheduledFor: row.scheduled_for ? new Date(row.scheduled_for).toISOString() : undefined,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : undefined,
    createdBy: row.created_by || "system",
    lastEditor: row.last_editor || "system",
    revisionCount: row.revision_count || 1,
  };
}

/**
 * PostgreSQL Implementation of ICmsRepository
 *
 * Provides persistent storage backed by managed PostgreSQL (Neon, Supabase, Cloud SQL, AWS RDS).
 * Uses parameterized queries and atomic transactions for all data modifications.
 */
export class PostgresCmsRepository implements ICmsRepository {
  private baseArticleSelect = `
    SELECT
      a.id, a.slug, a.title, a.english_title, a.summary, a.english_summary,
      a.body, a.category_id, c.slug AS category_slug, c.name AS category_name,
      a.author_id, au.slug AS author_slug, au.name AS author_name,
      au.english_name AS author_english_name, au.role AS author_role,
      au.avatar AS author_avatar, a.status, a.featured, a.breaking,
      a.image, a.video, a.tags, a.read_time_minutes, a.is_opinion,
      a.seo_title, a.seo_description, a.created_at, a.updated_at,
      a.scheduled_for, a.published_at, a.created_by::text, a.last_editor::text,
      a.revision_count
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    JOIN authors au ON a.author_id = au.id
  `;

  async getArticles(
    options: CmsArticleFilterOptions = {},
    user?: EditorialUser
  ): Promise<CmsPaginatedResult<CmsArticle>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Strict allowlist for workflow status values
    const VALID_STATUSES = new Set(["draft", "in_review", "scheduled", "published", "archived"]);
    if (options.status && options.status !== "all" && VALID_STATUSES.has(options.status)) {
      conditions.push(`a.status = $${paramIndex++}`);
      values.push(options.status);
    }

    if (options.categorySlug && options.categorySlug !== "all") {
      conditions.push(`c.slug = $${paramIndex++}`);
      values.push(options.categorySlug);
    }

    if (options.authorSlug) {
      conditions.push(`au.slug = $${paramIndex++}`);
      values.push(options.authorSlug);
    }

    // Role-based visibility enforcement:
    // If caller is a journalist, strictly restrict results to articles they created
    if (user?.role === "journalist") {
      conditions.push(`a.created_by::text = $${paramIndex++}`);
      values.push(user.id);
    } else if (options.createdBy) {
      conditions.push(`a.created_by::text = $${paramIndex++}`);
      values.push(options.createdBy);
    }

    if (options.query && options.query.trim()) {
      const q = `%${options.query.trim()}%`;
      conditions.push(
        `(a.title ILIKE $${paramIndex} OR a.english_title ILIKE $${paramIndex} OR a.summary ILIKE $${paramIndex} OR a.slug ILIKE $${paramIndex})`
      );
      values.push(q);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count Query
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN authors au ON a.author_id = au.id
      ${whereClause};
    `;
    const countRes = await query<{ total: number }>(countSql, values);
    const total = countRes.rows[0]?.total || 0;

    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, options.limit || 15);
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;

    // Allowlisted sort columns to prevent SQL injection or unexpected columns
    const ALLOWED_SORT_COLUMNS: Record<string, string> = {
      updatedAt: "a.updated_at",
      createdAt: "a.created_at",
      publishedAt: "a.published_at",
    };
    const sortCol = (options.sortBy && ALLOWED_SORT_COLUMNS[options.sortBy]) || "a.updated_at";
    const sortDir = options.sortOrder?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const dataSql = `
      ${this.baseArticleSelect}
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir} NULLS LAST
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    values.push(pageSize, offset);

    const dataRes = await query<ArticleRow>(dataSql, values);
    const items = dataRes.rows.map(mapArticleRowToCmsArticle);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getArticleById(id: string): Promise<CmsArticle | null> {
    const sql = `
      ${this.baseArticleSelect}
      WHERE a.id::text = $1;
    `;
    const res = await query<ArticleRow>(sql, [id]);
    return res.rows[0] ? mapArticleRowToCmsArticle(res.rows[0]) : null;
  }

  async getArticleBySlug(slug: string): Promise<CmsArticle | null> {
    const sql = `
      ${this.baseArticleSelect}
      WHERE a.slug = $1;
    `;
    const res = await query<ArticleRow>(sql, [slug]);
    return res.rows[0] ? mapArticleRowToCmsArticle(res.rows[0]) : null;
  }

  async createArticle(
    data: Omit<CmsArticle, "id" | "createdAt" | "updatedAt" | "revisionCount">,
    user: EditorialUser
  ): Promise<CmsArticle> {
    return withTransaction(async (client) => {
      // 1. Resolve category ID
      let categoryId = data.categoryId;
      const catCheck = await client.query<{ id: string }>(
        "SELECT id FROM categories WHERE id::text = $1 OR slug = $2 LIMIT 1;",
        [data.categoryId, data.categorySlug]
      );
      if (catCheck.rows[0]) {
        categoryId = catCheck.rows[0].id;
      } else {
        throw new Error(`Category "${data.categorySlug}" not found in database.`);
      }

      // 2. Resolve author ID
      let authorId = data.authorId;
      const authCheck = await client.query<{ id: string }>(
        "SELECT id FROM authors WHERE id::text = $1 OR slug = $2 LIMIT 1;",
        [data.authorId, data.author.slug]
      );
      if (authCheck.rows[0]) {
        authorId = authCheck.rows[0].id;
      } else {
        throw new Error(`Author "${data.author.slug}" not found in database.`);
      }

      // 3. Resolve user UUID or null
      let createdByUuid: string | null = null;
      const userCheck = await client.query<{ id: string }>(
        "SELECT id FROM editorial_users WHERE id::text = $1 OR email = $2 LIMIT 1;",
        [user.id, user.email]
      );
      if (userCheck.rows[0]) {
        createdByUuid = userCheck.rows[0].id;
      }

      // 4. Insert Article
      const insertArticleSql = `
        INSERT INTO articles (
          slug, title, english_title, summary, english_summary,
          body, category_id, author_id, status, featured, breaking,
          image, video, tags, read_time_minutes, is_opinion,
          seo_title, seo_description, created_by, last_editor,
          revision_count, published_at, scheduled_for, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19, $19,
          1, $20, $21, NOW(), NOW()
        )
        RETURNING id;
      `;

      const insertRes = await client.query<{ id: string }>(insertArticleSql, [
        data.slug,
        data.title,
        data.englishTitle || null,
        data.summary,
        data.englishSummary || null,
        JSON.stringify(data.body || []),
        categoryId,
        authorId,
        data.status,
        Boolean(data.featured),
        Boolean(data.breaking),
        data.image ? JSON.stringify(data.image) : null,
        data.video ? JSON.stringify(data.video) : null,
        data.tags || [],
        data.readTimeMinutes || 3,
        Boolean(data.isOpinion),
        data.seoTitle || null,
        data.seoDescription || null,
        createdByUuid,
        data.publishedAt ? new Date(data.publishedAt) : null,
        data.scheduledFor ? new Date(data.scheduledFor) : null,
      ]);

      const articleId = insertRes.rows[0].id;

      // 5. Create Initial Revision (Audit Trail)
      await client.query(
        `INSERT INTO article_revisions (
          article_id, revision_number, title, summary, body, status, edited_by, change_note
        ) VALUES ($1, 1, $2, $3, $4, $5, $6, $7);`,
        [
          articleId,
          data.title,
          data.summary,
          JSON.stringify(data.body || []),
          data.status,
          createdByUuid,
          `Initial creation by ${user.name} (${user.role})`,
        ]
      );

      // 6. Return fresh mapped article
      const fresh = await this.getArticleById(articleId);
      if (!fresh) {
        throw new Error("Failed to load newly created article from database.");
      }
      return fresh;
    });
  }

  async updateArticle(
    id: string,
    updates: Partial<CmsArticle>,
    user: EditorialUser,
    changeNote?: string
  ): Promise<CmsArticle> {
    return withTransaction(async (client) => {
      // Lock row for concurrent update protection
      const lockRes = await client.query<ArticleRow>(
        `SELECT * FROM articles WHERE id::text = $1 FOR UPDATE;`,
        [id]
      );
      if (!lockRes.rows[0]) {
        throw new Error(`Article with id "${id}" not found.`);
      }
      const existing = lockRes.rows[0];

      // Optimistic concurrency conflict detection
      if (updates.revisionCount !== undefined && updates.revisionCount !== existing.revision_count) {
        throw new Error(
          "CONCURRENT_UPDATE_CONFLICT: The article was updated by another editor. Please reload to review the latest changes."
        );
      }

      // Resolve editor UUID
      let editorUuid: string | null = null;
      const userCheck = await client.query<{ id: string }>(
        "SELECT id FROM editorial_users WHERE id::text = $1 OR email = $2 LIMIT 1;",
        [user.id, user.email]
      );
      if (userCheck.rows[0]) {
        editorUuid = userCheck.rows[0].id;
      }

      // Role-based ownership enforcement: journalists cannot modify articles created by others
      if (
        user.role === "journalist" &&
        existing.created_by &&
        existing.created_by !== editorUuid &&
        existing.created_by !== user.id
      ) {
        throw new Error(
          "Permission denied: Journalists can only edit articles they created."
        );
      }

      // Resolve category if updated
      let categoryId = existing.category_id;
      if (updates.categoryId || updates.categorySlug) {
        const catRes = await client.query<{ id: string }>(
          "SELECT id FROM categories WHERE id::text = $1 OR slug = $2 LIMIT 1;",
          [updates.categoryId || "", updates.categorySlug || ""]
        );
        if (catRes.rows[0]) categoryId = catRes.rows[0].id;
      }

      // Resolve author if updated
      let authorId = existing.author_id;
      if (updates.authorId || updates.author?.slug) {
        const authRes = await client.query<{ id: string }>(
          "SELECT id FROM authors WHERE id::text = $1 OR slug = $2 LIMIT 1;",
          [updates.authorId || "", updates.author?.slug || ""]
        );
        if (authRes.rows[0]) authorId = authRes.rows[0].id;
      }

      const nextRevision = (existing.revision_count || 1) + 1;

      // Update fields
      const updateSql = `
        UPDATE articles SET
          slug = COALESCE($1, slug),
          title = COALESCE($2, title),
          english_title = COALESCE($3, english_title),
          summary = COALESCE($4, summary),
          body = COALESCE($5, body),
          category_id = $6,
          author_id = $7,
          status = COALESCE($8, status),
          featured = COALESCE($9, featured),
          breaking = COALESCE($10, breaking),
          published_at = COALESCE($11, published_at),
          last_editor = $12,
          revision_count = $13,
          updated_at = NOW()
        WHERE id::text = $14;
      `;

      await client.query(updateSql, [
        updates.slug || null,
        updates.title || null,
        updates.englishTitle !== undefined ? updates.englishTitle : null,
        updates.summary || null,
        updates.body ? JSON.stringify(updates.body) : null,
        categoryId,
        authorId,
        updates.status || null,
        updates.featured !== undefined ? updates.featured : null,
        updates.breaking !== undefined ? updates.breaking : null,
        updates.publishedAt ? new Date(updates.publishedAt) : null,
        editorUuid,
        nextRevision,
        id,
      ]);

      // Record Revision History
      await client.query(
        `INSERT INTO article_revisions (
          article_id, revision_number, title, summary, body, status, edited_by, change_note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          existing.id,
          nextRevision,
          updates.title || existing.title,
          updates.summary || existing.summary,
          updates.body ? JSON.stringify(updates.body) : existing.body,
          updates.status || existing.status,
          editorUuid,
          changeNote || `Updated by ${user.name} (${user.role})`,
        ]
      );

      const fresh = await this.getArticleById(id);
      if (!fresh) {
        throw new Error("Failed to load updated article from database.");
      }
      return fresh;
    });
  }

  async getCategories(): Promise<CmsCategory[]> {
    const sql = `
      SELECT id, slug, name, english_name, description, sort_order, is_active, created_at
      FROM categories
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, name ASC;
    `;
    const res = await query<{
      id: string;
      slug: string;
      name: string;
      english_name: string;
      description: string;
      sort_order: number;
      is_active: boolean;
      created_at: Date;
    }>(sql);

    return res.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      englishName: r.english_name,
      description: r.description,
      order: r.sort_order,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  async getAuthors(): Promise<CmsAuthor[]> {
    const sql = `
      SELECT id, slug, name, english_name, role, avatar, bio, is_active, created_at
      FROM authors
      WHERE is_active = TRUE
      ORDER BY name ASC;
    `;
    const res = await query<{
      id: string;
      slug: string;
      name: string;
      english_name: string;
      role: string;
      avatar: string | null;
      bio: string | null;
      is_active: boolean;
      created_at: Date;
    }>(sql);

    return res.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      englishName: r.english_name,
      role: r.role,
      avatar: r.avatar || undefined,
      bio: r.bio || undefined,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  async getMetrics(user?: EditorialUser): Promise<CmsDashboardMetrics> {
    const params: unknown[] = [];
    let userFilter = "";
    if (user?.role === "journalist") {
      userFilter = "WHERE created_by::text = $1";
      params.push(user.id);
    }

    const sql = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'draft')::int AS drafts,
        COUNT(*) FILTER (WHERE status = 'in_review')::int AS in_review,
        COUNT(*) FILTER (WHERE status = 'scheduled')::int AS scheduled,
        COUNT(*) FILTER (WHERE status = 'published')::int AS published,
        COUNT(*) FILTER (WHERE status = 'archived')::int AS archived,
        COUNT(*) FILTER (WHERE status = 'published' AND breaking = TRUE)::int AS breaking_active
      FROM articles
      ${userFilter};
    `;

    const res = await query<{
      total: number;
      drafts: number;
      in_review: number;
      scheduled: number;
      published: number;
      archived: number;
      breaking_active: number;
    }>(sql, params);

    const row = res.rows[0] || {
      total: 0,
      drafts: 0,
      in_review: 0,
      scheduled: 0,
      published: 0,
      archived: 0,
      breaking_active: 0,
    };

    return {
      totalArticles: row.total,
      drafts: row.drafts,
      inReview: row.in_review,
      scheduled: row.scheduled,
      published: row.published,
      archived: row.archived,
      breakingActive: row.breaking_active,
      isDemonstration: false, // Live persistent storage!
    };
  }

  async isSlugAvailable(slug: string, excludeArticleId?: string): Promise<boolean> {
    let sql = "SELECT COUNT(*)::int AS count FROM articles WHERE slug = $1";
    const params: unknown[] = [slug];
    if (excludeArticleId) {
      sql += " AND id::text != $2";
      params.push(excludeArticleId);
    }
    const res = await query<{ count: number }>(sql, params);
    return (res.rows[0]?.count || 0) === 0;
  }

  async deleteArticle(id: string, user: EditorialUser): Promise<boolean> {
    if (user.role !== "admin") {
      throw new Error("Only administrators are authorized to permanently delete articles.");
    }
    const res = await query("DELETE FROM articles WHERE id::text = $1;", [id]);
    return (res.rowCount || 0) > 0;
  }

  async getArticleRevisions(articleId: string, user: EditorialUser): Promise<CmsArticleRevision[]> {
    const article = await this.getArticleById(articleId);
    if (!article) return [];

    // Ownership check for journalists
    if (user.role === "journalist" && article.createdBy !== user.id) {
      throw new Error(
        "Permission denied: Journalists cannot access revisions of articles authored by other newsroom staff."
      );
    }

    const sql = `
      SELECT id, article_id, revision_number, title, summary, body, status, edited_by::text, change_note, created_at
      FROM article_revisions
      WHERE article_id::text = $1
      ORDER BY revision_number DESC;
    `;
    const res = await query<{
      id: string;
      article_id: string;
      revision_number: number;
      title: string;
      summary: string;
      body: unknown;
      status: string;
      edited_by: string | null;
      change_note: string | null;
      created_at: Date;
    }>(sql, [articleId]);

    return res.rows.map((r) => ({
      id: r.id,
      articleId: r.article_id,
      revisionNumber: r.revision_number,
      title: r.title,
      summary: r.summary,
      body: Array.isArray(r.body) ? (r.body as any) : [],
      status: r.status as CmsArticle["status"],
      editedBy: r.edited_by || "unknown",
      createdAt: new Date(r.created_at).toISOString(),
      changeNote: r.change_note || undefined,
    }));
  }

  async getEditorialUsers(): Promise<EditorialUser[]> {
    const sql = `
      SELECT id, email, name, dhivehi_name, role, is_active, created_at
      FROM editorial_users
      ORDER BY created_at ASC;
    `;
    const res = await query<{
      id: string;
      email: string;
      name: string;
      dhivehi_name: string | null;
      role: string;
      is_active: boolean;
      created_at: Date;
    }>(sql);

    return res.rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      dhivehiName: r.dhivehi_name || undefined,
      role: r.role as EditorialRole,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  async getEditorialUserById(id: string): Promise<EditorialUser | null> {
    const sql = `
      SELECT id, email, name, dhivehi_name, role, is_active, created_at
      FROM editorial_users
      WHERE id::text = $1;
    `;
    const res = await query<{
      id: string;
      email: string;
      name: string;
      dhivehi_name: string | null;
      role: string;
      is_active: boolean;
      created_at: Date;
    }>(sql, [id]);

    const r = res.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      dhivehiName: r.dhivehi_name || undefined,
      role: r.role as EditorialRole,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async getEditorialUserByEmail(email: string): Promise<EditorialUser | null> {
    const sql = `
      SELECT id, email, name, dhivehi_name, role, is_active, created_at
      FROM editorial_users
      WHERE LOWER(email) = LOWER($1);
    `;
    const res = await query<{
      id: string;
      email: string;
      name: string;
      dhivehi_name: string | null;
      role: string;
      is_active: boolean;
      created_at: Date;
    }>(sql, [email.trim()]);

    const r = res.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      dhivehiName: r.dhivehi_name || undefined,
      role: r.role as EditorialRole,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async updateUserRole(
    userId: string,
    newRole: EditorialRole,
    adminUser: EditorialUser
  ): Promise<EditorialUser> {
    if (adminUser.role !== "admin") {
      throw new Error("Only administrators can assign editorial roles.");
    }
    if (adminUser.id === userId && newRole !== "admin") {
      throw new Error("Administrators cannot demote their own account to prevent system lockout.");
    }

    const sql = `
      UPDATE editorial_users
      SET role = $1, updated_at = NOW()
      WHERE id::text = $2
      RETURNING id, email, name, dhivehi_name, role, is_active, created_at;
    `;
    const res = await query<{
      id: string;
      email: string;
      name: string;
      dhivehi_name: string | null;
      role: string;
      is_active: boolean;
      created_at: Date;
    }>(sql, [newRole, userId]);

    const r = res.rows[0];
    if (!r) {
      throw new Error(`User with id "${userId}" not found.`);
    }
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      dhivehiName: r.dhivehi_name || undefined,
      role: r.role as EditorialRole,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async updateUserStatus(
    userId: string,
    isActive: boolean,
    adminUser: EditorialUser
  ): Promise<EditorialUser> {
    if (adminUser.role !== "admin") {
      throw new Error("Only administrators can activate or deactivate editorial accounts.");
    }
    if (adminUser.id === userId && !isActive) {
      throw new Error("Administrators cannot deactivate their own account.");
    }

    const sql = `
      UPDATE editorial_users
      SET is_active = $1, updated_at = NOW()
      WHERE id::text = $2
      RETURNING id, email, name, dhivehi_name, role, is_active, created_at;
    `;
    const res = await query<{
      id: string;
      email: string;
      name: string;
      dhivehi_name: string | null;
      role: string;
      is_active: boolean;
      created_at: Date;
    }>(sql, [isActive, userId]);

    const r = res.rows[0];
    if (!r) {
      throw new Error(`User with id "${userId}" not found.`);
    }
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      dhivehiName: r.dhivehi_name || undefined,
      role: r.role as EditorialRole,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async createEditorialUser(
    data: Omit<EditorialUser, "id" | "createdAt">,
    adminUser: EditorialUser
  ): Promise<EditorialUser> {
    if (adminUser.role !== "admin") {
      throw new Error("Only administrators can provision new editorial accounts.");
    }

    const sql = `
      INSERT INTO editorial_users (email, name, dhivehi_name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, name, dhivehi_name, role, is_active, created_at;
    `;
    const res = await query<{
      id: string;
      email: string;
      name: string;
      dhivehi_name: string | null;
      role: string;
      is_active: boolean;
      created_at: Date;
    }>(sql, [
      data.email.trim().toLowerCase(),
      data.name.trim(),
      data.dhivehiName?.trim() || null,
      data.role,
      data.isActive !== undefined ? data.isActive : true,
    ]);

    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      dhivehiName: r.dhivehi_name || undefined,
      role: r.role as EditorialRole,
      isActive: r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }
}
