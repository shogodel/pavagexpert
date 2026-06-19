"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw.split("").map((c) => c.charCodeAt(0)));
}

export default function PwaRegister({ isContractor }: { isContractor: boolean }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!("Notification" in window)) return;

    if (isContractor && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    let cancelled = false;

    (async () => {
      const reg = await navigator.serviceWorker.register("/sw.js").catch(() => null);
      if (!reg || cancelled) return;
      if (!isContractor) return;

      const res = await fetch("/api/vapid-public-key").catch(() => null);
      if (!res || !res.ok) return;
      const { publicKey } = await res.json().catch(() => ({ publicKey: null }));
      if (!publicKey || cancelled) return;

      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      }).then((sub) => {
        fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        }).catch(() => {});
      }).catch(() => {});
    })();

    return () => { cancelled = true; };
  }, [isContractor]);

  return null;
}
