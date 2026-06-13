import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog-data";

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

  const blogSlugs = getAllSlugs("fr");
  const blogEntries = locales.flatMap((locale) =>
    blogSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...extraEntries, ...blogEntries];
}
