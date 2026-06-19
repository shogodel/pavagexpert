"use client";

import { useState } from "react";

interface Props {
  currentVersion: string;
  onAccepted: () => void;
}

export default function TermsAcceptanceBanner({ currentVersion, onAccepted }: Props) {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await fetch("/api/terms/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsVersion: "2025-01" }),
      });
      if (res.ok) onAccepted();
    } catch {
      /* ignore */
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-3">
          Mise à jour des conditions d&rsquo;utilisation
        </h2>
        <p className="text-stone-400 text-sm leading-relaxed mb-1">
          Nos conditions d&rsquo;utilisation ont été mises à jour. Veuillez les consulter et les accepter pour continuer à utiliser la plateforme.
        </p>
        <div className="bg-stone-800 rounded-lg p-4 mb-4 text-sm text-stone-300 max-h-48 overflow-y-auto leading-relaxed">
          <p className="mb-2"><strong>1. Acceptation des conditions</strong></p>
          <p className="mb-2">En acceptant les présentes conditions, vous confirmez avoir pris connaissance et acceptez d&rsquo;être lié par les conditions d&rsquo;utilisation de Pavagexpert.</p>
          <p className="mb-2"><strong>2. Protection des données</strong></p>
          <p className="mb-2">Vous reconnaissez que Pavagexpert collecte et traite vos données personnelles conformément à sa politique de confidentialité, conformément à la Loi sur la protection des renseignements personnels du Québec et au RGPD.</p>
          <p className="mb-2"><strong>3. Conformité</strong></p>
          <p>Vous vous engagez à utiliser la plateforme conformément aux lois et règlements applicables.</p>
        </div>
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm"
        >
          {accepting ? "Traitement..." : "J&rsquo;accepte les conditions"}
        </button>
      </div>
    </div>
  );
}
