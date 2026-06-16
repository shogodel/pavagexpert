import type { Metadata } from "next";
import AdminDashboard from "./dashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Admin — Pavagexpert",
    robots: { index: false, follow: false },
    alternates: { canonical: `https://pavagexpert.space/${locale}/admin` },
  };
}

export default function AdminPage() {
  return <AdminDashboard />;
}
