import type { Metadata } from "next";
import ApplyForm from "./form";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, defaultLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const messages = await getMessages(locale) as unknown as Record<string, Record<string, string>>;
  const title = messages.seo?.apply_title || "Become a Contractor | Pavagexpert";
  const description = messages.seo?.apply_desc || "";
  return {
    title,
    description,
    alternates: { canonical: `https://pavagexpert.space/${locale}/apply` },
    openGraph: { title, description, images: [{ url: "/images/icon-512.png" }] },
    twitter: { title, description },
  };
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const messages = await getMessages(locale);
  return <ApplyForm locale={locale} t={messages.apply} />;
}
