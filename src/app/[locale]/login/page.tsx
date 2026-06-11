"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error();

      router.push("/admin");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-stone-800 rounded-xl p-8 shadow-xl space-y-5"
      >
        <div className="flex justify-center mb-2">
          <img src="/images/logo-white.svg" alt="Pavé Expert" className="h-8 w-auto" />
        </div>
        <p className="text-stone-400 text-sm text-center">Connexion administrateur</p>

        {error && (
          <p className="text-red-400 text-sm text-center">Identifiants invalides</p>
        )}

        <div>
          <label className="block text-sm text-stone-400 mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-stone-700 border border-stone-600 text-white focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-1">Mot de passe</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-stone-700 border border-stone-600 text-white focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? "..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
