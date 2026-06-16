"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/use-translations";

const AREA_OPTIONS = ["Montreal", "Laval", "Longueuil", "Brossard", "Repentigny", "Terrebonne", "South Shore", "West Island"];

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  return digits.length === 10;
}

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

type StatusMsg = { type: "success" | "error"; text: string } | null;

export default function ContractorProfileClient() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<StatusMsg>(null);
  const [pwMessage, setPwMessage] = useState<StatusMsg>(null);
  const [dirty, setDirty] = useState(false);
  const initialRef = useRef<string>("");

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
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pwFieldError, setPwFieldError] = useState<string | null>(null);

  // Auto-dismiss toasts
  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); } }, [message]);
  useEffect(() => { if (pwMessage) { const t = setTimeout(() => setPwMessage(null), 3000); return () => clearTimeout(t); } }, [pwMessage]);

  // Unsaved changes guard
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    fetch("/api/contractor/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return router.push(`/${locale}/contractor/login`);
        const snap = JSON.stringify({ company: d.data.company, phone: d.data.phone, email: d.data.email, rbqLicense: d.data.rbqLicense, yearsInBusiness: d.data.yearsInBusiness, serviceAreas: d.data.serviceAreas });
        initialRef.current = snap;
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

  const currentSnap = JSON.stringify({ company, phone, email, rbqLicense, yearsInBusiness, serviceAreas });
  useEffect(() => { setDirty(currentSnap !== initialRef.current); }, [currentSnap]);

  const handleAreaToggle = (area: string) => {
    setServiceAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]);
  };

  const validatePhone = (v: string) => {
    if (v && !isValidPhone(v)) { setPhoneError(t("phone_invalid")); return false; }
    setPhoneError(null); return true;
  };

  const validateEmail = (v: string) => {
    if (v && !v.includes("@")) { setEmailError(t("email_invalid")); return false; }
    setEmailError(null); return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validatePhone(phone)) return;
    if (!validateEmail(email)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contractor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company, phone: phone.replace(/\D/g, "").slice(0, 10),
          email: email.trim().toLowerCase(),
          rbqLicense, yearsInBusiness, serviceAreas,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        const snap = JSON.stringify({ company: d.data.company, phone: d.data.phone, email: d.data.email, rbqLicense: d.data.rbqLicense, yearsInBusiness: d.data.yearsInBusiness, serviceAreas: d.data.serviceAreas });
        initialRef.current = snap;
        setMessage({ type: "success", text: t("saved") });
      } else {
        setMessage({ type: "error", text: d.error || t("error") });
      }
    } catch { setMessage({ type: "error", text: t("error") }); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    setPwFieldError(null);
    if (!pwCurrent) { setPwFieldError(t("pw_current_required")); return; }
    if (!pwNew || pwNew.length < 6) { setPwFieldError(t("pw_too_short")); return; }
    if (pwNew !== pwConfirm) { setPwFieldError(t("pw_no_match")); return; }
    const res = await fetch("/api/contractor/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
    });
    const d = await res.json();
    if (d.ok) {
      setPwMessage({ type: "success", text: t("pw_success") });
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } else {
      setPwMessage({ type: "error", text: d.error || t("error") });
    }
  };

  if (loading) return <p className="text-center py-10 text-stone-500">{t("loading")}</p>;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href={`/${locale}/contractor/dashboard`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {t("back")}
        </Link>

        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          {t("title")}
        </h1>

        {/* Account info */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-stone-500">
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
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <span className="font-medium text-stone-700">{t("areas")}:</span>
              <span>{serviceAreas.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Edit profile form */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            {t("edit_title")}
          </h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("company")}</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("phone")}</label>
            <input
              value={phone}
              onChange={(e) => { setPhone(formatPhone(e.target.value)); if (phoneError) validatePhone(e.target.value); }}
              onBlur={(e) => { if (e.target.value) validatePhone(e.target.value); else setPhoneError(null); }}
              placeholder="(514) 555-1234"
              className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-terracotta/50 ${phoneError ? "border-red-400" : "border-stone-300"}`}
            />
            {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("email")}</label>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
              onBlur={(e) => { if (e.target.value) validateEmail(e.target.value); else setEmailError(null); }}
              type="email"
              className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-terracotta/50 ${emailError ? "border-red-400" : "border-stone-300"}`}
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">RBQ</label>
            <input value={rbqLicense} onChange={(e) => setRbqLicense(e.target.value)} placeholder="RBQ-1234-5678-90" className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("years")}</label>
            <input value={yearsInBusiness || ""} onChange={(e) => setYearsInBusiness(parseInt(e.target.value) || 0)} type="number" min={0} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("areas")}</label>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaToggle(area)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${serviceAreas.includes(area) ? "bg-terracotta text-white border-terracotta" : "bg-white text-stone-600 border-stone-300 hover:border-terracotta"}`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div className={`text-sm px-4 py-2 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={saving} className="bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : null}
            {saving ? t("saving") : t("save")}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handlePwChange} className="bg-stone-50 rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            {t("pw_title")}
          </h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("pw_current")}</label>
            <div className="relative">
              <input value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} type={showPwCurrent ? "text" : "password"} required className="w-full px-4 py-2 pr-10 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
              <button type="button" onClick={() => setShowPwCurrent(!showPwCurrent)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer" aria-label={showPwCurrent ? t("hide_password") : t("show_password")}>
                {showPwCurrent ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("pw_new")}</label>
            <div className="relative">
              <input value={pwNew} onChange={(e) => setPwNew(e.target.value)} type={showPwNew ? "text" : "password"} required minLength={6} className="w-full px-4 py-2 pr-10 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
              <button type="button" onClick={() => setShowPwNew(!showPwNew)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer" aria-label={showPwNew ? t("hide_password") : t("show_password")}>
                {showPwNew ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("pw_confirm")}</label>
            <div className="relative">
              <input value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} type={showPwConfirm ? "text" : "password"} required className="w-full px-4 py-2 pr-10 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
              <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer" aria-label={showPwConfirm ? t("hide_password") : t("show_password")}>
                {showPwConfirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {pwFieldError && <p className="text-sm text-red-600">{pwFieldError}</p>}
          {pwMessage && (
            <div className={`text-sm px-4 py-2 rounded-lg ${pwMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {pwMessage.text}
            </div>
          )}

          <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
            {t("pw_change")}
          </button>
        </form>
      </div>
    </div>
  );
}
