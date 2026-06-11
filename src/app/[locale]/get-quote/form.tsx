"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/use-translations";
import { motion } from "framer-motion";

export default function GetQuoteForm() {
  const t = useTranslations("get_quote");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    projectType: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("API error");
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
    <div className="min-h-[80vh] bg-stone-50">
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">{t("title")}</h1>
          <p className="mt-2 text-stone-500">{t("subtitle")}</p>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-stone-200 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("name")}</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t("email")}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t("phone")}</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("address")}</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("project_type")}</label>
              <select
                value={form.projectType}
                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors bg-white"
              >
                <option value="">{t("project_type")}</option>
                <option value="driveway">Pavé Uni - Entrée / Driveway</option>
                <option value="patio">Pavé Uni - Terrasse / Patio</option>
                <option value="walkway">Pavé Uni - Sentier / Walkway</option>
                <option value="retaining">Pavé Uni - Mur / Wall</option>
                <option value="commercial">Pavé Uni - Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("project_desc")}</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("photos")}</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-terracotta/10 file:text-terracotta hover:file:bg-terracotta/20"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{t("error_msg")}</p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-lg"
            >
              {sending ? "..." : t("submit")}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
