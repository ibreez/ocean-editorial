import type { Article } from "@/types/article";
import { ArticleCard } from "./article-card";
import { SectionHeading } from "./section-heading";

export interface RelatedStoriesProps {
  articles: Article[];
  categorySlug?: string;
}

export function RelatedStories({
  articles,
  categorySlug,
}: RelatedStoriesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section aria-label="ގުޅުންހުރި ޚަބަރުތައް" className="pt-10 mt-12 border-t-2 border-[#123B3A]">
      <SectionHeading
        title="ގުޅުންހުރި ޚަބަރު"
        englishTitle="RELATED STORIES"
        viewAllHref={categorySlug ? `/category/${categorySlug}` : undefined}
        viewAllLabel="މި ބައިގެ އިތުރު ޚަބަރު"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="standard"
          />
        ))}
      </div>
    </section>
  );
}
