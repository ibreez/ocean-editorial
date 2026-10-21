import Link from "next/link";
import { Bdi } from "@/components/ui/bdi";
import { formatMvrCurrency, formatReadingTime, normalizeDhivehiPunctuation } from "@/lib/typography";
import { getCurrentDhivehiDateFormatted, formatDhivehiDateTime } from "@/lib/format-date";

export const metadata = {
  title: "Dhivehi Typography & RTL Test Suite | Ocean Editorial",
  description: "Comprehensive verification suite for Dhivehi Thaana typography, RTL alignment, and bidirectional text isolation.",
};

export default function TypographyTestPage() {
  const currentDate = getCurrentDhivehiDateFormatted();
  const testSampleDateTime = formatDhivehiDateTime("2026-10-13T10:30:00.000Z");

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Test Suite Banner */}
      <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-6 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE4DF] pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider font-latin mb-1">
              <span>PHASE 3 VERIFICATION SUITE</span>
              <span aria-hidden="true">·</span>
              <span>RTL & THAANA TEST</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#123B3A]">
              ދިވެހި ޓައިޕޮގްރަފީ އަދި ރައިޓް-ޓު-ލެފްޓް (RTL) ޓެސްޓު
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-[#0F766E] hover:underline"
          >
            ← އެނބުރި ފުރަތަމަ ޞަފްޙާއަށް
          </Link>
        </div>

        <p className="text-sm text-[#53635F] leading-relaxed max-w-3xl">
          މި ޞަފްޙާއަކީ ދިވެހި ތާނަ އަކުރުތަކުގެ ޝޭޕިންގ، ފޮންޓް ސްކޭލް، އަދި އިނގިރޭސި ލިޔުންތަކާއި އަދަދުތައް އެކުލެވޭ ބައި-ޑިރެކްޝަނަލް (BiDi) ލިޔުންތައް ރަނގަޅަށް ދައްކުވައިދޭތޯ ޔަޤީންކުރުމަށް ތައްޔާރުކުރެވިފައިވާ ޓެސްޓު މާޙައުލެކެވެ.
        </p>
      </div>

      {/* Section 1: Typography Scale Tokens (from design.md) */}
      <section className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-6 sm:p-8 mb-8 shadow-xs">
        <h2 className="text-lg font-bold text-[#123B3A] border-b border-[#DCE4DF] pb-3 mb-6 flex items-center justify-between">
          <span>1. ޓައިޕޮގްރަފީ ސްކޭލް ޓޯކަންތައް (Typography Scale Tokens)</span>
          <span className="text-xs font-latin font-normal text-[#687671]">Tokens 5xl → xs</span>
        </h2>

        <div className="space-y-6">
          {/* 5xl Hero */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.5xl (48px / 64px) — Desktop Hero Headline
            </span>
            <p className="font-size-5xl font-black text-[#123B3A]">
              އަތޮޅުތަކުގެ ٥٠ ރަށެއްގައި އިޔާދަކުރަނިވި ހަކަތައިގެ ބިޔަ މަޝްރޫޢެއް ފަށައިފި
            </p>
          </div>

          {/* 4xl Major */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.4xl (38px / 54px) — Major Editorial Headline
            </span>
            <p className="font-size-4xl font-extrabold text-[#182624]">
              ރައްޔިތުންގެ މަޖިލީހުގައި އަންނަ އަހަރުގެ ބަޖެޓުގެ ބަހުސް ފޯރިއާއެކު ކުރިއަށްދަނީ
            </p>
          </div>

          {/* 3xl Featured */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.3xl (30px / 44px) — Featured Article Heading
            </span>
            <p className="font-size-3xl font-bold text-[#182624]">
              ކަނޑުމަހުގެ މަސްވެރިކަން ދެމެހެއްޓެނިވި ގޮތުގައި ކުރިއެރުވުމަށް އައު އުޞޫލުތަކެއް
            </p>
          </div>

          {/* 2xl Section */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.2xl (24px / 38px) — Article Section Heading
            </span>
            <p className="font-size-2xl font-bold text-[#182624]">
              ދިވެހި ޕްރިމިއަރ ލީގު: ފަހު ވަގުތު ޖެހި ލަނޑުން މާޒިޔާއިން ކާމިޔާބީ ހޯދައިފި
            </p>
          </div>

          {/* xl Secondary */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.xl (20px / 33px) — Secondary Headline
            </span>
            <p className="font-size-xl font-bold text-[#182624]">
              ޤައުމީ ދާރުލްއާޘާރުގައި ތާނަ ކެލިގްރަފީގެ ޚާއްޞަ މައުރަޒެއް ހުޅުވައިފި
            </p>
          </div>

          {/* lg Featured Excerpt */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.lg (18px / 31px) — Featured Excerpt / Deck
            </span>
            <p className="font-size-lg text-[#53635F]">
              ތިމާވެއްޓާ ރައްޓެހި އިރުގެ އަލިން ހަކަތަ އުފައްދާ ނިޒާމުތައް ގާއިމުކުރުމަށް ސަރުކާރުން ބައިނަލްއަޤްވާމީ ފަންޑުތަކާ ގުޅިގެން ފެށި މަޝްރޫޢުން ތެލަށް ކުރާ ހޭދަ އެތައް ގުނައަކުން ކުޑަކުރެވޭނެ.
            </p>
          </div>

          {/* base Default Body */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.base (16px / 28px) — Default Body Text
            </span>
            <p className="font-size-base text-[#182624] leading-[28px]">
              ދިވެހިރާއްޖޭގެ ތިމާވެށި ހިމާޔަތްކުރުމަށާއި އިމްޕޯޓްކުރާ ތެލަށް ކުރާ ހޭދަ ކުޑަކުރުމުގެ މަޤްޞަދުގައި، އަތޮޅުތަކުގެ ٥٠ ރަށެއްގައި އިޔާދަކުރަނިވި ހަކަތަ ބޭނުންކުރަން ފެށުމުގެ ބޮޑު މަޝްރޫޢެއް ރަސްމީކޮށް މިއަދު އިފްތިތާޙްކޮށްފިއެވެ. މި މަޝްރޫޢުގެ ސަބަބުން ކަރަންޓުގެ އަގު ހެޔޮވެގެންދާނެއެވެ.
            </p>
          </div>

          {/* sm Captions */}
          <div className="border-b border-[#DCE4DF]/60 pb-5">
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.sm (14px / 22px) — Captions and Timestamps
            </span>
            <p className="font-size-sm text-[#53635F]">
              ހއ. ދިއްދޫގައި ގާއިމުކުރެވުނު އައު ހައިބްރިޑް ސޯލާ ޕަވަރ ސިސްޓަމް — ފޮޓޯ: ކަނޑު އެޑިޓޯރިއަލް / މީޑިއާ
            </p>
          </div>

          {/* xs Compact Metadata */}
          <div>
            <span className="text-[11px] font-latin font-bold text-[#0F766E] block mb-1">
              font.size.xs (12px / 18px) — Compact Metadata
            </span>
            <p className="font-size-xs text-[#687671]">
              <span>އަޙްމަދު ރިޟްވާން</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span className="tabular-nums">{testSampleDateTime}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>{formatReadingTime(4)}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Mixed Dhivehi + Latin Bidirectional Isolation Tests */}
      <section className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-6 sm:p-8 mb-8 shadow-xs">
        <h2 className="text-lg font-bold text-[#123B3A] border-b border-[#DCE4DF] pb-3 mb-6 flex items-center justify-between">
          <span>2. މިކްސްޑް-ލެންގުއޭޖް އަދި ބައިޑިރެކްޝަނަލް (BiDi) އައިސޮލޭޝަން</span>
          <span className="text-xs font-latin font-normal text-[#687671]">RTL + LTR Protection</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Proper Names & Organisations */}
          <div className="p-5 rounded-[8px] bg-[#EDF2EF] border border-[#DCE4DF]">
            <span className="text-xs font-bold text-[#0F766E] block mb-2">
              ހ. އިނގިރޭސި ނަންތަކާއި ޖަމްޢިއްޔާތައް (English Proper Names)
            </span>
            <p className="text-base text-[#182624] leading-relaxed mb-3">
              ދިވެހިރާއްޖޭގެ ރައީސުލްޖުމްހޫރިއްޔާ <Bdi>Dr. Mohamed Muizzu</Bdi> ބައިނަލްއަޤްވާމީ މޫސުމީ ސަމިޓް <Bdi>COP28 Summit</Bdi> ގައި ތަޤްރީރު ކުރައްވައިފިއެވެ.
            </p>
            <p className="text-xs text-[#53635F]">
              ރަނގަޅު ގޮތް: އިނގިރޭސި ނަންތައް &lt;Bdi&gt; އިން ބަންދުކުރެވިފައި ވުމުން ތާނަ ލިޔުމުގެ ތަރުތީބު ނުގެއްލޭ.
            </p>
          </div>

          {/* Card B: URLs, Codes & Protocols */}
          <div className="p-5 rounded-[8px] bg-[#EDF2EF] border border-[#DCE4DF]">
            <span className="text-xs font-bold text-[#0F766E] block mb-2">
              ށ. ވެބްސައިޓް ލިންކުތަކާއި ކޯޑު (URLs & Links)
            </span>
            <p className="text-base text-[#182624] leading-relaxed mb-3">
              އިތުރު މަޢުލޫމާތު ހޯއްދެވުމަށް <Bdi dir="ltr">https://oceaneditorial.mv/special-report</Bdi> އަށް ޒިޔާރަތް ކުރައްވާށެވެ.
            </p>
            <p className="text-xs text-[#53635F]">
              ރަނގަޅު ގޮތް: URL ގެ ސްލޭޝްތަކާއި ޕްރޮޓޮކޯލް ލެފްޓް-ޓު-ރައިޓް ތަރުތީބުން ދައްކުވައިދޭ.
            </p>
          </div>

          {/* Card C: Currency and Numeric Metrics */}
          <div className="p-5 rounded-[8px] bg-[#EDF2EF] border border-[#DCE4DF]">
            <span className="text-xs font-bold text-[#0F766E] block mb-2">
              ނ. އަދަދުތަކާއި ފައިސާގެ މިންވަރު (Numbers & Currency)
            </span>
            <p className="text-base text-[#182624] leading-relaxed mb-3">
              މި މަޝްރޫޢުގެ ޖުމްލަ ބަޖެޓަކީ <Bdi dir="ltr">{formatMvrCurrency(50000000)}</Bdi> (ނުވަތަ <Bdi dir="ltr">{formatMvrCurrency(50000000, { inDhivehi: false })}</Bdi>) އެވެ. އިޔާދަކުރަނިވި ހަކަތައިގެ ނިސްބަތް ވަނީ <Bdi dir="ltr">45%</Bdi> އަށް އިތުރުކުރެވިފައެވެ.
            </p>
            <p className="text-xs text-[#53635F]">
              ރަނގަޅު ގޮތް: ފައިސާގެ ނަންބަރުތަކާއި ޕަސެންޓޭޖް ނިޝާން ފުށުނާރާ.
            </p>
          </div>

          {/* Card D: Phone Numbers & Contact */}
          <div className="p-5 rounded-[8px] bg-[#EDF2EF] border border-[#DCE4DF]">
            <span className="text-xs font-bold text-[#0F766E] block mb-2">
              ރ. ފޯނު ނަންބަރާއި ގުޅޭނެ ގޮތް (Phone Numbers)
            </span>
            <p className="text-base text-[#182624] leading-relaxed mb-3">
              ނޫސް އިދާރާގެ ހޮޓްލައިން: <Bdi dir="ltr">+960 332-1234</Bdi> ނުވަތަ <Bdi dir="ltr">news@oceaneditorial.mv</Bdi> އަށް މެއިލް ކުރައްވާ.
            </p>
            <p className="text-xs text-[#53635F]">
              ރަނގަޅު ގޮތް: ކަންޓްރީ ކޯޑު (+) އަދި ޑޭޝްތައް ރަނގަޅު ތަނުގައި ހުރޭ.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Punctuation & Drop Cap */}
      <section className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-6 sm:p-8 mb-8 shadow-xs">
        <h2 className="text-lg font-bold text-[#123B3A] border-b border-[#DCE4DF] pb-3 mb-6">
          3. ދިވެހި ފިލި، އަކުރުގެ ޝޭޕިންގ އަދި ޑްރޮޕް-ކެޕް (Drop Cap & Punctuation)
        </h2>

        {/* Drop cap opening test */}
        <div className="reading-column mb-8">
          <span className="text-xs font-bold text-[#0F766E] block mb-2 font-latin">
            EDITORIAL DROP CAP SAMPLE
          </span>
          <p className="thaana-dropcap article-body-prose text-justify">
            ރާއްޖޭގެ ތާރީޚުގައި ވެސް ދެކެފައިނުވާ ފަދަ ބޮޑު ތަރައްޤީގެ ބަދަލުތަކެއް އަތޮޅުތަކުގެ ރަށްރަށަށް އަންނަން ފަށައިފިއެވެ. ކަރަންޓުގެ ޚިދުމަތް ޔަޤީންކުރުމާއި، ތިމާވެއްޓާ ރައްޓެހި ޖަޒީރާ ދިރިއުޅުމެއް ބިނާކުރުމަށް އެޅޭ ކޮންމެ ފިޔަވަޅަކީ ޤައުމުގެ މުސްތަޤްބަލް އުޖާލާކޮށްދޭނެ ކަމެކެވެ. މިއީ ހަމައެކަނި ޓެކްނޮލޮޖީގެ ކުރިއެރުމެއް ނޫނެވެ؛ މިއީ އިޖުތިމާޢީ އަދި އިޤްތިޞާދީ ޢަދުލުވެރިކަމަށް ވާސިލުވުމުގެ މަގެކެވެ.
          </p>
        </div>

        {/* Punctuation Normalization Demo */}
        <div className="border-t border-[#DCE4DF] pt-6">
          <span className="text-xs font-bold text-[#0F766E] block mb-3">
            ދިވެހި ޕަންކްޗުއޭޝަން ހަމަތައް (Proper Thaana Punctuation Normalization):
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#182624]">
            <li className="p-3 bg-[#EDF2EF] rounded-[6px]">
              <span className="font-bold text-[#123B3A] block mb-1">ދިވެހި ކޮމާ (،)</span>
              <span>{normalizeDhivehiPunctuation("ރާއްޖެ, ކަނޑު, އަދި ފަރުތައް")}</span>
            </li>
            <li className="p-3 bg-[#EDF2EF] rounded-[6px]">
              <span className="font-bold text-[#123B3A] block mb-1">ދިވެހި ސެމީކޯލަން (؛)</span>
              <span>{normalizeDhivehiPunctuation("އަޅުގަނޑުމެން މަސައްކަތްކުރީމެވެ; ނަތީޖާ ފެނުނެވެ")}</span>
            </li>
            <li className="p-3 bg-[#EDF2EF] rounded-[6px]">
              <span className="font-bold text-[#123B3A] block mb-1">ސުވާލު މާކު (؟)</span>
              <span>{normalizeDhivehiPunctuation("މި މަޝްރޫޢު ނިމޭނީ ކޮން އިރަކުން؟")}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 4: Font Diagnostics & Verified Status */}
      <section className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-6 shadow-xs">
        <h2 className="text-lg font-bold text-[#123B3A] mb-3">
          4. ފޮންޓް ލޯޑިންގ އަދި ޑައިގްނޯސްޓިކްސް (Font Diagnostics)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#53635F]">
          <div className="p-4 bg-[#EDF2EF] rounded-[8px]">
            <p className="font-bold text-[#123B3A] mb-1">Primary Thaana Body & Headlines</p>
            <p>Production Font: <code className="text-[#0F766E]">Faruma</code> (/fonts/Faruma.ttf, NCIT Maldives)</p>
            <p>Secondary & Display Font: <code className="text-[#0F766E]">Faseyha</code> (/fonts/Faseyha.ttf)</p>
            <p>Fallback Stack: <code className="text-[#0F766E]">&quot;A_Faseyha&quot;, &quot;MV Boli&quot;, system-ui, sans-serif</code></p>
            <p>Supported Weights: Regular (400) & Bold (700)</p>
          </div>
          <div className="p-4 bg-[#EDF2EF] rounded-[8px]">
            <p className="font-bold text-[#123B3A] mb-1">Website Name Brand Font</p>
            <p>Selected Font: <code className="text-[#0F766E]">Noto Sans Thaana</code> (Google Fonts / Self-hosted)</p>
            <p>Applied To: <code className="text-[#0F766E]">Site Masthead, Navigation Drawer, Footer Brand</code></p>
            <div className="mt-2 pt-2 border-t border-[#DCE4DF]">
              <span className="text-[11px] text-[#123B3A] font-semibold block mb-0.5">Live Masthead Brand Sample:</span>
              <span className="font-noto-thaana font-bold text-lg text-[#123B3A] block">ކަނޑު އެޑިޓޯރިއަލް</span>
            </div>
          </div>
          <div className="p-4 bg-[#EDF2EF] rounded-[8px]">
            <p className="font-bold text-[#123B3A] mb-1">Primary Latin Font</p>
            <p>Next.js Font Optimization: <code className="text-[#0F766E]">Inter</code> (Google Fonts)</p>
            <p>Fallback Stack: <code className="text-[#0F766E]">system-ui, -apple-system, sans-serif</code></p>
            <p>Tabular Figures: <code className="text-[#0F766E]">font-variant-numeric: tabular-nums</code></p>
          </div>
        </div>
      </section>
    </div>
  );
}
