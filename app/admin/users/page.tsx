import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/cms/auth-boundary";
import { cmsRepository } from "@/lib/cms/repository";
import { getRecentAuditLogs } from "@/lib/cms/audit";
import { UserManagementView } from "@/components/admin/user-management-view";

export const metadata: Metadata = {
  title: "އެޑިޓޯރިއަލް ޔޫޒަރުން މެނޭޖްކުރުން | Ocean Editorial CMS",
  description: "ކަނޑު އެޑިޓޯރިއަލްގެ ޔޫޒަރުންނާއި ރޯލްތައް ބެލެހެއްޓުން",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const session = await getServerAuthSession();

  if (!session.isAuthenticated || !session.user) {
    redirect("/admin/login?callbackUrl=/admin/users");
  }

  // Strict Server-Side RBAC Guard: Only administrators can access user management
  if (session.user.role !== "admin") {
    redirect("/admin?error=unauthorized");
  }

  const [users, auditLogs] = await Promise.all([
    cmsRepository.getEditorialUsers(),
    getRecentAuditLogs(50),
  ]);

  return (
    <UserManagementView
      currentUser={session.user}
      initialUsers={users}
      initialAuditLogs={auditLogs}
    />
  );
}
