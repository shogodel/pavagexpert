"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/use-translations";

export default function PwaBanner() {
  const t = useTranslations("pwa");
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!installPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-xl border border-stone-200 p-4 max-w-xs space-y-3">
      <p className="text-sm font-medium text-stone-800">{t("banner_title")}</p>
      <p className="text-xs text-stone-500">{t("banner_desc")}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            (installPrompt as unknown as { prompt: () => Promise<void> }).prompt();
            setInstallPrompt(null);
          }}
          className="flex-1 text-sm px-3 py-1.5 rounded-lg bg-terracotta text-white hover:bg-terracotta-dark transition-colors font-medium cursor-pointer"
        >
          {t("install")}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-sm px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
        >
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
