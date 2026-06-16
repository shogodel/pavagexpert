"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "@/lib/use-translations";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [auth, setAuth] = useState<{ authenticated: boolean; role?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setAuth)
      .catch(() => setAuth({ authenticated: false }));
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setAuth({ authenticated: false });
    router.push(`/${locale}`);
  }

  function dashboardHref(): string {
    if (auth?.role === "contractor") return `/${locale}/contractor/dashboard`;
    return `/${locale}/admin`;
  }
  const otherLocale = locale === "fr" ? "en" : "fr";

  function isActive(page: string): boolean {
    if (page === "home") return pathname === `/${locale}` || pathname === "/fr" || pathname === "/en";
    return pathname === `/${locale}/${page}` || pathname === `/${page}`;
  }

  function isServiceActive(): boolean {
    return serviceLinks.some((s) => pathname.includes(`/services/${s.slug}`));
  }

  function switchLocale() {
    document.cookie = `NEXT_LOCALE=${otherLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax;${process.env.NODE_ENV === "production" ? " Secure;" : ""}`;
    router.push(`/${otherLocale}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <img src="/images/logo.svg" alt="Pavagexpert" className="h-8 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                isActive("home") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
              }`}
              aria-current={isActive("home") ? "page" : undefined}
            >
              {t("home")}
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <Link
                href={`/${locale}/services`}
                className={`text-sm font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1 ${
                  isServiceActive() ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {t("services")}
                <svg className={`w-3 h-3 transition-transform ${servicesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/${locale}/services/${s.slug}`}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname.includes(`/services/${s.slug}`) ? "text-terracotta font-semibold bg-terracotta/5" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                      }`}
                    >
                      {t(`services_${s.key}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`/${locale}/calculator`}
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                isActive("calculator") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
              }`}
              aria-current={isActive("calculator") ? "page" : undefined}
            >
              {t("calculator")}
            </Link>

            <Link
              href={`/${locale}/blog`}
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                isActive("blog") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
              }`}
              aria-current={isActive("blog") ? "page" : undefined}
            >
              {t("blog")}
            </Link>

            {auth === null ? null : auth.authenticated ? (
              <>
                <Link
                  href={`/${locale}/jobs`}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                    isActive("jobs") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
                  }`}
                  aria-current={isActive("jobs") ? "page" : undefined}
                >
                  {t("jobs")}
                </Link>
                <Link
                  href={dashboardHref()}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors text-stone-600 hover:text-stone-900`}
                >
                  {t("dashboard")}
                </Link>
                {auth.role === "contractor" && (
                  <Link
                    href={`/${locale}/contractor/profile`}
                    className={`text-sm font-medium uppercase tracking-wider transition-colors text-stone-600 hover:text-stone-900`}
                  >
                    {t("profile")}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium uppercase tracking-wider text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/apply`}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                    isActive("apply") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
                  }`}
                  aria-current={isActive("apply") ? "page" : undefined}
                >
                  {t("apply")}
                </Link>
                <Link
                  href={`/${locale}/login`}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                    isActive("login") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"
                  }`}
                  aria-current={isActive("login") ? "page" : undefined}
                >
                  {t("login")}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={switchLocale}
              className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors px-3 py-1.5 border border-stone-300 rounded-md cursor-pointer"
            >
              {otherLocale === "fr" ? "FR" : "EN"}
            </button>

            <Link
              href={`/${locale}/get-quote`}
              className="hidden sm:inline-flex bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {t("get_quote")}
            </Link>

            <button
              className="lg:hidden p-2 text-stone-600"
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
          <div className="lg:hidden pb-4 border-t border-stone-100 pt-4">
            <nav className="flex flex-col gap-3">
              <Link
                href={`/${locale}`}
                className={`text-sm font-medium py-2 uppercase tracking-wider transition-colors ${isActive("home") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"}`}
                aria-current={isActive("home") ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {t("home")}
              </Link>

              <Link
                href={`/${locale}/services`}
                className={`text-sm font-medium py-2 uppercase tracking-wider transition-colors ${isServiceActive() ? "text-terracotta" : "text-stone-600 hover:text-stone-900"}`}
                onClick={() => setMenuOpen(false)}
              >
                {t("services")}
              </Link>
              {serviceLinks.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${locale}/services/${s.slug}`}
                  className={`text-sm pl-4 py-1.5 transition-colors ${pathname.includes(`/services/${s.slug}`) ? "text-terracotta font-semibold" : "text-stone-500 hover:text-stone-900"}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(`services_${s.key}`)}
                </Link>
              ))}

              <Link
                href={`/${locale}/calculator`}
                className={`text-sm font-medium py-2 uppercase tracking-wider transition-colors ${isActive("calculator") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"}`}
                onClick={() => setMenuOpen(false)}
              >
                {t("calculator")}
              </Link>
              <Link
                href={`/${locale}/blog`}
                className={`text-sm font-medium py-2 uppercase tracking-wider transition-colors ${isActive("blog") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"}`}
                onClick={() => setMenuOpen(false)}
              >
                {t("blog")}
              </Link>
              {auth === null ? null : auth.authenticated ? (
                <>
                  <Link
                    href={`/${locale}/jobs`}
                    className={`text-sm font-medium py-2 uppercase tracking-wider transition-colors ${isActive("jobs") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("jobs")}
                  </Link>
                  <Link
                    href={dashboardHref()}
                    className="text-sm font-medium py-2 uppercase tracking-wider text-stone-600 hover:text-stone-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("dashboard")}
                  </Link>
                  {auth.role === "contractor" && (
                    <Link
                      href={`/${locale}/contractor/profile`}
                      className="text-sm font-medium py-2 uppercase tracking-wider text-stone-600 hover:text-stone-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("profile")}
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="text-sm font-medium py-2 uppercase tracking-wider text-stone-600 hover:text-stone-900 text-left cursor-pointer"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/apply`}
                    className={`text-sm font-medium py-2 uppercase tracking-wider transition-colors ${isActive("apply") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("apply")}
                  </Link>
                  <Link
                    href={`/${locale}/login`}
                    className={`text-sm font-medium py-2 uppercase tracking-wider transition-colors ${isActive("login") ? "text-terracotta" : "text-stone-600 hover:text-stone-900"}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("login")}
                  </Link>
                </>
              )}

              <Link
                href={`/${locale}/get-quote`}
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
