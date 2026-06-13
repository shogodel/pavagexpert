import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import ServicesSection from "@/components/services-section";
import ContactPreview from "@/components/contact-preview";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.services_title,
    description: messages.seo?.services_desc,
    alternates: { languages: { "x-default": "/fr/services", fr: "/fr/services", en: "/en/services" } },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return <></>;
  const messages = await getMessages(locale);
  return (
    <>
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">{messages.services?.title || "Nos Services"}</h1>
        </div>
      </div>
      <ServicesSection />
      <ContactPreview />
    </>
  );
}
