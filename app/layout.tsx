import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const faruma = localFont({
  src: "../public/fonts/Faruma.ttf",
  variable: "--font-faruma",
  display: "swap",
});

const faseyha = localFont({
  src: "../public/fonts/Faseyha.ttf",
  variable: "--font-faseyha",
  display: "swap",
});

const notoSansThaana = localFont({
  src: [
    {
      path: "../public/fonts/NotoSansThaana-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/NotoSansThaana-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-noto-thaana",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { getBaseUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ކަނޑު އެޑިޓޯރިއަލް — Ocean Editorial | ދިވެހި ޑިޖިޓަލް ނޫސް",
    template: "%s | Ocean Editorial",
  },
  description:
    "ޒަމާނީ، ފެންވަރު ރަނގަޅު ދިވެހި ޑިޖިޓަލް ނޫސް. އިތުބާރު ހުރި ނޫސްވެރިކަމާއި، ވަގުތުން ގެނެސްދޭ ޚަބަރާއި ދިރާސީ ރިޕޯޓުތައް.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "ކަނޑު އެޑިޓޯރިއަލް — Ocean Editorial | ދިވެހި ޑިޖިޓަލް ނޫސް",
    description:
      "ޒަމާނީ، ފެންވަރު ރަނގަޅު ދިވެހި ޑިޖިޓަލް ނޫސް. އިތުބާރު ހުރި ނޫސްވެރިކަމާއި، ވަގުތުން ގެނެސްދޭ ޚަބަރާއި ދިރާސީ ރިޕޯޓުތައް.",
    url: baseUrl,
    siteName: "ކަނޑު އެޑިޓޯރިއަލް (Ocean Editorial)",
    type: "website",
    locale: "dv_MV",
  },
  twitter: {
    card: "summary_large_image",
    title: "ކަނޑު އެޑިޓޯރިއަލް — Ocean Editorial | ދިވެހި ޑިޖިޓަލް ނޫސް",
    description:
      "ޒަމާނީ، ފެންވަރު ރަނގަޅު ދިވެހި ޑިޖިޓަލް ނޫސް. އިތުބާރު ހުރި ނޫސްވެރިކަމާއި، ވަގުތުން ގެނެސްދޭ ޚަބަރާއި ދިރާސީ ރިޕޯޓުތައް.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsMediaOrganization",
        "@id": `${baseUrl}/#organization`,
        "name": "ކަނޑު އެޑިޓޯރިއަލް",
        "alternateName": "Ocean Editorial",
        "url": baseUrl,
        "description":
          "ޒަމާނީ ދިވެހި ނޫސްވެރިކަމުގެ މިނިވަން މަންސަ. ޞައްޙަ މަޢުލޫމާތާއި، އިތުބާރު ހުރި ޚަބަރު ފޯރުކޮށްދިނުން.",
        "sameAs": [
          "https://twitter.com/oceaneditorial",
          "https://facebook.com/oceaneditorial"
        ],
        "knowsLanguage": ["dv", "en"]
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "ކަނޑު އެޑިޓޯރިއަލް",
        "alternateName": "Ocean Editorial",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "inLanguage": "dv",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="dv" dir="rtl" className={`${faruma.variable} ${faseyha.variable} ${notoSansThaana.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#F7F7F2] text-[#182624] font-thaana antialiased selection:bg-[#0F766E]/20 selection:text-[#123B3A]">
        {/* Schema.org Organization and WebSite structured data */}
        <JsonLd data={siteJsonLd} />
        {/* Skip to Content for Screen Readers & Keyboard Users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 z-50 px-4 py-2 bg-[#123B3A] text-white rounded-[6px] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        >
          ދާން ބޭނުންވާ މައި ބަޔަށް ދިއުމަށް ފިއްތަވާ
        </a>

        {/* Global Editorial Header */}
        <SiteHeader />

        {/* Main Content Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>

        {/* Global Editorial Footer */}
        <SiteFooter />
      </body>
    </html>
  );
}
