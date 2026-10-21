import Link from "next/link";
import type { Article } from "@/types/article";
import { formatDhivehiRelativeTime } from "@/lib/format-date";
import { BookmarkButton } from "@/components/actions/bookmark-button";
import { cn } from "@/lib/utils";

export interface CompactStoryRowProps {
  article: Article;
  rank?: number;
  className?: string;
  showBookmark?: boolean;
}

export function CompactStoryRow({
  article,
  rank,
  className,
  showBookmark = true,
}: CompactStoryRowProps) {
  const rankNumberFormatted = rank ? rank.toString().padStart(2, "0") : undefined;

  return (
    <article
      className={cn(
        "group flex items-start gap-4 py-3.5 border-b border-[#DCE4DF] last:border-b-0",
        className
      )}
    >
      {rankNumberFormatted && (
        <span
          className="text-2xl font-black text-[#0F766E]/70 group-hover:text-[#0F766E] font-latin tabular-nums select-none shrink-0 w-8 text-center pt-0.5"
          aria-hidden="true"
        >
          {rankNumberFormatted}
        </span>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 text-xs text-[#53635F] mb-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/category/${article.categorySlug}`}
              className="font-bold text-[#0F766E] hover:underline"
            >
              {article.categoryName}
            </Link>
            <span className="text-[#AAB9B2]" aria-hidden="true">
              ·
            </span>
            <time dateTime={article.publishedAt} suppressHydrationWarning className="text-[#687671] tabular-nums">
              {formatDhivehiRelativeTime(article.publishedAt)}
            </time>
          </div>

          {showBookmark && (
            <BookmarkButton
              slug={article.slug}
              title={article.title}
              variant="icon"
              className="p-1 -me-1"
            />
          )}
        </div>

        <h3 className="text-base font-bold text-[#182624] group-hover:text-[#0F766E] transition-colors leading-[26px]">
          <Link href={`/article/${article.slug}`} className="focus-visible:outline-none focus-visible:underline">
            {article.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
