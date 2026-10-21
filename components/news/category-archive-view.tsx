"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { Article, Category } from "@/types/article";
import { ArticleCard } from "./article-card";
import { ArticleMetadata } from "./article-metadata";
import { EmptyState } from "@/components/ui/empty-state";
import { BookmarkButton } from "@/components/actions/bookmark-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CategoryArchiveViewProps {
  category: Category;
  articles: Article[];
  allCategories: Category[];
}

export function CategoryArchiveView({
  category,
  articles,
  allCategories,
}: CategoryArchiveViewProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = React.useState<"newest" | "readtime">("newest");
  const [displayedCount, setDisplayedCount] = React.useState(6);

  // If there are articles, designate the first (or marked featured) as category lead story
  const featuredArticle = React.useMemo(() => {
    if (articles.length === 0) return null;
    return articles.find((a) => a.featured) || articles[0];
  }, [articles]);

  // Remaining articles for the grid/list
  const remainingArticles = React.useMemo(() => {
    if (!featuredArticle) return [];
    return articles.filter((a) => a.id !== featuredArticle.id);
  }, [articles, featuredArticle]);

  // Sorted remaining articles
  const sortedArticles = React.useMemo(() => {
    const list = [...remainingArticles];
    if (sortBy === "readtime") {
      return list.sort((a, b) => (a.readTimeMinutes || 3) - (b.readTimeMinutes || 3));
    }
    // Default newest first
    return list.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [remainingArticles, sortBy]);

  const visibleArticles = sortedArticles.slice(0, displayedCount);
  const hasMore = displayedCount < sortedArticles.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + 4, sortedArticles.length));
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* 1. Breadcrumbs Navigation */}
      <nav
        aria-label="ބްރެޑްކްރަމްބް"
        className="flex items-center gap-2 text-xs font-semibold text-[#0F766E]"
      >
        <Link href="/" className="hover:underline text-[#53635F] hover:text-[#123B3A]">
          ފުރަތަމަ ޞަފްޙާ
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <span className="text-[#53635F]">ޚަބަރުގެ ބައިތައް</span>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <span className="text-[#123B3A] font-bold" aria-current="page">
          {category.name}
        </span>
      </nav>

      {/* 2. Category Masthead Banner */}
      <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[12px] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DCE4DF]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider font-latin mb-2">
              <span>CATEGORY ARCHIVE</span>
              <span aria-hidden="true" className="text-[#AAB9B2]">·</span>
              <span>{category.englishName}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#123B3A] tracking-tight leading-tight">
              {category.name}
            </h1>

            {category.description && (
              <p className="text-base sm:text-lg text-[#53635F] mt-3 max-w-3xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDF2EF] text-xs font-bold text-[#123B3A]">
              <span className="w-2 h-2 rounded-full bg-[#0F766E]" aria-hidden="true" />
              <span>{articles.length} ޚަބަރު</span>
            </span>
          </div>
        </div>

        {/* Category Switcher Navigation Bar */}
        <div className="pt-5">
          <p className="text-xs font-bold text-[#687671] mb-2.5">
            އެހެން ބައިތަކަށް ވަޑައިގަންނަވާ:
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allCategories.map((c) => {
              const isCurrent = c.slug === category.slug;
              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className={cn(
                    "px-3.5 py-1.5 min-h-[36px] flex items-center rounded-full text-xs font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                    isCurrent
                      ? "bg-[#123B3A] text-white shadow-xs"
                      : "bg-[#EDF2EF] text-[#53635F] hover:bg-[#DCE4DF] hover:text-[#182624]"
                  )}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Empty State or Article Feeds */}
      {articles.length === 0 ? (
        <EmptyState
          title={`${category.name}ގެ އެއްވެސް ޚަބަރެއް އަދި ނެތް`}
          description="މި ބައިގައި އަދި އެއްވެސް ޚަބަރެއް ޝާއިޢުކުރެވިފައެއް ނުވެއެވެ. އަޅުގަނޑުމެންގެ އެހެން ބައިތައް ބައްލަވާލައްވާށެވެ."
          actionHref="/"
          actionLabel="ފުރަތަމަ ޞަފްޙާއަށް"
        />
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {/* Featured Category Lead Story */}
          {featuredArticle && (
            <section aria-label={`${category.name}ގެ މައި ޚަބަރު`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-[#D94343] rounded-full" aria-hidden="true" />
                <h2 className="text-sm font-bold text-[#123B3A] uppercase tracking-wide">
                  މި ބައިގެ ޚާއްޞަ ޚަބަރު
                </h2>
              </div>

              <article className="group bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-5 sm:p-7 shadow-xs hover:border-[#AAB9B2] transition-colors grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                {featuredArticle.image && (
                  <div className="lg:col-span-7">
                    <Link
                      href={`/article/${featuredArticle.slug}`}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="aspect-16/9 w-full rounded-[8px] overflow-hidden bg-[#EDF2EF] border border-[#DCE4DF] relative block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredArticle.image.src}
                        alt={featuredArticle.image.alt}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    {featuredArticle.image.caption && (
                      <p className="text-[11px] text-[#687671] mt-1.5 leading-normal">
                        {featuredArticle.image.caption}
                      </p>
                    )}
                  </div>
                )}

                <div className={cn("flex flex-col justify-between py-1", featuredArticle.image ? "lg:col-span-5" : "lg:col-span-12")}>
                  <div>
                    <ArticleMetadata
                      categorySlug={featuredArticle.categorySlug}
                      categoryName={featuredArticle.categoryName}
                      publishedAt={featuredArticle.publishedAt}
                      className="mb-3"
                    />

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#123B3A] group-hover:text-[#0F766E] transition-colors leading-[32px] sm:leading-[40px] mb-3">
                      <Link
                        href={`/article/${featuredArticle.slug}`}
                        className="focus-visible:outline-none focus-visible:underline"
                      >
                        {featuredArticle.title}
                      </Link>
                    </h3>

                    {featuredArticle.summary && (
                      <p className="text-sm sm:text-base text-[#53635F] leading-relaxed mb-4 line-clamp-3">
                        {featuredArticle.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#DCE4DF] flex flex-wrap items-center justify-between gap-3 text-xs text-[#687671]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#182624]">
                        {featuredArticle.author.name}
                      </span>
                      {featuredArticle.readTimeMinutes && (
                        <>
                          <span className="text-[#AAB9B2]" aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {featuredArticle.readTimeMinutes} މިނެޓު
                          </span>
                        </>
                      )}
                    </div>

                    <BookmarkButton
                      slug={featuredArticle.slug}
                      title={featuredArticle.title}
                      variant="button"
                    />
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* Supporting Category Stories Stream */}
          {remainingArticles.length > 0 && (
            <section aria-label={`${category.name}ގެ އެހެން ޚަބަރުތައް`} className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#123B3A] pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-black text-[#123B3A]">
                    އިތުރު ޚަބަރުތައް
                  </h2>
                  <span className="text-xs text-[#53635F]">
                    (ދައްކަނީ {visibleArticles.length} ގެ ތެރެއިން {sortedArticles.length} ޚަބަރު)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort options */}
                  <div className="flex items-center gap-1.5 text-xs text-[#53635F] bg-[#FFFFFF] border border-[#DCE4DF] rounded-[8px] p-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#0F766E]" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => setSortBy("newest")}
                      aria-pressed={sortBy === "newest"}
                      className={cn(
                        "px-3 py-1.5 min-h-[36px] rounded-[6px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                        sortBy === "newest"
                          ? "bg-[#123B3A] text-white"
                          : "hover:bg-[#EDF2EF] text-[#53635F]"
                      )}
                    >
                      އެންމެ ފަހުގެ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy("readtime")}
                      aria-pressed={sortBy === "readtime"}
                      className={cn(
                        "px-3 py-1.5 min-h-[36px] rounded-[6px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                        sortBy === "readtime"
                          ? "bg-[#123B3A] text-white"
                          : "hover:bg-[#EDF2EF] text-[#53635F]"
                      )}
                    >
                      ކުރު ޚަބަރު
                    </button>
                  </div>

                  {/* View layout toggle */}
                  <div className="flex items-center bg-[#FFFFFF] border border-[#DCE4DF] rounded-[8px] p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      aria-pressed={viewMode === "grid"}
                      aria-label="ގްރިޑް ވިއު (Grid view)"
                      className={cn(
                        "p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                        viewMode === "grid"
                          ? "bg-[#123B3A] text-white"
                          : "text-[#53635F] hover:bg-[#EDF2EF]"
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      aria-pressed={viewMode === "list"}
                      aria-label="ލިސްޓް ވިއު (List view)"
                      className={cn(
                        "p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                        viewMode === "list"
                          ? "bg-[#123B3A] text-white"
                          : "text-[#53635F] hover:bg-[#EDF2EF]"
                      )}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid or List View */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="standard"
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] px-5 divide-y divide-[#DCE4DF]">
                  {visibleArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="horizontal"
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-6 text-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleLoadMore}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    އިތުރު ޚަބަރު ބައްލަވާ ({sortedArticles.length - visibleArticles.length} ބާކީ)
                  </Button>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
