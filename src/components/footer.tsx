"use client";

import { useTranslations } from "@/lib/use-translations";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const servicesT = useTranslations("services");

  const serviceKeys = ["driveway", "patio", "walkway", "retaining", "commercial"] as const;

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">Pavé</span>
              <span className="text-xl font-light text-terracotta">Expert</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">{t("description")}</p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">{t("quick_links")}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-stone-400 hover:text-white transition-colors">{nav("home")}</Link>
              <Link href="/services" className="text-sm text-stone-400 hover:text-white transition-colors">{nav("services")}</Link>
              <Link href="/calculator" className="text-sm text-stone-400 hover:text-white transition-colors">{nav("calculator")}</Link>
              <Link href="/blog" className="text-sm text-stone-400 hover:text-white transition-colors">{nav("blog")}</Link>
              <Link href="/get-quote" className="text-sm text-stone-400 hover:text-white transition-colors">{nav("get_quote")}</Link>
              <Link href="/jobs" className="text-sm text-stone-400 hover:text-white transition-colors">{nav("jobs")}</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">{t("services_list")}</h3>
            <nav className="flex flex-col gap-2">
              {serviceKeys.map((key) => (
                <Link
                  key={key}
                  href="/services"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {servicesT(`${key}.title`)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">{t("contact_info")}</h3>
            <div className="flex flex-col gap-2 text-sm text-stone-400">
              <span>1234 Rue Principal</span>
              <span>Montréal, QC H3Z 2Y7</span>
              <a href="tel:+15145551234" className="hover:text-white transition-colors">(514) 555-1234</a>
              <a href="mailto:info@pave.expert" className="hover:text-white transition-colors">info@pave.expert</a>
            </div>
            <h4 className="text-white font-semibold mt-4 mb-2 uppercase text-xs tracking-wider">{t("hours")}</h4>
            <div className="flex flex-col gap-1 text-sm text-stone-400">
              <span>{t("mon_fri")}</span>
              <span>{t("sat")}</span>
              <span>{t("sun")}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Pavé Expert. {t("rights")}
          </p>
          <div className="flex gap-4 text-sm text-stone-500">
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">{t("privacy")}</Link>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
