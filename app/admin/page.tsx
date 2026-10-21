import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/cms/auth-boundary";
import { cmsRepository } from "@/lib/cms/repository";
import { DashboardView } from "@/components/admin/dashboard-view";

export const metadata: Metadata = {
  title: "އެޑިޓޯރިއަލް ޑޭޝްބޯޑް | Ocean Editorial CMS",
  description: "ކަނޑު އެޑިޓޯރިއަލް އެޑްމިން ޑޭޝްބޯޑް",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getServerAuthSession();

  if (!session.isAuthenticated || !session.user) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  // RBAC: Journalists view only content their role is authorized to access
  const filterOptions =
    session.user.role === "journalist"
      ? { limit: 50, sortOrder: "desc" as const, createdBy: session.user.id }
      : { limit: 50, sortOrder: "desc" as const };

  const [articlesResult, categories, metrics] = await Promise.all([
    cmsRepository.getArticles(filterOptions),
    cmsRepository.getCategories(),
    cmsRepository.getMetrics(session.user),
  ]);

  return (
    <DashboardView
      currentUser={session.user}
      initialArticles={articlesResult.items}
      categories={categories}
      metrics={metrics}
    />
  );
}
