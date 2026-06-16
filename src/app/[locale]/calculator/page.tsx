import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import Calculator from "@/components/calculator";
import ContactPreview from "@/components/contact-preview";
import FaqJsonLd from "@/components/faq-json-ld";

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

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return <></>;

  const faqsEn = [
    { question: "How much does interlocking paver installation cost in Montreal?", answer: "Interlocking paver installation in Montreal typically costs between $15 and $35 per square foot depending on the paver type, pattern, and site preparation. Use our free calculator above for a detailed estimate." },
    { question: "What is the price per square foot for asphalt paving in Montreal?", answer: "Asphalt paving in Montreal ranges from $5 to $12 per square foot for residential driveways. Commercial projects vary based on thickness and base preparation requirements." },
    { question: "How long do interlocking pavers last?", answer: "Interlocking pavers last 30 to 50 years with proper installation and basic maintenance like annual re-sanding and occasional cleaning." },
    { question: "Do I need a permit for a paver driveway in Montreal?", answer: "Permit requirements vary by municipality. Pavagexpert contractors handle permit applications for projects in Montreal, Laval, Longueuil and all South Shore cities." },
    { question: "How long does a paver driveway installation take?", answer: "A typical residential paver driveway takes 3 to 7 days depending on the size, site prep needs, and weather conditions. Our contractors provide a timeline during the estimate." },
  ];
  const faqsFr = [
    { question: "Combien coûte l'installation de pavé uni à Montréal?", answer: "L'installation de pavé uni à Montréal coûte généralement entre 15 $ et 35 $ le pied carré selon le type de pavé, le motif et la préparation du terrain. Utilisez notre calculateur gratuit ci-dessus." },
    { question: "Quel est le prix au pied carré pour l'asphalte à Montréal?", answer: "Le pavage d'asphalte à Montréal varie de 5 $ à 12 $ le pied carré pour les entrées résidentielles. Les projets commerciaux varient selon l'épaisseur et la préparation." },
    { question: "Quelle est la durée de vie du pavé uni?", answer: "Le pavé uni dure de 30 à 50 ans avec une installation professionnelle et un entretien de base : sablage annuel et nettoyage occasionnel." },
    { question: "Ai-je besoin d'un permis pour une entrée en pavé uni à Montréal?", answer: "Les exigences de permis varient par municipalité. Les entrepreneurs Pavagexpert gèrent les demandes de permis pour les projets à Montréal, Laval, Longueuil et toute la Rive-Sud." },
    { question: "Combien de temps prend l'installation d'une entrée en pavé uni?", answer: "Une entrée résidentielle typique prend 3 à 7 jours selon la superficie, la préparation nécessaire et les conditions météorologiques. Nos entrepreneurs fournissent un échéancier lors de l'estimation." },
  ];

  const faqItems = locale === "fr" ? faqsFr : faqsEn;

  return (
    <>
      <FaqJsonLd items={faqItems} />
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
