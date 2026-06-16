"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/use-translations";

let deferredPrompt: Event | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export default function PwaBanner() {
  const t = useTranslations("pwa");
  const [installPrompt, setInstallPrompt] = useState<Event | null>(deferredPrompt);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const appInstalledHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  if (installed) return null;
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
