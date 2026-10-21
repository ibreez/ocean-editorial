import Link from "next/link";
import type { Article } from "@/types/article";
import { ArticleMetadata } from "./article-metadata";
import { BookmarkButton } from "@/components/actions/bookmark-button";
import { cn } from "@/lib/utils";

export interface LeadStoryProps {
  article: Article;
  className?: string;
}

export function LeadStory({ article, className }: LeadStoryProps) {
  return (
    <article
      className={cn(
        "group flex flex-col lg:flex-row gap-6 lg:gap-8 bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-5 sm:p-7 shadow-xs hover:border-[#AAB9B2] transition-colors",
        className
      )}
    >
      {/* Lead Photography (Large 16:9) */}
      {article.image && (
        <div className="lg:w-7/12 shrink-0">
          <Link
            href={`/article/${article.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="aspect-16/9 w-full rounded-[8px] overflow-hidden bg-[#EDF2EF] border border-[#DCE4DF] relative block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image.src}
              alt={article.image.alt}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              referrerPolicy="no-referrer"
              fetchPriority="high"
            />
          </Link>
          {article.image.caption && (
            <p className="text-[11px] text-[#687671] mt-1.5 leading-normal">
              {article.image.caption}
            </p>
          )}
        </div>
      )}

      {/* Story Narrative & Metadata */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          {/* Category & Status Indicator */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
              {article.categoryName}
            </span>
            <span className="text-[#AAB9B2]" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-bold text-[#D94343]">
              ފުރަތަމަ ޚަބަރު
            </span>
          </div>

          {/* Dominant Headline */}
          <h2 className="headline-major font-black text-[#123B3A] group-hover:text-[#0F766E] transition-colors mb-4">
            <Link href={`/article/${article.slug}`} className="focus-visible:outline-none focus-visible:underline">
              {article.title}
            </Link>
          </h2>

          {/* Standfirst / Excerpt */}
          {article.summary && (
            <p className="text-base sm:text-lg text-[#53635F] leading-relaxed mb-6 font-medium">
              {article.summary}
            </p>
          )}
        </div>

        {/* Attribution & Read Time Footer with Bookmark */}
        <div className="pt-4 border-t border-[#DCE4DF] flex flex-wrap items-center justify-between gap-3">
          <ArticleMetadata
            categorySlug={article.categorySlug}
            categoryName={article.categoryName}
            authorName={article.author.name}
            publishedAt={article.publishedAt}
            readTimeMinutes={article.readTimeMinutes}
            showCategory={false}
          />

          <BookmarkButton
            slug={article.slug}
            title={article.title}
            variant="button"
          />
        </div>
      </div>
    </article>
  );
}
