export interface BlogArticle {
  title: string;
  desc: string;
  date: string;
  content: string[];
}

const articlesFR: Record<string, BlogArticle> = {
  "prix-pave-uni-montreal-2026": {
    title: "Prix du pav├⌐ uni ├á Montr├⌐al en 2026",
    desc: "Guide complet des co├╗ts d'installation au m┬▓.",
    date: "2026-01-15",
    content: [
      "Le prix du pav├⌐ uni ├á Montr├⌐al en 2026 varie entre 15 $ et 35 $ le pied carr├⌐, selon le type de pav├⌐, la superficie et la pr├⌐paration requise.",
      "Les principaux facteurs qui influencent le co├╗t sont : la surface ├á couvrir, le motif choisi, l'acc├¿s au site et les travaux de fondation n├⌐cessaires.",
      "Contactez Pavagexpert pour une estimation personnalis├⌐e gratuite pour votre projet ├á Montr├⌐al, Laval ou la Rive-Sud.",
    ],
  },
  "pave-uni-vs-asphalte": {
    title: "Pav├⌐ uni vs asphalte : lequel choisir ?",
    desc: "Comparatif dur├⌐e, esth├⌐tique, entretien et prix.",
    date: "2026-02-10",
    content: [
      "Le pav├⌐ uni offre une dur├⌐e de vie de 30 ├á 50 ans contre 15 ├á 20 ans pour l'asphalte. Son entretien est simple : un nettoyage et un sablage occasionnels suffisent.",
      "L'asphalte est moins cher ├á l'installation mais n├⌐cessite un resurfa├ºage tous les 5 ├á 7 ans. ├Ç long terme, le pav├⌐ uni est plus ├⌐conomique.",
    ],
  },
  "entretien-pave-uni": {
    title: "Entretien du pav├⌐ uni : guide complet",
    desc: "Nettoyage, scellant, r├⌐paration : tout savoir.",
    date: "2026-03-05",
    content: [
      "Un entretien r├⌐gulier prolonge la vie de votre pav├⌐ uni. Nettoyez au jet d'eau 2 fois par an et v├⌐rifiez les joints.",
      "Le sablage annuel remplace le sable perdu dans les joints. Un scellant peut ├¬tre appliqu├⌐ tous les 3 ├á 5 ans pour prot├⌐ger la couleur.",
    ],
  },
  "motifs-pose-pave-uni": {
    title: "Les motifs de pose de pav├⌐ uni",
    desc: "Opus romain, chevrons, panier : quel motif choisir ?",
    date: "2026-04-20",
    content: [
      "Le choix du motif influence l'esth├⌐tique et la solidit├⌐ de votre pav├⌐. L'opus romain est intemporel, les chevrons offrent une excellente r├⌐sistance.",
      "Le motif en panier est id├⌐al pour les grandes surfaces. Consultez notre ├⌐quipe pour choisir le motif adapt├⌐ ├á votre projet.",
    ],
  },
};

const articlesEN: Record<string, BlogArticle> = {
  "prix-pave-uni-montreal-2026": {
    title: "Interlocking Paver Prices in Montreal 2026",
    desc: "Complete guide to installation costs per square foot.",
    date: "2026-01-15",
    content: [
      "Interlocking paver prices in Montreal in 2026 range from $15 to $35 per square foot, depending on paver type, area size, and site preparation.",
      "Key cost factors include: surface area, chosen pattern, site access, and required foundation work.",
      "Contact Pavagexpert for a free personalized estimate for your project in Montreal, Laval, or the South Shore.",
    ],
  },
  "pave-uni-vs-asphalte": {
    title: "Pavers vs Asphalt: Which to Choose?",
    desc: "Comparison of durability, aesthetics, maintenance and price.",
    date: "2026-02-10",
    content: [
      "Interlocking pavers last 30 to 50 years compared to 15 to 20 years for asphalt. Maintenance is simple: occasional cleaning and re-sanding.",
      "Asphalt is cheaper to install but needs resurfacing every 5 to 7 years. Long-term, pavers are more cost-effective.",
    ],
  },
  "entretien-pave-uni": {
    title: "Paver Maintenance: Complete Guide",
    desc: "Cleaning, sealing, repair: everything you need to know.",
    date: "2026-03-05",
    content: [
      "Regular maintenance extends your paver's lifespan. Pressure wash twice a year and check the joints.",
      "Annual re-sanding replaces lost joint sand. Sealant can be applied every 3 to 5 years to protect the color.",
    ],
  },
  "motifs-pose-pave-uni": {
    title: "Interlocking Paver Patterns",
    desc: "Roman opus, herringbone, basket weave: which pattern to choose?",
    date: "2026-04-20",
    content: [
      "The pattern affects both the look and strength of your pavers. Roman opus is timeless, herringbone offers excellent resistance.",
      "The basket weave pattern is ideal for large surfaces. Consult our team to choose the right pattern for your project.",
    ],
  },
};

export function getArticle(slug: string, locale: string): BlogArticle | null {
  const db = locale === "en" ? articlesEN : articlesFR;
  return db[slug] || null;
}

export function getAllSlugs(locale: string): string[] {
  const db = locale === "en" ? articlesEN : articlesFR;
  return Object.keys(db);
}
