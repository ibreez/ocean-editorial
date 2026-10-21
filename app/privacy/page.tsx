import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

import type { Metadata } from "next";
import { getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "ޕްރައިވެސީ ސިޔާސަތު | Privacy Policy",
  description: "ކަނޑު އެޑިޓޯރިއަލްގެ ޒާތީ މަޢުލޫމާތު ރައްކާތެރިކުރުމުގެ ސިޔާސަތު އަދި ޑޭޓާ ރައްކާތެރިކަން.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "ޕްރައިވެސީ ސިޔާސަތު | Privacy Policy — Ocean Editorial",
    description: "ކަނޑު އެޑިޓޯރިއަލްގެ ޒާތީ މަޢުލޫމާތު ރައްކާތެރިކުރުމުގެ ސިޔާސަތު އަދި ޑޭޓާ ރައްކާތެރިކަން.",
    url: getAbsoluteUrl("/privacy"),
    type: "website",
    locale: "dv_MV",
  },
  twitter: {
    card: "summary",
    title: "ޕްރައިވެސީ ސިޔާސަތު | Privacy Policy — Ocean Editorial",
    description: "ކަނޑު އެޑިޓޯރިއަލްގެ ޒާތީ މަޢުލޫމާތު ރައްކާތެރިކުރުމުގެ ސިޔާސަތު އަދި ޑޭޓާ ރައްކާތެރިކަން.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="reading-column bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-6 sm:p-10 shadow-xs">
        <div className="border-b border-[#DCE4DF] pb-6 mb-8">
          <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider font-latin block mb-1">
            LEGAL & PRIVACY
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#123B3A]">
            ޕްރައިވެސީ ސިޔާސަތު
          </h1>
          <p className="text-sm text-[#53635F] mt-2">
            {siteConfig.dhivehiName} — ޒާތީ މަޢުލޫމާތު ރައްކާތެރިކުރުމުގެ އުޞޫލުތައް
          </p>
        </div>

        <div className="space-y-6 text-[#182624] leading-relaxed text-base">
          <p>
            ކަނޑު އެޑިޓޯރިއަލް އިން ކިޔުންތެރިންގެ ޕްރައިވެސީއަށް ފުރިހަމައަށް އިޙްތިރާމްކުރަމެވެ. އަޅުގަނޑުމެންގެ ވެބްސައިޓް ބޭނުންކުރެއްވުމުގައި ތިޔަބޭފުޅުންގެ ޒާތީ އެއްވެސް މަޢުލޫމާތެއް ތިންވަނަ ފަރާތަކަށް ނުވިއްކާނެއެވެ.
          </p>

          <h2 className="text-xl font-bold text-[#123B3A] pt-4 border-t border-[#DCE4DF]">
            ކޫކީޒް އަދި ލޯކަލް ސްޓޯރޭޖް
          </h2>
          <p>
            ޚަބަރު ރައްކާކުރުމުގެ ޚިދުމަތް (Bookmark / Save feature) ފޯރުކޮށްދިނުމަށް އަޅުގަނޑުމެން ބޭނުންކުރަނީ ތިޔަބޭފުޅާގެ ބްރައުޒަރގެ ލޯކަލް ސްޓޯރޭޖެވެ. މިއީ ތިޔަބޭފުޅާގެ ޑިވައިސްގައި އެކަނި ރައްކާކުރެވޭ މަޢުލޫމާތެކެވެ.
          </p>

          <div className="pt-6 border-t border-[#DCE4DF]">
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
