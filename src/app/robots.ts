import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/login", "/*/admin", "/*/contractor", "/api/"],
    },
    sitemap: "https://pavagexpert.space/sitemap.xml",
  };
}
