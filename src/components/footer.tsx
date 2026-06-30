"use client";

import { useTranslations, useLocale } from "@/lib/use-translations";
import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { servicesList } from "@/lib/services-data";
import { useState, useEffect } from "react";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const servicesT = useTranslations("services");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="mb-4">
              <img src="/images/logo-white.svg" alt="Pavagexpert" className="h-7 w-auto" />
            </div>
            <p className="text-sm leading-relaxed text-stone-400">{t("description")}</p>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold mb-4 uppercase text-sm tracking-wider">{t("quick_links")}</h3>
            <nav className="flex flex-col gap-1">
              <Link href={`/${locale}`} className="text-sm text-stone-400 hover:text-white transition-colors py-2 min-h-[44px] flex items-center">{nav("home")}</Link>
              <Link href={`/${locale}/services`} className="text-sm text-stone-400 hover:text-white transition-colors py-2 min-h-[44px] flex items-center">{nav("services")}</Link>
              <Link href={`/${locale}/calculator`} className="text-sm text-stone-400 hover:text-white transition-colors py-2 min-h-[44px] flex items-center">{nav("calculator")}</Link>
              <Link href={`/${locale}/blog`} className="text-sm text-stone-400 hover:text-white transition-colors py-2 min-h-[44px] flex items-center">{nav("blog")}</Link>
              <Link href={`/${locale}/get-quote`} className="text-sm text-stone-400 hover:text-white transition-colors py-2 min-h-[44px] flex items-center">{nav("get_quote")}</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold mb-4 uppercase text-sm tracking-wider">{t("services_list")}</h3>
            <nav className="flex flex-col gap-1">
              {servicesList.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${locale}/services/${s.slug}`}
                  className="text-sm text-stone-400 hover:text-white transition-colors py-2 min-h-[44px] flex items-center"
                >
                  {servicesT(`${s.id}.title`)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold mb-4 uppercase text-sm tracking-wider">{t("contact_info")}</h3>
            <div className="flex flex-col gap-2 text-sm text-stone-400">
              <span className="py-1">Laval, QC H7N 2C2</span>
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="hover:text-white transition-colors py-2 min-h-[44px] flex items-center">{CONTACT_PHONE}</a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors py-2 min-h-[44px] flex items-center">{CONTACT_EMAIL}</a>
            </div>
            <h4 className="text-white font-heading font-semibold mt-4 mb-2 uppercase text-xs tracking-wider">{t("hours")}</h4>
            <div className="flex flex-col gap-1 text-sm text-stone-400">
              <span className="py-1">{t("always_open")}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 pb-8 mb-8 border-b border-stone-800">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-white font-heading font-semibold text-lg">{t("exit_title")}</p>
            <p className="text-stone-400 text-sm mt-1">{t("exit_desc")}</p>
              <Link
                href={`/${locale}/get-quote`}
                className="inline-block mt-4 bg-terracotta hover:bg-terracotta-dark text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                {t("exit_cta")}
              </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Pavagexpert. {t("rights")}
          </p>
          <div className="flex gap-4 text-sm text-stone-500">
            <Link href={`/${locale}/privacy`} className="hover:text-stone-300 transition-colors py-2 min-h-[44px] flex items-center">{t("privacy")}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-stone-300 transition-colors py-2 min-h-[44px] flex items-center">{t("terms")}</Link>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
