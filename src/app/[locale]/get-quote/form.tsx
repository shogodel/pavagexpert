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
    email: "",
    postalCode: "",
    phone: "",
    budget: "",
    description: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
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
      fd.set("email", form.email);
      fd.set("phone", form.phone);
      fd.set("postalCode", form.postalCode);
      fd.set("budget", form.budget);
      fd.set("description", form.description);
      fd.set("_fm", String(mountTime.current));
      for (const f of photoFiles) fd.append("photos", f);
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
      <div className="pt-28 pb-10 bg-gradient-to-b from-stone-900 to-stone-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold">{t("title")}</h1>
          <p className="mt-2 text-stone-300">{t("subtitle")}</p>
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
                {t("email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all text-base shadow-sm focus:shadow-md min-h-[48px]"
                placeholder={t("email_placeholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("postal_code")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full px-4 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all text-base shadow-sm focus:shadow-md min-h-[48px]"
                placeholder="H3Z 2Y7"
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

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("photos")}
              </label>
              <p className="text-xs text-stone-400 mb-2">{t("photos_hint")}</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-stone-500 file:mr-4 file:py-3.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-terracotta/10 file:text-terracotta hover:file:bg-terracotta/20 file:cursor-pointer cursor-pointer file:min-h-[44px]"
              />
              {photoFiles.length > 0 && (
                <p className="text-xs text-stone-400 mt-1">{photoFiles.length} {t("photos_selected")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("budget")} <span className="text-stone-400 text-xs font-normal">({t("optional")})</span>
              </label>
              <input
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-4 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all text-base shadow-sm focus:shadow-md min-h-[48px]"
                placeholder={t("budget_placeholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("project_desc")} <span className="text-stone-400 text-xs font-normal">({t("optional")})</span>
              </label>
              <p className="text-xs text-stone-400 mb-2">{t("desc_hint")}</p>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all resize-y text-base shadow-sm focus:shadow-md min-h-[48px]"
                placeholder={t("desc_placeholder")}
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
