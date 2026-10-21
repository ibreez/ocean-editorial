export interface SiteConfig {
  name: string;
  dhivehiName: string;
  tagline: string;
  dhivehiTagline: string;
  description: string;
  url: string;
  locale: string;
  direction: "rtl" | "ltr";
  primaryNav: Array<{
    slug: string;
    label: string;
    englishLabel: string;
    href: string;
  }>;
  footerNav: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
}

export const siteConfig: SiteConfig = {
  name: "Ocean Editorial",
  dhivehiName: "ކަނޑު އެޑިޓޯރިއަލް",
  tagline: "Contemporary Maldivian Journalism",
  dhivehiTagline: "ޒަމާނީ ދިވެހި ނޫސްވެރިކަން",
  description: "A modern, mobile-first Dhivehi digital news platform for the Maldives with contemporary editorial design and right-to-left typography.",
  url: "https://oceaneditorial.mv",
  locale: "dv-MV",
  direction: "rtl",
  primaryNav: [
    { slug: "maldives", label: "ރާއްޖެ", englishLabel: "Maldives", href: "/category/maldives" },
    { slug: "politics", label: "ސިޔާސީ", englishLabel: "Politics", href: "/category/politics" },
    { slug: "economy", label: "އިޤްތިޞާދު", englishLabel: "Economy", href: "/category/economy" },
    { slug: "sports", label: "ކުޅިވަރު", englishLabel: "Sports", href: "/category/sports" },
    { slug: "culture", label: "ޘަޤާފަތް", englishLabel: "Culture", href: "/category/culture" },
    { slug: "world", label: "ދުނިޔެ", englishLabel: "World", href: "/category/world" },
  ],
  footerNav: [
    {
      title: "ބައިތައް",
      links: [
        { label: "އެންމެ ފަހުގެ ޚަބަރު", href: "/latest" },
        { label: "ރާއްޖެ", href: "/category/maldives" },
        { label: "ސިޔާސީ", href: "/category/politics" },
        { label: "އިޤްތިޞާދު", href: "/category/economy" },
        { label: "ކުޅިވަރު", href: "/category/sports" },
        { label: "ޘަޤާފަތް", href: "/category/culture" },
        { label: "ދުނިޔެ", href: "/category/world" },
      ],
    },
    {
      title: "ނޫސް އިދާރާ",
      links: [
        { label: "ތަޢާރަފު", href: "/about" },
        { label: "އެޑިޓޯރިއަލް ސިޔާސަތު", href: "/about#policy" },
        { label: "ގުޅުއްވާ", href: "/about#contact" },
      ],
    },
    {
      title: "ޤާނޫނީ އަދި އިތުރު",
      links: [
        { label: "ޕްރައިވެސީ ސިޔާސަތު", href: "/privacy" },
        { label: "ރައްކާކުރި ޚަބަރުތައް", href: "/saved" },
        { label: "ހޯދާ", href: "/search" },
      ],
    },
  ],
};
