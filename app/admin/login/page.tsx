import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/cms/auth-boundary";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "އެޑިޓޯރިއަލް ލޮގިން | Ocean Editorial CMS",
  description: "ކަނޑު އެޑިޓޯރިއަލް އެތެރޭގެ ލޮގިން",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getServerAuthSession();
  if (session.isAuthenticated) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto p-8 bg-white rounded-[12px] border border-[#DCE4DF] shadow-card text-center text-xs text-[#53635F]">
            ލޯޑުވަނީ...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
