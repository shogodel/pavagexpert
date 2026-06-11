"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "@/lib/use-translations";
import { motion } from "framer-motion";
import type { Job } from "@/lib/job-store";

const projectIcons: Record<string, string> = {
  driveway: "🏠",
  patio: "🌿",
  walkway: "🚶",
  retaining: "🧱",
  commercial: "🏢",
};

const statusLabels: Record<string, { fr: string; en: string }> = {
  new: { fr: "Nouveau", en: "New" },
  in_progress: { fr: "En cours", en: "In progress" },
  completed: { fr: "Terminé", en: "Completed" },
};

export default function JobsPage() {
  const t = useTranslations("jobs");
  const locale = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[80vh] bg-stone-50">
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">{t("title")}</h1>
          <p className="mt-2 text-stone-500">{t("subtitle")}</p>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-center text-stone-400">{t("loading")}</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-400 text-lg">{t("empty")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-stone-200"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{projectIcons[job.projectType] || "📋"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-stone-800 truncate">{job.name}</h3>
                        <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${job.status === "completed" ? "bg-green-100 text-green-700" : job.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {statusLabels[job.status]?.[locale as "fr" | "en"] || job.status}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 mt-1">{t("project_" + job.projectType) || job.projectType}</p>
                      {job.description && (
                        <p className="text-sm text-stone-600 mt-2 line-clamp-2">{job.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-stone-400">
                        <span>{job.address || "—"}</span>
                        <span>{new Date(job.createdAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
