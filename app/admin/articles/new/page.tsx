import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/cms/auth-boundary";
import { cmsRepository } from "@/lib/cms/repository";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata: Metadata = {
  title: "އައު ޚަބަރެއް ލިޔުއްވާ | Ocean Editorial CMS",
  description: "އައު އެޑިޓޯރިއަލް ޑްރާފްޓެއް ލިޔުއްވުން",
  robots: { index: false, follow: false },
};

export default async function NewArticlePage() {
  const session = await getServerAuthSession();
  if (!session.isAuthenticated || !session.user) {
    redirect("/admin/login?callbackUrl=/admin/articles/new");
  }

  const [categories, authors] = await Promise.all([
    cmsRepository.getCategories(),
    cmsRepository.getAuthors(),
  ]);

  return (
    <ArticleForm
      currentUser={session.user}
      categories={categories}
      authors={authors}
    />
  );
}
