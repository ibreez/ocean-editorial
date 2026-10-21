import type { Metadata } from "next";
import { Suspense } from "react";
import { getAbsoluteUrl } from "@/lib/site-url";
import { SearchView } from "@/components/news/search-view";

export const metadata: Metadata = {
  title: "ޚަބަރު ހޯއްދަވާ | Search",
  description: "ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި ދިރާސާތައް ތާނައިންނާއި އިނގިރޭސި ބަހުން ހޯއްދަވާ.",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "ޚަބަރު ހޯއްދަވާ — ކަނޑު އެޑިޓޯރިއަލް",
    description: "ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި ދިރާސާތައް ތާނައިންނާއި އިނގިރޭސި ބަހުން ހޯއްދަވާ.",
    url: getAbsoluteUrl("/search"),
    type: "website",
    locale: "dv_MV",
  },
  twitter: {
    card: "summary",
    title: "ޚަބަރު ހޯއްދަވާ — ކަނޑު އެޑިޓޯރިއަލް",
    description: "ދިވެހިރާއްޖެއާއި ދުނިޔޭގެ އެންމެ ފަހުގެ ޚަބަރުތަކާއި ދިރާސާތައް ތާނައިންނާއި އިނގިރޭސި ބަހުން ހޯއްދަވާ.",
  },
};

function SearchFallback() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-4 w-32 bg-[#DCE4DF] rounded mb-6" />
      <div className="h-10 w-64 bg-[#DCE4DF] rounded mb-4" />
      <div className="h-14 w-full bg-[#DCE4DF] rounded-[16px] mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-[#EDF2EF] rounded-[12px]" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F2]">
      <Suspense fallback={<SearchFallback />}>
        <SearchView />
      </Suspense>
    </main>
  );
}
