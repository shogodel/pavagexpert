import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import GallerySection from "@/components/gallery-section";

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
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const messages = await getMessages(locale);
  return (
    <>
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-stone-800">{messages.gallery?.title}</h1>
        </div>
      </div>
      <GallerySection />
    </>
  );
}
