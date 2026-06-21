import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import { getAllSlugs, getArticle } from "@/lib/blog-data";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.blog_title,
    description: messages.seo?.blog_desc,
    alternates: { canonical: `https://pavagexpert.space/${locale}/blog`, languages: { "x-default": "/fr/blog", fr: "/fr/blog", en: "/en/blog" } },
    openGraph: { title: messages.seo?.blog_title, description: messages.seo?.blog_desc },
    twitter: { title: messages.seo?.blog_title, description: messages.seo?.blog_desc },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return <></>;
  const messages = await getMessages(locale);
  const slugs = getAllSlugs(locale);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-stone-800 mb-2">{messages.blog?.title || "Blog"}</h1>
          <p className="text-stone-500">{messages.blog?.subtitle || ""}</p>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slugs.map((slug) => {
              const article = getArticle(slug, locale);
              if (!article) return null;
              return (
                <Link
                  key={slug}
                  href={`/${locale}/blog/${slug}`}
                  className="bg-white rounded-xl p-6 border border-stone-200 hover:border-terracotta/30 transition-colors group"
                >
                  <h2 className="font-heading font-semibold text-stone-800 group-hover:text-terracotta transition-colors mb-2">
                    {article.title}
                  </h2>
                  <p className="text-sm md:text-base text-stone-500">{article.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
