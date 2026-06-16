import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import AdminDashboard from "./dashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Admin — Pavagexpert",
    description: "Admin — Pavagexpert",
    robots: { index: false, follow: false },
    alternates: { canonical: `https://pavagexpert.space/${locale}/admin` },
  };
}

export default function AdminPage() {
  return <AdminDashboard />;
}
