"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  PlusCircle,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  Archive,
  Calendar,
  Layers,
  ChevronLeft,
  Sparkles,
  Info,
  ShieldCheck,
  Database,
} from "lucide-react";
import type { CmsArticle, CmsArticleStatus, CmsDashboardMetrics, CmsCategory } from "@/types/cms";
import { formatDhivehiDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

import type { EditorialUser } from "@/types/cms";

export interface DashboardViewProps {
  currentUser?: EditorialUser;
  initialArticles: CmsArticle[];
  categories: CmsCategory[];
  metrics: CmsDashboardMetrics;
}

const STATUS_LABELS: Record<CmsArticleStatus, { dv: string; en: string; badgeClass: string }> = {
  draft: {
    dv: "ޑްރާފްޓް",
    en: "Draft",
    badgeClass: "bg-[#EDF2EF] text-[#53635F] border-[#DCE4DF]",
  },
  in_review: {
    dv: "ރިވިއުގައި",
    en: "In Review",
    badgeClass: "bg-[#FFF9E6] text-[#8A5700] border-[#FFE082]",
  },
  scheduled: {
    dv: "ޝެޑިއުލްޑް",
    en: "Scheduled",
    badgeClass: "bg-[#E8F4FD] text-[#155E9A] border-[#B6E0FE]",
  },
  published: {
    dv: "ޝާއިޢުކުރެވިފައި",
    en: "Published",
    badgeClass: "bg-[#E3FCEF] text-[#216E4E] border-[#ABF5D1]",
  },
  archived: {
    dv: "އާކައިވް",
    en: "Archived",
    badgeClass: "bg-[#F4F5F7] text-[#687671] border-[#DFE1E6]",
  },
};

export function DashboardView({
  currentUser,
  initialArticles,
  categories,
  metrics,
}: DashboardViewProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<CmsArticleStatus | "all">("all");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Filter articles based on active filters
  const filteredArticles = React.useMemo(() => {
    return initialArticles.filter((article) => {
      // 1. Status Filter
      if (selectedStatus !== "all" && article.status !== selectedStatus) {
        return false;
      }
      // 2. Category Filter
      if (selectedCategory !== "all" && article.categorySlug !== selectedCategory) {
        return false;
      }
      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesEng = article.englishTitle?.toLowerCase().includes(q) || false;
        const matchesSlug = article.slug.toLowerCase().includes(q);
        const matchesAuthor = article.author.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesEng && !matchesSlug && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [initialArticles, selectedStatus, selectedCategory, searchQuery]);

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE4DF]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#123B3A] tracking-tight">
              އެޑިޓޯރިއަލް ޑޭޝްބޯޑް
            </h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-bold font-sans",
                metrics.isDemonstration
                  ? "bg-[#FFF9E6] text-[#8A5700] border border-[#FFE082]"
                  : "bg-[#E3FCEF] text-[#216E4E] border border-[#ABF5D1]"
              )}
            >
              <Database className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {metrics.isDemonstration
                  ? "Staging Memory Storage (PostgreSQL Unconfigured)"
                  : "Persistent Managed PostgreSQL Storage"}
              </span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#53635F] mt-1 font-sans">
            Ocean Editorial Newsroom Management & Content Workflow
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#123B3A] text-white hover:bg-[#0F766E] transition-all font-bold text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4 text-white" aria-hidden="true" />
          <span>އައު ޚަބަރެއް ލިޔުއްވާ (New Draft)</span>
        </Link>
      </div>

      {/* 2. Active Session & Role Status Banner */}
      <div className="my-6 p-4 rounded-[10px] bg-[#EDF2EF] border border-[#DCE4DF] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#53635F] leading-relaxed flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <p className="font-bold text-[#182624]">
              އޮތެންޓިކޭޓެޑް ސެޝަން:{" "}
              <span className="text-[#123B3A]">
                {currentUser?.dhivehiName || currentUser?.name}
              </span>{" "}
              <span className="font-sans font-semibold text-[#0F766E]">
                ({currentUser?.role?.toUpperCase()})
              </span>
            </p>
            <span className="font-mono text-[10px] text-[#687671]">
              Storage: {metrics.isDemonstration ? "Memory/Staging" : "PostgreSQL"}
            </span>
          </div>
          {currentUser?.role === "journalist" && (
            <p>
              ނޫސްވެރިޔާގެ ހުއްދަ: ތިޔަބޭފުޅާ ލިޔުއްވާފައިވާ ޑްރާފްޓްތައް ބެއްލެވުމާއި، އައު ޑްރާފްޓް އުފެއްދުމާއި، އެޑިޓަރ ރިވިއުއަށް ފޮނުއްވުން. (އެހެން ލިޔުންތެރިންގެ ޑްރާފްޓްތައް ސެކިއުރިޓީ ރޫލްސްއިން ވަނީ ފޮރުވިފައެވެ).
            </p>
          )}
          {currentUser?.role === "editor" && (
            <p>
              އެޑިޓަރުގެ ހުއްދަ: ހުރިހާ ޚަބަރުތަކެއް ރިވިއުކުރުމާއި، ޝާއިޢުކުރުމާއި، ޝެޑިއުލްކުރުމާއި، ބްރޭކިންގ ނިއުސް އަދި ފީޗަރޑް ސްޓޯރީތައް ކަނޑައެޅުން.
            </p>
          )}
          {currentUser?.role === "admin" && (
            <p>
              އެޑްމިނިސްޓްރޭޓަރުގެ ހުއްދަ: ފުރިހަމަ އެޑިޓޯރިއަލް ބާރު، ޔޫޒަރުންނަށް ރޯލް ކަނޑައެޅުން، އަދި ސެކިއުރިޓީ އޮޑިޓް ލޮގްސް ބެއްލެވުން.
            </p>
          )}
        </div>
      </div>

      {/* 3. Workflow Metric Cards */}
      <section aria-label="އެޑިޓޯރިއަލް ތަފާސްހިސާބު" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 my-6">
        {/* Total Articles */}
        <div className="p-4 bg-[#FFFFFF] rounded-[10px] border border-[#DCE4DF] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687671] mb-2">
            <span className="font-bold font-thaana">
              {currentUser?.role === "journalist" ? "އަޅުގަނޑުގެ ޖުމްލަ" : "ޖުމްލަ"}
            </span>
            <Layers className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-[#123B3A] font-mono tabular-nums">
            {metrics.totalArticles}
          </div>
          <span className="text-[11px] text-[#687671] mt-1 block">
            {currentUser?.role === "journalist" ? "My Articles" : "Total Articles"}
          </span>
        </div>

        {/* Drafts */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "draft" ? "all" : "draft")}
          className={cn(
            "p-4 rounded-[10px] border text-right transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
            selectedStatus === "draft"
              ? "bg-[#EDF2EF] border-[#0F766E] ring-2 ring-[#0F766E]/20"
              : "bg-[#FFFFFF] border-[#DCE4DF] hover:border-[#AAB9B2]"
          )}
        >
          <div className="flex items-center justify-between text-xs text-[#687671] mb-2">
            <span className="font-bold font-thaana">ޑްރާފްޓް</span>
            <FileText className="w-4 h-4 text-[#53635F]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-[#53635F] font-mono tabular-nums">
            {metrics.drafts}
          </div>
          <span className="text-[11px] text-[#687671] mt-1 block">Drafts</span>
        </button>

        {/* In Review */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "in_review" ? "all" : "in_review")}
          className={cn(
            "p-4 rounded-[10px] border text-right transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
            selectedStatus === "in_review"
              ? "bg-[#FFF9E6] border-[#8A5700] ring-2 ring-[#8A5700]/20"
              : "bg-[#FFFFFF] border-[#DCE4DF] hover:border-[#AAB9B2]"
          )}
        >
          <div className="flex items-center justify-between text-xs text-[#8A5700] mb-2">
            <span className="font-bold font-thaana">ރިވިއުގައި</span>
            <AlertCircle className="w-4 h-4 text-[#8A5700]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-[#8A5700] font-mono tabular-nums">
            {metrics.inReview}
          </div>
          <span className="text-[11px] text-[#8A5700] mt-1 block">In Review</span>
        </button>

        {/* Scheduled */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "scheduled" ? "all" : "scheduled")}
          className={cn(
            "p-4 rounded-[10px] border text-right transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
            selectedStatus === "scheduled"
              ? "bg-[#E8F4FD] border-[#155E9A] ring-2 ring-[#155E9A]/20"
              : "bg-[#FFFFFF] border-[#DCE4DF] hover:border-[#AAB9B2]"
          )}
        >
          <div className="flex items-center justify-between text-xs text-[#155E9A] mb-2">
            <span className="font-bold font-thaana">ޝެޑިއުލްޑް</span>
            <Calendar className="w-4 h-4 text-[#155E9A]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-[#155E9A] font-mono tabular-nums">
            {metrics.scheduled}
          </div>
          <span className="text-[11px] text-[#155E9A] mt-1 block">Scheduled</span>
        </button>

        {/* Published */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "published" ? "all" : "published")}
          className={cn(
            "p-4 rounded-[10px] border text-right transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
            selectedStatus === "published"
              ? "bg-[#E3FCEF] border-[#216E4E] ring-2 ring-[#216E4E]/20"
              : "bg-[#FFFFFF] border-[#DCE4DF] hover:border-[#AAB9B2]"
          )}
        >
          <div className="flex items-center justify-between text-xs text-[#216E4E] mb-2">
            <span className="font-bold font-thaana">ޝާއިޢުކުރެވިފައި</span>
            <CheckCircle2 className="w-4 h-4 text-[#216E4E]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-[#216E4E] font-mono tabular-nums">
            {metrics.published}
          </div>
          <span className="text-[11px] text-[#216E4E] mt-1 block">Published</span>
        </button>

        {/* Archived */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "archived" ? "all" : "archived")}
          className={cn(
            "p-4 rounded-[10px] border text-right transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
            selectedStatus === "archived"
              ? "bg-[#F4F5F7] border-[#687671] ring-2 ring-[#687671]/20"
              : "bg-[#FFFFFF] border-[#DCE4DF] hover:border-[#AAB9B2]"
          )}
        >
          <div className="flex items-center justify-between text-xs text-[#687671] mb-2">
            <span className="font-bold font-thaana">އާކައިވް</span>
            <Archive className="w-4 h-4 text-[#687671]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-[#687671] font-mono tabular-nums">
            {metrics.archived}
          </div>
          <span className="text-[11px] text-[#687671] mt-1 block">Archived</span>
        </button>
      </section>

      {/* 4. Filter Toolbar & Search */}
      <section aria-label="ފިލްޓަރުތައް" className="bg-[#FFFFFF] rounded-[10px] p-4 border border-[#DCE4DF] shadow-xs mb-6 space-y-4">
        {/* Workflow Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-3 border-b border-[#DCE4DF]">
          <span className="text-xs font-bold text-[#687671] ml-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#0F766E]" aria-hidden="true" />
            <span>ޙާލަތު:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={cn(
              "px-3 py-1.5 rounded-[6px] text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[36px]",
              selectedStatus === "all"
                ? "bg-[#123B3A] text-white"
                : "bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF]"
            )}
          >
            ހުރިހާ ({initialArticles.length})
          </button>

          {(Object.keys(STATUS_LABELS) as CmsArticleStatus[]).map((st) => {
            const count = initialArticles.filter((a) => a.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  "px-3 py-1.5 rounded-[6px] text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[36px]",
                  selectedStatus === st
                    ? "bg-[#123B3A] text-white"
                    : "bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF]"
                )}
              >
                <span>{STATUS_LABELS[st].dv}</span>
                <span className="mr-1 text-[11px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#687671] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ޚަބަރުގެ ސުރުޚީ، ސްލަގް، ނުވަތަ ލިޔުންތެރިޔާ ހޯއްދަވާ..."
              className="w-full pl-4 pr-9 py-2 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm text-[#182624] placeholder:text-[#687671] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="category-filter" className="text-xs font-bold text-[#687671] whitespace-nowrap">
              ބައި:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] min-h-[38px]"
            >
              <option value="all">ހުރިހާ ބައިތަކެއް (All)</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.englishName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 5. Articles List / Table */}
      <section aria-label="ޚަބަރުތަކުގެ ލިސްޓު" className="bg-[#FFFFFF] rounded-[10px] border border-[#DCE4DF] shadow-xs overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <FileText className="w-10 h-10 text-[#AAB9B2] mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#182624] mb-1">
              އެއްވެސް ޚަބަރެއް ނުފެނުނު
            </h3>
            <p className="text-xs text-[#53635F] max-w-sm mx-auto mb-4">
              ހޯއްދަވާ ޝަރުޠުތަކާ ގުޅޭ ޚަބަރެއް ނެތެވެ. ފިލްޓަރުތައް ބަދަލުކުރައްވާށެވެ.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-3.5 py-2 rounded-[6px] bg-[#EDF2EF] hover:bg-[#DCE4DF] text-xs font-bold text-[#182624] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              ފިލްޓަރުތައް ފޮހެލާ
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#DCE4DF]">
            {filteredArticles.map((article) => {
              const statusConfig = STATUS_LABELS[article.status] || STATUS_LABELS.draft;

              return (
                <article
                  key={article.id}
                  className="p-4 sm:p-5 hover:bg-[#F7F7F2]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Article Details */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-[4px] border text-[11px] font-bold inline-block",
                          statusConfig.badgeClass
                        )}
                      >
                        {statusConfig.dv}
                      </span>

                      {/* Category Badge */}
                      <span className="text-xs font-bold text-[#0F766E]">
                        {article.categoryName}
                      </span>

                      {article.featured && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#123B3A] text-white text-[10px] font-bold">
                          ފީޗަރޑް
                        </span>
                      )}

                      {article.isOpinion && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#EDF2EF] text-[#123B3A] text-[10px] font-bold">
                          ޚިޔާލު
                        </span>
                      )}
                    </div>

                    {/* Dhivehi Headline */}
                    <h2 className="text-base sm:text-lg font-bold text-[#182624] leading-snug">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="hover:text-[#0F766E] transition-colors focus-visible:outline-none focus-visible:underline"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    {/* English Title & Slug for technical precision */}
                    {article.englishTitle && (
                      <p className="text-xs text-[#687671] font-sans line-clamp-1">
                        {article.englishTitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[#687671] pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#0F766E]" aria-hidden="true" />
                        <span>{article.author.name}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#687671]" aria-hidden="true" />
                        <span>{formatDhivehiDateTime(article.updatedAt)}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-[#53635F] dir-ltr inline-block">
                        slug: /{article.slug}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="px-3.5 py-2 rounded-[6px] bg-[#EDF2EF] hover:bg-[#DCE4DF] text-[#182624] text-xs font-bold transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[38px]"
                    >
                      <span>އިޞްލާޙްކުރައްވާ</span>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#687671]" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
