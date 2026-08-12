"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "@/lib/use-translations";
import { motion } from "framer-motion";
import { getTrackingData, clearTracking } from "@/lib/utm-tracker";

export default function GetQuoteForm() {
  const t = useTranslations("get_quote");
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });
  const mountTime = useRef(0);

  useEffect(() => {
    mountTime.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const fd = new FormData();
      fd.set("name", form.name);
      fd.set("phone", form.phone);
      fd.set("_fm", String(mountTime.current));
      const tracking = getTrackingData();
      if (tracking)       fd.set("lead_source", JSON.stringify(tracking));
      fd.set("locale", locale);
      const res = await fetch("/api/contact", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error("API error");
      clearTracking();
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50">
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-heading font-bold text-stone-800 mb-2">{t("success_title")}</h2>
          <p className="text-stone-500">{t("success_msg")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="pt-28 pb-12 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold">{t("title")}</h1>
          <p className="mt-3 text-lg text-stone-300">{t("subtitle")}</p>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 md:p-10 shadow-xl border border-stone-200 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Honeypot field — hidden from humans */}
            <div aria-hidden="true" className="absolute left-[-9999px] opacity-0 pointer-events-none" tabIndex={-1}>
              <label htmlFor="_website">Website</label>
              <input id="_website" name="_website" type="text" autoComplete="off" tabIndex={-1} />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("name")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all text-base shadow-sm focus:shadow-md min-h-[48px]"
                placeholder={t("name_placeholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("phone")} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all text-base shadow-sm focus:shadow-md min-h-[48px]"
                placeholder={t("phone_placeholder")}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{t("error_msg")}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-all text-lg shadow-lg hover:shadow-xl hover:shadow-terracotta/25 min-h-[52px]"
            >
              {sending ? "..." : t("submit")}
            </button>

            <p className="text-xs text-green-700 font-medium text-center">
              {t("guarantee")}
            </p>

            <p className="text-xs text-stone-400 text-center">
              {t("privacy")}
            </p>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
