import Link from "next/link";
import type { BlogArticle } from "@/lib/blog-data";

interface Props {
  articles: (BlogArticle & { slug: string })[];
  locale: string;
}

export default function BlogPreview({ articles, locale }: Props) {
  const t = {
    title: locale === "en" ? "From Our Blog" : "Notre blogue",
    subtitle: locale === "en" ? "Tips and advice for your paving project" : "Conseils et astuces pour votre projet de pavage",
    viewAll: locale === "en" ? "View all articles" : "Voir tous les articles",
    readMore: locale === "en" ? "Read more" : "Lire la suite",
  };
  return (
    <section className="py-20 md:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-stone-800">{t.title}</h2>
          <p className="mt-3 text-stone-500 text-lg">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${locale}/blog/${a.slug}`}
              className="bg-white rounded-xl p-6 md:p-8 border border-stone-200 hover:border-terracotta/30 transition-all shadow-sm hover:shadow-lg group"
            >
              <h3 className="font-heading font-semibold text-stone-800 group-hover:text-terracotta transition-colors mb-2">
                {a.title}
              </h3>
              <p className="text-sm md:text-base text-stone-500 mb-3">{a.desc}</p>
              <span className="text-sm font-medium text-terracotta group-hover:underline">{t.readMore} &rarr;</span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-terracotta font-medium transition-colors min-h-[44px] px-6"
          >
            {t.viewAll} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
