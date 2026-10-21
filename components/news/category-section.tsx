import type { Article, Category } from "@/types/article";
import { SectionHeading } from "./section-heading";
import { ArticleCard } from "./article-card";
import { cn } from "@/lib/utils";

export interface CategorySectionProps {
  category: Category;
  articles: Article[];
  className?: string;
}

export function CategorySection({
  category,
  articles,
  className,
}: CategorySectionProps) {
  if (!articles || articles.length === 0) return null;

  const [lead, ...supporting] = articles;

  return (
    <section className={cn("py-6 sm:py-8 border-t border-[#DCE4DF]", className)}>
      <SectionHeading
        title={category.name}
        englishTitle={category.englishName}
        viewAllHref={`/category/${category.slug}`}
      />

      {/* Editorial layout: 1 primary card + supporting cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Main Category Feature */}
        <div className="md:col-span-7">
          <ArticleCard article={lead} variant="standard" />
        </div>

        {/* Supporting Category Stories */}
        <div className="md:col-span-5 flex flex-col divide-y divide-[#DCE4DF] bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] px-5 py-2">
          {supporting.slice(0, 3).map((story) => (
            <ArticleCard
              key={story.id}
              article={story}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
