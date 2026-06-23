import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import Hero from "@/components/hero";
import SocialProof from "@/components/social-proof";
import TrustBadges from "@/components/trust-badges";
import ServicesSection from "@/components/services-section";
import HowItWorks from "@/components/how-it-works";
import Calculator from "@/components/calculator";
import ContactPreview from "@/components/contact-preview";
import BlogPreview from "@/components/blog-preview";
import { getArticle, getAllSlugs } from "@/lib/blog-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.home_title,
    description: messages.seo?.home_desc,
    alternates: { canonical: `https://pavagexpert.space/${locale}`, languages: { "x-default": "/fr", fr: "/fr", en: "/en" } },
    openGraph: { title: messages.seo?.home_title, description: messages.seo?.home_desc },
    twitter: { title: messages.seo?.home_title, description: messages.seo?.home_desc },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return <></>;
  const slugs = getAllSlugs(locale).slice(0, 2);
  const articles = slugs.map((s) => ({ slug: s, ...getArticle(s, locale)! }));
  return (
    <>
      <Hero />
      <TrustBadges />
      <SocialProof />
      <ServicesSection />
      <HowItWorks />
      <Calculator />
      {articles.length > 0 && <BlogPreview articles={articles} locale={locale} />}
      <ContactPreview />
    </>
  );
}
