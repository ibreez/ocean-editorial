import type { ArticleBlock, ArticleMedia, VideoMedia, Author } from "@/types/article";

/**
 * Editorial Workflow Statuses
 * - draft: Work in progress by journalist / editor
 * - in_review: Submitted for copyediting and fact-checking
 * - scheduled: Approved and queued for scheduled publishing
 * - published: Active on public website
 * - archived: Retracted, historical, or removed from public feeds
 */
export type CmsArticleStatus = "draft" | "in_review" | "scheduled" | "published" | "archived";

export interface WorkflowTransitionRule {
  from: CmsArticleStatus;
  allowedTo: CmsArticleStatus[];
}

export const WORKFLOW_TRANSITIONS: Record<CmsArticleStatus, CmsArticleStatus[]> = {
  draft: ["in_review", "archived"],
  in_review: ["draft", "scheduled", "published", "archived"],
  scheduled: ["draft", "in_review", "published", "archived"],
  published: ["draft", "archived"],
  archived: ["draft"],
};

export function canTransitionWorkflow(from: CmsArticleStatus, to: CmsArticleStatus): boolean {
  if (from === to) return true;
  const allowed = WORKFLOW_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export type EditorialRole = "admin" | "editor" | "journalist";

export interface EditorialUser {
  id: string;
  email: string;
  name: string;
  dhivehiName?: string;
  role: EditorialRole;
  isActive: boolean;
  createdAt: string;
}

export interface CmsAuthor {
  id: string;
  slug: string;
  name: string; // Primary Dhivehi name
  englishName: string;
  role: string; // Editorial job title (e.g. ސީނިއަރ އެޑިޓޯރިއަލް ރިޕޯޓަރ)
  avatar?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CmsCategory {
  id: string;
  slug: string;
  name: string; // Dhivehi category label
  englishName: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface CmsArticle {
  id: string;
  slug: string;
  title: string; // Primary Dhivehi headline
  englishTitle?: string;
  summary: string; // Standfirst / deck
  englishSummary?: string;
  body: ArticleBlock[];
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  authorId: string;
  author: Author;
  status: CmsArticleStatus;
  featured: boolean;
  breaking: boolean;
  image?: ArticleMedia;
  video?: VideoMedia;
  tags: string[];
  readTimeMinutes: number;
  isOpinion: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  createdBy: string; // User ID / identifier
  lastEditor: string; // User ID / identifier
  revisionCount: number;
}

export interface CmsArticleRevision {
  id: string;
  articleId: string;
  revisionNumber: number;
  title: string;
  summary: string;
  body: ArticleBlock[];
  status: CmsArticleStatus;
  editedBy: string;
  createdAt: string;
  changeNote?: string;
}

export interface CmsMediaAsset {
  id: string;
  filename: string;
  url: string;
  alt: string;
  caption?: string;
  credit?: string;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  createdAt: string;
}

export interface CmsDashboardMetrics {
  totalArticles: number;
  drafts: number;
  inReview: number;
  scheduled: number;
  published: number;
  archived: number;
  breakingActive: number;
  isDemonstration: boolean; // Transparently identifies whether metrics reflect demo staging
}
