import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Pavagexpert",
  robots: { index: false },
};

export default function LocaleNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-heading font-bold text-stone-300">404</h1>
        <p className="text-xl text-stone-600">Page not found</p>
        <Link href="/fr" className="text-emerald-600 hover:text-emerald-700 underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
