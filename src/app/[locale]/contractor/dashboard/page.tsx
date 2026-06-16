import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import ContractorDashboard from "./dashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Tableau de bord - Pavagexpert",
    description: "Tableau de bord - Pavagexpert",
    robots: { index: false, follow: false },
    alternates: { canonical: `https://pavagexpert.space/${locale}/contractor/dashboard`, languages: { "x-default": "/fr/contractor/dashboard", fr: "/fr/contractor/dashboard", en: "/en/contractor/dashboard" } },
    openGraph: { title: "Tableau de bord - Pavagexpert", description: "Tableau de bord - Pavagexpert" },
    twitter: { title: "Tableau de bord - Pavagexpert", description: "Tableau de bord - Pavagexpert" },
  };
}

export default function Page() {
  return <ContractorDashboard />;
}
