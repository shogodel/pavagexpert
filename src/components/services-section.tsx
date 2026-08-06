"use client";

import { useTranslations } from "@/lib/use-translations";
import Link from "next/link";
import { motion } from "framer-motion";
import { servicesList } from "@/lib/services-data";

export default function ServicesSection() {
  const t = useTranslations("services");

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-stone-800">{t("title")}</h2>
          <p className="mt-3 text-stone-500 text-lg">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {servicesList.map((service, index) => {
            const title = t(`${service.id}.title`);
            const desc = t(`${service.id}.desc`);
            return (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <motion.div
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-stone-200 hover:border-terracotta/40 hover:-translate-y-1 transition-all duration-300 h-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
                    <svg className="w-6 h-6 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={service.icon} />
                    </svg>
                  </div>
                  <h3 className="font-heading font-semibold text-stone-800 mb-2 group-hover:text-terracotta transition-colors">{title}</h3>
                  <p className="text-sm md:text-base text-stone-500 leading-relaxed">{desc}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
