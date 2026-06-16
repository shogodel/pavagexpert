import type { Metadata } from "next";
import ContractorDashboard from "./dashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Tableau de bord - Pavagexpert",
    robots: { index: false, follow: false },
    alternates: { canonical: `https://pavagexpert.space/${locale}/contractor/dashboard` },
  };
}

export default function Page() {
  return <ContractorDashboard />;
}
