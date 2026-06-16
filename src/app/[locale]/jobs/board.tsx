"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "@/lib/use-translations";
import { motion } from "framer-motion";
import type { Job } from "@/lib/job-store";

type SortKey = "newest" | "oldest" | "budget_high" | "budget_low";

function parseBudget(budget: string): number {
  return parseFloat(budget.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

function formatBudget(budget: string): string {
  const num = parseBudget(budget);
  if (num === 0) return budget;
  return `$${num.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function statusBadge(job: Job): { label: string; className: string } {
  switch (job.status) {
    case "new":
      return { label: "status_new", className: "bg-amber-100 text-amber-700" };
    case "in_progress":
      return { label: "status_in_progress", className: "bg-blue-100 text-blue-700" };
    case "completed":
      return { label: "status_completed", className: "bg-green-100 text-green-700" };
    default:
      return { label: job.status, className: "bg-stone-100 text-stone-600" };
  }
}

export default function JobsBoard() {
  const t = useTranslations("jobs");
  const locale = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPostal, setFilterPostal] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [debouncedPostal, setDebouncedPostal] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedPostal(filterPostal), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [filterPostal]);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedPostal) params.set("postalCode", debouncedPostal);
    if (filterStatus) params.set("status", filterStatus);
    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [debouncedPostal, filterStatus]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const sorted = [...jobs].sort((a, b) => {
    switch (sort) {
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "budget_high": return parseBudget(b.budget) - parseBudget(a.budget);
      case "budget_low": return parseBudget(a.budget) - parseBudget(b.budget);
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

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
              <option value="new">{t("job_status_new")}</option>
              <option value="in_progress">{t("job_status_in_progress")}</option>
              <option value="completed">{t("job_status_completed")}</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-4 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="newest">{t("sort_newest")}</option>
              <option value="oldest">{t("sort_oldest")}</option>
              <option value="budget_high">{t("sort_budget_high")}</option>
              <option value="budget_low">{t("sort_budget_low")}</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center text-stone-600">{t("loading")}</p>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-600 text-lg">
                {debouncedPostal || filterStatus ? t("no_results") : t("empty")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((job, i) => {
                const badge = statusBadge(job);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-stone-200 hover:shadow-md hover:border-stone-300 transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-stone-800 truncate">{job.name}</h3>
                        {job.description && (
                          <p className="text-sm text-stone-600 mt-1 line-clamp-3">{job.description}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-stone-500">
                          <span>{t("postal")} {job.postalCode || "—"}</span>
                          {job.budget && <span className="text-green-700 font-medium">{formatBudget(job.budget)}</span>}
                          <span>{new Date(job.createdAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.className}`}>
                        {t(badge.label)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
