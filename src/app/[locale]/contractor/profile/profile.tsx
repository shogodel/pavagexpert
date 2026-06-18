"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/use-translations";

const AREA_OPTIONS = ["Montreal", "Laval", "Longueuil", "Brossard", "Repentigny", "Terrebonne", "South Shore", "West Island"];
const PLATFORMS = [
  "google_business","facebook","instagram","linkedin","youtube","tiktok","twitter","houzz","homestars","pinterest",
] as const;
const CATEGORIES = ["driveway","patio","walkway","commercial","excavation","drainage","turf","landscaping","retaining_wall","other"] as const;

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

interface Social {
  id: string; platform: string; url: string; label: string;
}
interface Review {
  id: string; contractorId: string; clientName: string;
  rating: number; title: string; body: string;
  response: string; respondedAt: string | null; createdAt: string;
}
interface PortfolioItem {
  id: string; caption: string; category: string; sortOrder: number;
}

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
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [insuranceInfo, setInsuranceInfo] = useState("");
  const [warrantyInfo, setWarrantyInfo] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [verified, setVerified] = useState(false);
  const [profileCompletionPct, setProfileCompletionPct] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [socials, setSocials] = useState<Social[]>([]);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [socialMsg, setSocialMsg] = useState<StatusMsg>(null);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [portfolioMsg, setPortfolioMsg] = useState<StatusMsg>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [reviewMsg, setReviewMsg] = useState<StatusMsg>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<"social" | "portfolio" | null>(null);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pwFieldError, setPwFieldError] = useState<string | null>(null);

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); } }, [message]);
  useEffect(() => { if (pwMessage) { const t = setTimeout(() => setPwMessage(null), 3000); return () => clearTimeout(t); } }, [pwMessage]);
  useEffect(() => { if (socialMsg) { const t = setTimeout(() => setSocialMsg(null), 3000); return () => clearTimeout(t); } }, [socialMsg]);
  useEffect(() => { if (portfolioMsg) { const t = setTimeout(() => setPortfolioMsg(null), 3000); return () => clearTimeout(t); } }, [portfolioMsg]);
  useEffect(() => { if (reviewMsg) { const t = setTimeout(() => setReviewMsg(null), 3000); return () => clearTimeout(t); } }, [reviewMsg]);

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
        const p = d.data;
        const snap = JSON.stringify({
          company: p.company, phone: p.phone, email: p.email,
          rbqLicense: p.rbqLicense, yearsInBusiness: p.yearsInBusiness,
          serviceAreas: p.serviceAreas, bio: p.bio, photoUrl: p.photoUrl,
          insuranceInfo: p.insuranceInfo, warrantyInfo: p.warrantyInfo,
          availabilityStatus: p.availabilityStatus,
        });
        initialRef.current = snap;
        setCompany(p.company || "");
        setPhone(p.phone || "");
        setEmail(p.email || "");
        setRbqLicense(p.rbqLicense || "");
        setYearsInBusiness(p.yearsInBusiness || 0);
        setServiceAreas(p.serviceAreas || []);
        setUsername(p.username || "");
        setBio(p.bio || "");
        setPhotoUrl(p.photoUrl || "");
        setInsuranceInfo(p.insuranceInfo || "");
        setWarrantyInfo(p.warrantyInfo || "");
        setAvailabilityStatus(p.availabilityStatus || "available");
        setVerified(p.verified || false);
        setProfileCompletionPct(p.profileCompletionPct || 0);
        setRating(p.rating || 0);
        setReviewCount(p.reviewCount || 0);
        setSocials(d.socials || []);
        setLoading(false);
      })
      .catch(() => router.push(`/${locale}/contractor/login`));

    fetch("/api/contractor/portfolio")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setPortfolio(d.data); })
      .catch(() => {});

    fetch("/api/contractor/reviews")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setReviews(d.data); })
      .catch(() => {});
  }, [router, locale]);

  const currentSnap = JSON.stringify({
    company, phone, email, rbqLicense, yearsInBusiness, serviceAreas,
    bio, photoUrl, insuranceInfo, warrantyInfo, availabilityStatus,
  });
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
          company,
          phone: phone.replace(/\D/g, "").slice(0, 10),
          email: email.trim().toLowerCase(),
          rbqLicense, yearsInBusiness, serviceAreas,
          bio, photoUrl, insuranceInfo, warrantyInfo, availabilityStatus,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        initialRef.current = JSON.stringify({
          company: d.data.company, phone: d.data.phone, email: d.data.email,
          rbqLicense: d.data.rbqLicense, yearsInBusiness: d.data.yearsInBusiness,
          serviceAreas: d.data.serviceAreas, bio: d.data.bio, photoUrl: d.data.photoUrl,
          insuranceInfo: d.data.insuranceInfo, warrantyInfo: d.data.warrantyInfo,
          availabilityStatus: d.data.availabilityStatus,
        });
        setProfileCompletionPct(d.data.profileCompletionPct || 0);
        setMessage({ type: "success", text: t("saved") });
      } else {
        setMessage({ type: "error", text: d.error || t("error") });
      }
    } catch { setMessage({ type: "error", text: t("error") }); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null); setPwFieldError(null);
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

  const handleAddSocial = async () => {
    if (!newPlatform || !newUrl) return;
    const res = await fetch("/api/contractor/socials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: newPlatform, url: newUrl }),
    });
    const d = await res.json();
    if (d.ok) {
      setSocials((prev) => [...prev.filter((s) => s.platform !== newPlatform), d.data]);
      setNewPlatform(""); setNewUrl("");
      setSocialMsg({ type: "success", text: t("saved") });
    } else {
      setSocialMsg({ type: "error", text: t("error") });
    }
  };

  const handleDeleteSocial = async (id: string) => {
    const res = await fetch(`/api/contractor/socials?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setSocials((prev) => prev.filter((s) => s.id !== id));
      setSocialMsg({ type: "success", text: t("saved") });
    }
    setConfirmDeleteId(null); setDeleteTarget(null);
  };

  const handleAddPortfolio = async () => {
    const res = await fetch("/api/contractor/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: newCaption, category: newCategory }),
    });
    const d = await res.json();
    if (d.ok) {
      setPortfolio((prev) => [...prev, d.data]);
      setNewCaption(""); setNewCategory("other");
      setPortfolioMsg({ type: "success", text: t("saved") });
    } else {
      setPortfolioMsg({ type: "error", text: t("error") });
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    const res = await fetch(`/api/contractor/portfolio?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
      setPortfolioMsg({ type: "success", text: t("saved") });
    }
    setConfirmDeleteId(null); setDeleteTarget(null);
  };

  const handleRespondToReview = async (reviewId: string) => {
    const res = await fetch("/api/contractor/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, response: responseText }),
    });
    const d = await res.json();
    if (d.ok) {
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, response: responseText, respondedAt: new Date().toISOString() } : r));
      setRespondingTo(null); setResponseText("");
      setReviewMsg({ type: "success", text: t("review_response_sent") });
    } else {
      setReviewMsg({ type: "error", text: t("error") });
    }
  };

  if (loading) return <p className="text-center py-10 text-stone-500">{t("loading")}</p>;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href={`/${locale}/contractor/dashboard`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {t("back")}
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center ${photoUrl ? "" : ""}`}>
              {photoUrl ? (
                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-stone-400 font-bold">{company.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-stone-800">{company || t("title")}</h1>
                {verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {t("verified_badge")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t("not_verified")}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500 mt-1">@{username}</p>
              {rating > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-500 text-sm">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
                  <span className="text-xs text-stone-400">{rating} ({reviewCount} avis)</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile completion bar (Freud: pleasure of visible progress) */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>{t("completion")}</span>
              <span>{profileCompletionPct}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${profileCompletionPct === 100 ? "bg-emerald-500" : "bg-terracotta"}`}
                style={{ width: `${profileCompletionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main info form */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            {t("edit_title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("company")}</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("phone")}</label>
              <input value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); if (phoneError) validatePhone(e.target.value); }} onBlur={(e) => { if (e.target.value) validatePhone(e.target.value); else setPhoneError(null); }} placeholder="(514) 555-1234" className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-terracotta/50 ${phoneError ? "border-red-400" : "border-stone-300"}`} />
              {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("email")}</label>
              <input value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }} onBlur={(e) => { if (e.target.value) validateEmail(e.target.value); else setEmailError(null); }} type="email" className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-terracotta/50 ${emailError ? "border-red-400" : "border-stone-300"}`} />
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
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("photo_url")}</label>
              <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder={t("photo_placeholder")} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("areas")}</label>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map((area) => (
                <button key={area} type="button" onClick={() => handleAreaToggle(area)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${serviceAreas.includes(area) ? "bg-terracotta text-white border-terracotta" : "bg-white text-stone-600 border-stone-300 hover:border-terracotta"}`}>
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("bio")}</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder={t("bio_placeholder")} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none resize-y" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("insurance")}</label>
              <input value={insuranceInfo} onChange={(e) => setInsuranceInfo(e.target.value)} placeholder={t("insurance_placeholder")} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("warranty")}</label>
              <input value={warrantyInfo} onChange={(e) => setWarrantyInfo(e.target.value)} placeholder={t("warranty_placeholder")} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("availability")}</label>
            <div className="flex gap-2">
              {["available", "busy", "unavailable"].map((s) => (
                <button key={s} type="button" onClick={() => setAvailabilityStatus(s)}
                  className={`text-xs px-4 py-2 rounded-full border transition-colors cursor-pointer ${availabilityStatus === s ? "bg-terracotta text-white border-terracotta" : "bg-white text-stone-600 border-stone-300 hover:border-terracotta"}`}>
                  {t(s)}
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

        {/* Portfolio section (Jung: Magician archetype — transformation shown through before/after work) */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {t("portfolio")}
          </h2>

          {portfolioMsg && (
            <div className={`text-sm px-4 py-2 rounded-lg ${portfolioMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {portfolioMsg.text}
            </div>
          )}

          {portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {portfolio.map((item) => (
                <div key={item.id} className="relative group bg-stone-50 rounded-lg p-3 border border-stone-200">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-stone-700 truncate">{item.caption || t("cat_" + item.category)}</span>
                    <button type="button" onClick={() => { setConfirmDeleteId(item.id); setDeleteTarget("portfolio"); }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <span className="text-xs text-stone-400">{t("cat_" + item.category)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">{t("portfolio_empty")}</p>
          )}

          <div className="flex gap-3 flex-wrap">
            <input value={newCaption} onChange={(e) => setNewCaption(e.target.value)} placeholder={t("caption")} className="flex-1 min-w-[140px] px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{t("cat_" + c)}</option>)}
            </select>
            <button type="button" onClick={handleAddPortfolio} className="bg-terracotta hover:bg-terracotta-dark text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
              {t("add_photo")}
            </button>
          </div>
        </div>

        {/* Social profiles section (Jung: Persona archetype — the digital face presented to the world) */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            {t("social_links")}
          </h2>

          {socialMsg && (
            <div className={`text-sm px-4 py-2 rounded-lg ${socialMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {socialMsg.text}
            </div>
          )}

          {socials.length > 0 ? (
            <div className="space-y-2">
              {socials.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-stone-50 rounded-lg px-4 py-2.5 border border-stone-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-stone-600 w-32 truncate">{t(s.platform) || s.platform}</span>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-terracotta hover:underline truncate max-w-[200px]">{s.url}</a>
                  </div>
                  <button type="button" onClick={() => { setConfirmDeleteId(s.id); setDeleteTarget("social"); }}
                    className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">{t("social_empty")}</p>
          )}

          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs text-stone-500 mb-1">{t("social_platform")}</label>
              <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none">
                <option value="">—</option>
                {PLATFORMS.map((p) => <option key={p} value={p}>{t(p)}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-stone-500 mb-1">{t("social_url")}</label>
              <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
            </div>
            <button type="button" onClick={handleAddSocial} disabled={!newPlatform || !newUrl}
              className="bg-terracotta hover:bg-terracotta-dark disabled:opacity-40 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
              {t("social_add")}
            </button>
          </div>
        </div>

        {/* Reviews section (Jung: Shadow integration — responding to reviews shows honesty) */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            {t("reviews_title")}
          </h2>

          {reviewMsg && (
            <div className={`text-sm px-4 py-2 rounded-lg ${reviewMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {reviewMsg.text}
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-stone-50 rounded-lg border border-stone-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-stone-700">{r.clientName}</span>
                      <span className="text-amber-500 text-sm ml-2">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.title && <p className="text-xs font-medium text-stone-600 mb-1">{r.title}</p>}
                  {r.body && <p className="text-xs text-stone-500 leading-relaxed">{r.body}</p>}
                  {r.response ? (
                    <div className="mt-2 pl-3 border-l-2 border-terracotta/30">
                      <p className="text-xs text-stone-400 italic">
                        <span className="font-medium text-stone-500">{t("review_respond")}:</span> {r.response}
                      </p>
                    </div>
                  ) : !r.response ? (
                    <div className="mt-2">
                      {respondingTo === r.id ? (
                        <div className="flex gap-2">
                          <input value={responseText} onChange={(e) => setResponseText(e.target.value)}
                            placeholder={t("review_response_placeholder")}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                          <button type="button" onClick={() => handleRespondToReview(r.id)} disabled={!responseText.trim()}
                            className="bg-terracotta hover:bg-terracotta-dark disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                            {t("review_send_response")}
                          </button>
                          <button type="button" onClick={() => { setRespondingTo(null); setResponseText(""); }}
                            className="text-xs text-stone-400 hover:text-stone-600 px-2 cursor-pointer">{t("cancel")}</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setRespondingTo(r.id)}
                          className="text-xs text-terracotta hover:underline cursor-pointer">
                          {t("review_respond")}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">{t("reviews_empty")}</p>
          )}
        </div>

        {/* Change password */}
        <form onSubmit={handlePwChange} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
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

        {/* Confirm delete modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4">
              <p className="text-sm text-stone-700 mb-4">{t("confirm_delete")}?</p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setConfirmDeleteId(null); setDeleteTarget(null); }}
                  className="px-4 py-2 text-sm text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer">
                  {t("cancel")}
                </button>
                <button type="button" onClick={() => {
                  if (deleteTarget === "social") handleDeleteSocial(confirmDeleteId);
                  else if (deleteTarget === "portfolio") handleDeletePortfolio(confirmDeleteId);
                }}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
