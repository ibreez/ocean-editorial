import type { Metadata } from "next";
import { Suspense } from "react";
import { getAbsoluteUrl } from "@/lib/site-url";
import { SavedArticlesView } from "@/components/news/saved-articles-view";

export const metadata: Metadata = {
  title: "ރައްކާކުރި ޚަބަރުތައް | Saved Articles",
  description: "ފަހުން ވިދާޅުވުމަށް ރައްކާކުރައްވާފައިވާ ޚަބަރުތަކުގެ ފުރިހަމަ ލިސްޓު. ސީދާ މި ބްރައުޒަރގައި ރައްކާކުރެވިފައި.",
  alternates: {
    canonical: "/saved",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "ރައްކާކުރި ޚަބަރުތައް | Saved Articles — Ocean Editorial",
    description: "ފަހުން ވިދާޅުވުމަށް ރައްކާކުރައްވާފައިވާ ޚަބަރުތަކުގެ ފުރިހަމަ ލިސްޓު.",
    url: getAbsoluteUrl("/saved"),
    type: "website",
    locale: "dv_MV",
  },
  twitter: {
    card: "summary",
    title: "ރައްކާކުރި ޚަބަރުތައް | Saved Articles — Ocean Editorial",
    description: "ފަހުން ވިދާޅުވުމަށް ރައްކާކުރައްވާފައިވާ ޚަބަރުތަކުގެ ފުރިހަމަ ލިސްޓު.",
  },
};

export default function SavedPage() {
  return (
    <main className="min-h-[70vh] bg-[#F7F7F2]">
      <Suspense
        fallback={
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 animate-pulse">
            <div className="h-8 w-64 bg-[#DCE4DF] rounded-[6px] mb-4" />
            <div className="h-4 w-96 bg-[#DCE4DF] rounded-[4px] mb-8" />
          </div>
        }
      >
        <SavedArticlesView />
      </Suspense>
    </main>
  );
}
