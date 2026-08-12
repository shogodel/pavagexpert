import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import { suburbs } from "@/lib/services-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.service_area_title,
    description: messages.seo?.service_area_desc,
    alternates: { canonical: `https://pavagexpert.space/${locale}/service-area`, languages: { "x-default": "/fr/service-area", fr: "/fr/service-area", en: "/en/service-area" } },
    openGraph: { title: messages.seo?.service_area_title, description: messages.seo?.service_area_desc },
    twitter: { title: messages.seo?.service_area_title, description: messages.seo?.service_area_desc },
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}

export default async function ServiceAreaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return <></>;
  const messages = await getMessages(locale);

  const isFr = locale === "fr";
  const title = isFr ? "Zones desservies" : "Service Areas";
  const subtitle = isFr
    ? "Pavagexpert dessert plus de 40 villes et quartiers du Grand Montréal. Trouvez un entrepreneur en pavé uni, asphalte ou béton près de chez vous."
    : "Pavagexpert serves 40+ cities and neighborhoods across Greater Montreal. Find an interlocking paver, asphalt or concrete contractor near you.";

  const groups = [
    { label: isFr ? "Île de Montréal" : "Island of Montreal", cities: ["Montréal", "Saint-Laurent", "Anjou", "Saint-Léonard", "Mont-Royal", "Outremont", "Hampstead", "Côte-Saint-Luc", "Westmount", "Montréal-Est", "Pointe-aux-Trembles", "Rivière-des-Prairies"] },
    { label: isFr ? "Laval" : "Laval", cities: ["Laval", "Sainte-Rose", "Fabreville", "Chomedey", "Duvernay", "Saint-Vincent-de-Paul", "Pont-Viau"] },
    { label: isFr ? "Rive-Sud (South Shore)" : "South Shore (Rive-Sud)", cities: ["Longueuil", "Brossard", "Boucherville", "Saint-Bruno", "Saint-Lambert", "Candiac", "La Prairie", "Châteauguay", "Mercier"] },
    { label: isFr ? "Rive-Nord (North Shore)" : "North Shore (Rive-Nord)", cities: ["Terrebonne", "Repentigny", "Boisbriand", "Blainville", "Sainte-Thérèse", "Rosemère", "Lorraine"] },
    { label: isFr ? "West Island" : "West Island", cities: ["Kirkland", "Dollard-Des-Ormeaux", "Pointe-Claire", "Beaconsfield", "Dorval", "Pierrefonds", "Roxboro", "Île-Bizard", "Sainte-Geneviève"] },
    { label: isFr ? "Vaudreuil-Soulanges" : "Vaudreuil-Soulanges", cities: ["Vaudreuil-Dorion", "Rigaud"] },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="pt-28 pb-12 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold">{title}</h1>
          <p className="mt-3 text-lg text-stone-300 max-w-2xl mx-auto">{subtitle}</p>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group) => (
              <div key={group.label} className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                <h2 className="font-heading font-semibold text-lg text-stone-800 mb-4">{group.label}</h2>
                <ul className="space-y-2">
                  {group.cities.map((city) => (
                    <li key={city} className="flex items-center gap-2 text-stone-600">
                      <svg className="w-4 h-4 text-stone-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
