"use client";

import { useTranslations } from "@/lib/use-translations";
import Link from "next/link";
import { motion } from "framer-motion";

const HERO_IMAGE = "/images/hero-bg.jpg";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-[500px] md:min-h-[700px] flex items-center overflow-hidden bg-stone-900">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/35 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("title")}
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-stone-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Link
              href="/get-quote"
              className="bg-terracotta hover:bg-terracotta-dark text-white font-semibold px-8 py-3.5 rounded-lg text-center transition-colors text-lg shadow-lg hover:shadow-terracotta/25 hover:shadow-xl"
            >
              {t("cta_estimate")}
            </Link>
            <a
              href="tel:+15142431580"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-lg text-center transition-all text-lg border border-white/30 hover:border-white/50 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              (514) 243-1580
            </a>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {["trust_badge_1", "trust_badge_2", "trust_badge_3"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-stone-300 text-sm">
                <svg className="w-5 h-5 text-terracotta flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t(badge)}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
