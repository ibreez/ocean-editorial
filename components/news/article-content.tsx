"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ArrowRight, User } from "lucide-react";
import type { Article } from "@/types/article";
import { formatDhivehiDateTime } from "@/lib/format-date";
import { formatReadingTime } from "@/lib/typography";
import { ShareActions } from "@/components/actions/share-actions";
import { EditorialImage } from "@/components/media/editorial-image";
import { EditorialVideo } from "@/components/media/editorial-video";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const [textSize, setTextSize] = React.useState<"sm" | "base" | "lg">("base");

  const bodySizeClass = {
    sm: "text-[15px] sm:text-base leading-[28px] sm:leading-[30px]",
    base: "text-base sm:text-[17px] leading-[30px] sm:leading-[33px]",
    lg: "text-lg sm:text-[19px] leading-[33px] sm:leading-[36px]",
  }[textSize];

  return (
    <div className="reading-column">
      {/* 1. Category & Breadcrumb Context */}
      <nav aria-label="ބްރެޑްކްރަމްބް" className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] mb-4">
        <Link href="/" className="hover:underline">
          ފުރަތަމަ ޞަފްޙާ
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <Link href={`/category/${article.categorySlug}`} className="hover:underline">
          {article.categoryName}
        </Link>
      </nav>

      {/* 2. Main Dhivehi Headline */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#123B3A] tracking-tight leading-tight mb-4">
        {article.title}
      </h1>

      {/* 3. Standfirst / Subtitle Summary */}
      {article.summary && (
        <p className="text-base sm:text-lg text-[#53635F] leading-relaxed mb-6 font-medium">
          {article.summary}
        </p>
      )}

      {/* 4. Publication & Author Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#687671] border-y border-[#DCE4DF] py-3.5 mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-bold text-[#182624]">{article.author.name}</span>
          {article.author.role && (
            <span className="text-[#53635F] hidden sm:inline">({article.author.role})</span>
          )}
          <span className="text-[#AAB9B2]" aria-hidden="true">
            ·
          </span>
          <time dateTime={article.publishedAt} suppressHydrationWarning className="tabular-nums">
            {formatDhivehiDateTime(article.publishedAt)}
          </time>
          {article.readTimeMinutes && (
            <>
              <span className="text-[#AAB9B2]" aria-hidden="true">
                ·
              </span>
              <span>{formatReadingTime(article.readTimeMinutes)}</span>
            </>
          )}
        </div>

        {article.updatedAt && (
          <span suppressHydrationWarning className="text-[11px] text-[#0F766E] font-medium">
            އިޞްލާޙްކުރީ: {formatDhivehiDateTime(article.updatedAt)}
          </span>
        )}
      </div>

      {/* 5. Top Interactive Share & Font Control Toolbar */}
      <ShareActions
        title={article.title}
        slug={article.slug}
        summary={article.summary}
        currentTextSize={textSize}
        onTextSizeChange={setTextSize}
        className="mb-8"
      />

      {/* 6. Lead Photography or Video */}
      {article.video ? (
        <EditorialVideo
          src={article.video.src}
          title={article.video.title}
          caption={article.video.caption}
          credit={article.video.credit}
          poster={article.video.poster}
          className="mb-8"
        />
      ) : article.image ? (
        <EditorialImage
          src={article.image.src}
          alt={article.image.alt}
          caption={article.image.caption}
          credit={article.image.credit}
          aspectRatio="16/9"
          priority={true}
          className="mb-8"
        />
      ) : null}

      {/* 7. Article Body Content */}
      <div className={cn("space-y-6 text-[#182624] font-thaana", bodySizeClass)}>
        {article.body.map((block, idx) => {
          if (block.type === "paragraph") {
            return (
              <p
                key={idx}
                className={idx === 0 ? "thaana-dropcap text-justify" : "text-justify"}
              >
                {block.text}
              </p>
            );
          }
          if (block.type === "heading") {
            return (
              <h2
                key={idx}
                className="text-xl sm:text-2xl font-bold text-[#123B3A] pt-5 border-t border-[#DCE4DF]"
              >
                {block.text}
              </h2>
            );
          }
          if (block.type === "quote") {
            return (
              <blockquote
                key={idx}
                className="my-7 p-5 sm:p-6 bg-[#FFFFFF] border-r-4 border-[#0F766E] border-y-0 border-l-0 rounded-[8px] shadow-xs"
              >
                <p className="text-base sm:text-lg font-bold text-[#123B3A] mb-2 leading-relaxed">
                  «{block.text}»
                </p>
                {block.attribution && (
                  <cite className="text-xs font-semibold text-[#53635F] not-italic block">
                    — {block.attribution}
                  </cite>
                )}
              </blockquote>
            );
          }
          if (block.type === "image") {
            return (
              <EditorialImage
                key={idx}
                src={block.src}
                alt={block.alt}
                caption={block.caption}
                credit={block.credit}
                aspectRatio="16/9"
              />
            );
          }
          if (block.type === "video") {
            return (
              <EditorialVideo
                key={idx}
                src={block.src}
                title={block.title}
                caption={block.caption}
                credit={block.credit}
                poster={block.poster}
              />
            );
          }
          return null;
        })}
      </div>

      {/* 8. Article Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-8 mt-8 border-t border-[#DCE4DF] flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#687671] ml-2">ޓެގްތައް:</span>
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="text-xs text-[#0F766E] hover:text-[#123B3A] bg-[#EDF2EF] hover:bg-[#DCE4DF] px-3 py-1 rounded-[6px] transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* 9. Author Bio Card */}
      <div className="my-8 p-5 sm:p-6 bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#123B3A] text-white flex items-center justify-center shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#182624]">
            {article.author.name}
          </h3>
          <p className="text-xs text-[#53635F] mt-0.5">
            {article.author.role || "ކަނޑު އެޑިޓޯރިއަލްގެ ނޫސްވެރިޔާ"}
          </p>
        </div>
      </div>

      {/* 10. Bottom Share Actions */}
      <ShareActions
        title={article.title}
        slug={article.slug}
        summary={article.summary}
        className="my-8"
      />

      {/* 11. Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#DCE4DF]">
        <Link href={`/category/${article.categorySlug}`}>
          <Button variant="secondary" size="md">
            {article.categoryName}ގެ އިތުރު ޚަބަރު
          </Button>
        </Link>

        <Link href="/">
          <Button variant="outline" size="md" className="gap-2">
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            <span>ފުރަތަމަ ޞަފްޙާ</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
