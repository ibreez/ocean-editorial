import type { Metadata } from "next";
import { getAllArticles, getTrendingArticles } from "@/lib/articles";
import { getAllCategories } from "@/lib/categories";
import { getBaseUrl, getAbsoluteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";
import { LatestNewsArchiveView } from "@/components/news/latest-news-archive-view";

export const metadata: Metadata = {
  title: "އެންމެ ފަހުގެ ޚަބަރު | Latest News",
  description:
    "ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި، ސިޔާސީ، އިޤްތިޞާދީ، ކުޅިވަރު އަދި ޘަޤާފީ އަދާހަމަތައް ވަގުތުން ވަގުތަށް.",
  alternates: {
    canonical: "/latest",
  },
  openGraph: {
    title: "އެންމެ ފަހުގެ ޚަބަރު | Latest News — ކަނޑު އެޑިޓޯރިއަލް",
    description:
      "ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި އަދާހަމަތައް ވަގުތުން ވަގުތަށް.",
    url: getAbsoluteUrl("/latest"),
    type: "website",
    locale: "dv_MV",
  },
  twitter: {
    card: "summary_large_image",
    title: "އެންމެ ފަހުގެ ޚަބަރު | Latest News — ކަނޑު އެޑިޓޯރިއަލް",
    description:
      "ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި އަދާހަމަތައް ވަގުތުން ވަގުތަށް.",
  },
};

export default function LatestNewsPage() {
  const articles = getAllArticles();
  const categories = getAllCategories();
  const trendingArticles = getTrendingArticles(4);
  const baseUrl = getBaseUrl();
  const canonicalUrl = getAbsoluteUrl("/latest");

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "ފުރަތަމަ ޞަފްޙާ",
        "item": baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "އެންމެ ފަހުގެ ޚަބަރު",
        "item": canonicalUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <LatestNewsArchiveView
          articles={articles}
          categories={categories}
          trendingArticles={trendingArticles}
        />
      </div>
    </>
  );
}
