import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, demoArticles } from "@/lib/articles";
import { getBaseUrl, getAbsoluteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleContent } from "@/components/news/article-content";
import { RelatedStories } from "@/components/news/related-stories";

import { isValidSlug } from "@/lib/input-validation";

export function generateStaticParams() {
  return demoArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return {
      title: "ޚަބަރު ފެންނާކަށް ނެތް",
      robots: { index: false, follow: false },
    };
  }
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "ޚަބަރު ފެންނާކަށް ނެތް",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/article/${article.slug}`;
  const canonicalUrl = getAbsoluteUrl(canonicalPath);

  const imageUrl = article.image
    ? article.image.src.startsWith("http")
      ? article.image.src
      : getAbsoluteUrl(article.image.src)
    : undefined;

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: canonicalUrl,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author.name],
      section: article.categoryName,
      tags: article.tags,
      locale: "dv_MV",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: article.image?.alt || article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    notFound();
  }
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedStories = getRelatedArticles(article.slug, article.categorySlug, 3);
  const baseUrl = getBaseUrl();
  const canonicalUrl = getAbsoluteUrl(`/article/${article.slug}`);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    "headline": article.title,
    "description": article.summary,
    "image": article.image ? [article.image.src] : undefined,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "jobTitle": article.author.role,
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "ކަނޑު އެޑިޓޯރިއަލް",
      "alternateName": "Ocean Editorial",
      "url": baseUrl,
    },
    "inLanguage": "dv",
    "articleSection": article.categoryName,
    "keywords": article.tags?.join(", "),
  };

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
        "name": article.categoryName,
        "item": getAbsoluteUrl(`/category/${article.categorySlug}`),
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": canonicalUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbsJsonLd]} />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Article Narrative and Actions */}
        <ArticleContent article={article} />

        {/* Relevant Related Stories */}
        {relatedStories.length > 0 && (
          <RelatedStories
            articles={relatedStories}
            categorySlug={article.categorySlug}
          />
        )}
      </div>
    </>
  );
}
