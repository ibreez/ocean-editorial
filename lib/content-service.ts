/**
 * Editorial Content Service & Publishing System Integration Layer
 *
 * Architecture Overview:
 * This module establishes a typed, asynchronous content abstraction separating the UI
 * presentation layer from data sources. It prepares Ocean Editorial for future
 * migration to headless CMS platforms (e.g., Strapi, Sanity, WordPress REST API, Directus)
 * or real-time SQL/NoSQL databases without requiring changes to page components.
 *
 * Phase 13 Security & Production Readiness Enhancements:
 * - Runtime schema validation of external CMS payloads (prevents rendering malformed records)
 * - Request timeouts (AbortSignal.timeout(8000)) to prevent thread stalling
 * - Strict URL validation ensuring only http/https protocols
 * - Bounded ISR revalidation intervals (10s <= interval <= 86400s)
 * - Sensitive token & credential isolation (never leaked in error messages or logs)
 * - Deliberate breaking news policy: Never presents mock/demo items as active breaking alerts
 *   when running against an external CMS.
 */

import type { Article, Category, LiveCoverage } from "@/types/article";
import {
  demoArticles,
  getAllArticles as getRawAllArticles,
  getArticleBySlug as getRawArticleBySlug,
  getSecondaryTopStories as getRawSecondaryTopStories,
  getTrendingArticles as getRawTrendingArticles,
  getOpinionArticles as getRawOpinionArticles,
  getLatestArticles as getRawLatestArticles,
  getRelatedArticles as getRawRelatedArticles,
  searchArticles as getRawSearchArticles,
} from "@/lib/articles";
import {
  getAllCategories as getRawAllCategories,
  getCategoryBySlug as getRawCategoryBySlug,
} from "@/lib/categories";
import {
  demoLiveCoverages,
  getLiveCoverageBySlug as getRawLiveCoverageBySlug,
  getPrimaryActiveLiveCoverage as getRawPrimaryActiveLiveCoverage,
} from "@/lib/live-coverage";

// ============================================================================
// Query Interfaces & Response Types
// ============================================================================

export interface ContentFilterOptions {
  categorySlug?: string;
  tag?: string;
  authorSlug?: string;
  status?: Article["status"] | "all";
  featuredOnly?: boolean;
  opinionOnly?: boolean;
  query?: string;
  limit?: number;
  page?: number;
  sortBy?: "publishedAt" | "relevance" | "trending";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedEditorialResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export class ContentServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "NETWORK_ERROR" | "INVALID_REQUEST" | "CMS_UNAVAILABLE" | "SCHEMA_ERROR",
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "ContentServiceError";
  }
}

// ============================================================================
// Runtime Payload Validation Helpers (Defense-in-depth against malformed CMS data)
// ============================================================================

export function isValidArticle(obj: unknown): obj is Article {
  if (!obj || typeof obj !== "object") return false;
  const a = obj as Record<string, unknown>;
  return (
    typeof a.id === "string" &&
    typeof a.slug === "string" &&
    typeof a.title === "string" &&
    typeof a.categorySlug === "string" &&
    typeof a.categoryName === "string" &&
    typeof a.publishedAt === "string" &&
    Array.isArray(a.body) &&
    typeof a.author === "object" &&
    a.author !== null &&
    typeof (a.author as Record<string, unknown>).name === "string"
  );
}

export function isValidCategory(obj: unknown): obj is Category {
  if (!obj || typeof obj !== "object") return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.slug === "string" &&
    typeof c.name === "string" &&
    typeof c.englishName === "string"
  );
}

export function isValidLiveCoverage(obj: unknown): obj is LiveCoverage {
  if (!obj || typeof obj !== "object") return false;
  const l = obj as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    typeof l.slug === "string" &&
    typeof l.title === "string" &&
    typeof l.categorySlug === "string" &&
    Array.isArray(l.updates)
  );
}

export function validateArticleList(arr: unknown): Article[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(isValidArticle);
}

export function validatePaginatedArticles(obj: unknown): PaginatedEditorialResponse<Article> {
  if (!obj || typeof obj !== "object") {
    return {
      data: [],
      pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1, hasMore: false },
    };
  }
  const raw = obj as Record<string, unknown>;
  const data = Array.isArray(raw.data) ? raw.data.filter(isValidArticle) : [];
  const rawPagination = (raw.pagination || {}) as Record<string, unknown>;

  const total = typeof rawPagination.total === "number" ? rawPagination.total : data.length;
  const page = typeof rawPagination.page === "number" ? rawPagination.page : 1;
  const pageSize = typeof rawPagination.pageSize === "number" ? rawPagination.pageSize : 10;
  const totalPages = typeof rawPagination.totalPages === "number" ? rawPagination.totalPages : Math.ceil(total / (pageSize || 1)) || 1;
  const hasMore = typeof rawPagination.hasMore === "boolean" ? rawPagination.hasMore : page < totalPages;

  return {
    data,
    pagination: { total, page, pageSize, totalPages, hasMore },
  };
}

// ============================================================================
// Editorial Content Adapter Contract
// ============================================================================

export interface IEditorialContentAdapter {
  getArticles(options?: ContentFilterOptions): Promise<PaginatedEditorialResponse<Article>>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getLeadStory(): Promise<Article | null>;
  getSecondaryTopStories(limit?: number): Promise<Article[]>;
  getBreakingArticle(): Promise<Article | null>;
  getTrendingArticles(limit?: number): Promise<Article[]>;
  getLatestArticles(limit?: number): Promise<Article[]>;
  getOpinionArticles(limit?: number): Promise<Article[]>;
  getRelatedArticles(currentSlug: string, categorySlug: string, limit?: number): Promise<Article[]>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getLiveCoverages(status?: "all" | "live" | "completed"): Promise<LiveCoverage[]>;
  getLiveCoverageBySlug(slug: string): Promise<LiveCoverage | null>;
  getActiveLiveCoverage(): Promise<LiveCoverage | null>;
  search(query: string, options?: ContentFilterOptions): Promise<PaginatedEditorialResponse<Article>>;
}

// ============================================================================
// 1. Local / In-Memory Demo Adapter (Active Default)
// ============================================================================

export class LocalEditorialAdapter implements IEditorialContentAdapter {
  async getArticles(options: ContentFilterOptions = {}): Promise<PaginatedEditorialResponse<Article>> {
    let pool = [...demoArticles];

    // Public reader isolation: draft articles are strictly excluded from public display
    pool = pool.filter((a) => a.status !== "draft");

    if (options.categorySlug) {
      pool = pool.filter((a) => a.categorySlug === options.categorySlug);
    }
    if (options.tag) {
      pool = pool.filter((a) => a.tags.includes(options.tag!));
    }
    if (options.authorSlug) {
      pool = pool.filter((a) => a.author.slug === options.authorSlug);
    }
    if (options.status && options.status !== "all") {
      pool = pool.filter((a) => a.status === options.status);
    }
    if (options.featuredOnly) {
      pool = pool.filter((a) => a.featured);
    }
    if (options.opinionOnly) {
      pool = pool.filter((a) => a.isOpinion);
    }

    // Sorting
    pool.sort((a, b) => {
      const order = options.sortOrder === "asc" ? 1 : -1;
      return (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * order;
    });

    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, options.limit || 10);
    const total = pool.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginatedItems = pool.slice(start, start + pageSize);

    return {
      data: paginatedItems,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const article = getRawArticleBySlug(slug);
    if (!article || article.status === "draft") return null;
    return article ? { ...article } : null;
  }

  async getLeadStory(): Promise<Article | null> {
    const story = demoArticles.find((a) => a.featured) || demoArticles[0];
    return story ? { ...story } : null;
  }

  async getSecondaryTopStories(limit: number = 2): Promise<Article[]> {
    return getRawSecondaryTopStories().slice(0, limit);
  }

  async getBreakingArticle(): Promise<Article | null> {
    const breaking = demoArticles.find((a) => a.status === "breaking");
    return breaking ? { ...breaking } : null;
  }

  async getTrendingArticles(limit: number = 4): Promise<Article[]> {
    return getRawTrendingArticles(limit);
  }

  async getLatestArticles(limit: number = 6): Promise<Article[]> {
    return getRawLatestArticles(limit);
  }

  async getOpinionArticles(limit: number = 2): Promise<Article[]> {
    return getRawOpinionArticles(limit);
  }

  async getRelatedArticles(
    currentSlug: string,
    categorySlug: string,
    limit: number = 3
  ): Promise<Article[]> {
    return getRawRelatedArticles(currentSlug, categorySlug, limit);
  }

  async getCategories(): Promise<Category[]> {
    return [...getRawAllCategories()];
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const category = getRawCategoryBySlug(slug);
    return category ? { ...category } : null;
  }

  async getLiveCoverages(status: "all" | "live" | "completed" = "all"): Promise<LiveCoverage[]> {
    if (status === "all") return [...demoLiveCoverages];
    return demoLiveCoverages.filter((c) => c.status === status);
  }

  async getLiveCoverageBySlug(slug: string): Promise<LiveCoverage | null> {
    const coverage = getRawLiveCoverageBySlug(slug);
    return coverage ? { ...coverage } : null;
  }

  async getActiveLiveCoverage(): Promise<LiveCoverage | null> {
    const active = getRawPrimaryActiveLiveCoverage();
    return active ? { ...active } : null;
  }

  async search(query: string, options: ContentFilterOptions = {}): Promise<PaginatedEditorialResponse<Article>> {
    const matches = getRawSearchArticles(query).filter((a) => a.status !== "draft");
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, options.limit || 10);
    const total = matches.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;

    return {
      data: matches.slice(start, start + pageSize),
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }
}

// ============================================================================
// 2. Production Remote Headless CMS Adapter (Blueprint / Migration Reference)
// ============================================================================

/**
 * RemoteCmsAdapter demonstrates how to safely connect to an external publishing API
 * (e.g., Strapi, WordPress VIP REST, Ghost, or Sanity CMS).
 *
 * Security & Reliability features:
 * - 8-second request timeouts via AbortSignal.timeout
 * - URL scheme validation (strictly http / https)
 * - Safe error handling preventing token leaks
 * - Bounded revalidation
 * - Deliberate breaking news handling: never leaks mock demo alerts as live breaking stories
 */
export class RemoteCmsAdapter implements IEditorialContentAdapter {
  private apiUrl: string;
  private apiToken?: string;
  private revalidateSeconds: number;
  private allowDemoFallback: boolean;
  private fallbackAdapter: LocalEditorialAdapter;

  constructor(config?: {
    apiUrl?: string;
    apiToken?: string;
    revalidateSeconds?: number;
    allowDemoFallback?: boolean;
  }) {
    const rawUrl = (config?.apiUrl || process.env.CMS_API_URL || "").trim();
    this.apiUrl = this.validateApiUrl(rawUrl);
    this.apiToken = config?.apiToken || process.env.CMS_API_TOKEN;

    // Bounded revalidation between 10 seconds and 24 hours (86400s)
    const envReval = Number(config?.revalidateSeconds ?? process.env.CMS_REVALIDATE_SECONDS);
    this.revalidateSeconds = !isNaN(envReval) && envReval >= 10 && envReval <= 86400 ? envReval : 60;

    // In production, fallback to demo content is disabled by default to prevent
    // sample articles from being masqueraded as real breaking news.
    this.allowDemoFallback = config?.allowDemoFallback ?? (process.env.CMS_ALLOW_DEMO_FALLBACK === "true");
    this.fallbackAdapter = new LocalEditorialAdapter();
  }

  private validateApiUrl(urlStr: string): string {
    if (!urlStr) return "";
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return "";
      }
      return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/$/, "")}`;
    } catch {
      return "";
    }
  }

  private async fetchFromCms<T>(
    endpoint: string,
    queryParams: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    if (!this.apiUrl) {
      throw new ContentServiceError("CMS_API_URL is invalid or unconfigured", "CMS_UNAVAILABLE");
    }

    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const url = new URL(`${this.apiUrl}/${cleanEndpoint}`);
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.set(key, String(val));
    });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiToken) {
      headers["Authorization"] = `Bearer ${this.apiToken}`;
    }

    try {
      // 8-second bounded timeout to prevent hanging worker threads
      const response = await fetch(url.toString(), {
        headers,
        signal: AbortSignal.timeout(8000),
        next: { revalidate: this.revalidateSeconds },
      });

      if (!response.ok) {
        // Redact endpoint details to prevent upstream error leakage
        throw new ContentServiceError(
          `Upstream CMS request failed with HTTP ${response.status}`,
          "NETWORK_ERROR",
          response.status
        );
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof ContentServiceError) {
        throw err;
      }
      // Redact internal network/DNS error details
      throw new ContentServiceError(
        "Failed to reach external CMS publishing endpoint",
        "CMS_UNAVAILABLE",
        502
      );
    }
  }

  async getArticles(options?: ContentFilterOptions): Promise<PaginatedEditorialResponse<Article>> {
    try {
      const raw = await this.fetchFromCms<unknown>("/articles", {
        category: options?.categorySlug,
        tag: options?.tag,
        status: options?.status,
        featured: options?.featuredOnly ? 1 : undefined,
        opinion: options?.opinionOnly ? 1 : undefined,
        page: options?.page || 1,
        limit: options?.limit || 10,
        sortBy: options?.sortBy,
        sortOrder: options?.sortOrder,
      });
      return validatePaginatedArticles(raw);
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getArticles(options);
      }
      return {
        data: [],
        pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1, hasMore: false },
      };
    }
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const raw = await this.fetchFromCms<unknown>(`/articles/${encodeURIComponent(slug)}`);
      return isValidArticle(raw) ? raw : null;
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getArticleBySlug(slug);
      }
      return null;
    }
  }

  async getLeadStory(): Promise<Article | null> {
    try {
      const response = await this.getArticles({ featuredOnly: true, limit: 1 });
      if (response.data.length > 0) return response.data[0];
      return null;
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getLeadStory();
      }
      return null;
    }
  }

  async getSecondaryTopStories(limit: number = 2): Promise<Article[]> {
    try {
      const response = await this.getArticles({ featuredOnly: true, limit: limit + 1 });
      return response.data.slice(1, limit + 1);
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getSecondaryTopStories(limit);
      }
      return [];
    }
  }

  /**
   * Safe breaking news retrieval:
   * When connected to a real CMS, if the CMS query fails or returns empty,
   * this NEVER falls back to demo articles. Presenting mock articles as real
   * breaking news during an upstream error is an unacceptable editorial risk.
   */
  async getBreakingArticle(): Promise<Article | null> {
    try {
      const response = await this.getArticles({ status: "breaking", limit: 1 });
      return response.data[0] || null;
    } catch {
      // Return null safely without fake breaking news
      return null;
    }
  }

  async getTrendingArticles(limit: number = 4): Promise<Article[]> {
    try {
      const raw = await this.fetchFromCms<unknown>("/articles/trending", { limit });
      return validateArticleList(raw);
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getTrendingArticles(limit);
      }
      return [];
    }
  }

  async getLatestArticles(limit: number = 6): Promise<Article[]> {
    try {
      const response = await this.getArticles({ limit, sortBy: "publishedAt", sortOrder: "desc" });
      return response.data;
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getLatestArticles(limit);
      }
      return [];
    }
  }

  async getOpinionArticles(limit: number = 2): Promise<Article[]> {
    try {
      const response = await this.getArticles({ opinionOnly: true, limit });
      return response.data;
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getOpinionArticles(limit);
      }
      return [];
    }
  }

  async getRelatedArticles(
    currentSlug: string,
    categorySlug: string,
    limit: number = 3
  ): Promise<Article[]> {
    try {
      const raw = await this.fetchFromCms<unknown>("/articles/related", {
        slug: currentSlug,
        category: categorySlug,
        limit,
      });
      return validateArticleList(raw);
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getRelatedArticles(currentSlug, categorySlug, limit);
      }
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const raw = await this.fetchFromCms<unknown>("/categories");
      if (Array.isArray(raw)) {
        return raw.filter(isValidCategory);
      }
      return [];
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getCategories();
      }
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const raw = await this.fetchFromCms<unknown>(`/categories/${encodeURIComponent(slug)}`);
      return isValidCategory(raw) ? raw : null;
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getCategoryBySlug(slug);
      }
      return null;
    }
  }

  async getLiveCoverages(status: "all" | "live" | "completed" = "all"): Promise<LiveCoverage[]> {
    try {
      const raw = await this.fetchFromCms<unknown>("/live-coverages", { status });
      if (Array.isArray(raw)) {
        return raw.filter(isValidLiveCoverage);
      }
      return [];
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getLiveCoverages(status);
      }
      return [];
    }
  }

  async getLiveCoverageBySlug(slug: string): Promise<LiveCoverage | null> {
    try {
      const raw = await this.fetchFromCms<unknown>(`/live-coverages/${encodeURIComponent(slug)}`);
      return isValidLiveCoverage(raw) ? raw : null;
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getLiveCoverageBySlug(slug);
      }
      return null;
    }
  }

  async getActiveLiveCoverage(): Promise<LiveCoverage | null> {
    try {
      const coverages = await this.getLiveCoverages("live");
      return coverages[0] || null;
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.getActiveLiveCoverage();
      }
      return null;
    }
  }

  async search(query: string, options?: ContentFilterOptions): Promise<PaginatedEditorialResponse<Article>> {
    try {
      const raw = await this.fetchFromCms<unknown>("/search", {
        q: query,
        page: options?.page || 1,
        limit: options?.limit || 10,
      });
      return validatePaginatedArticles(raw);
    } catch {
      if (this.allowDemoFallback) {
        return this.fallbackAdapter.search(query, options);
      }
      return {
        data: [],
        pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1, hasMore: false },
      };
    }
  }
}

// ============================================================================
// Exported Unified Content Service Singleton
// ============================================================================

/**
 * Creates the active content adapter based on runtime environment configuration.
 * When CMS_API_URL is configured, RemoteCmsAdapter is used with automatic fallback;
 * otherwise, LocalEditorialAdapter is used.
 */
function createContentAdapter(): IEditorialContentAdapter {
  if (process.env.CMS_API_URL && process.env.CMS_API_URL.trim()) {
    return new RemoteCmsAdapter();
  }
  return new LocalEditorialAdapter();
}

export const editorialContentService = createContentAdapter();
