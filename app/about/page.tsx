import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

import type { Metadata } from "next";
import { getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "ތަޢާރަފާއި ސިޔާސަތު | About Us",
  description: "ކަނޑު އެޑިޓޯރިއަލްގެ ތަޢާރަފާއި، މިޝަން، އަދި އެޑިޓޯރިއަލް އުޞޫލުތައް.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "ތަޢާރަފާއި ސިޔާސަތު | About Us — Ocean Editorial",
    description: "ކަނޑު އެޑިޓޯރިއަލްގެ ތަޢާރަފާއި، މިޝަން، އަދި އެޑިޓޯރިއަލް އުޞޫލުތައް.",
    url: getAbsoluteUrl("/about"),
    type: "website",
    locale: "dv_MV",
  },
  twitter: {
    card: "summary",
    title: "ތަޢާރަފާއި ސިޔާސަތު | About Us — Ocean Editorial",
    description: "ކަނޑު އެޑިޓޯރިއަލްގެ ތަޢާރަފާއި، މިޝަން، އަދި އެޑިޓޯރިއަލް އުޞޫލުތައް.",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="reading-column bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-6 sm:p-10 shadow-xs">
        <div className="border-b border-[#DCE4DF] pb-6 mb-8">
          <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider font-latin block mb-1">
            ABOUT THE NEWSROOM
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-noto-thaana text-[#123B3A]">
            {siteConfig.dhivehiName} — ތަޢާރަފު
          </h1>
          <p className="text-sm text-[#53635F] mt-2 font-latin font-medium">
            {siteConfig.name} · Maldivian Digital Newsroom
          </p>
        </div>

        <div className="space-y-6 text-[#182624] leading-relaxed text-base">
          <p className="thaana-dropcap">
            ކަނޑު އެޑިޓޯރިއަލް އަކީ ދިވެހިރާއްޖޭގެ ޑިޖިޓަލް ނޫސްވެރިކަމަށް އައު ދިރުމެއް ގެނެސްދިނުމުގެ މަޤްޞަދުގައި، ޒަމާނީ ފަންނިއްޔާތާއި މޮޅު ޑިޒައިން އެކުލެވޭ ގޮތަށް ބިނާކުރެވިފައިވާ ޚަބަރު މަންސައެކެވެ.
          </p>

          <h2 id="policy" className="text-xl font-bold text-[#123B3A] pt-4 border-t border-[#DCE4DF]">
            އެޑިޓޯރިއަލް ސިޔާސަތު
          </h2>
          <p>
            އަޅުގަނޑުމެންގެ އެންމެ އިސް ވާޖިބަކީ ކިޔުންތެރިންނަށް ޞައްޙަ، އިތުބާރު ހުރި، އަދި ވަކިފަރާތަކަށް ނުޖެހޭ ޚަބަރު ފޯރުކޮށްދިނުމެވެ. ޚަބަރުގެ މަސްދަރުތައް ސާފުކޮށް ބަޔާންކުރުމަށާއި، ކުށެއް ޖެހިއްޖެނަމަ ހާމަކަން ބޮޑު ގޮތެއްގައި އިޞްލާޙް ގެނައުމަށް އަޅުގަނޑުމެން އިލްތިޒާމުވަމެވެ.
          </p>

          <h2 id="contact" className="text-xl font-bold text-[#123B3A] pt-4 border-t border-[#DCE4DF]">
            ގުޅުއްވުމަށް
          </h2>
          <p>
            ޚަބަރާ ބެހޭ މަޢުލޫމާތާއި، ޚިޔާލު، އަދި އިޞްލާޙްތައް ހުށަހެޅުއްވުމަށް ނޫސް އިދާރާގެ ރަސްމީ މެއިލް އެޑްރެހަށް މެއިލް ކުރައްވާށެވެ.
          </p>

          <div className="pt-6 border-t border-[#DCE4DF] flex items-center justify-between">
            <Link href="/">
              <Button variant="secondary" size="md">
                ފުރަތަމަ ޞަފްޙާއަށް އެނބުރި ވަޑައިގަންނަވާ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
