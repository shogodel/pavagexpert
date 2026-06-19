"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Props {
  locale: string;
  messages: Record<string, unknown>;
}

function t(messages: Record<string, unknown>, key: string): string {
  const ns = (messages as Record<string, Record<string, string>>).data_request;
  return ns?.[key] || key;
}

function FormInner({ messages }: { messages: Record<string, unknown> }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<"deletion" | "export">("export");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/data/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, requestType }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        alert(t(messages, "error"));
      }
    } catch {
      alert(t(messages, "error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done || success) {
    return (
      <div className="bg-stone-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">&#x2709;&#xFE0F;</div>
        <h2 className="text-lg font-semibold text-white mb-2">{t(messages, "check_email_title")}</h2>
        <p className="text-stone-400 text-sm">{t(messages, "check_email_msg")}</p>
      </div>
    );
  }

  if (error === "invalid-expired" || error === "missing-token") {
    return (
      <div className="bg-stone-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
        <h2 className="text-lg font-semibold text-white mb-2">{t(messages, "invalid_title")}</h2>
        <p className="text-stone-400 text-sm">{t(messages, "invalid_msg")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-800 rounded-xl p-6 space-y-5">
      <div>
        <label className="block text-sm text-stone-400 mb-1.5">{t(messages, "email")}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(messages, "email_placeholder")}
          className="w-full bg-stone-700 border border-stone-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-terracotta"
        />
      </div>

      <div>
        <label className="block text-sm text-stone-400 mb-1.5">{t(messages, "request_type")}</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-lg bg-stone-700/50 cursor-pointer hover:bg-stone-700 transition">
            <input
              type="radio"
              name="requestType"
              value="export"
              checked={requestType === "export"}
              onChange={() => setRequestType("export")}
              className="accent-terracotta"
            />
            <div>
              <p className="text-white text-sm font-medium">{t(messages, "export_label")}</p>
              <p className="text-stone-400 text-xs">{t(messages, "export_desc")}</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-stone-700/50 cursor-pointer hover:bg-stone-700 transition">
            <input
              type="radio"
              name="requestType"
              value="deletion"
              checked={requestType === "deletion"}
              onChange={() => setRequestType("deletion")}
              className="accent-terracotta"
            />
            <div>
              <p className="text-white text-sm font-medium">{t(messages, "deletion_label")}</p>
              <p className="text-stone-400 text-xs">{t(messages, "deletion_desc")}</p>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm"
      >
        {submitting ? t(messages, "sending") : t(messages, "submit")}
      </button>
    </form>
  );
}

export default function DataRequestForm(props: Props) {
  return (
    <Suspense fallback={<div className="bg-stone-800 rounded-xl p-6 text-stone-400 text-sm">Chargement...</div>}>
      <FormInner {...props} />
    </Suspense>
  );
}
