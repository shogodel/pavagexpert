"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "@/lib/use-translations";
import Link from "next/link";

const pages = ["home", "services", "gallery", "calculator", "blog", "contact"] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const otherLocale = locale === "fr" ? "en" : "fr";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={`/${locale === "fr" ? "" : "en"}`} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-stone-800">Pavé</span>
            <span className="text-2xl font-light text-terracotta">Expert</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {pages.map((page) => (
              <Link
                key={page}
                href={`/${locale === "fr" ? "" : "en"}${page === "home" ? "" : `/${page}`}`}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors uppercase tracking-wider"
              >
                {t(page)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                document.cookie = `NEXT_LOCALE=${otherLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
                window.location.href = `/${otherLocale}`;
              }}
              className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors px-3 py-1.5 border border-stone-300 rounded-md cursor-pointer"
            >
              {otherLocale === "fr" ? "FR" : "EN"}
            </button>

            <Link
              href={`/${locale === "fr" ? "" : "en"}/contact`}
              className="hidden sm:inline-flex bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {t("get_quote")}
            </Link>

            <button
              className="lg:hidden p-2 text-stone-600"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-stone-100 pt-4">
            <nav className="flex flex-col gap-3">
              {pages.map((page) => (
                <Link
                  key={page}
                  href={`/${locale === "fr" ? "" : "en"}${page === "home" ? "" : `/${page}`}`}
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 py-2 uppercase tracking-wider"
                  onClick={() => setMenuOpen(false)}
                >
                  {t(page)}
                </Link>
              ))}
              <Link
                href={`/${locale === "fr" ? "" : "en"}/contact`}
                className="bg-terracotta text-white text-center text-sm font-semibold px-5 py-2.5 rounded-lg mt-2"
                onClick={() => setMenuOpen(false)}
              >
                {t("get_quote")}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
