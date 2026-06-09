"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/use-translations";
import Link from "next/link";
import { motion } from "framer-motion";

const products = ["classic", "aged", "slate"] as const;
const patterns = ["running", "herringbone", "basket"] as const;

const PRICE_MATERIALS: Record<string, number> = {
  classic: 45,
  aged: 55,
  slate: 70,
};

const PRICE_INSTALLATION: Record<string, number> = {
  running: 35,
  herringbone: 45,
  basket: 40,
};

export default function Calculator() {
  const t = useTranslations("calculator");

  const [length, setLength] = useState(6);
  const [width, setWidth] = useState(4);
  const [product, setProduct] = useState<string>("classic");
  const [pattern, setPattern] = useState<string>("running");

  const area = length * width;
  const materialPrice = PRICE_MATERIALS[product] || 45;
  const installPrice = PRICE_INSTALLATION[pattern] || 35;
  const materialsCost = area * materialPrice;
  const installationCost = area * installPrice;
  const totalCost = materialsCost + installationCost;

  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800">{t("title")}</h2>
          <p className="mt-3 text-stone-500 text-lg">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-stone-200"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t("length")}</label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="0.5"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-terracotta"
                />
                <span className="text-sm text-stone-500">{length} m</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t("width")}</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-terracotta"
                />
                <span className="text-sm text-stone-500">{width} m</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t("product")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {products.map((p) => (
                    <button
                      key={p}
                      onClick={() => setProduct(p)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        product === p
                          ? "bg-terracotta text-white border-terracotta"
                          : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
                      }`}
                    >
                      {t(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t("pattern")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {patterns.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPattern(p)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        pattern === p
                          ? "bg-terracotta text-white border-terracotta"
                          : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
                      }`}
                    >
                      {t(p)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-stone-200 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-stone-800 mb-6">{t("estimate_result")}</h3>

            <div className="flex items-center justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-stone-100 flex items-center justify-center border-2 border-terracotta/20">
                <div className="text-center">
                  <span className="text-2xl font-bold text-stone-800">{area.toFixed(1)}</span>
                  <span className="text-sm text-stone-500 block">m²</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-600">{t("materials_label")}</span>
                <span className="font-semibold text-stone-800">{materialsCost.toFixed(0)}$</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-600">{t("installation_label")}</span>
                <span className="font-semibold text-stone-800">{installationCost.toFixed(0)}$</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-semibold text-stone-800 text-lg">{t("total_label")}</span>
                <span className="font-bold text-terracotta text-xl">{totalCost.toFixed(0)}$</span>
              </div>
            </div>

            <Link
              href="/contact"
              className="mt-6 bg-terracotta hover:bg-terracotta-dark text-white font-semibold px-6 py-3 rounded-lg text-center transition-colors block"
            >
              {t("cta_get_quote")}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
