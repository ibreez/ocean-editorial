import * as React from "react";
import Link from "next/link";
import { formatDhivehiRelativeTime, formatDhivehiDateTime } from "@/lib/format-date";
import { formatReadingTime } from "@/lib/typography";
import { cn } from "@/lib/utils";

export interface ArticleMetadataProps {
  categorySlug?: string;
  categoryName?: string;
  authorName?: string;
  publishedAt: string;
  readTimeMinutes?: number;
  className?: string;
  showCategory?: boolean;
  showAuthor?: boolean;
}

export function ArticleMetadata({
  categorySlug,
  categoryName,
  authorName,
  publishedAt,
  readTimeMinutes,
  className,
  showCategory = true,
  showAuthor = true,
}: ArticleMetadataProps) {
  const relativeTime = formatDhivehiRelativeTime(publishedAt);
  const fullDateTime = formatDhivehiDateTime(publishedAt);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#53635F] tabular-nums",
        className
      )}
    >
      {showCategory && categoryName && (
        <>
          {categorySlug ? (
            <Link
              href={`/category/${categorySlug}`}
              className="font-bold text-[#0F766E] hover:text-[#123B3A] transition-colors"
            >
              {categoryName}
            </Link>
          ) : (
            <span className="font-bold text-[#0F766E]">{categoryName}</span>
          )}
          <span className="text-[#AAB9B2]" aria-hidden="true">
            ·
          </span>
        </>
      )}

      {showAuthor && authorName && (
        <>
          <span className="text-[#182624] font-medium">{authorName}</span>
          <span className="text-[#AAB9B2]" aria-hidden="true">
            ·
          </span>
        </>
      )}

      <time dateTime={publishedAt} title={fullDateTime} suppressHydrationWarning className="text-[#687671]">
        {relativeTime}
      </time>

      {readTimeMinutes && (
        <>
          <span className="text-[#AAB9B2]" aria-hidden="true">
            ·
          </span>
          <span className="text-[#687671]">{formatReadingTime(readTimeMinutes)}</span>
        </>
      )}
    </div>
  );
}
