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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.home_title,
    description: messages.seo?.home_desc,
    alternates: { languages: { "x-default": "/fr", fr: "/fr", en: "/en" } },
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <SocialProof />
      <ServicesSection />
      <HowItWorks />
      <Calculator />
      <ContactPreview />
    </>
  );
}
