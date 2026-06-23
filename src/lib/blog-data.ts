export interface BlogArticle {
  title: string;
  desc: string;
  date: string;
  content: string[];
}

const articlesFR: Record<string, BlogArticle> = {
  "prix-pave-uni-montreal-2026": {
    title: "Prix du pavé uni à Montréal en 2026",
    desc: "Guide complet des coûts d'installation au m². Obtenez une estimation gratuite.",
    date: "2026-01-15",
    content: [
      "Le prix du pavé uni à Montréal en 2026 varie entre 15 $ et 35 $ le pied carré, selon le type de pavé, la superficie et la préparation requise. Ce guide vous aide à comprendre chaque facteur qui influence le coût final de votre projet.",
      "Les pavés de béton de base (type 'classique') coûtent généralement entre 15 $ et 20 $ le pi² installé. Les pavés vieillis ou texturés montent à 20 $-28 $/pi², tandis que les dalles ardoise ou les formats spéciaux peuvent atteindre 30 $-35 $/pi². Le choix du produit a donc un impact direct sur votre budget.",
      "La superficie joue aussi un rôle majeur. Un projet de 400 pi² coûtera plus cher au pied carré qu'un projet de 1 000 pi², car les coûts fixes (transport, mobilisation) sont répartis sur une plus petite surface. En règle générale, plus la surface est grande, plus le prix unitaire diminue.",
      "Le motif de pose influence également le prix. L'opus romain (pose en ligne) est le plus économique, tandis que les chevrons et le panier nécessitent plus de coupes et de main-d'œuvre, ce qui augmente le coût de 10 à 15 %. Pour les grandes surfaces, le motif en panier est idéal mais requiert un expert expérimenté.",
      "La préparation du terrain est l'étape la plus cruciale. Une excavation de 8 à 12 pouces, l'installation d'une fondation en pierre concassée compactée et le damproofing sont essentiels pour garantir la durabilité de votre pavé uni face aux cycles de gel-dégel québécois. Cette étape représente environ 30 à 40 % du coût total.",
      "Chez Pavagexpert, nous vous mettons en relation avec les meilleurs installateurs de pavé uni certifiés RBQ à Montréal, Laval et la Rive-Sud. <a href=\"/fr/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Obtenez votre estimation gratuite en 2 minutes</a> et recevez un devis personnalisé pour votre projet.",
    ],
  },
  "pave-uni-vs-asphalte": {
    title: "Pavé uni vs asphalte : lequel choisir ?",
    desc: "Comparatif durée, esthétique, entretien et prix. Faites le bon choix.",
    date: "2026-02-10",
    content: [
      "Le pavé uni et l'asphalte sont les deux options les plus populaires pour les entrées de garage et les stationnements à Montréal. Chacun a ses avantages selon votre budget, vos goûts et vos besoins à long terme. Voici un comparatif complet.",
      "Le pavé uni offre une durée de vie de 30 à 50 ans contre 15 à 20 ans pour l'asphalte. Bien que l'asphalte soit moins cher à l'installation (5 $ à 12 $/pi² contre 15 $ à 35 $/pi²), il nécessite un resurfaçage complet tous les 5 à 7 ans. À long terme, le pavé uni est souvent plus économique.",
      "L'entretien du pavé uni est simple : un nettoyage au jet d'eau deux fois par an et un sablage occasionnel des joints suffisent. L'asphalte, quant à lui, doit être scellé tous les 2 à 3 ans et réparé rapidement dès l'apparition de fissures pour éviter les dommages causés par l'eau et le gel.",
      "Sur le plan esthétique, le pavé uni offre une variété incomparable de couleurs, de motifs et de formats. Vous pouvez créer des bordures décoratives, des motifs géométriques et même intégrer des éléments paysagers. L'asphalte offre un look uniforme et classique, mais sans flexibilité de design.",
      "La réparation est un autre facteur important. Un pavé endommagé se remplace individuellement sans laisser de trace. Une fissure dans l'asphalte, si elle n'est pas traitée rapidement, s'aggrave et nécessite des réparations coûteuses. Pour une entrée de garage résidentielle à Montréal, le pavé uni est généralement recommandé.",
      "<a href=\"/fr/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Contactez Pavagexpert pour une estimation gratuite</a> et découvrez quelle solution convient le mieux à votre projet à Montréal, Laval ou la Rive-Sud.",
    ],
  },
  "entretien-pave-uni": {
    title: "Entretien du pavé uni : guide complet",
    desc: "Nettoyage, scellant, réparation : tout savoir pour protéger votre investissement.",
    date: "2026-03-05",
    content: [
      "Un entretien régulier prolonge considérablement la durée de vie de votre pavé uni et préserve son apparence. Ce guide couvre les gestes essentiels à poser chaque saison pour protéger votre investissement de 30 à 50 ans.",
      "Nettoyez votre pavé uni au jet d'eau deux fois par an : au printemps après la fonte des neiges et à l'automne avant l'hiver. Évitez le nettoyeur à pression trop puissant (plus de 1 500 PSI) qui pourrait endommager les joints. Un balai-brosse et un savon doux suffisent pour les taches courantes.",
      "Les joints de sable sont essentiels à la stabilité de votre pavé. Vérifiez-les chaque printemps et ajoutez du sable polymère si nécessaire. Le sable polymère durcit au contact de l'eau et empêche les mauvaises herbes et les insectes de s'installer entre les pavés.",
      "Un scellant peut être appliqué tous les 3 à 5 ans pour protéger la couleur des pavés contre les UV et faciliter le nettoyage. Choisissez un scellant adapté à votre type de pavé (perméable ou non) et appliquez-le par temps sec et doux, idéalement au printemps ou à l'automne.",
      "Si un pavé s'affaisse ou se fissure, remplacez-le rapidement pour éviter que le problème ne s'étende. Retirez le pavé endommagé avec un levier, ajustez la fondation si nécessaire, et installez un nouveau pavé. Pour les réparations importantes, faites appel à un professionnel.",
      "Vous avez un projet de pavé uni à Montréal, Laval ou la Rive-Sud ? <a href=\"/fr/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Obtenez une soumission gratuite dès maintenant</a> et nos experts certifiés RBQ vous conseilleront.",
    ],
  },
  "motifs-pose-pave-uni": {
    title: "Les motifs de pose de pavé uni",
    desc: "Opus romain, chevrons, panier : quel motif choisir pour votre projet ?",
    date: "2026-04-20",
    content: [
      "Le choix du motif de pose est l'une des décisions les plus importantes pour votre projet de pavé uni. Il influence à la fois l'esthétique et la résistance de votre surface. Voici les trois motifs les plus populaires à Montréal.",
      "L'opus romain (ou pose en ligne) est le motif classique : des pavés rectangulaires posés en lignes parallèles. C'est le plus économique et le plus rapide à installer. Il convient parfaitement aux allées de garage rectangulaires et aux terrasses de forme simple.",
      "Les chevrons (ou pose en chevrons) offrent une résistance latérale exceptionnelle, ce qui les rend idéaux pour les entrées de garage et les surfaces soumises à des charges lourdes. Les pavés sont posés à 45 degrés, créant un motif en V qui répartit la pression uniformément. Ce motif nécessite plus de coupes et donc un budget légèrement plus élevé.",
      "Le motif en panier (ou pose en panier) alterne des paires de pavés horizontaux et verticaux, créant un effet tressé élégant. Il est parfait pour les grandes surfaces comme les stationnements ou les patios spacieux. Ce motif offre une excellente stabilité et un rendu visuel sophistiqué.",
      "D'autres motifs existent : la pose en éventail (demi-cercle), la pose en damier, ou les motifs personnalisés avec bordures contrastantes. Votre choix dépendra de la forme de votre espace, de votre budget et du style architectural de votre maison.",
      "Chez Pavagexpert, nos installateurs certifiés RBQ maîtrisent tous les motifs de pose. <a href=\"/fr/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Demandez votre devis gratuit en ligne</a> et choisissez le motif qui transformera votre entrée ou votre terrasse.",
    ],
  },
};

const articlesEN: Record<string, BlogArticle> = {
  "prix-pave-uni-montreal-2026": {
    title: "Interlocking Paver Prices in Montreal 2026",
    desc: "Complete guide to installation costs per square foot. Get a free estimate.",
    date: "2026-01-15",
    content: [
      "Interlocking paver prices in Montreal in 2026 range from $15 to $35 per square foot, depending on paver type, area size, and site preparation. This guide breaks down every factor that affects your final project cost.",
      "Basic concrete pavers (classic style) typically cost $15 to $20 per sq ft installed. Tumbled or textured pavers range from $20 to $28 per sq ft, while premium slate or special-format stones can reach $30–$35 per sq ft. Your choice of product has a direct impact on your budget.",
      "Project size matters too. A 400 sq ft driveway costs more per square foot than a 1,000 sq ft project because fixed costs (delivery, mobilization) are spread over a smaller area. Generally, larger surfaces mean a lower unit price.",
      "The laying pattern also affects the price. Running bond (straight line) is the most economical, while herringbone and basket weave require more cuts and labor, adding 10–15% to the cost. For large surfaces, basket weave offers an elegant look but needs an experienced installer.",
      "Site preparation is the most critical step. Excavating 8 to 12 inches, installing a compacted granular base, and proper drainage are essential for withstanding Quebec's freeze-thaw cycles. This step accounts for roughly 30–40% of the total cost.",
      "At Pavagexpert, we connect you with the best RBQ-certified paver installers in Montreal, Laval, and the South Shore. <a href=\"/en/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Get your free estimate in 2 minutes</a> and receive a personalized quote for your project.",
    ],
  },
  "pave-uni-vs-asphalte": {
    title: "Pavers vs Asphalt: Which to Choose?",
    desc: "Comparison of durability, aesthetics, maintenance and price. Make the right choice.",
    date: "2026-02-10",
    content: [
      "Interlocking pavers and asphalt are the two most popular options for driveways and parking lots in Montreal. Each has its strengths depending on your budget, taste, and long-term needs. Here's a complete comparison.",
      "Interlocking pavers last 30 to 50 years compared to 15 to 20 years for asphalt. While asphalt is cheaper upfront ($5–$12 per sq ft vs $15–$35 per sq ft), it needs resurfacing every 5–7 years. Over the long term, pavers are often more cost-effective.",
      "Paver maintenance is simple: pressure wash twice a year and re-sand joints occasionally. Asphalt must be sealed every 2–3 years and cracks repaired quickly to prevent water damage and frost heaving during Montreal winters.",
      "Aesthetically, pavers offer unmatched variety in colors, patterns, and shapes. You can create decorative borders, geometric designs, and integrate landscape elements. Asphalt offers a clean, uniform look but no design flexibility.",
      "Repairs are another key factor. A damaged paver can be replaced individually with no trace. A crack in asphalt, if left untreated, worsens quickly and requires costly repairs. For residential driveways in Montreal, pavers are generally the recommended choice.",
      "<a href=\"/en/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Contact Pavagexpert for a free estimate</a> and find out which solution works best for your project in Montreal, Laval, or the South Shore.",
    ],
  },
  "entretien-pave-uni": {
    title: "Paver Maintenance: Complete Guide",
    desc: "Cleaning, sealing, repair: everything you need to protect your investment.",
    date: "2026-03-05",
    content: [
      "Regular maintenance dramatically extends the life of your interlocking pavers and keeps them looking great. This guide covers the essential seasonal tasks to protect your 30- to 50-year investment.",
      "Clean your pavers with a garden hose twice a year: in spring after snow melts and in fall before winter. Avoid pressure washers above 1,500 PSI, which can damage the joints. A stiff broom and mild detergent handle most stains.",
      "The sand joints are critical to paver stability. Check them every spring and top up with polymeric sand as needed. Polymeric sand hardens when wet, preventing weeds and insects from settling between the pavers.",
      "A sealant can be applied every 3 to 5 years to protect the paver color from UV rays and make cleaning easier. Choose a sealant suited to your paver type (permeable or not) and apply it in dry, mild weather — ideally spring or fall.",
      "If a paver sinks or cracks, replace it quickly to prevent the problem from spreading. Pry out the damaged paver with a lever, adjust the base if needed, and insert a new one. For major repairs, call a professional.",
      "Planning a paver project in Montreal, Laval, or the South Shore? <a href=\"/en/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Get a free quote right now</a> and our RBQ-certified experts will guide you.",
    ],
  },
  "motifs-pose-pave-uni": {
    title: "Interlocking Paver Patterns",
    desc: "Running bond, herringbone, basket weave: which pattern to choose?",
    date: "2026-04-20",
    content: [
      "Choosing your paver pattern is one of the most important decisions for your project. It affects both the look and the structural strength of your paved surface. Here are the three most popular patterns in Montreal.",
      "Running bond (straight line) is the classic pattern: rectangular pavers laid in parallel rows. It's the most economical and quickest to install. Ideal for rectangular driveways and simple patio shapes.",
      "Herringbone offers exceptional lateral resistance, making it perfect for driveways and surfaces bearing heavy loads. Pavers are laid at 45-degree angles, creating a V-pattern that distributes pressure evenly. This pattern requires more cuts and a slightly higher budget.",
      "Basket weave alternates horizontal and vertical pairs of pavers, creating an elegant braided effect. It's perfect for large surfaces like parking lots or spacious patios. This pattern offers excellent stability and a sophisticated visual finish.",
      "Other patterns exist: fan (semi-circle), checkerboard, or custom designs with contrasting borders. Your choice depends on your space shape, budget, and home's architectural style.",
      "At Pavagexpert, our RBQ-certified installers master all laying patterns. <a href=\"/en/get-quote\" class=\"text-terracotta font-semibold hover:underline\">Request your free quote online</a> and choose the pattern that will transform your driveway or patio.",
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
