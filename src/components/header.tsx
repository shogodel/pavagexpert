"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "@/lib/use-translations";
import Link from "next/link";
import { usePathname } from "next/navigation";

const serviceLinks = [
  { key: "pavers", slug: "pavers" },
  { key: "asphalt", slug: "asphalt" },
  { key: "concrete", slug: "concrete" },
  { key: "excavation", slug: "excavation" },
  { key: "retaining_walls", slug: "retaining-walls" },
  { key: "landscaping", slug: "landscaping" },
  { key: "turf", slug: "turf" },
  { key: "drainage", slug: "drainage" },
];

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const isTouchRef = useRef(false);

  if (typeof window !== "undefined") {
    isTouchRef.current = "ontouchstart" in window;
  }

  const otherLocale = locale === "fr" ? "en" : "fr";

  function isActive(page: string): boolean {
    if (page === "home") return pathname === `/${locale}` || pathname === "/fr" || pathname === "/en";
    return pathname === `/${locale}/${page}` || pathname === `/${page}`;
  }

  function isServiceActive(): boolean {
    return serviceLinks.some((s) => pathname.startsWith(`/${locale}/services/${s.slug}`));
  }

  const navLink = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`text-sm font-medium uppercase tracking-wider transition-colors ${
        active ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <>
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <img src="/images/logo.svg" alt="Pavagexpert" className="h-8 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            <div
              className="relative"
              onMouseEnter={() => { if (!isTouchRef.current) setServicesOpen(true); }}
              onMouseLeave={() => { if (!isTouchRef.current) setServicesOpen(false); }}
              onFocus={() => setServicesOpen(true)}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setServicesOpen(false); }}
            >
              <button
                type="button"
                onClick={() => setServicesOpen((o) => !o)}
                className={`text-sm font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer ${
                  isServiceActive() ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
                }`}
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                aria-label={t("services")}
              >
                {t("services")}
                <svg className={`w-3 h-3 transition-transform ${servicesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {servicesOpen && (
                <div
                  role="menu"
                  aria-label={t("services")}
                  className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50"
                >
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.slug}
                      role="menuitem"
                      href={`/${locale}/services/${s.slug}`}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname.startsWith(`/${locale}/services/${s.slug}`) ? "text-terracotta font-semibold bg-terracotta/5" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                      }`}
                    >
                      {t(`services_${s.key}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLink(`/${locale}/calculator`, t("calculator"), isActive("calculator"))}
            {navLink(`/${locale}/blog`, t("blog"), isActive("blog"))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+15142431580"
              className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
              aria-label="Call us at (514) 243-1580"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              (514) 243-1580
            </a>

            <button
              type="button"
              onClick={() => {
                document.cookie = `NEXT_LOCALE=${otherLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax;${process.env.NODE_ENV === "production" ? " Secure;" : ""}`;
                setMenuOpen(false);
                window.location.href = `/${otherLocale}`;
              }}
              className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors px-4 py-2.5 border border-stone-300 rounded-md cursor-pointer min-h-[44px] flex items-center"
              aria-label={`Switch language to ${otherLocale === "fr" ? "French" : "English"}`}
            >
              {otherLocale === "fr" ? "FR" : "EN"}
            </button>

            <Link
              href={`/${locale}/get-quote`}
              className="hidden sm:inline-flex bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {t("get_quote")}
            </Link>

            <Link
              href={`/${locale}/get-quote`}
              className="sm:hidden bg-terracotta hover:bg-terracotta-dark text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors min-h-[44px] flex items-center"
            >
              {t("get_quote")}
            </Link>

            {menuOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
            )}

            <button
              type="button"
              className="lg:hidden p-3 text-stone-600 relative z-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
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
          <div className="lg:hidden pb-4 border-t border-stone-100 pt-4 relative z-50 bg-white">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className={`text-sm font-medium py-3 px-3 uppercase tracking-wider transition-colors flex items-center justify-between text-left rounded-lg cursor-pointer min-h-[44px] ${isServiceActive() ? "text-terracotta bg-terracotta/5" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"}`}
                aria-expanded={mobileServicesOpen}
              >
                {t("services")}
                <svg className={`w-3 h-3 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileServicesOpen && (
                <div className="flex flex-col ml-4 border-l-2 border-stone-200 pl-3">
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/${locale}/services/${s.slug}`}
                      className={`text-sm py-3 px-3 transition-colors rounded-lg min-h-[44px] flex items-center ${pathname.startsWith(`/${locale}/services/${s.slug}`) ? "text-terracotta font-semibold bg-terracotta/5" : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {t(`services_${s.key}`)}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href={`/${locale}/calculator`}
                className={`text-sm font-medium py-3 px-3 uppercase tracking-wider transition-colors rounded-lg min-h-[44px] flex items-center ${isActive("calculator") ? "text-terracotta bg-terracotta/5" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"}`}
                onClick={() => setMenuOpen(false)}
              >
                {t("calculator")}
              </Link>
              <Link
                href={`/${locale}/blog`}
                className={`text-sm font-medium py-3 px-3 uppercase tracking-wider transition-colors rounded-lg min-h-[44px] flex items-center ${isActive("blog") ? "text-terracotta bg-terracotta/5" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"}`}
                onClick={() => setMenuOpen(false)}
              >
                {t("blog")}
              </Link>

              <div className="mt-3 pt-3 border-t border-stone-200">
                <Link
                  href={`/${locale}/get-quote`}
                  className="block bg-terracotta text-white text-center text-sm font-semibold px-5 py-2.5 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("get_quote")}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>

      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden flex">
        <a
          href="tel:+15142431580"
          className="flex-1 bg-terracotta text-white text-sm font-semibold py-3.5 flex items-center justify-center gap-2 min-h-[52px]"
          aria-label="Call us at (514) 243-1580"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          (514) 243-1580
        </a>
        <a
          href={`/${locale}/get-quote`}
          className="flex-1 bg-stone-800 text-white text-sm font-semibold py-3.5 flex items-center justify-center gap-2 min-h-[52px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          {t("get_quote")}
        </a>
      </div>
    </>
  );
}
