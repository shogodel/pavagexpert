import { notFound } from "next/navigation";
import { locales, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import DataRequestForm from "./form";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.data_request?.title || "Data Request",
    description: messages.data_request?.desc || "",
    alternates: {
      canonical: `https://pavagexpert.space/${locale}/data-request`,
    },
  };
}

export default async function DataRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages(locale);

  return (
    <div className="min-h-screen bg-stone-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">{messages.data_request?.title}</h1>
        <p className="text-stone-400 text-sm mb-8">{messages.data_request?.desc}</p>
        <DataRequestForm locale={locale} messages={messages} />
      </div>
    </div>
  );
}
