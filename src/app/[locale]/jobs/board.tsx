"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/use-translations";
import { motion, AnimatePresence } from "framer-motion";
import type { Job } from "@/lib/job-store";

type SortKey = "score" | "newest" | "oldest" | "budget_high" | "budget_low";

function parseBudget(budget: string): number {
  return parseFloat(budget.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

function formatBudget(budget: string): string {
  if (!budget) return "";
  const num = parseBudget(budget);
  if (num === 0) return budget;
  return `$${num.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function relativeTime(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return locale === "fr" ? "À l'instant" : "Just now";
  if (minutes < 60) return locale === "fr" ? `Il y a ${minutes} min` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return locale === "fr" ? `Il y a ${hours}h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return locale === "fr" ? `Il y a ${days}j` : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA");
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function borderClass(status: string): string {
  switch (status) {
    case "new": return "border-l-amber-400";
    case "in_progress": return "border-l-blue-400";
    case "completed": return "border-l-green-400";
    default: return "border-l-stone-300";
  }
}

function scoreBadge(score: number): { label: string; class: string } {
  if (score >= 80) return { label: "Excellent", class: "bg-emerald-100 text-emerald-700" };
  if (score >= 60) return { label: "Élevé", class: "bg-blue-100 text-blue-700" };
  if (score >= 40) return { label: "Moyen", class: "bg-amber-100 text-amber-700" };
  return { label: "Basique", class: "bg-stone-100 text-stone-500" };
}

export default function JobsBoard() {
  const t = useTranslations("jobs");
  const locale = useLocale();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPostal, setFilterPostal] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sort, setSort] = useState<SortKey>("score");
  const [debouncedPostal, setDebouncedPostal] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (!data.authenticated || data.role !== "contractor") router.push(`/${locale}/login?redirect=/${locale}/jobs`); })
      .catch(() => router.push(`/${locale}/login?redirect=/${locale}/jobs`));
  }, []);

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
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { if (Array.isArray(data)) setJobs(data); })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [debouncedPostal, filterStatus]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const sorted = [...jobs].sort((a, b) => {
    switch (sort) {
      case "score": return (b.score ?? 0) - (a.score ?? 0);
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
              <option value="new">{t("status_new")}</option>
              <option value="in_progress">{t("status_in_progress")}</option>
              <option value="completed">{t("status_completed")}</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-4 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="score">{t("sort_score")}</option>
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
                const isExpanded = expandedId === job.id;
                const isRevealed = revealedId === job.id;
                const firstPhoto = job.photos?.[0];
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`bg-white rounded-xl shadow-sm border border-stone-200 border-l-4 ${borderClass(job.status)} hover:shadow-md transition-shadow`}
                  >
                    <div
                      className="p-5 md:p-6 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : job.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-stone-800 truncate">{job.name}</h3>
                            <span className="text-[10px] font-mono text-stone-400 tracking-wider bg-stone-100 px-1.5 py-0.5 rounded">
                              #{shortId(job.id)}
                            </span>
                          </div>
                          {!isExpanded && job.description && (
                            <p className="text-sm text-stone-600 mt-1 line-clamp-2">{job.description}</p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-stone-500">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {job.postalCode || "—"}
                            </span>
                            {job.budget && <span className="text-green-700 font-medium">{formatBudget(job.budget)}</span>}
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${scoreBadge(job.score ?? 0).class}`}>
                              {scoreBadge(job.score ?? 0).label} ({job.score ?? 0})
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {relativeTime(job.createdAt, locale)}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {isExpanded ? t("hide_details") : t("view_details")}
                        </span>
                      </div>

                      {firstPhoto && (
                        <div className="mt-3 flex gap-2">
                          <img
                            src={`/api/photos/${job.id}?file=${encodeURIComponent(firstPhoto)}`}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover border border-stone-200"
                          />
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-stone-100 pt-4 space-y-4">
                            {job.description && (
                              <div>
                                <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">{t("description")}</p>
                                <p className="text-sm text-stone-700 whitespace-pre-wrap">{job.description}</p>
                              </div>
                            )}

                            {job.photos && job.photos.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">
                                  {t("photos")} ({job.photos.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {job.photos.map((photo) => (
                                    <img
                                      key={photo}
                                      src={`/api/photos/${job.id}?file=${encodeURIComponent(photo)}`}
                                      alt=""
                                      className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-stone-200 hover:opacity-90 transition-opacity"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">{t("contact")}</p>
                              {!isRevealed ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRevealedId(job.id); }}
                                  className="text-sm px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium"
                                >
                                  {t("reveal_contact")}
                                </button>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  <a
                                    href={`tel:${job.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    {t("call_now")}
                                  </a>
                                  <a
                                    href={`mailto:${job.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-stone-700 text-white hover:bg-stone-800 transition-colors font-medium"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {t("email")}
                                  </a>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); alert(t("interest_alert")); }}
                              className="text-sm px-4 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                            >
                              {t("express_interest")}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
