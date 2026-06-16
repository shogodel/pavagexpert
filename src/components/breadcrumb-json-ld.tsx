"use client";

import { usePathname } from "next/navigation";
import { servicesList } from "@/lib/services-data";

const defaultNames: Record<string, Record<string, string>> = {
  "": { fr: "Accueil", en: "Home" },
  services: { fr: "Services", en: "Services" },
  blog: { fr: "Blog", en: "Blog" },
  calculator: { fr: "Calculateur", en: "Calculator" },
  gallery: { fr: "Réalisations", en: "Portfolio" },
  "get-quote": { fr: "Soumission", en: "Estimate" },
  jobs: { fr: "Projets", en: "Projects" },
  "service-area": { fr: "Zones desservies", en: "Service Areas" },
  privacy: { fr: "Confidentialité", en: "Privacy" },
  terms: { fr: "Conditions", en: "Terms" },
  login: { fr: "Connexion", en: "Login" },
  apply: { fr: "Devenir entrepreneur", en: "Become a Contractor" },
  admin: { fr: "Administration", en: "Admin" },
  contractor: { fr: "Entrepreneur", en: "Contractor" },
  dashboard: { fr: "Tableau de bord", en: "Dashboard" },
  profile: { fr: "Profil", en: "Profile" },
};

const serviceSlugNames: Record<string, Record<string, string>> = {};
for (const s of servicesList) {
  serviceSlugNames[s.slug] = { fr: s.slug, en: s.slug };
}

export default function BreadcrumbJsonLd({ locale }: { locale: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1);

  const items = [{ name: defaultNames[""][locale] || "Home", item: `https://pavagexpert.space/${locale}` }];

  let currentPath = locale;
  for (const seg of segments) {
    currentPath += `/${seg}`;
    const name =
      defaultNames[seg]?.[locale] ||
      serviceSlugNames[seg]?.[locale] ||
      seg.replace(/-/g, " ");
    items.push({ name, item: `https://pavagexpert.space${currentPath}` });
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
