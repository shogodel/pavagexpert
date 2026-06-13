import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import GetQuoteForm from "./form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.get_quote_title,
    description: messages.seo?.get_quote_desc,
    alternates: { languages: { "x-default": "/fr/get-quote", fr: "/fr/get-quote", en: "/en/get-quote" } },
  };
}

export default function ContactPage() {
  return <GetQuoteForm />;
}
