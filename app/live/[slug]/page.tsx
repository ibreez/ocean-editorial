import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveCoverageBySlug, demoLiveCoverages } from "@/lib/live-coverage";
import { getBaseUrl, getAbsoluteUrl } from "@/lib/site-url";
import { isValidSlug } from "@/lib/input-validation";
import { JsonLd } from "@/components/seo/json-ld";
import { LiveCoverageView } from "@/components/news/live-coverage-view";

export function generateStaticParams() {
  return demoLiveCoverages.map((item) => ({
    slug: item.slug,
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
      title: "ކަވަރޭޖް ފެންނާކަށް ނެތް | Live Coverage Not Found",
      robots: { index: false, follow: false },
    };
  }
  const coverage = getLiveCoverageBySlug(slug);

  if (!coverage) {
    return {
      title: "ކަވަރޭޖް ފެންނާކަށް ނެތް | Live Coverage Not Found",
      robots: { index: false, follow: false },
    };
  }

  const statusPrefix = coverage.status === "live" ? "🔴 ވަގުތުން: " : "ނިންމާލެވިފައި: ";
  const canonicalPath = `/live/${coverage.slug}`;
  const canonicalUrl = getAbsoluteUrl(canonicalPath);

  const imageUrl = coverage.image
    ? coverage.image.src.startsWith("http")
      ? coverage.image.src
      : getAbsoluteUrl(coverage.image.src)
    : undefined;

  return {
    title: `${statusPrefix}${coverage.title} | Ocean Editorial`,
    description: coverage.summary,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${statusPrefix}${coverage.title}`,
      description: coverage.summary,
      url: canonicalUrl,
      type: "article",
      locale: "dv_MV",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: coverage.image?.alt || coverage.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${statusPrefix}${coverage.title}`,
      description: coverage.summary,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function LiveCoveragePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    notFound();
  }
  const coverage = getLiveCoverageBySlug(slug);

  if (!coverage) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const canonicalUrl = getAbsoluteUrl(`/live/${coverage.slug}`);

  // Schema.org LiveBlogPosting structured data
  const liveBlogJsonLd = {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    "@id": canonicalUrl,
    "headline": coverage.title,
    "description": coverage.summary,
    "coverageStartTime": coverage.startedAt,
    "coverageEndTime": coverage.status === "completed" ? coverage.updatedAt : undefined,
    "datePublished": coverage.startedAt,
    "dateModified": coverage.updatedAt || coverage.startedAt,
    "image": coverage.image ? [coverage.image.src] : undefined,
    "inLanguage": "dv",
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "ކަނޑު އެޑިޓޯރިއަލް",
      "alternateName": "Ocean Editorial",
      "url": baseUrl,
    },
    "liveBlogUpdate": coverage.updates.map((update) => ({
      "@type": "BlogPosting",
      "headline": update.title,
      "datePublished": update.timestamp,
      "dateModified": update.timestamp,
      "articleBody": update.content,
      "image": update.image ? [update.image.src] : undefined,
      "author": {
        "@type": "Person",
        "name": update.authorName || "ކަނޑު އެޑިޓޯރިއަލް",
      },
    })),
  };

  // Schema.org BreadcrumbList structured data
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
        "name": coverage.categoryName || "ވަގުތުން ގެނެސްދޭ ކަވަރޭޖް",
        "item": coverage.categorySlug
          ? getAbsoluteUrl(`/category/${coverage.categorySlug}`)
          : baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": coverage.title,
        "item": canonicalUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[liveBlogJsonLd, breadcrumbsJsonLd]} />
      <main className="min-h-[75vh] bg-[#F7F7F2]">
        <LiveCoverageView coverage={coverage} />
      </main>
    </>
  );
}
