"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/use-translations";
import { motion } from "framer-motion";

const filters = ["all", "driveway", "patio", "walkway", "commercial"] as const;

const projects = [
  { id: 1, category: "driveway", titleKey: "filter_driveway", before: "/images/project-1.jpg", after: "/images/project-2.jpg" },
  { id: 2, category: "patio", titleKey: "filter_patio", before: "/images/project-1.jpg", after: "/images/project-2.jpg" },
  { id: 3, category: "walkway", titleKey: "filter_walkway", before: "/images/project-1.jpg", after: "/images/project-2.jpg" },
  { id: 4, category: "driveway", titleKey: "filter_driveway", before: "/images/project-1.jpg", after: "/images/project-2.jpg" },
  { id: 5, category: "commercial", titleKey: "filter_commercial", before: "/images/project-1.jpg", after: "/images/project-2.jpg" },
  { id: 6, category: "patio", titleKey: "filter_patio", before: "/images/project-1.jpg", after: "/images/project-2.jpg" },
];

export default function GallerySection() {
  const t = useTranslations("gallery");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filtered = activeFilter === "all"
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-stone-800">{t("title")}</h2>
          <p className="mt-3 text-stone-500 text-lg">{t("subtitle")}</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-3 text-sm rounded-full transition-colors min-h-[44px] ${
                activeFilter === filter
                  ? "bg-terracotta text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {t(filter)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative group rounded-xl overflow-hidden bg-stone-100 aspect-[4/3] cursor-pointer"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-stone-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className={`absolute inset-0 bg-stone-900/70 flex items-center justify-center transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100`}>
                <div className="text-center text-white px-4">
                  <p className="font-heading font-semibold mb-2">{t(project.titleKey)}</p>
                  <div className="flex gap-3 justify-center text-xs">
                    <span className="bg-white/20 px-3 py-1 rounded">{t("before")}</span>
                    <span className="bg-white/20 px-3 py-1 rounded">{t("after")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
