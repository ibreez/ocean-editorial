import type { Article, Category } from "@/types/article";
import { demoArticles } from "@/lib/articles";
import { categories, getCategoryBySlug } from "@/lib/categories";

export interface SearchOptions {
  categorySlug?: string;
  sortBy?: "newest" | "relevance";
}

export interface SearchResultItem {
  article: Article;
  score: number;
  matchedFields: string[];
}

import { sanitizeSearchQuery } from "@/lib/input-validation";

/**
 * Normalizes and sanitizes a search query by trimming, stripping control characters,
 * bounding length to 150 characters, and collapsing whitespace.
 */
export function normalizeQuery(query: string): string {
  return sanitizeSearchQuery(query, 150);
}

/**
 * Extracts plain text from all blocks within an article's body.
 */
export function extractArticleBodyText(article: Article): string {
  if (!article.body || !Array.isArray(article.body)) return "";
  return article.body
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
          return block.text || "";
        case "image":
          return `${block.alt || ""} ${block.caption || ""}`;
        default:
          return "";
      }
    })
    .join(" ");
}

/**
 * Executes a search against article data with comprehensive field matching,
 * Dhivehi and English language support, whitespace normalization,
 * relevance scoring, category filtering, and consistent sorting.
 */
export function searchArticlesDetailed(
  rawQuery: string,
  options: SearchOptions = {}
): SearchResultItem[] {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  const queryTokens = lowerQuery.split(" ").filter(Boolean);

  const matchedItems: SearchResultItem[] = [];

  for (const article of demoArticles) {
    // If a category filter is applied and does not match, skip
    if (options.categorySlug && options.categorySlug !== "all" && article.categorySlug !== options.categorySlug) {
      continue;
    }

    const matchedFields: string[] = [];
    let score = 0;

    const titleLower = (article.title || "").toLowerCase();
    const englishTitleLower = (article.englishTitle || "").toLowerCase();
    const summaryLower = (article.summary || "").toLowerCase();
    const categoryNameLower = (article.categoryName || "").toLowerCase();
    const categoryObj = getCategoryBySlug(article.categorySlug);
    const categoryEngLower = (categoryObj?.englishName || "").toLowerCase();
    const authorNameLower = (article.author?.name || "").toLowerCase();
    const authorEngLower = (article.author?.englishName || "").toLowerCase();
    const tagsLower = (article.tags || []).map((t) => t.toLowerCase());
    const bodyTextLower = extractArticleBodyText(article).toLowerCase();

    // 1. Title match (highest weight)
    if (titleLower.includes(lowerQuery) || englishTitleLower.includes(lowerQuery)) {
      matchedFields.push("title");
      score += 100;
      if (titleLower === lowerQuery || englishTitleLower === lowerQuery) {
        score += 50; // exact title match bonus
      }
    }

    // 2. Summary match (high weight)
    if (summaryLower.includes(lowerQuery)) {
      matchedFields.push("summary");
      score += 40;
    }

    // 3. Category match (Dhivehi or English)
    if (categoryNameLower.includes(lowerQuery) || categoryEngLower.includes(lowerQuery)) {
      matchedFields.push("category");
      score += 30;
    }

    // 4. Tags match
    if (tagsLower.some((t) => t.includes(lowerQuery))) {
      matchedFields.push("tag");
      score += 25;
    }

    // 5. Author match
    if (authorNameLower.includes(lowerQuery) || authorEngLower.includes(lowerQuery)) {
      matchedFields.push("author");
      score += 20;
    }

    // 6. Body text match
    if (bodyTextLower.includes(lowerQuery)) {
      matchedFields.push("body");
      score += 15;
    }

    // If whole phrase didn't match, check token matches (for multi-word queries)
    if (matchedFields.length === 0 && queryTokens.length > 1) {
      let tokenMatches = 0;
      for (const token of queryTokens) {
        if (
          titleLower.includes(token) ||
          englishTitleLower.includes(token) ||
          summaryLower.includes(token) ||
          categoryNameLower.includes(token) ||
          tagsLower.some((t) => t.includes(token)) ||
          bodyTextLower.includes(token)
        ) {
          tokenMatches++;
        }
      }
      if (tokenMatches === queryTokens.length) {
        matchedFields.push("token-match");
        score += 10 * tokenMatches;
      }
    }

    if (matchedFields.length > 0) {
      matchedItems.push({
        article,
        score,
        matchedFields,
      });
    }
  }

  // Sorting
  const sortBy = options.sortBy || "newest";
  matchedItems.sort((a, b) => {
    if (sortBy === "relevance") {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
    }
    // Tie-breaker or default newest-first
    return new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime();
  });

  return matchedItems;
}

/**
 * Standard search returning array of matched articles.
 */
export function searchArticles(query: string, options?: SearchOptions): Article[] {
  return searchArticlesDetailed(query, options).map((item) => item.article);
}

/**
 * Curated popular search suggestions for Maldivian news readers.
 */
export const popularSearchKeywords = [
  { label: "ރާއްޖެ", query: "ރާއްޖެ" },
  { label: "ސިޔާސީ", query: "ސިޔާސީ" },
  { label: "މަޖިލިސް", query: "މަޖިލިސް" },
  { label: "ފަތުރުވެރިކަން", query: "ފަތުރުވެރިކަން" },
  { label: "ތިމާވެށި", query: "ތިމާވެށި" },
  { label: "ކުޅިވަރު", query: "ކުޅިވަރު" },
  { label: "ފުޓްބޯޅަ", query: "ފުޓްބޯޅަ" },
  { label: "ދިވެހި ބަސް", query: "ދިވެހި" },
];
