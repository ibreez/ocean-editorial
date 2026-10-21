import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, categories, getAllCategories } from "@/lib/categories";
import { getArticlesByCategory } from "@/lib/articles";
import { getBaseUrl, getAbsoluteUrl } from "@/lib/site-url";
import { isValidSlug } from "@/lib/input-validation";
import { JsonLd } from "@/components/seo/json-ld";
import { CategoryArchiveView } from "@/components/news/category-archive-view";

export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
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
      title: "ބައި ފެންނާކަށް ނެތް",
      robots: { index: false, follow: false },
    };
  }
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "ބައި ފެންނާކަށް ނެތް",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} (${category.englishName})`;
  const description = category.description || `${category.name} ބައިގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި އަދާހަމަތައް.`;
  const canonicalPath = `/category/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${category.name} — ޚަބަރު | Ocean Editorial`,
      description,
      url: getAbsoluteUrl(canonicalPath),
      type: "website",
      locale: "dv_MV",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} — ޚަބަރު | Ocean Editorial`,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    notFound();
  }
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const articles = getArticlesByCategory(slug);
  const allCategories = getAllCategories();
  const baseUrl = getBaseUrl();
  const canonicalUrl = getAbsoluteUrl(`/category/${category.slug}`);

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
        "name": category.name,
        "item": canonicalUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <CategoryArchiveView
          category={category}
          articles={articles}
          allCategories={allCategories}
        />
      </div>
    </>
  );
}
