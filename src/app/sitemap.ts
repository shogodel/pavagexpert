import type { MetadataRoute } from "next";
import { getAllSlugs, getArticle } from "@/lib/blog-data";
import { servicesList } from "@/lib/services-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pavagexpert.space";
  const locales = ["fr", "en"];
  const pages = ["", "/services", "/calculator", "/blog", "/gallery", "/get-quote", "/jobs"];
  const extras = ["/privacy", "/terms"];

  const staticEntries = locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: (page === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: page === "" ? 1.0 : 0.8,
    }))
  );

  const extraEntries = locales.flatMap((locale) =>
    extras.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  );

  const allSlugs = new Set([...getAllSlugs("fr"), ...getAllSlugs("en")]);
  const blogEntries = locales.flatMap((locale) =>
    [...allSlugs].map((slug) => {
      const article = getArticle(slug, locale);
      return {
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: article?.date ? new Date(article.date) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
  );

  const serviceEntries = locales.flatMap((locale) =>
    servicesList.map((s) => ({
      url: `${baseUrl}/${locale}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...extraEntries, ...blogEntries, ...serviceEntries];
}
