"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/use-translations";

const errorCode: Record<string, string> = {
  missing_fields: "error_missing_fields",
  invalid_credentials: "error",
  server_error: "error_server",
  too_many_attempts: "error_too_many",
  ip_blocked: "error_ip_blocked",
};

export default function LoginForm() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode_, setErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    setErrorCode(null);

    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      setValidationError(t("error_missing_fields"));
      return;
    }
    if (p.length < 6) {
      setValidationError(t("error"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrorCode(data.code || "invalid_credentials");
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else if (data.role === "admin") {
        router.push(`/${locale}/admin`);
      } else if (data.role === "contractor") {
        router.push(`/${locale}/contractor/dashboard`);
      }
    } catch {
      setErrorCode("server_error");
    } finally {
      setLoading(false);
    }
  }

  const errKey = errorCode_ ? errorCode[errorCode_] || "error" : null;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-5">
        {redirectTo && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 text-center">
            {t("redirect_banner")}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-stone-800 rounded-xl p-8 shadow-xl space-y-5"
        >
          <div className="flex justify-center mb-2">
            <img src="/images/logo-white.svg" alt="Pavagexpert" className="h-8 w-auto" />
          </div>
          <p className="text-stone-400 text-sm text-center">{t("title")}</p>

          {validationError && (
            <p className="text-red-400 text-sm text-center">{validationError}</p>
          )}
          {errKey && !validationError && (
            <p className="text-red-400 text-sm text-center">{t(errKey)}</p>
          )}

          <div>
            <label className="block text-sm text-stone-400 mb-1" htmlFor="username">{t("username")}</label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-colors"
              placeholder={t("username")}
            />
          </div>

          <div>
            <label className="block text-sm text-stone-400 mb-1" htmlFor="password">{t("password")}</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-colors"
                placeholder={t("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-300 cursor-pointer"
                aria-label={showPw ? t("hide_password") : t("show_password")}
              >
                {showPw ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              t("submit")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
