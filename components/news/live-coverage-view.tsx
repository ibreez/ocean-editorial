"use client";

import * as React from "react";
import Link from "next/link";
import {
  Radio,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  Share2,
  Bookmark,
  Sparkles,
  Link as LinkIcon,
  Check,
  ArrowRight,
  Info,
  Filter,
} from "lucide-react";
import type { LiveCoverage } from "@/types/article";
import { formatDhivehiDateTime } from "@/lib/format-date";
import { EditorialImage } from "@/components/media/editorial-image";
import { ShareActions } from "@/components/actions/share-actions";
import { ShareModal } from "@/components/actions/share-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LiveCoverageViewProps {
  coverage: LiveCoverage;
}

export function LiveCoverageView({ coverage }: LiveCoverageViewProps) {
  const [filterImportant, setFilterImportant] = React.useState(false);
  const [copiedUpdateId, setCopiedUpdateId] = React.useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);

  const isLive = coverage.status === "live";

  // Sort updates newest first
  const sortedUpdates = React.useMemo(() => {
    return [...coverage.updates].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [coverage.updates]);

  const displayedUpdates = React.useMemo(() => {
    if (!filterImportant) return sortedUpdates;
    return sortedUpdates.filter((u) => u.isImportant);
  }, [sortedUpdates, filterImportant]);

  const importantCount = React.useMemo(() => {
    return coverage.updates.filter((u) => u.isImportant).length;
  }, [coverage.updates]);

  const handleCopyUpdateLink = async (updateId: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/live/${coverage.slug}#${updateId}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopiedUpdateId(updateId);
        setTimeout(() => setCopiedUpdateId(null), 2500);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* 1. Breadcrumb navigation */}
      <nav
        aria-label="ބްރެޑްކްރަމްބް"
        className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] mb-5"
      >
        <Link href="/" className="hover:underline">
          ފުރަތަމަ ޞަފްޙާ
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <Link href={`/category/${coverage.categorySlug}`} className="hover:underline">
          {coverage.categoryName}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <span className="text-[#182624]">ވަގުތުން ގެނެސްދޭ ކަވަރޭޖް</span>
      </nav>

      {/* 2. Header and Hero Context */}
      <header className="reading-column mb-8">
        {/* Status indicator bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          {isLive ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3F2] text-[#D94343] border border-[#FECDCA] text-xs font-bold shadow-xs"
              role="status"
              aria-label="ވަގުތުން ގެނެސްދޭ ޚަބަރު (Live Coverage Active)"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D94343] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D94343]" />
              </span>
              <span>ވަގުތުން / LIVE</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF2EF] text-[#53635F] border border-[#DCE4DF] text-xs font-bold"
              role="status"
              aria-label="ކަވަރޭޖް ނިމިފައި (Coverage Concluded)"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>ނިންމާލެވިފައި / Concluded</span>
            </span>
          )}

          <Link
            href={`/category/${coverage.categorySlug}`}
            className="px-2.5 py-1 rounded-[6px] bg-[#EDF2EF] text-[#123B3A] text-xs font-bold hover:bg-[#DCE4DF] transition-colors"
          >
            {coverage.categoryName}
          </Link>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#123B3A] tracking-tight leading-tight mb-4">
          {coverage.title}
        </h1>

        {/* Standfirst Summary */}
        {coverage.summary && (
          <p className="text-base sm:text-lg text-[#53635F] leading-relaxed mb-6 font-medium">
            {coverage.summary}
          </p>
        )}

        {/* Timestamps and Author Context */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#687671] border-y border-[#DCE4DF] py-3.5 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1 text-[#182624] font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>ފެށުނީ:</span>
            </span>
            <time dateTime={coverage.startedAt} suppressHydrationWarning className="tabular-nums">
              {formatDhivehiDateTime(coverage.startedAt)}
            </time>

            <span className="text-[#AAB9B2]" aria-hidden="true">
              ·
            </span>

            <span className="flex items-center gap-1 text-[#0F766E] font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>އެންމެ ފަހުން އަދާހަމަކުރީ:</span>
            </span>
            <time dateTime={coverage.updatedAt} suppressHydrationWarning className="tabular-nums">
              {formatDhivehiDateTime(coverage.updatedAt)}
            </time>
          </div>

          <span className="px-2.5 py-0.5 rounded-[4px] bg-[#EDF2EF] text-[11px] font-bold text-[#182624]">
            {coverage.updates.length} އަދާހަމަ
          </span>
        </div>

        {/* Share & Tools Bar */}
        <ShareActions
          title={coverage.title}
          slug={coverage.slug}
          summary={coverage.summary}
          className="mb-8"
        />

        {/* Lead Image if provided */}
        {coverage.image && (
          <EditorialImage
            src={coverage.image.src}
            alt={coverage.image.alt}
            caption={coverage.image.caption}
            credit={coverage.image.credit}
            aspectRatio="16/9"
            priority={true}
            className="mb-8"
          />
        )}

        {/* Static demo boundary transparency callout */}
        <div className="p-3.5 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] flex items-start gap-3 text-xs text-[#53635F] mb-8">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="leading-relaxed">
            <strong className="text-[#182624] font-bold">އެޑިޓޯރިއަލް މަޢުލޫމާތު:</strong>{" "}
            މިއީ ވަގުތުން ގެނެސްދޭ ޚަބަރުތަކުގެ އޮނިގަނޑާއި ތަރުތީބު ދައްކުވައިދޭ ނަމޫނާ (ޑެމޯ) ކަވަރޭޖެކެވެ. އައު މަޢުލޫމާތު ޝާއިޢުކުރެވޭ ވަރަކަށް ޓައިމްލައިނަށް އިތުރުވެގެންދާނެއެވެ.
          </div>
        </div>
      </header>

      {/* 3. Timeline Column */}
      <main className="reading-column">
        {/* Timeline Controls: All vs Key Updates */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-[#DCE4DF]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-sm font-bold text-[#123B3A]">
              ވަގުތުން ލިބެމުންދާ މަޢުލޫމާތު
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-[#EDF2EF] p-0.5 rounded-[6px]">
            <button
              type="button"
              onClick={() => setFilterImportant(false)}
              aria-pressed={!filterImportant}
              className={cn(
                "px-3 py-1.5 min-h-[36px] rounded-[4px] text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                !filterImportant
                  ? "bg-white text-[#123B3A] shadow-xs"
                  : "text-[#53635F] hover:text-[#182624]"
              )}
            >
              ހުރިހާ ({sortedUpdates.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterImportant(true)}
              aria-pressed={filterImportant}
              className={cn(
                "px-3 py-1.5 min-h-[36px] rounded-[4px] text-xs font-bold transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                filterImportant
                  ? "bg-white text-[#123B3A] shadow-xs"
                  : "text-[#53635F] hover:text-[#182624]"
              )}
            >
              <Sparkles className="w-3 h-3 text-[#D94343]" />
              <span>މުހިންމު ({importantCount})</span>
            </button>
          </div>
        </div>

        {/* Updates list with RTL timeline stem */}
        {displayedUpdates.length === 0 ? (
          <div className="py-12 text-center bg-white border border-[#DCE4DF] rounded-[10px] p-6">
            <p className="text-sm text-[#53635F]">
              މިވަގުތު މުހިންމު ފާހަގަކޮށްފައިވާ އަދާހަމައެއް ނެތެވެ.
            </p>
            <button
              type="button"
              onClick={() => setFilterImportant(false)}
              className="mt-3 text-xs font-bold text-[#0F766E] hover:underline"
            >
              ހުރިހާ އަދާހަމައެއް ބައްލަވާ
            </button>
          </div>
        ) : (
          <div className="relative border-r-2 border-[#DCE4DF] pr-6 sm:pr-8 space-y-8 sm:space-y-10 my-4">
            {displayedUpdates.map((update, idx) => {
              const isNewest = idx === 0 && !filterImportant;
              return (
                <article
                  key={update.id}
                  id={update.id}
                  className={cn(
                    "relative bg-[#FFFFFF] rounded-[10px] p-5 sm:p-6 transition-all duration-200 text-right scroll-mt-24",
                    isNewest
                      ? "border-2 border-[#0F766E] shadow-sm ring-4 ring-[#0F766E]/5"
                      : "border border-[#DCE4DF] shadow-xs hover:border-[#AAB9B2]"
                  )}
                >
                  {/* Timeline node icon on stem */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -right-[31px] sm:-right-[39px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors",
                      isNewest
                        ? "bg-[#D94343] ring-4 ring-[#D94343]/20"
                        : update.isImportant
                        ? "bg-[#0F766E]"
                        : "bg-[#AAB9B2]"
                    )}
                  />

                  {/* Top update metadata row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#DCE4DF]">
                    <div className="flex items-center gap-2">
                      {isNewest && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#D94343] text-white text-[11px] font-bold">
                          އެންމެ ފަހުގެ މަޢުލޫމާތު
                        </span>
                      )}

                      {update.isImportant && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#EDF2EF] text-[#0F766E] text-[11px] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D94343]" />
                          <span>{update.tag || "މުހިންމު"}</span>
                        </span>
                      )}

                      <time
                        dateTime={update.timestamp}
                        suppressHydrationWarning
                        className="text-xs font-bold text-[#182624] tabular-nums font-mono flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#687671]" />
                        {formatDhivehiDateTime(update.timestamp)}
                      </time>
                    </div>

                    {/* Quick Anchor Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyUpdateLink(update.id)}
                      aria-label="މި އަދާހަމައިގެ ސީދާ ލިންކު ކޮޕީކުރައްވާ"
                      title="ލިންކު ކޮޕީކުރޭ"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#53635F] hover:text-[#0F766E] transition-colors px-2 py-1.5 min-h-[36px] rounded-[4px] hover:bg-[#EDF2EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                    >
                      {copiedUpdateId === update.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#216E4E]" />
                          <span className="text-[#216E4E]">ކޮޕީކުރެވިއްޖެ</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3 h-3" />
                          <span>ލިންކު</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Update Heading */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#123B3A] leading-snug mb-3">
                    {update.title}
                  </h3>

                  {/* Update Body Narrative */}
                  <div className="text-sm sm:text-base text-[#182624] leading-relaxed mb-4 text-justify">
                    <p>{update.content}</p>
                  </div>

                  {/* Update Image if provided */}
                  {update.image && (
                    <EditorialImage
                      src={update.image.src}
                      alt={update.image.alt}
                      caption={update.image.caption}
                      credit={update.image.credit}
                      aspectRatio="16/9"
                      className="my-4"
                    />
                  )}

                  {/* Update Author Byline */}
                  {update.authorName && (
                    <div className="pt-3 border-t border-[#DCE4DF] flex items-center justify-between text-xs text-[#687671]">
                      <span>ރިޕޯޓުކުރީ: <strong>{update.authorName}</strong></span>
                      <a
                        href={`#${update.id}`}
                        className="text-[11px] text-[#AAB9B2] hover:text-[#0F766E] font-mono"
                      >
                        #{update.id}
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* 4. Bottom Navigation & Exploration */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 mt-12 border-t border-[#DCE4DF]">
          <Link href={`/category/${coverage.categorySlug}`}>
            <Button variant="secondary" size="md">
              {coverage.categoryName}ގެ އިތުރު ޚަބަރު
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/latest">
              <Button variant="outline" size="md">
                ފަހުގެ ޚަބަރުތައް
              </Button>
            </Link>

            <Link href="/">
              <Button variant="primary" size="md" className="gap-1.5">
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>ފުރަތަމަ ޞަފްޙާ</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Share Modal Trigger */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={coverage.title}
        slug={`live/${coverage.slug}`}
        summary={coverage.summary}
      />
    </div>
  );
}
