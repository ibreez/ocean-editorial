import type { LiveCoverage } from "@/types/article";

/**
 * Editorial Demo Live Coverage Datasets
 * 
 * Boundary Note: This is pre-compiled editorial demo content for demonstration of
 * the live timeline architecture, timestamps, and RTL media formatting.
 * It does not connect to real-time WebSockets or polling services.
 */
export const demoLiveCoverages: LiveCoverage[] = [
  {
    id: "live-1",
    slug: "parliament-budget-session-live",
    title: "ރައްޔިތުންގެ މަޖިލީހުގެ ބަޖެޓު ބަހުސް — ވަގުތުން ގެނެސްދޭ ކަވަރޭޖް",
    summary:
      "ދަޢުލަތުގެ އަންނަ އަހަރުގެ ބަޖެޓު ކޮމިޓީ މަރުޙަލާގެ މުހިންމު ނިންމުންތަކާއި، މަޖިލީހުގެ ތަޅުމުގައި މެންބަރުން ކުރައްވާ ބަހުސްގެ އެންމެ ފަހުގެ މަޢުލޫމާތު ވަގުތުން ވަގުތަށް.",
    status: "live",
    startedAt: "2026-10-15T04:00:00.000Z",
    updatedAt: "2026-10-15T07:45:00.000Z",
    categorySlug: "majlis",
    categoryName: "މަޖިލިސް",
    image: {
      src: "https://picsum.photos/seed/ocean-parliament-live/1200/675",
      alt: "ރައްޔިތުންގެ މަޖިލީހުގެ ތަޅުމުގައި ބަޖެޓު ބަހުސް ކުރިއަށްދާ މަންޒަރު",
      caption: "މަޖިލީހުގެ މިއަދުގެ ޖަލްސާގައި މެންބަރުން ބަޖެޓަށް ބަހުސްކުރައްވަނީ.",
      credit: "ކަނޑު އެޑިޓޯރިއަލް / މަޖިލިސް މީޑިއާ",
    },
    updates: [
      {
        id: "update-4",
        timestamp: "2026-10-15T07:45:00.000Z",
        title: "ބަޖެޓު ދިރާސާކުރާ ކޮމިޓީގެ ރިޕޯޓު ތަޅުމަށް ހުށަހަޅައިފި",
        content:
          "ބަޖެޓު ކޮމިޓީގެ މުޤައްރިރު ވަނީ ކޮމިޓީން ގެނައި މައިގަނޑު އިޞްލާޙުތަކާއެކު ފައިނަލް ރިޕޯޓު މަޖިލީހުގެ ތަޅުމަށް އިއްވަވާފައެވެ. މި ރިޕޯޓުގައި ޞިއްޙީ ދާއިރާއާއި އަތޮޅުތަކުގެ ތަޢުލީމީ ފެންވަރު މަތިކުރުމަށް އިތުރު ٥٠ މިލިއަން ރުފިޔާ ކަނޑައެޅުމަށް ލަފާދީފައިވެއެވެ.",
        isImportant: true,
        authorName: "އަޙްމަދު ރިޟްވާން",
        tag: "މުހިންމު ނިންމުން",
        image: {
          src: "https://picsum.photos/seed/ocean-budget-report/1200/675",
          alt: "ކޮމިޓީ ރިޕޯޓު އިއްވަވާ މަންޒަރު",
          caption: "ކޮމިޓީގެ މުޤައްރިރު ރިޕޯޓު މަޖިލީހުގެ ތަޅުމަށް ހުށަހަޅުއްވަނީ.",
          credit: "މަޖިލިސް ޕީއާރު",
        },
      },
      {
        id: "update-3",
        timestamp: "2026-10-15T06:15:00.000Z",
        title: "އަތޮޅުތަކުގެ ތަރައްޤީގެ މަޝްރޫޢުތަކާ ގުޅޭގޮތުން މެންބަރުންގެ ސުވާލުތައް",
        content:
          "އުތުރާއި ދެކުނުގެ ރަށްރަށުގެ ބަނދަރު ހެދުމާއި، ފެނާއި ނަރުދަމާގެ މަޝްރޫޢުތައް ބަޖެޓުގައި ހިމެނިފައިވާ މިންވަރާ މެދު އެކި ދާއިރާތަކުގެ މެންބަރުން ވަނީ ޚިޔާލުފާޅުކުރައްވާފައެވެ. މާލީ ވަޒީރު ވަނީ މެންބަރުންގެ ސުވާލުތަކަށް ޖަވާބުދެއްވާނެ ކަމަށް ވިދާޅުވެފައެވެ.",
        isImportant: false,
        authorName: "ފާޠިމަތު ޝަފާ",
        tag: "ބަހުސް",
      },
      {
        id: "update-2",
        timestamp: "2026-10-15T05:30:00.000Z",
        title: "މަޖިލީހުގެ ރިޔާސަތުން ޖަލްސާ މެދުކަނޑާލުމަށްފަހު އަލުން ފަށައިފި",
        content:
          "ހެނދުނުގެ ކުރު މެދުކެނޑުމަކަށްފަހު، ރިޔާސަތުން ވަނީ މެންބަރުންނަށް ވާހަކަދެއްކެވުމުގެ ٥ މިނެޓުގެ ފުރުޞަތު ހުޅުވާލައްވާފައެވެ. ސިޔާސީ އެކި ޕާޓީތަކުން ބަޖެޓާ މެދު ދެކޭގޮތް މިހާރު ދަނީ ހާމަކުރަމުންނެވެ.",
        isImportant: false,
        authorName: "އަޙްމަދު ރިޟްވާން",
        tag: "ޖަލްސާ",
      },
      {
        id: "update-1",
        timestamp: "2026-10-15T04:00:00.000Z",
        title: "މަޖިލީހުގެ މިއަދުގެ ޖަލްސާ ފެށިއްޖެ",
        content:
          "ކަނޑައެޅިފައިވާ އެޖެންޑާއާ އެއްގޮތަށް މިއަދުގެ ޖަލްސާ ފެށިގެން ކުރިއަށްދާއިރު، ޖަލްސާގެ ކޯރަމް ހަމަވެފައިވާ ކަމަށް މަޖިލީހުގެ އަމީން ޢާއްމު އިޢުލާންކުރެއްވިއެވެ.",
        isImportant: true,
        authorName: "ފާޠިމަތު ޝަފާ",
        tag: "ފެށުން",
      },
    ],
  },
  {
    id: "live-2",
    slug: "saaff-championship-maldives-final-live",
    title: "ސާފް ޗެމްޕިއަންޝިޕް: ދިވެހިރާއްޖެ އަދި އިންޑިއާ — މެޗުގެ ވަގުތުން ކަވަރޭޖް",
    summary:
      "ސާފް ޗެމްޕިއަންޝިޕްގެ ފޯރިގަދަ ފައިނަލް މެޗުގައި ދިވެހިރާއްޖެއާއި އިންޑިއާ ބައްދަލުކުރި މެޗުގެ ފުރިހަމަ ކަވަރޭޖް.",
    status: "completed",
    startedAt: "2026-10-10T15:00:00.000Z",
    updatedAt: "2026-10-10T17:15:00.000Z",
    categorySlug: "sports",
    categoryName: "ކުޅިވަރު",
    image: {
      src: "https://picsum.photos/seed/ocean-saaff-cup/1200/675",
      alt: "ދިވެހި ޤައުމީ ޓީމު ކުޅުންތެރިން މެޗުގައި",
      caption: "ދިވެހި ޓީމުން ތަށި އުފުލާލި ތާރީޚީ މަންޒަރު.",
      credit: "ކުޅިވަރު ފޮޓޯގްރަފީ",
    },
    updates: [
      {
        id: "update-c3",
        timestamp: "2026-10-10T17:15:00.000Z",
        title: "މެޗު ނިމިއްޖެ: ދިވެހިރާއްޖެއަށް ތާރީޚީ ކާމިޔާބީއެއް!",
        content:
          "ފުރިހަމަ ވަގުތު ހަމަވިއިރު ދިވެހިރާއްޖެއިން ވަނީ 2-1 އިން އިންޑިއާ ބަލިކޮށް، ސާފް ޗެމްޕިއަންޝިޕްގެ ތަށި ކާމިޔާބުކޮށްފައެވެ. މުޅި ސްޓޭޑިއަމް ވަނީ ރަތާއި ފެހީގެ ކުލަތަކުން ފުރިފައެވެ.",
        isImportant: true,
        authorName: "ޢަލީ ނަޞީރު",
        tag: "ނިމުން",
        image: {
          src: "https://picsum.photos/seed/ocean-trophy-lift/1200/675",
          alt: "ދިވެހި ޓީމުން ތަށި އުފުލާލަނީ",
          caption: "ކެޕްޓަން ސާފް ތަށި އުފުލާލި ވަގުތު.",
          credit: "އެފްއޭއެމް މީޑިއާ",
        },
      },
      {
        id: "update-c2",
        timestamp: "2026-10-10T16:45:00.000Z",
        title: "ދިވެހި ޓީމުން ދެވަނަ ލަނޑު ޖަހައި ކުރިހޯދައިފި!",
        content:
          "ދެވަނަ ހާފުގެ ٧٨ ވަނަ މިނެޓުގައި ލިބުނު ފުރުޞަތެއްގައި އަލީ ފާސިރު ވަނީ ރީތި ބޯޅައެއް ގޯލުގެ ކަނަށް ވައްދާލައި، ދިވެހިރާއްޖެއަށް 2-1 އިން ކުރިހޯދައިދީފައެވެ.",
        isImportant: true,
        authorName: "ޢަލީ ނަޞީރު",
        tag: "ލަނޑު!",
      },
      {
        id: "update-c1",
        timestamp: "2026-10-10T15:50:00.000Z",
        title: "ފުރަތަމަ ހާފު އެއްވަރުވެގެން ނިމިއްޖެ",
        content:
          "ދެ ޓީމުގެ ފަރާތުންވެސް ވާދަވެރި އަދި ހަލުވި ކުޅުމެއް ފެނިގެންދިޔަ ފުރަތަމަ ހާފު ނިމުނީ 1-1 އިން އެއްވަރުވެގެންނެވެ.",
        isImportant: false,
        authorName: "ޢަލީ ނަޞީރު",
        tag: "ފުރަތަމަ ހާފު",
      },
    ],
  },
];

/**
 * Returns all live coverage events.
 */
export function getAllLiveCoverages(): LiveCoverage[] {
  return demoLiveCoverages;
}

/**
 * Retrieves a live coverage event by slug.
 */
export function getLiveCoverageBySlug(slug: string): LiveCoverage | undefined {
  return demoLiveCoverages.find((c) => c.slug === slug);
}

/**
 * Returns active live coverage events (status: "live").
 */
export function getActiveLiveCoverages(): LiveCoverage[] {
  return demoLiveCoverages.filter((c) => c.status === "live");
}

/**
 * Returns the primary active live coverage event, if one is currently active.
 */
export function getPrimaryActiveLiveCoverage(): LiveCoverage | undefined {
  return demoLiveCoverages.find((c) => c.status === "live");
}
