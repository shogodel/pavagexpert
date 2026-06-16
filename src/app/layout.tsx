import { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pavagexpert",
  description: "Spécialiste en pavé uni à Montréal",
  metadataBase: new URL("https://pavagexpert.space"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
