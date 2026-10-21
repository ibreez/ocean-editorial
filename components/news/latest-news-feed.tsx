"use client";

import * as React from "react";
import type { Article } from "@/types/article";
import { ArticleCard } from "./article-card";
import { Button } from "@/components/ui/button";

export interface LatestNewsFeedProps {
  initialArticles: Article[];
  allArticles?: Article[];
}

export function LatestNewsFeed({
  initialArticles,
  allArticles = [],
}: LatestNewsFeedProps) {
  const [displayedCount, setDisplayedCount] = React.useState(initialArticles.length || 6);

  const pool = allArticles.length > 0 ? allArticles : initialArticles;
  const currentArticles = pool.slice(0, displayedCount);
  const hasMore = displayedCount < pool.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + 4, pool.length));
  };

  return (
    <div className="space-y-4">
      <div className="divide-y divide-[#DCE4DF]">
        {currentArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="horizontal"
          />
        ))}
      </div>

      {hasMore && (
        <div className="pt-4 text-center">
          <Button
            variant="secondary"
            size="md"
            onClick={handleLoadMore}
            className="w-full sm:w-auto"
          >
            އިތުރު ޚަބަރު ބައްލަވާ
          </Button>
        </div>
      )}
    </div>
  );
}
