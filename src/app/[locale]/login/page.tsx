import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./form";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, defaultLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const messages = await getMessages(locale) as unknown as Record<string, Record<string, string>>;
  const title = messages.seo?.login_title || "Login | Pavagexpert";
  const description = messages.seo?.login_desc || "";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `https://pavagexpert.space/${locale}/login` },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <LoginForm />
    </Suspense>
  );
}
