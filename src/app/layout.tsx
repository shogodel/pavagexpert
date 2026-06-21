import { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pavagexpert",
  description: "Pavagexpert connects homeowners with RBQ-certified contractors for paving, asphalt, concrete, and landscaping projects across Greater Montreal.",
  metadataBase: new URL("https://pavagexpert.space"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/images/favicon.svg", type: "image/svg+xml" },
      { url: "/images/icon-192.png", type: "image/png", sizes: "any" },
    ],
    apple: "/images/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
