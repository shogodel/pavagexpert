"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/use-translations";

export default function ContractorProfileClient() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rbqLicense, setRbqLicense] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState(0);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [username, setUsername] = useState("");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    fetch("/api/contractor/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return router.push(`/${locale}/contractor/login`);
        setCompany(d.data.company || "");
        setPhone(d.data.phone || "");
        setEmail(d.data.email || "");
        setRbqLicense(d.data.rbqLicense || "");
        setYearsInBusiness(d.data.yearsInBusiness || 0);
        setServiceAreas(d.data.serviceAreas || []);
        setUsername(d.data.username || "");
        setLoading(false);
      })
      .catch(() => router.push(`/${locale}/contractor/login`));
  }, [router, locale]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!phone || !/^\(?\d{3}\)?\s?\d{3}-?\d{4}$/.test(phone.trim())) {
      setMessage(t("phone_invalid"));
      return;
    }
    if (!email || !email.includes("@")) {
      setMessage(t("email_invalid"));
      return;
    }
    setSaving(true);
    const res = await fetch("/api/contractor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, phone: phone.trim(), email: email.trim().toLowerCase() }),
    });
    const d = await res.json();
    setSaving(false);
    if (d.ok) {
      setMessage(t("saved"));
    } else {
      setMessage(d.error || t("error"));
    }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage("");
    if (!pwCurrent) { setPwMessage(t("pw_current_required")); return; }
    if (!pwNew || pwNew.length < 6) { setPwMessage(t("pw_too_short")); return; }
    if (pwNew !== pwConfirm) { setPwMessage(t("pw_no_match")); return; }
    const res = await fetch("/api/contractor/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
    });
    const d = await res.json();
    if (d.ok) {
      setPwMessage(t("pw_success"));
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } else {
      setPwMessage(d.error || t("error"));
    }
  };

  if (loading) return <p className="text-center py-10 text-stone-500">{t("loading")}</p>;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-stone-800">{t("title")}</h1>

        {/* Account info badge */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-1">
            <span className="font-medium text-stone-700">{t("username")}:</span>
            <span>@{username}</span>
          </div>
          {rbqLicense && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <span className="font-medium text-stone-700">RBQ:</span>
              <span>{rbqLicense}</span>
            </div>
          )}
          {yearsInBusiness > 0 && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <span className="font-medium text-stone-700">{t("years")}:</span>
              <span>{yearsInBusiness} {t("years_unit")}</span>
            </div>
          )}
          {serviceAreas.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
              <span className="font-medium text-stone-700">{t("areas")}:</span>
              <span>{serviceAreas.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Edit profile */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">{t("edit_title")}</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("company")}</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("phone")}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="514 555-1234" className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("email")}</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>
          {message && <p className={`text-sm ${message === t("saved") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
          <button type="submit" disabled={saving} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? t("saving") : t("save")}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handlePwChange} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">{t("pw_title")}</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("pw_current")}</label>
            <input value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} type="password" required className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("pw_new")}</label>
            <input value={pwNew} onChange={(e) => setPwNew(e.target.value)} type="password" required minLength={6} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("pw_confirm")}</label>
            <input value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} type="password" required className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>
          {pwMessage && <p className={`text-sm ${pwMessage === t("pw_success") ? "text-green-600" : "text-red-600"}`}>{pwMessage}</p>}
          <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
            {t("pw_change")}
          </button>
        </form>
      </div>
    </div>
  );
}
