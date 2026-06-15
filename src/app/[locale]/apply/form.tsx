"use client";

import { useState } from "react";

interface ApplyFormProps {
  locale: string;
  t: Record<string, string>;
}

const serviceAreaOptions = [
  "residential",
  "commercial",
  "industrial",
  "roadwork",
  "municipal",
];

export default function ApplyForm({ locale, t }: ApplyFormProps) {
  const [form, setForm] = useState({
    company: "",
    rbqLicense: "",
    phone: "",
    email: "",
    yearsInBusiness: "",
    serviceAreas: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  function toggleArea(area: string) {
    setForm((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter((a) => a !== area)
        : [...prev.serviceAreas, area],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const fieldErrors: Record<string, string> = {};
    if (!form.company.trim()) fieldErrors.company = t.company_required;
    if (!/^RBQ\s?\d{4,6}-\d{4,5}-\d{2}$/i.test(form.rbqLicense.trim())) fieldErrors.rbqLicense = t.rbq_invalid;
    if (!/^\(?\d{3}\)?\s?\d{3}-?\d{4}$/.test(form.phone.trim())) fieldErrors.phone = t.phone_invalid;
    if (!form.email.includes("@")) fieldErrors.email = t.email_invalid;
    const yrs = parseInt(form.yearsInBusiness, 10);
    if (isNaN(yrs) || yrs < 0 || yrs > 100) fieldErrors.yearsInBusiness = t.years_invalid;
    if (form.serviceAreas.length === 0) fieldErrors.serviceAreas = t.areas_required;

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contractors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company.trim(),
          rbqLicense: form.rbqLicense.trim(),
          phone: form.phone.trim(),
          email: form.email.trim().toLowerCase(),
          yearsInBusiness: yrs,
          serviceAreas: form.serviceAreas,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.errors) {
          const errorKeyMap: Record<string, string> = {
            company: "company_required",
            rbqLicense: "rbq_invalid",
            yearsInBusiness: "years_invalid",
            serviceAreas: "areas_required",
            email: "email_taken",
          };
          const apiErrors: Record<string, string> = {};
          for (const key of data.errors) {
            const tKey = errorKeyMap[key] || `${key}_invalid`;
            apiErrors[key] = t[tKey] || t.error_generic;
          }
          setErrors(apiErrors);
        } else {
          setServerError(t.error_generic);
        }
        return;
      }
      setDone(true);
    } catch {
      setServerError(t.error_network);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">{t.success_title}</h1>
          <p className="text-stone-600">{t.success_body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">{t.title}</h1>
        <p className="text-stone-600 mb-8">{t.subtitle}</p>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.company} *</label>
            <input
              type="text" required value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.company ? "border-red-400" : "border-stone-300"} focus:ring-2 focus:ring-terracotta/50 outline-none`}
            />
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.rbq} *</label>
            <input
              type="text" required value={form.rbqLicense}
              placeholder="RBQ 1234-5675-01"
              onChange={(e) => setForm({ ...form, rbqLicense: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.rbqLicense ? "border-red-400" : "border-stone-300"} focus:ring-2 focus:ring-terracotta/50 outline-none`}
            />
            {errors.rbqLicense && <p className="text-red-500 text-xs mt-1">{errors.rbqLicense}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.phone} *</label>
            <input
              type="tel" required value={form.phone}
              placeholder="514 555-1234"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? "border-red-400" : "border-stone-300"} focus:ring-2 focus:ring-terracotta/50 outline-none`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.email} *</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? "border-red-400" : "border-stone-300"} focus:ring-2 focus:ring-terracotta/50 outline-none`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.years} *</label>
            <input
              type="number" min="0" max="100" required value={form.yearsInBusiness}
              onChange={(e) => setForm({ ...form, yearsInBusiness: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.yearsInBusiness ? "border-red-400" : "border-stone-300"} focus:ring-2 focus:ring-terracotta/50 outline-none`}
            />
            {errors.yearsInBusiness && <p className="text-red-500 text-xs mt-1">{errors.yearsInBusiness}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">{t.areas} *</label>
            <div className="space-y-2">
              {serviceAreaOptions.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.serviceAreas.includes(area)}
                    onChange={() => toggleArea(area)}
                    className="rounded border-stone-300 text-terracotta focus:ring-terracotta/50"
                  />
                  <span className="text-sm text-stone-700">{t[`area_${area}`]}</span>
                </label>
              ))}
            </div>
            {errors.serviceAreas && <p className="text-red-500 text-xs mt-1">{errors.serviceAreas}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {submitting ? "..." : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
