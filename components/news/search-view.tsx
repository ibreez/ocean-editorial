"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  ChevronLeft,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Compass,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { Article, Category } from "@/types/article";
import { searchArticlesDetailed, popularSearchKeywords, normalizeQuery } from "@/lib/search";
import { getAllCategories } from "@/lib/categories";
import { ArticleCard } from "@/components/news/article-card";
import { CompactStoryRow } from "@/components/news/compact-story-row";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive state directly from URL query parameters (single source of truth)
  const urlQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const sortBy = (searchParams.get("sort") as "newest" | "relevance") || "newest";

  const [inputVal, setInputVal] = React.useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = React.useState(urlQuery);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Synchronize local input if URL changed externally (e.g. back/forward navigation)
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setInputVal(urlQuery);
  }

  const inputRef = React.useRef<HTMLInputElement>(null);
  const allCategories = React.useMemo(() => getAllCategories(), []);

  const activeQuery = urlQuery;

  // Execute search when activeQuery, selectedCategory, or sortBy changes
  const searchResults = React.useMemo(() => {
    if (!activeQuery.trim()) return [];
    return searchArticlesDetailed(activeQuery, {
      categorySlug: selectedCategory === "all" ? undefined : selectedCategory,
      sortBy,
    });
  }, [activeQuery, selectedCategory, sortBy]);

  // Compute category breakdown counts for the active query
  const categoryCounts = React.useMemo(() => {
    if (!activeQuery.trim()) return {};
    const counts: Record<string, number> = {};
    const allMatches = searchArticlesDetailed(activeQuery, { sortBy });
    for (const item of allMatches) {
      counts[item.article.categorySlug] = (counts[item.article.categorySlug] || 0) + 1;
    }
    return counts;
  }, [activeQuery, sortBy]);

  // Update URL helper
  const updateUrl = React.useCallback(
    (newQ: string, newCat: string, newSort: "newest" | "relevance") => {
      const params = new URLSearchParams();
      if (newQ.trim()) params.set("q", newQ.trim());
      if (newCat && newCat !== "all") params.set("category", newCat);
      if (newSort && newSort !== "newest") params.set("sort", newSort);

      const qs = params.toString();
      const target = qs ? `/search?${qs}` : "/search";
      router.push(target);
    },
    [router]
  );

  // Form submission handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeQuery(inputVal);
    updateUrl(clean, selectedCategory, sortBy);
  };

  // Clear query handler
  const handleClear = () => {
    setInputVal("");
    updateUrl("", selectedCategory, sortBy);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Click on a keyword chip
  const handleKeywordClick = (keyword: string) => {
    setInputVal(keyword);
    updateUrl(keyword, selectedCategory, sortBy);
  };

  // Change category filter
  const handleCategorySelect = (slug: string) => {
    updateUrl(activeQuery, slug, sortBy);
  };

  // Change sort option
  const handleSortChange = (newSort: "newest" | "relevance") => {
    updateUrl(activeQuery, selectedCategory, newSort);
  };

  const hasSearched = activeQuery.trim().length > 0;
  const resultCount = searchResults.length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-[#53635F]">
          <li>
            <Link href="/" className="hover:text-[#123B3A] transition-colors">
              ފުރަތަމަ ޞަފްޙާ
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronLeft className="w-3.5 h-3.5 opacity-50 rtl:rotate-0" />
          </li>
          <li className="font-semibold text-[#182624]" aria-current="page">
            ޚަބަރު ހޯއްދަވާ
          </li>
        </ol>
      </nav>

      {/* 2. Main Search Header */}
      <header className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F766E] mb-2 font-latin">
          <Search className="w-4 h-4" />
          <span>Archive Search & Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-noto-thaana text-[#123B3A] tracking-normal mb-3">
          ޚަބަރު ހޯއްދަވާ
        </h1>
        <p className="text-sm sm:text-base text-[#53635F] leading-relaxed">
          ދިވެހިރާއްޖެއާއި ބައިނަލްއަޤްވާމީ މުހިންމު ޚަބަރުތަކާއި، ދިރާސާތަކާއި މަޒުމޫނުތައް ތާނައިން ނުވަތަ އިނގިރޭސި ބަހުން ހޯއްދަވާ.
        </p>
      </header>

      {/* 3. Search Form Bar */}
      <div className="mb-8 bg-[#FFFFFF] p-3 sm:p-5 rounded-[16px] border border-[#DCE4DF] shadow-xs">
        <form onSubmit={handleSearchSubmit} role="search" className="relative">
          <label htmlFor="news-search-input" className="sr-only">
            ޚަބަރު ހޯދުމަށް ލިޔުއްވާ
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                id="news-search-input"
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="މިސާލަކަށް: މަޖިލިސް، ފަތުރުވެރިކަން، ޤައުމީ ޓީމު، އިޤްތިޞާދު..."
                className="w-full h-12 sm:h-14 px-4 sm:px-5 pl-12 text-base font-faruma text-[#182624] bg-[#F7F7F2] rounded-[10px] border border-[#DCE4DF] focus:border-[#0F766E] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#0F766E]/20 transition-all placeholder:text-[#687671]/70"
              />

              {/* Clear button inside input */}
              {inputVal && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="ހޯދާ ޢިބާރާތް ފޮހެލާ"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-[#687671] hover:text-[#182624] hover:bg-[#DCE4DF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="h-12 sm:h-14 px-6 sm:px-8 bg-[#123B3A] hover:bg-[#0F766E] text-white font-bold text-sm sm:text-base rounded-[10px] transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              <Search className="w-4 h-4" />
              <span>ހޯއްދަވާ</span>
            </button>
          </div>
        </form>

        {/* Popular Keyword Suggestions */}
        <div className="mt-4 pt-3 border-t border-[#EDF2EF] flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#687671] flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>ގިނައިން ހޯދާ މައުޟޫޢުތައް:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {popularSearchKeywords.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => handleKeywordClick(item.query)}
                className={cn(
                  "px-3 py-1.5 min-h-[36px] text-xs rounded-full border transition-all font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                  activeQuery === item.query
                    ? "bg-[#123B3A] text-white border-[#123B3A]"
                    : "bg-[#EDF2EF] text-[#182624] border-[#DCE4DF] hover:bg-[#DCE4DF] hover:border-[#AAB9B2]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Filter & Controls Toolbar (Only shown when a query is searched or during exploration) */}
      {hasSearched && (
        <div className="mb-6 space-y-4">
          {/* Result Count and Sort / View bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE4DF]">
            <div aria-live="polite" className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-[#182624]">
                &ldquo;{activeQuery}&rdquo; އާ ގުޅޭ
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EDF2EF] text-[#123B3A] border border-[#DCE4DF]">
                {resultCount} {resultCount === 1 ? "ޚަބަރު" : "ޚަބަރު"}
              </span>
              {selectedCategory !== "all" && (
                <span className="text-xs text-[#53635F]">
                  (ދާއިރާ:{" "}
                  {allCategories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  )
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#DCE4DF] rounded-[8px] p-1 text-xs">
                <span className="text-[#687671] px-1 font-semibold flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ތަރުތީބު:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSortChange("newest")}
                  aria-pressed={sortBy === "newest"}
                  className={cn(
                    "px-3 py-1.5 min-h-[36px] rounded-[6px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                    sortBy === "newest"
                      ? "bg-[#123B3A] text-white"
                      : "text-[#53635F] hover:text-[#182624]"
                  )}
                >
                  އެންމެ އާ
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange("relevance")}
                  aria-pressed={sortBy === "relevance"}
                  className={cn(
                    "px-3 py-1.5 min-h-[36px] rounded-[6px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                    sortBy === "relevance"
                      ? "bg-[#123B3A] text-white"
                      : "text-[#53635F] hover:text-[#182624]"
                  )}
                >
                  އެންމެ ގުޅޭ
                </button>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center border border-[#DCE4DF] rounded-[8px] bg-[#FFFFFF] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  aria-label="ގްރިޑް ވިއު (Grid view)"
                  className={cn(
                    "p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                    viewMode === "grid"
                      ? "bg-[#123B3A] text-white"
                      : "text-[#53635F] hover:text-[#182624]"
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
                      : "text-[#53635F] hover:text-[#182624]"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills with counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              aria-pressed={selectedCategory === "all"}
              className={cn(
                "px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                selectedCategory === "all"
                  ? "bg-[#123B3A] text-white shadow-xs"
                  : "bg-[#FFFFFF] text-[#53635F] border border-[#DCE4DF] hover:bg-[#EDF2EF] hover:text-[#182624]"
              )}
            >
              <span>ހުރިހާ ދާއިރާތައް</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  selectedCategory === "all" ? "bg-white/20 text-white" : "bg-[#EDF2EF] text-[#53635F]"
                )}
              >
                {searchArticlesDetailed(activeQuery, { sortBy }).length}
              </span>
            </button>

            {allCategories.map((cat) => {
              const count = categoryCounts[cat.slug] || 0;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  aria-pressed={isSelected}
                  className={cn(
                    "px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                    isSelected
                      ? "bg-[#123B3A] text-white shadow-xs"
                      : "bg-[#FFFFFF] text-[#53635F] border border-[#DCE4DF] hover:bg-[#EDF2EF] hover:text-[#182624]"
                  )}
                >
                  <span>{cat.name}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px]",
                      isSelected ? "bg-white/20 text-white" : "bg-[#EDF2EF] text-[#53635F]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Content Presentation */}
      {!hasSearched ? (
        /* Pre-Search State: Guidance & Discovery */
        <div className="bg-[#FFFFFF] rounded-[16px] border border-[#DCE4DF] p-6 sm:p-12 text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#EDF2EF] text-[#0F766E] flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-noto-thaana text-[#123B3A] mb-2">
            ބޭނުންފުޅުވާ ޚަބަރެއް ހޯއްދަވާ
          </h2>
          <p className="text-sm text-[#53635F] leading-relaxed mb-6 max-w-md mx-auto">
            މަތީގައިވާ ސަރޗް ބާގައި ބަހެއް ނުވަތަ ޖުމުލައެއް ލިޔުއްވައިގެން މުޅި ނޫހުން ޚަބަރުތައް ހޯއްދަވާ. ނުވަތަ ތިރީގައިވާ ބައިތަކުން ވަޑައިގަންނަވާ.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-right">
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="p-3.5 rounded-[10px] border border-[#DCE4DF] bg-[#F7F7F2] hover:bg-[#EDF2EF] hover:border-[#AAB9B2] transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#123B3A] group-hover:text-[#0F766E]">
                    {cat.name}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-[#AAB9B2] group-hover:text-[#0F766E] group-hover:-translate-x-0.5 transition-transform rtl:rotate-0" />
                </div>
                <p className="text-[11px] text-[#53635F] font-latin">
                  {cat.englishName}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : resultCount === 0 ? (
        /* No Results State */
        <div className="bg-[#FFFFFF] rounded-[16px] border border-[#DCE4DF] p-8 sm:p-12 text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#FEE2E2] text-[#B42318] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-noto-thaana text-[#182624] mb-2">
            &ldquo;{activeQuery}&rdquo; އާ ގުޅޭ އެއްވެސް ޚަބަރެއް ނުފެނުނު
          </h2>
          <p className="text-sm text-[#53635F] leading-relaxed mb-6 max-w-md mx-auto">
            ހޯއްދެވި ލަފުޒާ ގުޅޭ ޚަބަރެއް މިވަގުތު އަރުޝީފަކުން ނުފެނުނެވެ. ތިރީގައިވާ ކަންކަމަށް ސަމާލުކަން ދެއްވުން އެދެމެވެ:
          </p>

          <div className="bg-[#F7F7F2] p-4 rounded-[12px] text-right text-xs text-[#53635F] space-y-2 mb-6">
            <p className="flex items-start gap-2">
              <span className="text-[#0F766E] font-bold">•</span>
              <span>ލިޔުއްވި އަކުރުތަކާއި ފިލިތައް ރަނގަޅުތޯ ބައްލަވާލައްވާ</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#0F766E] font-bold">•</span>
              <span>އާންމުކޮށް ބޭނުންކުރާ އެހެން ލަފުޒަކުން އަލުން މަސައްކަތްކުރައްވާ</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#0F766E] font-bold">•</span>
              <span>ދާއިރާ ފިލްޓަރު ހުރިހާ ދާއިރާއަށް ބަދަލުކޮށްލައްވާ</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 bg-[#123B3A] text-white rounded-[8px] text-xs font-bold hover:bg-[#0F766E] transition-colors"
            >
              އަލުން ހޯއްދަވާ
            </button>
            <Link
              href="/latest"
              className="px-5 py-2.5 bg-[#EDF2EF] text-[#123B3A] rounded-[8px] text-xs font-bold hover:bg-[#DCE4DF] transition-colors border border-[#DCE4DF]"
            >
              އެންމެ ފަހުގެ ޚަބަރުތައް ބައްލަވާ
            </Link>
          </div>
        </div>
      ) : (
        /* Results Found */
        <div>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <ArticleCard
                  key={item.article.id}
                  article={item.article}
                  variant="standard"
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFFFF] rounded-[16px] border border-[#DCE4DF] divide-y divide-[#EDF2EF] overflow-hidden">
              {searchResults.map((item) => (
                <div key={item.article.id} className="p-4 sm:p-5 hover:bg-[#F7F7F2] transition-colors">
                  <ArticleCard article={item.article} variant="horizontal" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
