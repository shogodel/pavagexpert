import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import { servicesList } from "@/lib/services-data";
import ContactPreview from "@/components/contact-preview";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.services_title,
    description: messages.seo?.services_desc,
    alternates: { canonical: `https://pavagexpert.space/${locale}/services`, languages: { "x-default": "/fr/services", fr: "/fr/services", en: "/en/services" } },
    openGraph: { title: messages.seo?.services_title, description: messages.seo?.services_desc },
    twitter: { title: messages.seo?.services_title, description: messages.seo?.services_desc },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return <></>;
  const messages = await getMessages(locale) as Record<string, unknown>;
  const t = (messages.services as Record<string, unknown>) || {};

  return (
    <>
      <div className="pt-28 pb-12 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">{t.title as string || "Nos Services"}</h1>
          <p className="mt-3 text-lg text-stone-300">{(t.subtitle as string) || ""}</p>
        </div>
      </div>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servicesList.map((service) => {
              const svc = t[service.id] as Record<string, string> | undefined;
              if (!svc) return null;
              return (
                <Link key={service.slug} href={`/${locale}/services/${service.slug}`}>
                  <div className="group bg-stone-50 rounded-xl p-6 hover:bg-stone-100 transition-colors border border-stone-200 hover:border-terracotta/30 h-full">
                    <div className="w-12 h-12 bg-terracotta/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-terracotta/20 transition-colors">
                      <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={service.icon} />
                      </svg>
                    </div>
                    <h2 className="font-semibold text-stone-800 mb-2 group-hover:text-terracotta transition-colors">{svc.title}</h2>
                    <p className="text-sm text-stone-500 leading-relaxed">{svc.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ContactPreview />
    </>
  );
}
