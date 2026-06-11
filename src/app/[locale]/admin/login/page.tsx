"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, password }),
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
        <h1 className="text-2xl font-bold text-white text-center">Admin</h1>

        {error && (
          <p className="text-red-400 text-sm text-center">Identifiants invalides</p>
        )}

        <div>
          <label className="block text-sm text-stone-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-stone-700 border border-stone-600 text-white focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-1">Mot de passe</label>
          <input
            type="password"
            required
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
