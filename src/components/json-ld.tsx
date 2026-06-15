const descriptions: Record<string, string> = {
  fr: "Spécialiste en pavé uni à Montréal, Laval, Longueuil et tout le Grand Montréal. Installation d'entrées pavées, terrasses, sentiers et stationnements.",
  en: "Interlocking paver specialist in Montreal, Laval, Longueuil and all Greater Montreal. Driveway, patio, walkway and parking lot installation.",
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
};

export default function JsonLd({ locale = "fr" }: { locale?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Pavagexpert",
    url: "https://pavagexpert.space",
    telephone: "+15145551234",
    email: "info@pavagexpert.space",
    description: descriptions[locale] || descriptions.fr,
    image: "https://pavagexpert.space/images/logo.svg",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Montréal",
      addressRegion: "QC",
      postalCode: "H3Z 2Y7",
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
    sameAs: ["https://pavagexpert.space"],
    priceRange: "$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
