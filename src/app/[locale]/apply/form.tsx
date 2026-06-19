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

function validateField(
  field: string,
  value: string | number | string[]
): string | null {
  switch (field) {
    case "company":
      return typeof value === "string" && value.trim().length > 0 && value.length <= 100
        ? null : "company_required";
    case "rbqLicense":
      return typeof value === "string" && /^RBQ\s?\d{4,6}-\d{4,5}-\d{2}$/i.test(value.trim())
        ? null : "rbq_invalid";
    case "phone":
      return typeof value === "string" && /^\(?\d{3}\)?\s?\d{3}-?\d{4}$/.test(value.trim())
        ? null : "phone_invalid";
    case "email":
      return typeof value === "string" && value.includes("@") ? null : "email_invalid";
    case "yearsInBusiness": {
      const n = typeof value === "string" ? parseInt(value, 10) : value;
      return typeof n === "number" && !isNaN(n) && n >= 0 && n <= 100 ? null : "years_invalid";
    }
    case "serviceAreas":
      return Array.isArray(value) && value.length > 0 ? null : "areas_required";
    default:
      return null;
  }
}

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [username, setUsername] = useState("");
  const [serverError, setServerError] = useState("");

  function toggleArea(area: string) {
    setForm((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter((a) => a !== area)
        : [...prev.serviceAreas, area],
    }));
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errKey = validateField(field, form[field as keyof typeof form]);
    if (errKey) {
      setErrors((prev) => ({ ...prev, [field]: t[errKey] }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const fieldErrors: Record<string, string> = {};
    for (const field of ["company", "rbqLicense", "phone", "email", "yearsInBusiness", "serviceAreas"]) {
      const errKey = validateField(field, form[field as keyof typeof form]);
      if (errKey) fieldErrors[field] = t[errKey];
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setTouched({ company: true, rbqLicense: true, phone: true, email: true, yearsInBusiness: true, serviceAreas: true });
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
          yearsInBusiness: parseInt(form.yearsInBusiness, 10),
          serviceAreas: form.serviceAreas,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.errors) {
          const errorKeyMap: Record<string, string> = {
            company: "company_required",
            rbqLicense: "rbq_invalid",
            phone: "phone_invalid",
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
          setTouched({ company: true, rbqLicense: true, phone: true, email: true, yearsInBusiness: true, serviceAreas: true });
        } else {
          setServerError(t.error_generic);
        }
        return;
      }
      setUsername(data.username || "");
      setDone(true);
    } catch {
      setServerError(t.error_network);
    } finally {
      setSubmitting(false);
    }
  }

  function inputClass(field: string): string {
    const showError = touched[field] && errors[field];
    return `w-full px-4 py-2.5 rounded-lg border ${showError ? "border-red-400" : "border-stone-300"} focus:ring-2 focus:ring-terracotta/50 outline-none transition-colors`;
  }

  if (done) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">{t.success_title}</h1>
          <p className="text-stone-600 mb-6">{t.success_body}</p>
          {username && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 inline-block">
              <p className="text-xs text-amber-700 font-medium mb-1">{t.success_username}</p>
              <p className="text-lg font-bold text-amber-900 font-mono">@{username}</p>
              <p className="text-xs text-amber-600 mt-2">{t.success_username_hint}</p>
            </div>
          )}
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
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="company">{t.company} *</label>
            <input id="company" type="text" required maxLength={100} autoComplete="organization"
              value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} onBlur={() => handleBlur("company")}
              className={inputClass("company")} />
            {touched.company && errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="rbqLicense">{t.rbq} *</label>
            <input id="rbqLicense" type="text" required maxLength={30} autoComplete="off"
              placeholder="RBQ 1234-5675-01"
              value={form.rbqLicense} onChange={(e) => setForm({ ...form, rbqLicense: e.target.value })} onBlur={() => handleBlur("rbqLicense")}
              className={inputClass("rbqLicense")} />
            {touched.rbqLicense && errors.rbqLicense && <p className="text-red-500 text-xs mt-1">{errors.rbqLicense}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="phone">{t.phone} *</label>
            <input id="phone" type="tel" required maxLength={20} autoComplete="tel"
              placeholder="514 555-1234"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} onBlur={() => handleBlur("phone")}
              className={inputClass("phone")} />
            {touched.phone && errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="email">{t.email} *</label>
            <input id="email" type="email" required maxLength={254} autoComplete="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={() => handleBlur("email")}
              className={inputClass("email")} />
            {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="years">{t.years} *</label>
            <input id="years" type="number" min={0} max={100} required maxLength={3} autoComplete="off"
              value={form.yearsInBusiness} onChange={(e) => setForm({ ...form, yearsInBusiness: e.target.value })} onBlur={() => handleBlur("yearsInBusiness")}
              className={inputClass("yearsInBusiness")} />
            {touched.yearsInBusiness && errors.yearsInBusiness && <p className="text-red-500 text-xs mt-1">{errors.yearsInBusiness}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">{t.areas} *</label>
            <div className="space-y-2">
              {serviceAreaOptions.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={form.serviceAreas.includes(area)}
                    onChange={() => toggleArea(area)}
                    className="rounded border-stone-300 text-terracotta focus:ring-terracotta/50" />
                  <span className="text-sm text-stone-700">{t[`area_${area}`]}</span>
                </label>
              ))}
            </div>
            {touched.serviceAreas && errors.serviceAreas && <p className="text-red-500 text-xs mt-1">{errors.serviceAreas}</p>}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2">
            {submitting ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : null}
            {submitting ? "..." : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
