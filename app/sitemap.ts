import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getAllCategories } from "@/lib/categories";
import { demoLiveCoverages } from "@/lib/live-coverage";
import { getBaseUrl, getAbsoluteUrl } from "@/lib/site-url";

/**
 * Dynamic XML Sitemap Generation for Ocean Editorial
 *
 * Covers all indexable editorial content:
 * - Homepage and primary editorial desks
 * - All published articles with verifiable lastModified timestamps
 * - All category archive pages
 * - Active and archived live-coverage event timelines
 * - Foundational static editorial pages (About, Privacy)
 *
 * Explicitly excludes:
 * - /saved: Private, device-local bookmark storage with zero indexed content
 * - /search: Dynamic exploration endpoint blocked to prevent search query crawl bloat
 * - /typography-test: Internal design system verification suite
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const articles = getAllArticles();
  const categories = getAllCategories();

  // 1. Core Editorial Anchors
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: getAbsoluteUrl("/latest"),
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/about"),
      lastModified: new Date("2026-10-15T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: getAbsoluteUrl("/privacy"),
      lastModified: new Date("2026-10-15T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 2. Category Archive Desks
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: getAbsoluteUrl(`/category/${cat.slug}`),
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  // 3. Published Editorial Articles
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: getAbsoluteUrl(`/article/${article.slug}`),
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Public Live Coverage Events
  const liveRoutes: MetadataRoute.Sitemap = demoLiveCoverages.map((coverage) => ({
    url: getAbsoluteUrl(`/live/${coverage.slug}`),
    lastModified: new Date(coverage.updatedAt || coverage.startedAt),
    changeFrequency: coverage.status === "live" ? "always" : "monthly",
    priority: coverage.status === "live" ? 0.9 : 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...liveRoutes,
  ];
}
