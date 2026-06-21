"use client";

import { useTranslations } from "@/lib/use-translations";
import Link from "next/link";
import { motion } from "framer-motion";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/constants";

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
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">{t("title")}</h2>
          <p className="text-lg text-white/80 mb-8">{t("subtitle")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/get-quote"
              className="bg-white text-terracotta hover:bg-stone-100 font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg"
            >
              {t("submit")}
            </Link>
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="text-white font-semibold text-lg hover:underline"
            >
              {CONTACT_PHONE}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
