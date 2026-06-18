"use client";
import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "@/lib/use-translations";

interface Job {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  budget: string;
  description: string;
  status: string;
  createdAt: string;
  photos: string[];
}

export default function ClientProjectView({ job, locale }: { job: Job; locale: string }) {
  const t = useTranslations("client");
  const [status, setStatus] = useState(job.status);
  const [completing, setCompleting] = useState(false);

  const statusLabel: Record<string, string> = {
    new: t("status_new"),
    in_progress: t("status_in_progress"),
    completed: t("status_completed"),
  };

  const handleComplete = useCallback(async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/complete`, { method: "POST" });
      if (res.ok) setStatus("completed");
    } catch { /* ignore */ }
    setCompleting(false);
  }, [job.id]);

  const statusColor: Record<string, string> = {
    new: "bg-amber-100 text-amber-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const photoDir = job.id;

  return (
    <main className="min-h-screen bg-stone-50 pt-32 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-800">{t("project_title")}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[status] || "bg-stone-100 text-stone-600"}`}>
              {statusLabel[status] || status}
            </span>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <dt className="text-stone-500">{t("field_name")}</dt>
              <dd className="font-medium text-stone-800">{job.name}</dd>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <dt className="text-stone-500">{t("field_email")}</dt>
              <dd className="font-medium text-stone-800">{job.email}</dd>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <dt className="text-stone-500">{t("field_phone")}</dt>
              <dd className="font-medium text-stone-800">{job.phone}</dd>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <dt className="text-stone-500">{t("field_postal")}</dt>
              <dd className="font-medium text-stone-800">{job.postalCode}</dd>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <dt className="text-stone-500">{t("field_budget")}</dt>
              <dd className="font-medium text-stone-800">{job.budget}</dd>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <dt className="text-stone-500">{t("field_created")}</dt>
              <dd className="font-medium text-stone-800">{new Date(job.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-stone-700">{t("field_desc")}</h2>
            <p className="text-sm leading-relaxed text-stone-600">{job.description}</p>
          </div>

          {job.photos.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-stone-700">{t("photos")}</h2>
              <div className="grid grid-cols-2 gap-3">
                {job.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={`/images/projects/${photoDir}/${photo}`}
                    alt=""
                    className="h-40 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {status !== "completed" && (
            <div className="mt-8 border-t border-stone-100 pt-6">
              <p className="mb-3 text-sm text-stone-500">{t("complete_hint")}</p>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="rounded-lg bg-stone-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50"
              >
                {completing ? t("completing") : t("mark_complete")}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
