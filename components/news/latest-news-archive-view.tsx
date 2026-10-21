"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Radio,
  Filter,
  Flame,
  FolderOpen,
  Calendar,
} from "lucide-react";
import type { Article, Category } from "@/types/article";
import { ArticleCard } from "./article-card";
import { CompactStoryRow } from "./compact-story-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDhivehiDate, formatDhivehiRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

export interface LatestNewsArchiveViewProps {
  articles: Article[];
  categories: Category[];
  trendingArticles?: Article[];
}

export function LatestNewsArchiveView({
  articles,
  categories,
  trendingArticles = [],
}: LatestNewsArchiveViewProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [displayedCount, setDisplayedCount] = React.useState<number>(8);

  // Filter articles based on selected category
  const filteredArticles = React.useMemo(() => {
    if (selectedCategory === "all") return articles;
    return articles.filter((a) => a.categorySlug === selectedCategory);
  }, [articles, selectedCategory]);

  // Reset pagination when category changes
  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setDisplayedCount(8);
  };

  const visibleArticles = filteredArticles.slice(0, displayedCount);
  const hasMore = displayedCount < filteredArticles.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + 6, filteredArticles.length));
  };

  // Group visible articles by date for a chronological timeline feel
  const groupedArticles = React.useMemo(() => {
    const groups: { [key: string]: Article[] } = {};
    for (const article of visibleArticles) {
      const dateKey = formatDhivehiDate(article.publishedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(article);
    }
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }));
  }, [visibleArticles]);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* 1. Breadcrumb navigation */}
      <nav
        aria-label="ބްރެޑްކްރަމްބް"
        className="flex items-center gap-2 text-xs font-semibold text-[#0F766E]"
      >
        <Link href="/" className="hover:underline text-[#53635F] hover:text-[#123B3A]">
          ފުރަތަމަ ޞަފްޙާ
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <span className="text-[#123B3A] font-bold" aria-current="page">
          އެންމެ ފަހުގެ ޚަބަރު
        </span>
      </nav>

      {/* 2. Page Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[12px] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DCE4DF]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#D94343] uppercase tracking-wider font-latin mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D94343] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D94343]" />
              </span>
              <span>LIVE EDITORIAL FEED · ވަގުތުން ވަގުތަށް</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#123B3A] tracking-tight leading-tight">
              އެންމެ ފަހުގެ ޚަބަރު
            </h1>

            <p className="text-base sm:text-lg text-[#53635F] mt-3 max-w-3xl leading-relaxed">
              ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި، ސިޔާސީ، އިޤްތިޞާދީ، ކުޅިވަރު އަދި ޘަޤާފީ އަދާހަމަތައް ވަގުތުން ވަގުތަށް.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EDF2EF] text-xs font-bold text-[#123B3A]">
              <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>ޖުމްލަ {articles.length} ޚަބަރު</span>
            </span>
          </div>
        </div>

        {/* 3. Category Filter Chips */}
        <div className="pt-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Filter className="w-3.5 h-3.5 text-[#0F766E]" />
            <p className="text-xs font-bold text-[#687671]">
              ބައިތަކުން ފުރާނާލައްވާ:
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              aria-pressed={selectedCategory === "all"}
              className={cn(
                "px-3.5 py-1.5 min-h-[36px] rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                selectedCategory === "all"
                  ? "bg-[#123B3A] text-white shadow-xs"
                  : "bg-[#EDF2EF] text-[#53635F] hover:bg-[#DCE4DF] hover:text-[#182624]"
              )}
            >
              <span>ހުރިހާ ޚަބަރެއް</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-[#DCE4DF] text-[#53635F]"
              )}>
                {articles.length}
              </span>
            </button>

            {categories.map((c) => {
              const count = articles.filter((a) => a.categorySlug === c.slug).length;
              const isSelected = selectedCategory === c.slug;

              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => handleCategorySelect(c.slug)}
                  aria-pressed={isSelected}
                  className={cn(
                    "px-3.5 py-1.5 min-h-[36px] rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                    isSelected
                      ? "bg-[#123B3A] text-white shadow-xs"
                      : "bg-[#EDF2EF] text-[#53635F] hover:bg-[#DCE4DF] hover:text-[#182624]"
                  )}
                >
                  <span>{c.name}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isSelected ? "bg-white/20 text-white" : "bg-[#DCE4DF] text-[#53635F]"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Main Feed Layout + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {filteredArticles.length === 0 ? (
            <EmptyState
              title="މި ބައިން އެއްވެސް ޚަބަރެއް ނުފެނުނު"
              description="އެހެން ބައެއް ޚިޔާރުކުރައްވައިގެން ޚަބަރުތައް ބައްލަވާލައްވާށެވެ."
              actionHref="#"
              actionLabel="ހުރިހާ ޚަބަރެއް ބެއްލެވުމަށް"
            >
              <Button
                variant="primary"
                size="md"
                onClick={() => handleCategorySelect("all")}
                className="mt-4"
              >
                ހުރިހާ ޚަބަރެއް ދައްކަވާ
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-8">
              {groupedArticles.map((group, groupIdx) => (
                <div key={group.date} className="space-y-3">
                  {/* Timeline Date Divider */}
                  <div className="flex items-center gap-2 border-b border-[#DCE4DF] pb-2">
                    <Calendar className="w-4 h-4 text-[#0F766E]" />
                    <h2 className="text-sm font-bold text-[#123B3A]">
                      {group.date}
                    </h2>
                  </div>

                  {/* Stories list */}
                  <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] px-5 divide-y divide-[#DCE4DF] shadow-xs">
                    {group.items.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        variant="horizontal"
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleLoadMore}
                    className="w-full sm:w-auto min-w-[220px]"
                  >
                    އިތުރު ޚަބަރު ބައްލަވާ ({filteredArticles.length - visibleArticles.length} ބާކީ)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Rail (4 cols) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Trending stories */}
          {trendingArticles.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b-2 border-[#123B3A] pb-2 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#D94343]" />
                  <h3 className="text-lg font-black text-[#123B3A]">
                    އެންމެ ގިނައިން ކިޔާފައިވާ
                  </h3>
                </div>
                <span className="text-[11px] font-latin font-bold text-[#53635F]">
                  TRENDING
                </span>
              </div>

              <div className="divide-y divide-[#DCE4DF]">
                {trendingArticles.map((story, index) => (
                  <CompactStoryRow
                    key={story.id}
                    article={story}
                    rank={index + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Categories Navigation Box */}
          <div className="bg-[#EDF2EF] border border-[#DCE4DF] rounded-[10px] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-base font-bold text-[#123B3A]">
                ޚަބަރުގެ ހުރިހާ ބައިތައް
              </h3>
            </div>
            <p className="text-xs text-[#53635F] leading-relaxed mb-4">
              ވަކިވަކި ދާއިރާތަކުން އިތުރު ތަފްޞީލީ ރިޕޯޓުތައް ބެއްލެވުމަށް ތިރީގައިވާ ބައިތަކަށް ޒިޔާރަތްކުރައްވާ.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="p-2.5 rounded-[8px] bg-[#FFFFFF] border border-[#DCE4DF] text-xs font-bold text-[#182624] hover:border-[#0F766E] hover:text-[#0F766E] transition-colors flex items-center justify-between"
                >
                  <span>{c.name}</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
