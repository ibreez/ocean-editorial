"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bookmark,
  Trash2,
  Share2,
  ChevronLeft,
  LayoutGrid,
  List,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import type { Article } from "@/types/article";
import { demoArticles } from "@/lib/articles";
import { useSavedArticles } from "@/lib/saved-articles";
import { formatDhivehiDate } from "@/lib/format-date";
import { ArticleMetadata } from "./article-metadata";
import { ShareModal } from "@/components/actions/share-modal";
import { BookmarkButton } from "@/components/actions/bookmark-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SavedArticlesView() {
  const { records, savedSlugs, count, isLoaded, remove, clear } = useSavedArticles();

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const [shareTarget, setShareTarget] = React.useState<Article | null>(null);

  // Match saved slugs to full article entities
  const savedArticlesWithMeta = React.useMemo(() => {
    const recordMap = new Map(records.map((r) => [r.slug, r]));
    const list: { article: Article; savedAt: string }[] = [];

    for (const slug of savedSlugs) {
      const art = demoArticles.find((a) => a.slug === slug);
      if (art) {
        const rec = recordMap.get(slug);
        list.push({
          article: art,
          savedAt: rec?.savedAt || new Date().toISOString(),
        });
      }
    }
    return list;
  }, [records, savedSlugs]);

  // Extract distinct categories present in saved list
  const availableCategories = React.useMemo(() => {
    const cats = new Map<string, { slug: string; name: string; count: number }>();
    for (const item of savedArticlesWithMeta) {
      const existing = cats.get(item.article.categorySlug);
      if (existing) {
        existing.count += 1;
      } else {
        cats.set(item.article.categorySlug, {
          slug: item.article.categorySlug,
          name: item.article.categoryName,
          count: 1,
        });
      }
    }
    return Array.from(cats.values());
  }, [savedArticlesWithMeta]);

  // Filtered by active category
  const filteredItems = React.useMemo(() => {
    if (selectedCategory === "all") return savedArticlesWithMeta;
    return savedArticlesWithMeta.filter(
      (item) => item.article.categorySlug === selectedCategory
    );
  }, [savedArticlesWithMeta, selectedCategory]);

  // Suggested articles to recommend when saved list is empty
  const recommendedArticles = React.useMemo(() => {
    return demoArticles.slice(0, 3);
  }, []);

  // Hydration safety: render skeleton placeholder until client mounts
  if (!isLoaded) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
        <div className="h-4 w-48 bg-[#DCE4DF] rounded-[4px] mb-6" />
        <div className="h-10 w-64 bg-[#DCE4DF] rounded-[6px] mb-4" />
        <div className="h-4 w-96 bg-[#DCE4DF] rounded-[4px] mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-[#EDF2EF] rounded-[10px] border border-[#DCE4DF]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* 1. Breadcrumbs */}
      <nav aria-label="ބްރެޑްކްރަމްބް" className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] mb-5">
        <Link href="/" className="hover:underline">
          ފުރަތަމަ ޞަފްޙާ
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <span className="text-[#182624]">ރައްކާކުރި ޚަބަރުތައް</span>
      </nav>

      {/* 2. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCE4DF] mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#123B3A] text-white">
              <Bookmark className="w-4 h-4 fill-white" />
            </span>
            <span className="text-xs font-bold text-[#0F766E] font-latin uppercase tracking-wider">
              Saved Articles · Offline Reading
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#123B3A] tracking-tight leading-tight">
            ރައްކާކުރި ޚަބަރުތައް
          </h1>
          <p className="text-sm text-[#53635F] mt-2 max-w-2xl leading-relaxed">
            ތިޔަބޭފުޅާ ފަހުން ވިދާޅުވުމަށް ރައްކާކުރައްވާފައިވާ ޚަބަރުތަކުގެ ފުރިހަމަ ލިސްޓު. މި ޚަބަރުތައް ރައްކާކުރެވެނީ ސީދާ ތިޔަބޭފުޅާގެ މި ބްރައުޒަރގައެވެ.
          </p>
        </div>

        {/* Count Pill */}
        {count > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 rounded-full bg-[#EDF2EF] border border-[#DCE4DF] text-xs font-bold text-[#123B3A]">
              ޖުމްލަ: <span className="tabular-nums font-mono text-[#0F766E]">{count}</span> ޚަބަރު
            </div>

            {/* Clear All Trigger */}
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold text-[#B42318] hover:bg-[#FEE4E2] border border-transparent hover:border-[#FECDCA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B42318]"
              aria-label="ހުރިހާ ޚަބަރެއް ފޮހެލާ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ހުރިހާ ޚަބަރެއް ފޮހެލާ</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Privacy & Device Storage Transparency Notice */}
      <div className="p-3.5 mb-6 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] flex items-start gap-3 text-xs text-[#53635F]">
        <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="leading-relaxed">
          <strong className="text-[#182624] font-bold">ރައްކާތެރިކަމުގެ މަޢުލޫމާތު:</strong>{" "}
          ރައްކާކުރެވޭ ޚަބަރުތަކަކީ ތިޔަބޭފުޅާގެ ބްރައުޒަރ ލޯކަލް ސްޓޯރޭޖުގައި ރައްކާކުރެވޭ މަޢުލޫމާތެކެވެ. މިއީ އެއްވެސް ސާވަރަކަށް ނުވަތަ އެކައުންޓަކަށް ފޮނުވޭ މަޢުލޫމާތެއް ނޫން ކަމުން، އެހެން ޑިވައިސްތަކަކާ ސިންކެއް ނުވާނެއެވެ.
        </div>
      </div>

      {/* 4. Clear Confirmation Bar Modal */}
      {showClearConfirm && (
        <div
          role="alertdialog"
          aria-labelledby="clear-dialog-title"
          aria-describedby="clear-dialog-desc"
          className="mb-6 p-4 rounded-[10px] bg-[#FEF3F2] border border-[#FECDCA] text-right animate-in fade-in"
        >
          <div className="flex items-center gap-2 mb-2 text-[#B42318]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 id="clear-dialog-title" className="text-sm font-bold">
              ހުރިހާ ޚަބަރެއް ލިސްޓުން ފޮހެލަންވީތޯ؟
            </h2>
          </div>
          <p id="clear-dialog-desc" className="text-xs text-[#53635F] mb-3 leading-relaxed">
            މި ޢަމަލު ކުރުމުން ރައްކާކުރެވިފައިވާ ހުރިހާ ޚަބަރެއް ބްރައުޒަރއިން އުނިވާނެއެވެ. މިކަން އަލުން އަނބުރައެއް ނުގެނެވޭނެއެވެ.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-3.5 py-2 min-h-[38px] rounded-[6px] text-xs font-semibold bg-white border border-[#DCE4DF] text-[#182624] hover:bg-[#EDF2EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              ކެންސަލް
            </button>
            <button
              type="button"
              onClick={() => {
                clear();
                setShowClearConfirm(false);
              }}
              className="px-4 py-2 min-h-[38px] rounded-[6px] text-xs font-bold bg-[#B42318] text-white hover:bg-[#911D13] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B42318]"
            >
              އާނ، ހުރިހާ އެއްޗެއް ފޮހެލާ
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Content Area */}
      {count === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 sm:px-6 bg-[#FFFFFF] border border-[#DCE4DF] rounded-[12px] text-center my-6 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#EDF2EF] text-[#0F766E] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#182624] mb-2">
            ރައްކާކުރި އެއްވެސް ޚަބަރެއް ނެތް
          </h2>
          <p className="text-sm text-[#53635F] max-w-lg mx-auto mb-6 leading-relaxed">
            ތިޔަބޭފުޅާ ފަހުން ވިދާޅުވުމަށް ބުކްމާކް ކުރައްވާފައިވާ އެއްވެސް ޚަބަރެއް އަދި ނެތެވެ. ޚަބަރު ކިޔުއްވާއިރު ނުވަތަ ޚަބަރު ކާޑުތަކުގައިވާ ބުކްމާކް އައިކަންއަށް ފިއްތަވާލައްވައިގެން ފަސޭހަކަމާއެކު ރައްކާކުރެއްވޭނެއެވެ.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link href="/">
              <Button variant="primary" size="md">
                ފުރަތަމަ ޞަފްޙާ ބައްލަވާ
              </Button>
            </Link>
            <Link href="/latest">
              <Button variant="secondary" size="md">
                ފަހުގެ ޚަބަރުތައް
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="md">
                ޚަބަރު ހޯއްދަވާ
              </Button>
            </Link>
          </div>

          {/* Recommended stories showcase */}
          <div className="pt-8 border-t border-[#DCE4DF] text-right">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-[#182624]">
                ވިދާޅުވެލައްވަން ރަނގަޅު ބައެއް ޚަބަރުތައް:
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 bg-[#F7F7F2] border border-[#DCE4DF] rounded-[10px] text-right flex flex-col justify-between hover:border-[#AAB9B2] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#0F766E]">
                        {article.categoryName}
                      </span>
                      <BookmarkButton
                        slug={article.slug}
                        title={article.title}
                        variant="icon"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-[#182624] leading-snug line-clamp-2 hover:text-[#0F766E]">
                      <Link href={`/article/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#DCE4DF] flex items-center justify-between text-[11px] text-[#687671]">
                    <span>{article.author.name}</span>
                    <Link
                      href={`/article/${article.slug}`}
                      className="text-[#0F766E] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>ވިދާޅުވޭ</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Saved Articles Active List */
        <div>
          {/* Controls: Category Filter and View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#FFFFFF] p-3 border border-[#DCE4DF] rounded-[10px] shadow-xs">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-[#687671] ml-1">
                ބައިތައް:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-3 py-1 rounded-[6px] text-xs font-semibold transition-colors",
                  selectedCategory === "all"
                    ? "bg-[#123B3A] text-white"
                    : "bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF]"
                )}
              >
                ހުރިހާ ({count})
              </button>

              {availableCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    "px-3 py-1 rounded-[6px] text-xs font-semibold transition-colors",
                    selectedCategory === cat.slug
                      ? "bg-[#123B3A] text-white"
                      : "bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF]"
                  )}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-[#EDF2EF] p-0.5 rounded-[6px]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="ގްރިޑް ވިއު"
                className={cn(
                  "p-1.5 rounded-[4px] transition-colors",
                  viewMode === "grid"
                    ? "bg-white text-[#123B3A] shadow-xs"
                    : "text-[#53635F] hover:text-[#182624]"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="ލިސްޓް ވިއު"
                className={cn(
                  "p-1.5 rounded-[4px] transition-colors",
                  viewMode === "list"
                    ? "bg-white text-[#123B3A] shadow-xs"
                    : "text-[#53635F] hover:text-[#182624]"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active List Grid / Rows */}
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center bg-white border border-[#DCE4DF] rounded-[10px]">
              <p className="text-sm text-[#53635F]">
                މި ބައިގައި ރައްކާކުރެވިފައިވާ އެއްވެސް ޚަބަރެއް ނެތެވެ.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="mt-3 text-xs font-bold text-[#0F766E] hover:underline"
              >
                ހުރިހާ ޚަބަރެއް ބައްލަވާ
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(({ article, savedAt }) => (
                <article
                  key={article.id}
                  className="group bg-[#FFFFFF] border border-[#DCE4DF] hover:border-[#AAB9B2] rounded-[10px] overflow-hidden shadow-xs flex flex-col justify-between transition-colors text-right"
                >
                  {article.image && (
                    <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EDF2EF] border-b border-[#DCE4DF]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.image.src}
                        alt={article.image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2.5 end-2.5 px-2 py-0.5 rounded-[4px] bg-[#123B3A]/90 text-white text-[11px] font-bold">
                        {article.categoryName}
                      </span>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {!article.image && (
                        <ArticleMetadata
                          categorySlug={article.categorySlug}
                          categoryName={article.categoryName}
                          publishedAt={article.publishedAt}
                          className="mb-2"
                        />
                      )}

                      <h2 className="text-base sm:text-lg font-bold text-[#182624] group-hover:text-[#0F766E] transition-colors leading-[26px] mb-2 line-clamp-2">
                        <Link href={`/article/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>

                      {article.summary && (
                        <p className="text-xs text-[#53635F] line-clamp-2 leading-relaxed mb-4">
                          {article.summary}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] text-[#687671] pt-3 border-t border-[#DCE4DF] flex items-center justify-between mb-3">
                        <span>{article.author.name}</span>
                        <span className="flex items-center gap-1 text-[10px]" suppressHydrationWarning>
                          <Clock className="w-3 h-3 text-[#AAB9B2]" />
                          {formatDhivehiDate(savedAt)}
                        </span>
                      </div>

                      {/* Card Action Row */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EDF2EF]">
                        <button
                          type="button"
                          onClick={() => setShareTarget(article)}
                          aria-label={`«${article.title}» ޙިއްޞާކުރައްވާ`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-[6px] bg-[#EDF2EF] hover:bg-[#DCE4DF] text-xs font-semibold text-[#182624] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#0F766E]" />
                          <span>ޙިއްޞާ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(article.slug)}
                          aria-label={`«${article.title}» ރައްކާކުރި ލިސްޓުން އުނިކުރައްވާ`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-[6px] text-xs font-semibold text-[#B42318] hover:bg-[#FEE4E2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B42318]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>އުނިކުރޭ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* List / Rows View */
            <div className="space-y-3">
              {filteredItems.map(({ article, savedAt }) => (
                <article
                  key={article.id}
                  className="group bg-[#FFFFFF] border border-[#DCE4DF] hover:border-[#AAB9B2] rounded-[10px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors text-right"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {article.image && (
                      <Link
                        href={`/article/${article.slug}`}
                        tabIndex={-1}
                        className="w-20 sm:w-28 aspect-4/3 rounded-[6px] overflow-hidden bg-[#EDF2EF] border border-[#DCE4DF] shrink-0 block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.image.src}
                          alt={article.image.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] mb-1">
                        <Link href={`/category/${article.categorySlug}`} className="hover:underline">
                          {article.categoryName}
                        </Link>
                        <span className="text-[#AAB9B2]">·</span>
                        <span className="text-[#687671] font-normal">{article.author.name}</span>
                      </div>

                      <h2 className="text-base sm:text-[17px] font-bold text-[#182624] group-hover:text-[#0F766E] transition-colors leading-[26px] line-clamp-1 mb-1">
                        <Link href={`/article/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>

                      {article.summary && (
                        <p className="text-xs text-[#53635F] line-clamp-1">
                          {article.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EDF2EF]">
                    <span className="text-[10px] text-[#AAB9B2] hidden md:inline" suppressHydrationWarning>
                      {formatDhivehiDate(savedAt)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setShareTarget(article)}
                      aria-label={`«${article.title}» ޙިއްޞާކުރައްވާ`}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[6px] bg-[#EDF2EF] hover:bg-[#DCE4DF] text-[#182624] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                    >
                      <Share2 className="w-4 h-4 text-[#0F766E]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(article.slug)}
                      aria-label={`«${article.title}» ރައްކާކުރި ލިސްޓުން އުނިކުރައްވާ`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-[6px] text-xs font-semibold text-[#B42318] hover:bg-[#FEE4E2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B42318]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>އުނިކުރޭ</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal Triggered from Saved Items */}
      {shareTarget && (
        <ShareModal
          isOpen={true}
          onClose={() => setShareTarget(null)}
          title={shareTarget.title}
          slug={shareTarget.slug}
          summary={shareTarget.summary}
        />
      )}
    </div>
  );
}
