import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import GallerySection from "@/components/gallery-section";
import ContactPreview from "@/components/contact-preview";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.gallery_title,
    description: messages.seo?.gallery_desc,
    alternates: { canonical: `https://pavagexpert.space/${locale}/gallery`, languages: { "x-default": "/fr/gallery", fr: "/fr/gallery", en: "/en/gallery" } },
    openGraph: { title: messages.seo?.gallery_title, description: messages.seo?.gallery_desc },
    twitter: { title: messages.seo?.gallery_title, description: messages.seo?.gallery_desc },
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  void params;
  notFound();
}
