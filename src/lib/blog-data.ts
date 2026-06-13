export interface BlogArticle {
  title: string;
  desc: string;
  content: string[];
}

const articlesFR: Record<string, BlogArticle> = {
  "prix-pave-uni-montreal-2026": {
    title: "Prix du pavé uni à Montréal en 2026",
    desc: "Guide complet des coûts d'installation au m².",
    content: [
      "Le prix du pavé uni à Montréal en 2026 varie entre 15 $ et 35 $ le pied carré, selon le type de pavé, la superficie et la préparation requise.",
      "Les principaux facteurs qui influencent le coût sont : la surface à couvrir, le motif choisi, l'accès au site et les travaux de fondation nécessaires.",
      "Contactez Pavagexpert pour une estimation personnalisée gratuite pour votre projet à Montréal, Laval ou la Rive-Sud.",
    ],
  },
  "pave-uni-vs-asphalte": {
    title: "Pavé uni vs asphalte : lequel choisir ?",
    desc: "Comparatif durée, esthétique, entretien et prix.",
    content: [
      "Le pavé uni offre une durée de vie de 30 à 50 ans contre 15 à 20 ans pour l'asphalte. Son entretien est simple : un nettoyage et un sablage occasionnels suffisent.",
      "L'asphalte est moins cher à l'installation mais nécessite un resurfaçage tous les 5 à 7 ans. À long terme, le pavé uni est plus économique.",
    ],
  },
  "entretien-pave-uni": {
    title: "Entretien du pavé uni : guide complet",
    desc: "Nettoyage, scellant, réparation : tout savoir.",
    content: [
      "Un entretien régulier prolonge la vie de votre pavé uni. Nettoyez au jet d'eau 2 fois par an et vérifiez les joints.",
      "Le sablage annuel remplace le sable perdu dans les joints. Un scellant peut être appliqué tous les 3 à 5 ans pour protéger la couleur.",
    ],
  },
  "motifs-pose-pave-uni": {
    title: "Les motifs de pose de pavé uni",
    desc: "Opus romain, chevrons, panier : quel motif choisir ?",
    content: [
      "Le choix du motif influence l'esthétique et la solidité de votre pavé. L'opus romain est intemporel, les chevrons offrent une excellente résistance.",
      "Le motif en panier est idéal pour les grandes surfaces. Consultez notre équipe pour choisir le motif adapté à votre projet.",
    ],
  },
};

const articlesEN: Record<string, BlogArticle> = {
  "prix-pave-uni-montreal-2026": {
    title: "Interlocking Paver Prices in Montreal 2026",
    desc: "Complete guide to installation costs per square foot.",
    content: [
      "Interlocking paver prices in Montreal in 2026 range from $15 to $35 per square foot, depending on paver type, area size, and site preparation.",
      "Key cost factors include: surface area, chosen pattern, site access, and required foundation work.",
      "Contact Pavagexpert for a free personalized estimate for your project in Montreal, Laval, or the South Shore.",
    ],
  },
  "pave-uni-vs-asphalte": {
    title: "Pavers vs Asphalt: Which to Choose?",
    desc: "Comparison of durability, aesthetics, maintenance and price.",
    content: [
      "Interlocking pavers last 30 to 50 years compared to 15 to 20 years for asphalt. Maintenance is simple: occasional cleaning and re-sanding.",
      "Asphalt is cheaper to install but needs resurfacing every 5 to 7 years. Long-term, pavers are more cost-effective.",
    ],
  },
  "entretien-pave-uni": {
    title: "Paver Maintenance: Complete Guide",
    desc: "Cleaning, sealing, repair: everything you need to know.",
    content: [
      "Regular maintenance extends your paver's lifespan. Pressure wash twice a year and check the joints.",
      "Annual re-sanding replaces lost joint sand. Sealant can be applied every 3 to 5 years to protect the color.",
    ],
  },
  "motifs-pose-pave-uni": {
    title: "Interlocking Paver Patterns",
    desc: "Roman opus, herringbone, basket weave: which pattern to choose?",
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
