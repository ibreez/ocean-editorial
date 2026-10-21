import type {
  CmsArticle,
  CmsArticleStatus,
  CmsArticleRevision,
  CmsCategory,
  CmsAuthor,
  CmsDashboardMetrics,
  EditorialUser,
  EditorialRole,
} from "@/types/cms";
import { canTransitionWorkflow } from "@/types/cms";
import { demoArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { isDatabaseConfigured } from "@/lib/cms/db";
import { PostgresCmsRepository } from "@/lib/cms/postgres-repository";

export interface CmsArticleFilterOptions {
  status?: CmsArticleStatus | "all";
  categorySlug?: string;
  authorSlug?: string;
  createdBy?: string;
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: "updatedAt" | "createdAt" | "publishedAt";
  sortOrder?: "asc" | "desc";
}

export interface CmsPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ICmsRepository {
  getArticles(options?: CmsArticleFilterOptions, user?: EditorialUser): Promise<CmsPaginatedResult<CmsArticle>>;
  getArticleById(id: string): Promise<CmsArticle | null>;
  getArticleBySlug(slug: string): Promise<CmsArticle | null>;
  getArticleRevisions(articleId: string, user: EditorialUser): Promise<CmsArticleRevision[]>;
  createArticle(
    data: Omit<CmsArticle, "id" | "createdAt" | "updatedAt" | "revisionCount">,
    user: EditorialUser
  ): Promise<CmsArticle>;
  updateArticle(
    id: string,
    updates: Partial<CmsArticle>,
    user: EditorialUser,
    changeNote?: string
  ): Promise<CmsArticle>;
  getCategories(): Promise<CmsCategory[]>;
  getAuthors(): Promise<CmsAuthor[]>;
  getMetrics(user?: EditorialUser): Promise<CmsDashboardMetrics>;
  isSlugAvailable(slug: string, excludeArticleId?: string): Promise<boolean>;
  deleteArticle(id: string, user: EditorialUser): Promise<boolean>;
  getEditorialUsers(): Promise<EditorialUser[]>;
  getEditorialUserById(id: string): Promise<EditorialUser | null>;
  getEditorialUserByEmail(email: string): Promise<EditorialUser | null>;
  updateUserRole(userId: string, newRole: EditorialRole, adminUser: EditorialUser): Promise<EditorialUser>;
  updateUserStatus(userId: string, isActive: boolean, adminUser: EditorialUser): Promise<EditorialUser>;
  createEditorialUser(
    data: Omit<EditorialUser, "id" | "createdAt">,
    adminUser: EditorialUser
  ): Promise<EditorialUser>;
}

/**
 * In-Memory Staging Repository for Phase 15.
 * Seeds demonstration editorial articles as drafts/reviews, allowing the
 * admin interface to be tested without an external database connection.
 * All demo records are marked with isDemonstration: true in metrics.
 */
export class MemoryCmsRepository implements ICmsRepository {
  private articles: Map<string, CmsArticle> = new Map();
  private revisionsMap: Map<string, CmsArticleRevision[]> = new Map();
  private categoriesList: CmsCategory[] = [];
  private authorsList: CmsAuthor[] = [];
  private usersMap: Map<string, EditorialUser> = new Map();

  constructor() {
    this.seedUsers();
    this.seedCategories();
    this.seedAuthors();
    this.seedArticles();
  }

  private seedUsers() {
    const defaultUsers: EditorialUser[] = [
      {
        id: "usr-admin",
        email: "admin@oceaneditorial.mv",
        name: "Ahmed Ridhwan",
        dhivehiName: "އަޙްމަދު ރިޟްވާން",
        role: "admin",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "usr-editor",
        email: "editor@oceaneditorial.mv",
        name: "Mariyam Shafeeqa",
        dhivehiName: "މަރިޔަމް ޝަފީޤާ",
        role: "editor",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "usr-journalist",
        email: "journalist@oceaneditorial.mv",
        name: "Ali Zahir",
        dhivehiName: "ޢަލީ ޒާހިރު",
        role: "journalist",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    defaultUsers.forEach((u) => this.usersMap.set(u.id, u));
  }

  private seedCategories() {
    this.categoriesList = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      englishName: c.englishName,
      description: c.description,
      order: c.order,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    }));
  }

  private seedAuthors() {
    // Unique authors extracted from demo articles
    const unique = new Map<string, CmsAuthor>();
    demoArticles.forEach((a, i) => {
      if (!unique.has(a.author.slug)) {
        unique.set(a.author.slug, {
          id: `auth-${i + 1}`,
          slug: a.author.slug,
          name: a.author.name,
          englishName: a.author.englishName || a.author.name,
          role: a.author.role || "ރިޕޯޓަރ",
          avatar: a.author.avatar,
          isActive: true,
          createdAt: "2026-01-01T00:00:00.000Z",
        });
      }
    });
    this.authorsList = Array.from(unique.values());
  }

  private seedArticles() {
    // Seed demo articles converted into staging records with varied workflow states
    // Note: Demo breaking flag is intentionally disabled to adhere to strict rules!
    demoArticles.forEach((a, index) => {
      // Varied workflow states for comprehensive dashboard visualization:
      // Index 0: draft
      // Index 1: in_review
      // Index 2: scheduled
      // Remaining: draft or archived
      let status: CmsArticleStatus = "draft";
      if (index === 1) status = "in_review";
      else if (index === 2) status = "scheduled";
      else if (index === 3) status = "published";
      else if (index === 4) status = "archived";

      const category = this.categoriesList.find((c) => c.slug === a.categorySlug) || this.categoriesList[0];
      const author = this.authorsList.find((au) => au.slug === a.author.slug) || this.authorsList[0];

      const cmsArticle: CmsArticle = {
        id: `cms-${a.id}`,
        slug: a.slug,
        title: a.title,
        englishTitle: a.englishTitle,
        summary: a.summary,
        englishSummary: undefined,
        body: a.body,
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
        status,
        featured: Boolean(a.featured),
        breaking: false, // Strict Rule: Never set breaking: true on staging demo imports!
        image: a.image,
        video: a.video,
        tags: a.tags || [],
        readTimeMinutes: a.readTimeMinutes || 3,
        isOpinion: Boolean(a.isOpinion),
        seoTitle: undefined,
        seoDescription: undefined,
        createdAt: a.publishedAt,
        updatedAt: a.updatedAt || a.publishedAt,
        scheduledFor: status === "scheduled" ? "2026-10-25T12:00:00.000Z" : undefined,
        publishedAt: status === "published" ? a.publishedAt : undefined,
        createdBy: index % 3 === 0 ? "usr-journalist" : index % 3 === 1 ? "usr-editor" : "usr-admin",
        lastEditor: index % 3 === 0 ? "usr-journalist" : index % 3 === 1 ? "usr-editor" : "usr-admin",
        revisionCount: 1,
      };

      this.articles.set(cmsArticle.id, cmsArticle);
      this.revisionsMap.set(cmsArticle.id, [
        {
          id: `rev-${cmsArticle.id}-1`,
          articleId: cmsArticle.id,
          revisionNumber: 1,
          title: cmsArticle.title,
          summary: cmsArticle.summary,
          body: cmsArticle.body,
          status: cmsArticle.status,
          editedBy: cmsArticle.createdBy,
          createdAt: cmsArticle.createdAt,
          changeNote: "Initial seed revision",
        },
      ]);
    });
  }

  async getArticles(
    options: CmsArticleFilterOptions = {},
    user?: EditorialUser
  ): Promise<CmsPaginatedResult<CmsArticle>> {
    let list = Array.from(this.articles.values());

    // Role-based visibility enforcement:
    // If caller is a journalist, strictly restrict results to articles they created
    if (user?.role === "journalist") {
      list = list.filter((a) => a.createdBy === user.id);
    } else if (options.createdBy) {
      list = list.filter((a) => a.createdBy === options.createdBy);
    }

    if (options.status && options.status !== "all") {
      list = list.filter((a) => a.status === options.status);
    }
    if (options.categorySlug && options.categorySlug !== "all") {
      list = list.filter((a) => a.categorySlug === options.categorySlug);
    }
    if (options.authorSlug) {
      list = list.filter((a) => a.author.slug === options.authorSlug);
    }
    if (options.query && options.query.trim()) {
      const q = options.query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.englishTitle && a.englishTitle.toLowerCase().includes(q)) ||
          a.summary.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q)
      );
    }

    const sortOrder = options.sortOrder === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return (timeA - timeB) * sortOrder;
    });

    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, options.limit || 15);
    const total = list.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getArticleById(id: string): Promise<CmsArticle | null> {
    const article = this.articles.get(id);
    return article ? { ...article } : null;
  }

  async getArticleBySlug(slug: string): Promise<CmsArticle | null> {
    for (const article of this.articles.values()) {
      if (article.slug === slug) {
        return { ...article };
      }
    }
    return null;
  }

  async getArticleRevisions(articleId: string, user: EditorialUser): Promise<CmsArticleRevision[]> {
    const article = this.articles.get(articleId);
    if (!article) return [];

    // Ownership check for journalists
    if (user.role === "journalist" && article.createdBy !== user.id) {
      throw new Error(
        "Permission denied: Journalists cannot access revisions of articles authored by other newsroom staff."
      );
    }

    const revs = this.revisionsMap.get(articleId) || [];
    return [...revs].sort((a, b) => b.revisionNumber - a.revisionNumber);
  }

  async isSlugAvailable(slug: string, excludeArticleId?: string): Promise<boolean> {
    for (const article of this.articles.values()) {
      if (article.slug === slug && article.id !== excludeArticleId) {
        return false;
      }
    }
    return true;
  }

  private assertWritable(): void {
    if (process.env.NODE_ENV === "production" && !isDatabaseConfigured()) {
      throw new Error(
        "PRODUCTION_FAIL_CLOSED: Managed PostgreSQL database is not configured. CMS write operations are disabled in production to prevent silent data loss. Please configure DATABASE_URL."
      );
    }
  }

  async createArticle(
    data: Omit<CmsArticle, "id" | "createdAt" | "updatedAt" | "revisionCount">,
    user: EditorialUser
  ): Promise<CmsArticle> {
    this.assertWritable();
    const isAvailable = await this.isSlugAvailable(data.slug);
    if (!isAvailable) {
      throw new Error(`The slug "${data.slug}" is already in use by another article.`);
    }

    const now = new Date().toISOString();
    const id = `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newArticle: CmsArticle = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      lastEditor: user.id,
      revisionCount: 1,
    };

    this.articles.set(id, newArticle);

    // Initial revision record
    this.revisionsMap.set(id, [
      {
        id: `rev-${id}-1`,
        articleId: id,
        revisionNumber: 1,
        title: newArticle.title,
        summary: newArticle.summary,
        body: newArticle.body,
        status: newArticle.status,
        editedBy: user.id,
        createdAt: now,
        changeNote: `Created by ${user.name} (${user.role})`,
      },
    ]);

    return { ...newArticle };
  }

  async updateArticle(
    id: string,
    updates: Partial<CmsArticle>,
    user: EditorialUser,
    changeNote?: string
  ): Promise<CmsArticle> {
    this.assertWritable();
    const existing = this.articles.get(id);
    if (!existing) {
      throw new Error(`Article with id ${id} not found.`);
    }

    // Role-based ownership enforcement: journalists cannot modify articles created by others
    if (user.role === "journalist" && existing.createdBy !== user.id) {
      throw new Error(
        "Permission denied: Journalists can only edit articles they created."
      );
    }

    // Optimistic concurrency conflict detection
    if (updates.revisionCount !== undefined && updates.revisionCount !== existing.revisionCount) {
      throw new Error(
        "CONCURRENT_UPDATE_CONFLICT: The article was updated by another editor. Please reload to review the latest changes."
      );
    }

    if (updates.slug && updates.slug !== existing.slug) {
      const isAvailable = await this.isSlugAvailable(updates.slug, id);
      if (!isAvailable) {
        throw new Error(`The slug "${updates.slug}" is already in use by another article.`);
      }
    }

    if (updates.status && updates.status !== existing.status) {
      if (!canTransitionWorkflow(existing.status, updates.status)) {
        throw new Error(
          `Invalid workflow transition from "${existing.status}" to "${updates.status}".`
        );
      }
    }

    const now = new Date().toISOString();
    const nextRevision = existing.revisionCount + 1;
    const updated: CmsArticle = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      updatedAt: now,
      lastEditor: user.id,
      revisionCount: nextRevision,
    };

    this.articles.set(id, updated);

    // Record revision history
    const existingRevs = this.revisionsMap.get(id) || [];
    existingRevs.unshift({
      id: `rev-${id}-${nextRevision}`,
      articleId: id,
      revisionNumber: nextRevision,
      title: updated.title,
      summary: updated.summary,
      body: updated.body,
      status: updated.status,
      editedBy: user.id,
      createdAt: now,
      changeNote: changeNote || `Updated by ${user.name} (${user.role})`,
    });
    this.revisionsMap.set(id, existingRevs);

    return { ...updated };
  }

  async getCategories(): Promise<CmsCategory[]> {
    return [...this.categoriesList];
  }

  async getAuthors(): Promise<CmsAuthor[]> {
    return [...this.authorsList];
  }

  async getMetrics(user?: EditorialUser): Promise<CmsDashboardMetrics> {
    let all = Array.from(this.articles.values());
    if (user?.role === "journalist") {
      all = all.filter((a) => a.createdBy === user.id);
    }
    return {
      totalArticles: all.length,
      drafts: all.filter((a) => a.status === "draft").length,
      inReview: all.filter((a) => a.status === "in_review").length,
      scheduled: all.filter((a) => a.status === "scheduled").length,
      published: all.filter((a) => a.status === "published").length,
      archived: all.filter((a) => a.status === "archived").length,
      breakingActive: all.filter((a) => a.breaking && a.status === "published").length,
      isDemonstration: true,
    };
  }

  async deleteArticle(id: string, user: EditorialUser): Promise<boolean> {
    this.assertWritable();
    if (user.role !== "admin") {
      throw new Error("Only administrators are authorized to permanently delete articles.");
    }
    return this.articles.delete(id);
  }

  async getEditorialUsers(): Promise<EditorialUser[]> {
    return Array.from(this.usersMap.values());
  }

  async getEditorialUserById(id: string): Promise<EditorialUser | null> {
    const user = this.usersMap.get(id);
    return user ? { ...user } : null;
  }

  async getEditorialUserByEmail(email: string): Promise<EditorialUser | null> {
    for (const user of this.usersMap.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return { ...user };
      }
    }
    return null;
  }

  async updateUserRole(userId: string, newRole: EditorialRole, adminUser: EditorialUser): Promise<EditorialUser> {
    this.assertWritable();
    if (adminUser.role !== "admin") {
      throw new Error("Only administrators can assign editorial roles.");
    }
    // Privilege escalation & self-lockout defense:
    if (adminUser.id === userId && newRole !== "admin") {
      throw new Error("Administrators cannot demote their own account to prevent system lockout.");
    }
    const target = this.usersMap.get(userId);
    if (!target) {
      throw new Error(`User with id "${userId}" not found.`);
    }
    const updated: EditorialUser = { ...target, role: newRole };
    this.usersMap.set(userId, updated);
    return { ...updated };
  }

  async updateUserStatus(userId: string, isActive: boolean, adminUser: EditorialUser): Promise<EditorialUser> {
    this.assertWritable();
    if (adminUser.role !== "admin") {
      throw new Error("Only administrators can activate or deactivate editorial accounts.");
    }
    // Prevent admin self-deactivation lockout
    if (adminUser.id === userId && !isActive) {
      throw new Error("Administrators cannot deactivate their own account.");
    }
    const target = this.usersMap.get(userId);
    if (!target) {
      throw new Error(`User with id "${userId}" not found.`);
    }
    const updated: EditorialUser = { ...target, isActive };
    this.usersMap.set(userId, updated);
    return { ...updated };
  }

  async createEditorialUser(
    data: Omit<EditorialUser, "id" | "createdAt">,
    adminUser: EditorialUser
  ): Promise<EditorialUser> {
    this.assertWritable();
    if (adminUser.role !== "admin") {
      throw new Error("Only administrators can provision new editorial accounts.");
    }
    const existing = await this.getEditorialUserByEmail(data.email);
    if (existing) {
      throw new Error(`User with email "${data.email}" already exists.`);
    }
    const id = `usr-${Date.now()}`;
    const newUser: EditorialUser = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.usersMap.set(id, newUser);
    return { ...newUser };
  }
}

// Global cached repository instances
let postgresRepoInstance: ICmsRepository | null = null;
let memoryRepoInstance: ICmsRepository | null = null;

/**
 * Returns the current active storage engine: "postgres" if DATABASE_URL is configured, else "memory".
 */
export function getRepositoryType(): "postgres" | "memory" {
  return isDatabaseConfigured() ? "postgres" : "memory";
}

/**
 * Returns the active CMS repository.
 * - In production: writes fail-closed if PostgreSQL is not configured.
 * - In development/staging: MemoryCmsRepository allows staging testing.
 */
export function getCmsRepository(): ICmsRepository {
  if (isDatabaseConfigured()) {
    if (!postgresRepoInstance) {
      postgresRepoInstance = new PostgresCmsRepository();
    }
    return postgresRepoInstance;
  }
  if (!memoryRepoInstance) {
    memoryRepoInstance = new MemoryCmsRepository();
  }
  return memoryRepoInstance;
}

// Proxied singleton repository provider ensuring transparent dynamic resolution across all existing imports
export const cmsRepository: ICmsRepository = new Proxy({} as ICmsRepository, {
  get(_target, prop) {
    const repo = getCmsRepository();
    const value = (repo as any)[prop];
    if (typeof value === "function") {
      return value.bind(repo);
    }
    return value;
  },
});
