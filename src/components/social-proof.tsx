"use client";

import { useTranslations } from "@/lib/use-translations";
import { motion } from "framer-motion";

const stats = [
  { value: "42", key: "projects" },
  { value: "15 000 m²", key: "area" },
  { value: "98%", key: "satisfaction" },
];

export default function SocialProof() {
  const t = useTranslations("social_proof");

  return (
    <section className="bg-stone-900 border-y border-stone-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="flex flex-wrap justify-center gap-x-12 gap-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {stats.map((stat, i) => (
            <div key={stat.key} className="flex items-center gap-2 text-sm">
              <span className="text-terracotta font-bold text-lg">{stat.value}</span>
              <span className="text-stone-400">{t(stat.key)}</span>
              {i < stats.length - 1 && (
                <span className="hidden sm:inline text-stone-600 ml-2">•</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
