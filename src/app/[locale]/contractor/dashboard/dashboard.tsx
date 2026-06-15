"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-translations";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  budget: string;
  description: string;
  createdAt: string;
}

export default function ContractorDashboard() {
  const locale = useLocale();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [profile, setProfile] = useState<{ company: string; email: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contractor/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProfile(d.data);
        else router.push(`/${locale}/login`);
      })
      .catch(() => router.push(`/${locale}/login`));
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, locale]);

  const handleLogout = () => {
    document.cookie = "contractor_token=; path=/; max-age=0";
    router.push(`/${locale}`);
  };

  if (loading) return <p className="text-center py-10">Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/${locale}/contractor/profile`)}
            className="text-blue-600 hover:underline"
          >
            Mon profil
          </button>
          <button onClick={handleLogout} className="text-red-600 hover:underline">
            Déconnexion
          </button>
        </div>
      </div>

      {profile && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <p className="text-lg font-semibold">{profile.company}</p>
          <p className="text-gray-600">{profile.email} | {profile.phone}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Projets disponibles</h2>
      {leads.length === 0 ? (
        <p className="text-gray-500">Aucun projet pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{lead.name}</h3>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                    <p className="text-sm text-gray-500">{lead.phone} | {lead.postalCode}</p>
                    {lead.budget && <p className="text-sm font-medium text-green-700">Budget : {lead.budget}</p>}
                  </div>
                <span className="text-xs text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString("fr-CA")}
                </span>
              </div>
              {lead.description && (
                <p className="mt-2 text-gray-700 text-sm">{lead.description}</p>
              )}
              <button className="mt-3 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700">
                Réclamer ce projet
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
