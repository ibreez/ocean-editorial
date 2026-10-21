import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/cms/auth-boundary";
import { cmsRepository } from "@/lib/cms/repository";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata: Metadata = {
  title: "ޚަބަރު އިޞްލާޙްކުރައްވާ | Ocean Editorial CMS",
  description: "އެޑިޓޯރިއަލް ޚަބަރެއް އިޞްލާޙްކުރުން",
  robots: { index: false, follow: false },
};

import { canUserViewArticle } from "@/lib/cms/permissions";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerAuthSession();
  const { id } = await params;

  if (!session.isAuthenticated || !session.user) {
    redirect(`/admin/login?callbackUrl=/admin/articles/${encodeURIComponent(id)}`);
  }

  const [article, categories, authors] = await Promise.all([
    cmsRepository.getArticleById(id),
    cmsRepository.getCategories(),
    cmsRepository.getAuthors(),
  ]);

  if (!article) {
    notFound();
  }

  // RBAC: Enforce ownership & view permissions
  if (!canUserViewArticle(session.user, article)) {
    redirect("/admin?error=unauthorized");
  }

  return (
    <ArticleForm
      currentUser={session.user}
      initialArticle={article}
      categories={categories}
      authors={authors}
    />
  );
}
