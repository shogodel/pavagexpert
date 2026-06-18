import { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pavagexpert",
  description: "Spécialiste en pavé uni à Montréal",
  metadataBase: new URL("https://pavagexpert.space"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/icon-192.png", type: "image/png", sizes: "any" },
    ],
    apple: "/images/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
