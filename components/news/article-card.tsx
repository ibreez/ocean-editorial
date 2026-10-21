import Link from "next/link";
import type { Article } from "@/types/article";
import { ArticleMetadata } from "./article-metadata";
import { formatDhivehiDate } from "@/lib/format-date";
import { BookmarkButton } from "@/components/actions/bookmark-button";
import { cn } from "@/lib/utils";

export interface ArticleCardProps {
  article: Article;
  variant?: "standard" | "horizontal" | "compact" | "featured" | "opinion";
  className?: string;
  imagePriority?: boolean;
  showBookmark?: boolean;
}

export function ArticleCard({
  article,
  variant = "standard",
  className,
  showBookmark = true,
}: ArticleCardProps) {
  // Variant: Compact (Text-only)
  if (variant === "compact") {
    return (
      <article
        className={cn(
          "group py-3.5 border-b border-[#DCE4DF] last:border-b-0 flex flex-col gap-1.5",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <ArticleMetadata
            categorySlug={article.categorySlug}
            categoryName={article.categoryName}
            publishedAt={article.publishedAt}
            showAuthor={false}
          />
          {showBookmark && (
            <BookmarkButton
              slug={article.slug}
              title={article.title}
              variant="icon"
              className="p-1 -me-1"
            />
          )}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#182624] group-hover:text-[#0F766E] transition-colors leading-[26px]">
          <Link href={`/article/${article.slug}`} className="focus-visible:outline-none focus-visible:underline">
            {article.title}
          </Link>
        </h3>
      </article>
    );
  }

  // Variant: Horizontal (Thumbnail + Text side by side)
  if (variant === "horizontal") {
    return (
      <article
        className={cn(
          "group flex items-start gap-4 py-4 border-b border-[#DCE4DF] last:border-b-0",
          className
        )}
      >
        {article.image && (
          <Link
            href={`/article/${article.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="w-28 sm:w-36 aspect-4/3 shrink-0 rounded-[8px] overflow-hidden bg-[#EDF2EF] border border-[#DCE4DF] relative block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image.src}
              alt={article.image.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </Link>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <ArticleMetadata
                categorySlug={article.categorySlug}
                categoryName={article.categoryName}
                publishedAt={article.publishedAt}
                showAuthor={false}
              />
              {showBookmark && (
                <BookmarkButton
                  slug={article.slug}
                  title={article.title}
                  variant="icon"
                  className="p-1 -me-1"
                />
              )}
            </div>

            <h3 className="text-base sm:text-[17px] font-bold text-[#182624] group-hover:text-[#0F766E] transition-colors leading-[26px] mb-2 line-clamp-2">
              <Link href={`/article/${article.slug}`} className="focus-visible:outline-none focus-visible:underline">
                {article.title}
              </Link>
            </h3>
          </div>

          <span className="text-xs text-[#687671] hidden sm:inline-block">
            {article.author.name}
          </span>
        </div>
      </article>
    );
  }

  // Variant: Opinion / Analysis
  if (variant === "opinion") {
    return (
      <article
        className={cn(
          "group p-5 bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] shadow-xs flex flex-col justify-between hover:border-[#AAB9B2] transition-colors",
          className
        )}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-[#0F766E]">
              ޚިޔާލާއި ތަޙްލީލު
            </span>
            {showBookmark ? (
              <BookmarkButton
                slug={article.slug}
                title={article.title}
                variant="icon"
                className="p-1 -me-1"
              />
            ) : (
              <span className="text-xl text-[#0F766E]/40 font-serif" aria-hidden="true">
                “
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[#123B3A] group-hover:text-[#0F766E] transition-colors leading-[30px] mb-3">
            <Link href={`/article/${article.slug}`} className="focus-visible:outline-none focus-visible:underline">
              {article.title}
            </Link>
          </h3>

          {article.summary && (
            <p className="text-sm text-[#53635F] line-clamp-2 leading-relaxed mb-4">
              {article.summary}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#DCE4DF] flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-[#182624]">{article.author.name}</p>
            {article.author.role && (
              <p className="text-[#687671] text-[11px]">{article.author.role}</p>
            )}
          </div>
          <time dateTime={article.publishedAt} suppressHydrationWarning className="text-[#687671] tabular-nums">
            {formatDhivehiDate(article.publishedAt)}
          </time>
        </div>
      </article>
    );
  }

  // Variant: Standard (Card with image on top)
  return (
    <article
      className={cn(
        "group flex flex-col bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] overflow-hidden shadow-xs hover:border-[#AAB9B2] transition-colors",
        className
      )}
    >
      {article.image && (
        <div className="relative">
          <Link
            href={`/article/${article.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="aspect-16/10 w-full overflow-hidden bg-[#EDF2EF] border-b border-[#DCE4DF] relative block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image.src}
              alt={article.image.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </Link>
          {showBookmark && (
            <div className="absolute top-2.5 start-2.5 z-10">
              <BookmarkButton
                slug={article.slug}
                title={article.title}
                variant="card"
              />
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <ArticleMetadata
              categorySlug={article.categorySlug}
              categoryName={article.categoryName}
              publishedAt={article.publishedAt}
            />
            {/* If no image was rendered, render bookmark button in header */}
            {!article.image && showBookmark && (
              <BookmarkButton
                slug={article.slug}
                title={article.title}
                variant="icon"
                className="p-1 -me-1"
              />
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[#182624] group-hover:text-[#0F766E] transition-colors leading-[28px] mb-2">
            <Link href={`/article/${article.slug}`} className="focus-visible:outline-none focus-visible:underline">
              {article.title}
            </Link>
          </h3>

          {article.summary && (
            <p className="text-xs sm:text-sm text-[#53635F] line-clamp-2 leading-relaxed mb-4">
              {article.summary}
            </p>
          )}
        </div>

        <div className="pt-2 text-xs text-[#687671] flex items-center justify-between">
          <span>{article.author.name}</span>
          {article.readTimeMinutes && (
            <span className="tabular-nums">{article.readTimeMinutes} މިނެޓު</span>
          )}
        </div>
      </div>
    </article>
  );
}
