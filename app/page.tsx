import Link from "next/link";
import {
  getLeadStory,
  getSecondaryTopStories,
  getLatestArticles,
  getAllArticles,
  getTrendingArticles,
  getOpinionArticles,
  getArticlesByCategory,
} from "@/lib/articles";
import { getCategoryBySlug } from "@/lib/categories";
import { LeadStory } from "@/components/news/lead-story";
import { ArticleCard } from "@/components/news/article-card";
import { LatestNewsFeed } from "@/components/news/latest-news-feed";
import { CompactStoryRow } from "@/components/news/compact-story-row";
import { SectionHeading } from "@/components/news/section-heading";
import { CategorySection } from "@/components/news/category-section";
import { getPrimaryActiveLiveCoverage } from "@/lib/live-coverage";
import { LiveCoverageBanner } from "@/components/news/live-coverage-banner";

import type { Metadata } from "next";
import { getBaseUrl, getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "ކަނޑު އެޑިޓޯރިއަލް | Ocean Editorial — ދިވެހިރާއްޖޭގެ ޚަބަރު",
  description:
    "ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި، ސިޔާސީ، އިޤްތިޞާދީ، ކުޅިވަރު އަދި ޘަޤާފީ ދިރާސާތައް.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ކަނޑު އެޑިޓޯރިއަލް — Ocean Editorial | ދިވެހި ޑިޖިޓަލް ނޫސް",
    description:
      "ޒަމާނީ، ފެންވަރު ރަނގަޅު ދިވެހި ޑިޖިޓަލް ނޫސް. އިތުބާރު ހުރި ނޫސްވެރިކަމާއި، ވަގުތުން ގެނެސްދޭ ޚަބަރާއި ދިރާސީ ރިޕޯޓުތައް.",
    url: getBaseUrl(),
    type: "website",
    locale: "dv_MV",
  },
  twitter: {
    card: "summary_large_image",
    title: "ކަނޑު އެޑިޓޯރިއަލް — Ocean Editorial | ދިވެހި ޑިޖިޓަލް ނޫސް",
    description:
      "ޒަމާނީ، ފެންވަރު ރަނގަޅު ދިވެހި ޑިޖިޓަލް ނޫސް. އިތުބާރު ހުރި ނޫސްވެރިކަމާއި، ވަގުތުން ގެނެސްދޭ ޚަބަރާއި ދިރާސީ ރިޕޯޓުތައް.",
  },
};

export default function HomePage() {
  const leadStory = getLeadStory();
  const secondaryStories = getSecondaryTopStories();
  const latestArticles = getLatestArticles(5);
  const allArticles = getAllArticles();
  const trendingArticles = getTrendingArticles(4);
  const opinionArticles = getOpinionArticles(2);

  const maldivesCategory = getCategoryBySlug("maldives");
  const maldivesArticles = getArticlesByCategory("maldives");

  const sportsCategory = getCategoryBySlug("sports");
  const sportsArticles = getArticlesByCategory("sports");

  const economyCategory = getCategoryBySlug("economy");
  const economyArticles = getArticlesByCategory("economy");
  const activeLiveCoverage = getPrimaryActiveLiveCoverage();

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* 0. Live Coverage Banner Entry Point */}
      {activeLiveCoverage && (
        <LiveCoverageBanner coverage={activeLiveCoverage} />
      )}

      {/* 1. HERO COMPOSITION: Lead Story + Secondary Top Features */}
      <section aria-label="މައި ޚަބަރުތައް" className="space-y-6">
        {/* Dominant Lead Story */}
        <LeadStory article={leadStory} />

        {/* Secondary Top Features (Balanced 2-Column Grid) */}
        {secondaryStories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryStories.map((story) => (
              <ArticleCard
                key={story.id}
                article={story}
                variant="standard"
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. MAIN EDITORIAL CONTENT: Latest News Feed + Sidebar Rail */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed Column (7 cols on Desktop) */}
        <div className="lg:col-span-8 space-y-12">
          {/* Latest News Feed */}
          <div>
            <SectionHeading
              title="ފަހުގެ ޚަބަރު"
              englishTitle="LATEST NEWS"
              viewAllHref="/latest"
              viewAllLabel="ހުރިހާ ފަހުގެ ޚަބަރެއް"
            />
            <LatestNewsFeed
              initialArticles={latestArticles}
              allArticles={allArticles}
            />
          </div>

          {/* Featured Category: Maldives (ރާއްޖެ) */}
          {maldivesCategory && maldivesArticles.length > 0 && (
            <CategorySection
              category={maldivesCategory}
              articles={maldivesArticles}
            />
          )}

          {/* Featured Category: Sports (ކުޅިވަރު) */}
          {sportsCategory && sportsArticles.length > 0 && (
            <CategorySection
              category={sportsCategory}
              articles={sportsArticles}
            />
          )}
        </div>

        {/* Secondary Rail / Sidebar (4 cols on Desktop) */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Trending / Most Read Stories */}
          <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-5 sm:p-6 shadow-xs">
            <h3 className="text-lg font-black text-[#123B3A] border-b-2 border-[#123B3A] pb-2 mb-4 flex items-center justify-between">
              <span>އެންމެ ގިނައިން ކިޔާފައިވާ</span>
              <span className="text-[11px] font-latin font-bold text-[#53635F]">
                MOST READ
              </span>
            </h3>

            <div className="divide-y divide-[#DCE4DF]">
              {trendingArticles.map((story, index) => (
                <CompactStoryRow
                  key={story.id}
                  article={story}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>

          {/* Editorial Opinion & Analysis Section */}
          {opinionArticles.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#123B3A] pb-2 mb-4">
                <h3 className="text-lg font-black text-[#123B3A]">
                  ޚިޔާލާއި ތަޙްލީލު
                </h3>
                <span className="text-[11px] font-latin font-bold text-[#53635F]">
                  OPINION
                </span>
              </div>

              <div className="space-y-4">
                {opinionArticles.map((story) => (
                  <ArticleCard
                    key={story.id}
                    article={story}
                    variant="opinion"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Subscription Box */}
          <div className="bg-[#EDF2EF] border border-[#DCE4DF] rounded-[10px] p-5 sm:p-6">
            <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider font-latin block mb-1">
              NEWSLETTER
            </span>
            <h4 className="text-lg font-black text-[#123B3A] mb-2">
              ކަނޑު އެޑިޓޯރިއަލް ނިއުސްލެޓަރ
            </h4>
            <p className="text-xs text-[#53635F] leading-relaxed mb-4">
              ދުވަހުގެ އެންމެ މުހިންމު ޚަބަރުތަކާއި ޚާއްޞަ ރިޕޯޓުތައް ކޮންމެ ހެނދުނަކު ތިޔަބޭފުޅާގެ އީމެއިލަށް ހިލޭ ލިބިވަޑައިގަންނަވާނެ.
            </p>
            <Link
              href="/about#subscribe"
              className="inline-block w-full text-center py-2.5 px-4 bg-[#123B3A] text-white text-xs font-bold rounded-[8px] hover:bg-[#0F766E] transition-colors"
            >
              ސަބްސްކްރައިބް ކުރައްވާ
            </Link>
          </div>
        </aside>
      </section>

      {/* 3. ECONOMY & MARKET SECTION (Full Width Editorial Module) */}
      {economyCategory && economyArticles.length > 0 && (
        <section aria-label="އިޤްތިޞާދީ ޚަބަރު">
          <CategorySection
            category={economyCategory}
            articles={economyArticles}
          />
        </section>
      )}
    </div>
  );
}
