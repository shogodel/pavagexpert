import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import { servicesList } from "@/lib/services-data";
import Link from "next/link";
import ContactPreview from "@/components/contact-preview";
import type { Metadata } from "next";
import ServiceJsonLd from "@/components/service-json-ld";

const slugToId: Record<string, string> = {};
for (const s of servicesList) slugToId[s.slug] = s.id;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale) as Record<string, unknown>;
  const id = slugToId[slug];
  if (!id) return {};
  const seo = messages.seo as Record<string, string> | undefined;
  const seoKey = `services_${id}_title`;
  const seoDescKey = `services_${id}_desc`;
  return {
    title: seo?.[seoKey] || `Pavagexpert | ${slug}`,
    description: seo?.[seoDescKey] || "",
    alternates: { canonical: `https://pavagexpert.space/${locale}/services/${slug}`, languages: { "x-default": `/fr/services/${slug}`, fr: `/fr/services/${slug}`, en: `/en/services/${slug}` } },
    openGraph: { title: seo?.[seoKey], description: seo?.[seoDescKey] },
    twitter: { title: seo?.[seoKey], description: seo?.[seoDescKey] },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return notFound();
  const messages = await getMessages(locale);
  const id = slugToId[slug];
  if (!id) return notFound();
  const service = (messages.services as Record<string, unknown>)[id] as Record<string, string> | undefined;
  if (!service) return notFound();

  const t = (messages.nav as Record<string, string>) || {};
  const seo = (messages.seo as Record<string, string>) || {};
  const seoKey = `services_${id}_title` as string;
  const seoDescKey = `services_${id}_desc` as string;

  const subservices = [
    { key: "asphalt", slug: "asphalt" },
    { key: "pavers", slug: "pavers" },
    { key: "concrete", slug: "concrete" },
    { key: "excavation", slug: "excavation" },
    { key: "retaining_walls", slug: "retaining-walls" },
    { key: "landscaping", slug: "landscaping" },
    { key: "turf", slug: "turf" },
    { key: "drainage", slug: "drainage" },
  ];

  return (
    <>
      <ServiceJsonLd
        name={seo[seoKey] || service.title}
        description={seo[seoDescKey] || service.content || service.desc}
        url={`https://pavagexpert.space/${locale}/services/${slug}`}
      />
      <div className="pt-28 pb-12 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Link
              href={`/${locale}/services`}
              className="text-stone-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {t.all_services || "All Services"}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{service.title}</h1>
            <p className="mt-4 text-lg text-stone-300 leading-relaxed">{service.content}</p>
          </div>
        </div>
      </div>

      <div className="py-12 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">{t.all_services || "All Services"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subservices.filter((s) => s.slug !== slug).map((s) => {
              const svc = (messages.services as Record<string, unknown>)[s.key] as Record<string, string> | undefined;
              if (!svc) return null;
              return (
                <Link
                  key={s.slug}
                  href={`/${locale}/services/${s.slug}`}
                  className="bg-white rounded-lg px-4 py-3 text-sm font-medium text-stone-700 hover:text-terracotta hover:border-terracotta/30 border border-stone-200 transition-colors text-center"
                >
                  {svc.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <ContactPreview />
    </>
  );
}
