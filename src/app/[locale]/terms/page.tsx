import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.terms?.title || "Terms",
    description: messages.terms?.title ? `${messages.terms.title} — Pavagexpert` : "Terms of Use — Pavagexpert",
    alternates: { canonical: `https://pavagexpert.space/${locale}/terms`, languages: { "x-default": "/fr/terms", fr: "/fr/terms", en: "/en/terms" } },
    openGraph: { title: messages.terms?.title, description: messages.terms?.title ? `${messages.terms.title} — Pavagexpert` : "Terms of Use — Pavagexpert" },
    twitter: { title: messages.terms?.title, description: messages.terms?.title ? `${messages.terms.title} — Pavagexpert` : "Terms of Use — Pavagexpert" },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return <></>;
  const messages = await getMessages(locale);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="pt-28 pb-12 bg-stone-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="text-sm text-stone-400 hover:text-white mb-4 inline-block">&larr; Accueil</Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">{messages.terms?.title}</h1>
        </div>
      </div>
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {(messages.terms?.content || []).map((p: string, i: number) => (
            <p key={i} className="text-stone-700 mb-4 leading-relaxed">{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
