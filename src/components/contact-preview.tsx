"use client";

import { useTranslations } from "@/lib/use-translations";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactPreview() {
  const t = useTranslations("get_quote");

  return (
    <section className="py-16 md:py-24 bg-terracotta">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("title")}</h2>
          <p className="text-lg text-white/80 mb-8">{t("subtitle")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/get-quote"
              className="bg-white text-terracotta hover:bg-stone-100 font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg"
            >
              {t("submit")}
            </Link>
            <a
              href="tel:+15145551234"
              className="text-white font-semibold text-lg hover:underline"
            >
              {t("phone_number")}
            </a>
          </div>

          <p className="mt-6 text-sm text-white/60">{t("areas")}</p>
        </motion.div>
      </div>
    </section>
  );
}
