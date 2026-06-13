"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "@/lib/use-translations";
import { motion } from "framer-motion";
import type { Job } from "@/lib/job-store";

const statusLabels: Record<string, { fr: string; en: string }> = {
  new: { fr: "Nouveau", en: "New" },
  in_progress: { fr: "En cours", en: "In progress" },
  completed: { fr: "Terminé", en: "Completed" },
};

export default function JobsBoard() {
  const t = useTranslations("jobs");
  const locale = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPostal, setFilterPostal] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPostal) params.set("postalCode", filterPostal);
    if (filterStatus) params.set("status", filterStatus);
    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then(setJobs)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [filterPostal, filterStatus]);

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
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder={t("filter_postal")}
              value={filterPostal}
              onChange={(e) => setFilterPostal(e.target.value)}
              className="flex-1 min-w-[160px] px-4 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{t("filter_status_all")}</option>
              <option value="new">{statusLabels.new[locale as "fr" | "en"]}</option>
              <option value="in_progress">{statusLabels.in_progress[locale as "fr" | "en"]}</option>
              <option value="completed">{statusLabels.completed[locale as "fr" | "en"]}</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center text-stone-600">{t("loading")}</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-600 text-lg">{t("empty")}</p>
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-stone-800 truncate">{job.name}</h3>
                      {job.description && (
                        <p className="text-sm text-stone-600 mt-1 line-clamp-3">{job.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-stone-500">
                        <span>{t("postal")} {job.postalCode || "—"}</span>
                        {job.budget && <span className="text-green-700 font-medium">{job.budget}</span>}
                        <span>{new Date(job.createdAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${job.status === "completed" ? "bg-green-100 text-green-700" : job.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {statusLabels[job.status]?.[locale as "fr" | "en"] || job.status}
                    </span>
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
