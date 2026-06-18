"use client";
import { useState, useCallback } from "react";

export default function ResendLink({ jobId, locale }: { jobId: string; locale: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/resend-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else if (res.status === 429) {
        setError("Veuillez patienter 60 secondes avant de renvoyer un lien.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    }
    setSending(false);
  }, [jobId]);

  if (sent) {
    return (
      <main className="min-h-screen bg-stone-50 pt-32 pb-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-stone-800">Lien envoyé !</h1>
            <p className="text-sm text-stone-500">Vérifiez votre boîte de réception. Le lien expire dans 7 jours.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-32 pb-16">
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" /></svg>
          </div>
          <h1 className="mb-2 text-center text-xl font-bold text-stone-800">Lien de connexion</h1>
          <p className="mb-6 text-center text-sm text-stone-500">
            Entrez votre courriel pour recevoir un lien magique vous permettant d&rsquo;accéder à votre projet.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@courriel.com"
              required
              className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-800 disabled:opacity-50"
            >
              {sending ? "Envoi en cours..." : "Recevoir le lien"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
