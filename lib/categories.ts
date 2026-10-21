import type { Category } from "@/types/article";

export const categories: Category[] = [
  {
    id: "cat-1",
    slug: "maldives",
    name: "ރާއްޖެ",
    englishName: "Maldives",
    description: "ދިވެހިރާއްޖޭގެ އެކި ކަންކޮޅުތަކުން އެންމެ ފަހުގެ ޚަބަރުތަކާއި ރަށްރަށުގެ ދިރިއުޅުން",
    order: 1,
  },
  {
    id: "cat-2",
    slug: "politics",
    name: "ސިޔާސީ",
    englishName: "Politics",
    description: "ރައްޔިތުންގެ މަޖިލިސް، ސަރުކާރު އަދި ސިޔާސީ ޕާޓީތަކުގެ ހަރަކާތްތަކާއި ދިރާސާތައް",
    order: 2,
  },
  {
    id: "cat-3",
    slug: "economy",
    name: "އިޤްތިޞާދު",
    englishName: "Economy",
    description: "ފަތުރުވެރިކަން، މަސްވެރިކަން، ވިޔަފާރި އަދި މާލީ މާކެޓްތަކުގެ ޚަބަރުތައް",
    order: 3,
  },
  {
    id: "cat-4",
    slug: "sports",
    name: "ކުޅިވަރު",
    englishName: "Sports",
    description: "ދިވެހި ފުޓްބޯޅަ، ޤައުމީ މުބާރާތްތައް އަދި ބައިނަލްއަޤްވާމީ ކުޅިވަރުގެ ފަހުގެ މައުލޫމާތު",
    order: 4,
  },
  {
    id: "cat-5",
    slug: "culture",
    name: "ޘަޤާފަތް",
    englishName: "Culture",
    description: "ދިވެހި ބަސް، ތާރީޚު، ފަންނުވެރިކަން އަދި އަދަބިއްޔާތުގެ ދިރާސާތަކާއި މަޒުމޫނު",
    order: 5,
  },
  {
    id: "cat-6",
    slug: "world",
    name: "ދުނިޔެ",
    englishName: "World",
    description: "ބައިނަލްއަޤްވާމީ ސިޔާސަތާއި ދުނިޔޭގެ މުހިންމު ހާދިސާތައް",
    order: 6,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllCategories(): Category[] {
  return categories;
}
