import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.blog_title,
    description: messages.seo?.blog_desc,
    alternates: { languages: { fr: "/fr/blog", en: "/en/blog" } },
  };
}

const articles = [
  { title: "Prix du pavé uni à Montréal en 2026", desc: "Guide complet des coûts d'installation au m².", slug: "prix-pave-uni-montreal-2026" },
  { title: "Pavé uni vs asphalte : lequel choisir ?", desc: "Comparatif durée, esthétique, entretien et prix.", slug: "pave-uni-vs-asphalte" },
  { title: "Entretien du pavé uni : guide complet", desc: "Nettoyage, scellant, réparation : tout savoir.", slug: "entretien-pave-uni" },
  { title: "Les motifs de pose de pavé uni", desc: "Opus romain, chevrons, panier : quel motif choisir ?", slug: "motifs-pose-pave-uni" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">Blog & Conseils</h1>
          <p className="text-stone-500">Tout savoir sur le pavé uni</p>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="bg-white rounded-xl p-6 border border-stone-200 hover:border-terracotta/30 transition-colors group"
              >
                <h2 className="font-semibold text-stone-800 group-hover:text-terracotta transition-colors mb-2">
                  {article.title}
                </h2>
                <p className="text-sm text-stone-500">{article.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
