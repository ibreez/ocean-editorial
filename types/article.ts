export type ArticleStatus =
  | "published"
  | "updated"
  | "breaking"
  | "draft";

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "image"; src: string; alt: string; caption?: string; credit?: string }
  | { type: "video"; src: string; title: string; caption?: string; credit?: string; poster?: string };

export interface Author {
  name: string;
  englishName?: string;
  slug: string;
  role?: string;
  avatar?: string;
}

export interface ArticleMedia {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export interface VideoMedia {
  src: string;
  title: string;
  caption?: string;
  credit?: string;
  poster?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string; // Primary Dhivehi headline
  englishTitle?: string;
  summary: string; // Standfirst / deck
  body: ArticleBlock[];
  categorySlug: string;
  categoryName: string; // Dhivehi category label
  author: Author;
  publishedAt: string; // ISO timestamp
  updatedAt?: string;
  status: ArticleStatus;
  image?: ArticleMedia;
  video?: VideoMedia;
  tags: string[];
  featured?: boolean;
  readTimeMinutes?: number;
  isOpinion?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string; // Dhivehi label
  englishName: string;
  description: string;
  order: number;
}

export interface LiveUpdate {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  isImportant?: boolean;
  authorName?: string;
  image?: ArticleMedia;
  video?: VideoMedia;
  tag?: string;
}

export interface LiveCoverage {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "live" | "completed" | "scheduled" | "concluded";
  startedAt: string;
  updatedAt: string;
  categorySlug: string;
  categoryName: string;
  image?: ArticleMedia;
  video?: VideoMedia;
  updates: LiveUpdate[];
}
