import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#123B3A] text-white border-t border-[#0F766E]/40 mt-16 pt-12 pb-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Top footer row: brand and navigation columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold font-noto-thaana text-white tracking-normal">
                {siteConfig.dhivehiName}
              </h2>
              <p className="text-xs font-latin tracking-wider uppercase text-white/60 font-semibold">
                {siteConfig.name}
              </p>
            </Link>
            <p className="text-xs text-white/75 leading-relaxed pt-1">
              ޒަމާނީ ދިވެހި ނޫސްވެރިކަމުގެ މިނިވަން މަންސަ. ޞައްޙަ މަޢުލޫމާތާއި، އިތުބާރު ހުރި ޚަބަރު ފޯރުކޮށްދިނުމަށް އަޅުގަނޑުމެން އިސްކަންދެމެވެ.
            </p>

            {/* Social Placeholder Strip (Neutral accessible links) */}
            <div className="pt-2">
              <span className="text-[11px] text-white/60 block mb-2 font-medium">
                ސޯޝަލް މީޑިއާ
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="#social-x"
                  aria-label="އެކްސް (ޓްވިޓަރ)"
                  className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-[6px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="font-bold font-latin">X</span>
                </a>
                <a
                  href="#social-fb"
                  aria-label="ފޭސްބުކް"
                  className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-[6px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="font-bold font-latin">fb</span>
                </a>
                <a
                  href="#social-tg"
                  aria-label="ޓެލެގްރާމް"
                  className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-[6px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="font-bold font-latin">tg</span>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          {siteConfig.footerNav.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-sm font-bold text-white/90 pb-1 border-b border-white/10">
                {col.title}
              </h3>
              <ul className="space-y-2 text-xs">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors block py-1.5 focus-visible:outline-none focus-visible:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row: disclaimer, copyright & back-to-top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>
            © {currentYear} <span className="font-noto-thaana font-bold">{siteConfig.dhivehiName}</span> ({siteConfig.name}). ހުރިހާ ޙައްޤެއް ރައްކާތެރިކުރެވިފައި.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:underline">
              ޕްރައިވެސީ ސިޔާސަތު
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/about" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:underline">
              އެޑިޓޯރިއަލް ގައިޑްލައިން
            </Link>
            <span aria-hidden="true">·</span>
            <a
              href="#main-content"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors px-3 py-1.5 min-h-[36px] rounded-[6px] bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>މައްޗަށް</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
