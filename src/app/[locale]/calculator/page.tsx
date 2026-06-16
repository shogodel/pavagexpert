import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import Calculator from "@/components/calculator";
import ContactPreview from "@/components/contact-preview";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.calculator_title,
    description: messages.seo?.calculator_desc,
    alternates: { canonical: `https://pavagexpert.space/${locale}/calculator`, languages: { "x-default": "/fr/calculator", fr: "/fr/calculator", en: "/en/calculator" } },
    openGraph: { title: messages.seo?.calculator_title, description: messages.seo?.calculator_desc },
    twitter: { title: messages.seo?.calculator_title, description: messages.seo?.calculator_desc },
  };
}

export default function CalculatorPage() {
  return (
    <>
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Calculateur</h1>
        </div>
      </div>
      <Calculator />
      <ContactPreview />
    </>
  );
}
