"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-translations";

export default function ContractorProfileClient() {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    fetch("/api/contractor/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return router.push(`/${locale}/contractor/login`);
        setCompany(d.data.company || "");
        setPhone(d.data.phone || "");
        setEmail(d.data.email || "");
        setLoading(false);
      });
  }, [router, locale]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/contractor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, phone, email }),
    });
    const d = await res.json();
    setSaving(false);
    setMessage(d.ok ? "Profil mis à jour" : "Erreur");
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwCurrent || !pwNew || pwNew.length < 6) {
      setPwMessage("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    const res = await fetch("/api/contractor/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
    });
    const d = await res.json();
    if (d.ok) {
      setPwMessage("Mot de passe changé avec succès");
      setPwCurrent("");
      setPwNew("");
    } else {
      setPwMessage(d.error || "Erreur");
    }
  };

  if (loading) return <p className="text-center py-10">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-lg shadow p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Entreprise</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Courriel</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </form>

      <form onSubmit={handlePwChange} className="space-y-4 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold">Changer le mot de passe</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
          <input value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} type="password" required className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
          <input value={pwNew} onChange={(e) => setPwNew(e.target.value)} type="password" required minLength={6} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        {pwMessage && <p className={`text-sm ${pwMessage.includes("succès") ? "text-green-600" : "text-red-600"}`}>{pwMessage}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}
