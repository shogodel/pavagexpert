"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "@/lib/use-translations";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

const CONSENT_COOKIE = "cookie_consent";

export default function CookieConsent() {
  const t = useTranslations("cookie_consent");
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (getCookie(CONSENT_COOKIE)) {
      setVisible(false);
    }
  }, []);

  const save = useCallback(async (consentGiven: boolean, categories: string[]) => {
    setCookie(CONSENT_COOKIE, categories.join(","), 365);
    setVisible(false);
  }, []);

  const acceptAll = useCallback(() => {
    save(true, ["necessary", "analytics"]);
    if (typeof gtag !== "undefined") {
      gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
  }, [save]);
  const rejectAll = useCallback(() => {
    save(false, ["necessary"]);
    if (typeof gtag !== "undefined") {
      gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      });
    }
  }, [save]);
  const saveCustom = useCallback(() => {
    const cats = ["necessary"];
    const analyticsGranted = analytics;
    if (analyticsGranted) cats.push("analytics");
    save(cats.length > 1, cats);
    if (typeof gtag !== "undefined") {
      gtag("consent", "update", {
        ad_storage: analyticsGranted ? "granted" : "denied",
        ad_user_data: analyticsGranted ? "granted" : "denied",
        ad_personalization: analyticsGranted ? "granted" : "denied",
        analytics_storage: analyticsGranted ? "granted" : "denied",
      });
    }
  }, [analytics, save]);

  if (!mounted || !visible) return null;

  if (showCustomize) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-[60] p-4 pb-[env(safe-area-inset-bottom,16px)]">
        <div className="max-w-lg mx-auto bg-stone-900 border border-stone-700 rounded-xl p-5 shadow-2xl">
          <h3 className="text-white font-heading font-semibold mb-3">{t("title")}</h3>
          <div className="space-y-3 mb-4">
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-white text-sm font-medium">{t("necessary")}</p>
                <p className="text-stone-400 text-xs">{t("necessary_desc")}</p>
              </div>
              <input type="checkbox" checked disabled className="accent-terracotta" />
            </label>
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-white text-sm font-medium">{t("analytics")}</p>
                <p className="text-stone-400 text-xs">{t("analytics_desc")}</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="accent-terracotta"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveCustom}
              className="flex-1 bg-terracotta hover:bg-terracotta/90 text-white text-sm font-medium py-2 px-4 rounded-lg transition cursor-pointer"
            >
              {t("save")}
            </button>
            <button
              onClick={() => setShowCustomize(false)}
              className="text-stone-400 hover:text-white text-sm py-2 px-4 transition cursor-pointer"
            >
              {t("back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 pb-[env(safe-area-inset-bottom,16px)]">
      <div className="max-w-2xl mx-auto bg-stone-900 border border-stone-700 rounded-xl p-5 shadow-2xl">
        <p className="text-stone-300 text-sm mb-4 leading-relaxed">
          {t("message")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={acceptAll}
            className="bg-terracotta hover:bg-terracotta/90 text-white text-sm font-medium py-2 px-5 rounded-lg transition cursor-pointer"
          >
            {t("accept_all")}
          </button>
          <button
            onClick={rejectAll}
            className="bg-stone-700 hover:bg-stone-600 text-white text-sm font-medium py-2 px-5 rounded-lg transition cursor-pointer"
          >
            {t("reject_all")}
          </button>
          <button
            onClick={() => setShowCustomize(true)}
            className="text-stone-400 hover:text-white text-sm py-2 px-5 transition cursor-pointer"
          >
            {t("customize")}
          </button>
        </div>
      </div>
    </div>
  );
}
