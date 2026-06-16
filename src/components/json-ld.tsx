const descriptions: Record<string, string> = {
  fr: "Spécialiste en pavé uni, asphalte, béton, excavation, murs de soutènement, aménagement paysager, tourbe et drainage à Montréal, Laval, Longueuil, Rive-Sud, Rive-Nord, West Island et tout le Grand Montréal.",
  en: "Interlocking paver, asphalt, concrete, excavation, retaining wall, landscaping, turf and drainage specialist in Montreal, Laval, Longueuil, South Shore, North Shore, West Island and all Greater Montreal. Paving contractor near you.",
};

const cityNames: Record<string, string> = {
  Montréal: "Montréal",
  Laval: "Laval",
  Longueuil: "Longueuil",
  Brossard: "Brossard",
  Repentigny: "Repentigny",
  Terrebonne: "Terrebonne",
  "Saint-Laurent": "Saint-Laurent",
  Kirkland: "Kirkland",
  "Dollard-Des-Ormeaux": "Dollard-Des-Ormeaux",
  "Pointe-Claire": "Pointe-Claire",
  Beaconsfield: "Beaconsfield",
  Dorval: "Dorval",
  Pierrefonds: "Pierrefonds",
  Roxboro: "Roxboro",
  "Île-Bizard": "Île-Bizard",
  "Sainte-Geneviève": "Sainte-Geneviève",
  Boisbriand: "Boisbriand",
  Blainville: "Blainville",
  "Sainte-Thérèse": "Sainte-Thérèse",
  Rosemère: "Rosemère",
  Lorraine: "Lorraine",
  Boucherville: "Boucherville",
  "Saint-Bruno": "Saint-Bruno",
  "Saint-Lambert": "Saint-Lambert",
  Candiac: "Candiac",
  "La Prairie": "La Prairie",
  Châteauguay: "Châteauguay",
  Mercier: "Mercier",
  "Vaudreuil-Dorion": "Vaudreuil-Dorion",
  Rigaud: "Rigaud",
  "Montréal-Est": "Montréal-Est",
  "Pointe-aux-Trembles": "Pointe-aux-Trembles",
  "Rivière-des-Prairies": "Rivière-des-Prairies",
  Anjou: "Anjou",
  "Saint-Léonard": "Saint-Léonard",
  "Mont-Royal": "Mont-Royal",
  Outremont: "Outremont",
  Hampstead: "Hampstead",
  "Côte-Saint-Luc": "Côte-Saint-Luc",
  Westmount: "Westmount",
};

export default function JsonLd({ locale = "fr" }: { locale?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Pavagexpert",
    alternateName: locale === "fr" ? "Pavagexpert — Pavé Uni | Asphalte | Béton" : "Pavagexpert — Interlocking Pavers | Asphalt | Concrete",
    url: "https://pavagexpert.space",
    telephone: "+15142431580",
    email: "pavagexpertmtl@gmail.com",
    description: descriptions[locale] || descriptions.fr,
    image: "https://pavagexpert.space/images/logo.svg",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Laval",
      addressRegion: "QC",
      postalCode: "H7N 2C2",
      addressCountry: "CA",
    },
    areaServed: Object.values(cityNames).map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "16:00" },
    ],
    priceRange: "$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
