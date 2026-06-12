const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Pavagexpert",
  url: "https://pavagexpert.space",
  telephone: "+15145551234",
  email: "info@pavagexpert.space",
  description: "Spécialiste en pavé uni à Montréal, Laval, Longueuil et tout le Grand Montréal. Installation d'entrées pavées, terrasses, sentiers et stationnements.",
  image: "https://pavagexpert.space/images/logo.svg",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Montréal",
    addressRegion: "QC",
    postalCode: "H3Z 2Y7",
    addressCountry: "CA",
  },
  areaServed: [
    { "@type": "City", name: "Montréal" },
    { "@type": "City", name: "Laval" },
    { "@type": "City", name: "Longueuil" },
    { "@type": "City", name: "Brossard" },
    { "@type": "City", name: "Repentigny" },
    { "@type": "City", name: "Terrebonne" },
    { "@type": "City", name: "Saint-Laurent" },
    { "@type": "City", name: "Kirkland" },
    { "@type": "City", name: "Dollard-Des-Ormeaux" },
  ],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "08:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "08:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "08:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "08:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "08:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "16:00" },
  ],
  sameAs: [
    "https://pavagexpert.space",
  ],
  priceRange: "$$",
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
