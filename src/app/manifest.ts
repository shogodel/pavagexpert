import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pavagexpert — Portail entrepreneurs",
    short_name: "Pavagexpert",
    description: "Consultez les projets de pavage à Montréal, Laval et la Rive-Sud. Recevez des notifications quand un nouveau projet est publié.",
    start_url: "/fr/login",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#c87d5d",
    icons: [
      { src: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/images/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/images/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
    lang: "fr",
    scope: "/",
  };
}
