"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/use-translations";
import { motion } from "framer-motion";
import { getTrackingData, clearTracking } from "@/lib/utm-tracker";

export default function GetQuoteForm() {
  const t = useTranslations("get_quote");
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
      for (const f of photoFiles) fd.append("photos", f);
      const tracking = getTrackingData();
      if (tracking) fd.set("lead_source", JSON.stringify(tracking));
      const res = await fetch("/api/contact", {
        method: "POST",
        body: fd,
      });
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
          <h2 className="text-3xl font-bold text-stone-800 mb-2">{t("success_title")}</h2>
          <p className="text-stone-500">{t("success_msg")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">{t("title")}</h1>
          <p className="mt-2 text-stone-500">{t("subtitle")}</p>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-stone-200 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("name")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors text-base"
                placeholder="Jean Tremblay"
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
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors text-base"
                placeholder="jean@exemple.com"
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
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors text-base"
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
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors text-base"
                placeholder="(514) 555-1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("photos")} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-400 mb-2">{t("photos_hint")}</p>
              <input
                required
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-terracotta/10 file:text-terracotta hover:file:bg-terracotta/20 file:cursor-pointer cursor-pointer"
              />
              {photoFiles.length > 0 && (
                <p className="text-xs text-stone-400 mt-1">{photoFiles.length} fichier(s) sélectionné(s)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("video")}
              </label>
              <p className="text-xs text-stone-400 mb-2">{t("video_hint")}</p>
              <input
                type="file"
                accept="video/*"
                className="w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-terracotta/10 file:text-terracotta hover:file:bg-terracotta/20 file:cursor-pointer cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("budget")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors text-base"
                placeholder={t("budget_placeholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {t("project_desc")} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-400 mb-2">{t("desc_hint")}</p>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors resize-none text-base"
                placeholder={t("desc_placeholder")}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{t("error_msg")}</p>
            )}

            <p className="text-xs text-amber-600 text-center">
              {t("urgency")}
            </p>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors text-lg"
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
