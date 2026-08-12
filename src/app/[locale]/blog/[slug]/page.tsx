import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import { getArticle } from "@/lib/blog-data";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = getArticle(slug, locale);
  if (!article) notFound();
  const messages = await getMessages(locale);
  return {
    title: `${article.title} | ${messages.seo?.blog_title || "Blog"}`,
    description: article.desc,
    alternates: { canonical: `https://pavagexpert.space/${locale}/blog/${slug}`, languages: { "x-default": `/fr/blog/${slug}`, fr: `/fr/blog/${slug}`, en: `/en/blog/${slug}` } },
    openGraph: { title: article.title, description: article.desc },
    twitter: { title: article.title, description: article.desc },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = getArticle(slug, locale);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.desc,
    datePublished: article.date,
    author: { "@type": "Organization", name: "Pavagexpert" },
    publisher: { "@type": "Organization", name: "Pavagexpert", url: "https://pavagexpert.space" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://pavagexpert.space/${locale}/blog/${slug}` },
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-28 pb-12 bg-stone-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/blog`} className="text-sm text-stone-400 hover:text-white mb-4 inline-block min-h-[44px] py-2">&larr; Blog</Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">{article.title}</h1>
          <p className="text-lg text-stone-300">{article.desc}</p>
        </div>
      </div>
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-stone max-w-none">
            {article.content.map((paragraph, i) => (
              <p key={i} className="text-stone-700 mb-4 leading-relaxed">{paragraph}</p>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-stone-200">
            <Link href={`/${locale}/blog`} className="text-terracotta hover:underline">&larr; Retour au blog</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
