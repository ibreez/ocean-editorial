import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header";
import { getServerAuthSession } from "@/lib/cms/auth-boundary";

export const metadata: Metadata = {
  title: "އެޑިޓޯރިއަލް ޑޭޝްބޯޑް | Ocean Editorial CMS",
  description: "ކަނޑު އެޑިޓޯރިއަލްގެ އެތެރޭގެ އެޑިޓޯރިއަލް މެނޭޖްމަންޓް ޑޭޝްބޯޑު",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#182624] font-thaana flex flex-col">
      <AdminHeader currentUser={session.user} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
