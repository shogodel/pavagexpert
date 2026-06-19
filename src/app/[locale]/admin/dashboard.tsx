"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/use-translations";

interface Analytics {
  totalLeads: number;
  totalUsers: number;
  activeUsers: number;
  leadsByType: Record<string, number>;
  leadsByStatus: Record<string, number>;
  leadsPerDay: { date: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: "active" | "paused" | "deleted";
  createdAt: string;
}

interface ApplicationItem {
  id: string;
  company: string;
  email: string;
  phone: string;
  rbqLicense: string;
  yearsInBusiness: number;
  serviceAreas: string[];
  username: string;
  createdAt: string;
}

interface AdminJob {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  budget: string;
  description: string;
  status: string;
  createdAt: string;
  leadSource: { utm_source?: string; utm_medium?: string; utm_campaign?: string; referrer?: string; landing_page?: string } | null;
}

interface Contractor {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  rbqLicense?: string;
  serviceAreas?: string[];
  verified?: boolean;
  bio?: string;
}

interface BillItem {
  itemType: string;
  jobId: string | null;
  amountCents: number;
  description: string;
}

interface Bill {
  id: string;
  contractorId: string;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  items: BillItem[];
}

interface ClientJob {
  id: string;
  title: string;
  description: string;
  postalCode: string;
  budget: string;
  status: string;
  createdAt: string;
}

type Tab = "analytics" | "users" | "contractors" | "applications" | "jobs" | "bills" | "health";

function statusBadgeClass(status: string): string {
  switch (status) {
    case "active": return "bg-green-900 text-green-300";
    case "pending": return "bg-blue-900 text-blue-300";
    case "rejected": return "bg-red-900 text-red-300";
    case "paused": return "bg-amber-900 text-amber-300";
    default: return "bg-red-900 text-red-300";
  }
}

function statusLabelKey(status: string): string {
  switch (status) {
    case "active": return "status_active";
    case "pending": return "status_pending";
    case "rejected": return "status_rejected";
    case "paused": return "status_paused";
    default: return "status_deleted";
  }
}

function jobStatusBadgeClass(status: string): string {
  switch (status) {
    case "new": return "bg-blue-900 text-blue-300";
    case "in_progress": return "bg-amber-900 text-amber-300";
    case "completed": return "bg-green-900 text-green-300";
    case "published": return "bg-cyan-900 text-cyan-300";
    case "draft": return "bg-stone-700 text-stone-300";
    default: return "bg-stone-700 text-stone-300";
  }
}

function sourceBadgeClass(source: string): string {
  switch (source) {
    case "google": return "bg-red-900/50 text-red-300";
    case "facebook": return "bg-blue-900/50 text-blue-300";
    case "instagram": return "bg-pink-900/50 text-pink-300";
    case "organic": return "bg-green-900/50 text-green-300";
    case "referral": return "bg-purple-900/50 text-purple-300";
    case "email": return "bg-cyan-900/50 text-cyan-300";
    default: return "bg-stone-700 text-stone-400";
  }
}

function getSourceLabel(source: string, tr: (k: string) => string): string {
  switch (source) {
    case "google": return tr("source_google");
    case "facebook": return tr("source_facebook");
    case "instagram": return tr("source_instagram");
    case "organic": return tr("source_organic");
    case "referral": return tr("source_referral");
    case "email": return tr("source_email");
    case "direct": return tr("source_direct");
    default: return source;
  }
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useLocale() as "fr" | "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as Tab | null;
  const validTabs: Tab[] = ["analytics", "users", "contractors", "applications", "jobs", "bills", "health"];
  const [tab, setTabState] = useState<Tab>(tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "analytics");

  function setTab(newTab: Tab) {
    setTabState(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`/${locale}/admin?${params.toString()}`, { scroll: false });
  }

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [showAddJob, setShowAddJob] = useState(false);
  const [editJob, setEditJob] = useState<AdminJob | null>(null);
  const [jobForm, setJobForm] = useState({ name: "", email: "", phone: "", description: "", postalCode: "", budget: "" });
  const [jobError, setJobError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [showAddContractor, setShowAddContractor] = useState(false);
  const [contractorForm, setContractorForm] = useState({ username: "", password: "", company: "", phone: "", email: "" });
  const [contractorError, setContractorError] = useState("");
  const [contractorActionError, setContractorActionError] = useState("");
  const [resetPw, setResetPw] = useState<{ id: string; username: string } | null>(null);
  const [resetPwValue, setResetPwValue] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "user" | "contractor" | "job"; id: string; label: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceAreaFilter, setServiceAreaFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const [bills, setBills] = useState<Bill[]>([]);
  const [generating, setGenerating] = useState(false);
  const [reminding, setReminding] = useState(false);

  const [healthData, setHealthData] = useState<{ dbConnected: boolean; migrationCount: number; serverTime: string; nodeVersion: string } | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState("");

  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientJobs, setClientJobs] = useState<Record<string, ClientJob[]>>({});
  const [loadingClientJobs, setLoadingClientJobs] = useState<string | null>(null);

  const [appNote, setAppNote] = useState("");

  const [showPwChange, setShowPwChange] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", new: "" });
  const [pwMsg, setPwMsg] = useState("");

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setRefreshing(true);
    setFetchError("");
    setActionSuccess("");
    try {
      const [aRes, uRes, cRes, appRes, jRes, bRes, hRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/leads"),
        fetch("/api/admin/contractors"),
        fetch("/api/admin/applications"),
        fetch("/api/admin/jobs"),
        fetch("/api/admin/bills"),
        fetch("/api/admin/health"),
      ]);
      if (aRes.status === 401 || uRes.status === 401 || cRes.status === 401 || appRes.status === 401 || jRes.status === 401) {
        router.push(`/${locale}/login`);
        return;
      }
      const ok = aRes.ok && uRes.ok && cRes.ok && appRes.ok && jRes.ok;
      const aData = ok ? await aRes.json() : null;
      const uData = ok ? await uRes.json() : null;
      const cData = ok ? await cRes.json() : null;
      const appData = ok ? await appRes.json() : null;
      const jData = ok ? await jRes.json() : null;
      const bData = bRes.ok ? await bRes.json() : null;
      const hData = hRes.ok ? await hRes.json() : null;
      if (aData?.ok) setAnalytics(aData.data);
      if (uData?.ok) setUsers(uData.data);
      if (cData?.ok) setContractors(cData.data);
      if (appData?.ok) setApplications(appData.data);
      if (jData?.ok) setJobs(jData.data);
      if (bData?.ok) setBills(bData.data);
      if (hData?.ok) setHealthData(hData.data);
      if (!ok) setFetchError(t("fetch_error"));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setFetchError(t("network_error"));
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [router, locale, t]);

  useEffect(() => { fetchData(true); }, [fetchData]); // eslint-disable-line react-hooks/set-state-in-effect

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push(`/${locale}/login`);
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (res.status === 401) { router.push(`/${locale}/login`); return; }
    const data = await res.json();
    if (!data.ok) { setError(data.error || t("user_error")); return; }
    setShowAdd(false);
    setAddForm({ name: "", email: "", phone: "", notes: "" });
    setActionSuccess(t("user_added"));
    fetchData();
  }

  async function handleStatus(id: string, status: User["status"]) {
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  }

  function confirmDeleteUser(id: string, name: string) {
    setDeleteConfirm({ type: "user", id, label: name });
  }

  async function executeDelete() {
    if (!deleteConfirm) return;
    let res;
    if (deleteConfirm.type === "user") {
      res = await fetch(`/api/admin/leads?id=${deleteConfirm.id}`, { method: "DELETE" });
    } else if (deleteConfirm.type === "contractor") {
      res = await fetch(`/api/admin/contractors?id=${deleteConfirm.id}`, { method: "DELETE" });
    } else {
      res = await fetch(`/api/admin/jobs?id=${deleteConfirm.id}`, { method: "DELETE" });
    }
    setDeleteConfirm(null);
    if (!res.ok) {
      try { const d = await res.json(); setFetchError(d.error || t("network_error")); } catch { setFetchError(t("network_error")); }
      return;
    }
    fetchData();
  }

  async function handleAddContractor(e: React.FormEvent) {
    e.preventDefault();
    setContractorError("");
    const res = await fetch("/api/admin/contractors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contractorForm),
    });
    const data = await res.json();
    if (!data.ok) { setContractorError(data.error || t("contractor_error")); return; }
    setShowAddContractor(false);
    setContractorForm({ username: "", password: "", company: "", phone: "", email: "" });
    setActionSuccess(t("contractor_added"));
    fetchData();
  }

  async function handleContractorStatus(id: string, status: string) {
    setContractorActionError("");
    try {
      const res = await fetch("/api/admin/contractors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.ok) { setContractorActionError(data.error || t("contractor_error")); return; }
      fetchData();
    } catch {
      setContractorActionError(t("network_error"));
    }
  }

  function confirmDeleteContractor(id: string, label: string) {
    setDeleteConfirm({ type: "contractor", id, label });
  }

  async function handleApplicationAction(id: string, action: "approve" | "reject") {
    setContractorActionError("");
    setActionSuccess("");
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, notes: appNote }),
      });
      const data = await res.json();
      if (!data.ok) { setContractorActionError(data.error || t("contractor_error")); return; }
      setActionSuccess(action === "approve" ? t("app_approved") : t("app_rejected"));
      setAppNote("");
      fetchData();
    } catch {
      setContractorActionError(t("network_error"));
    }
  }

  async function handleResetContractorPw() {
    if (!resetPw || !resetPwValue || resetPwValue.length < 6) return;
    setContractorActionError("");
    try {
      const res = await fetch("/api/admin/contractors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetPw.id, password: resetPwValue }),
      });
      const data = await res.json();
      if (!data.ok) { setContractorActionError(data.error || t("contractor_error")); return; }
      setResetPw(null);
      setResetPwValue("");
      setActionSuccess(t("pw_reset"));
      fetchData();
    } catch {
      setContractorActionError(t("network_error"));
    }
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    if (!pwForm.current || !pwForm.new || pwForm.new.length < 6) {
      setPwMsg(t("pw_too_short"));
      return;
    }
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }),
    });
    const d = await res.json();
    if (d.ok) {
      setPwMsg(t("pw_success"));
      setPwForm({ current: "", new: "" });
    } else {
      setPwMsg(d.error || t("user_error"));
    }
  }

  function openAddJob() {
    setJobForm({ name: "", email: "", phone: "", description: "", postalCode: "", budget: "" });
    setEditJob(null);
    setShowAddJob(true);
  }

  function openEditJob(job: AdminJob) {
    setJobForm({ name: job.name, email: job.email, phone: job.phone, description: job.description, postalCode: job.postalCode, budget: job.budget });
    setEditJob(job);
    setShowAddJob(true);
  }

  async function handleSaveJob(e: React.FormEvent) {
    e.preventDefault();
    setJobError("");
    try {
      const url = editJob ? "/api/admin/jobs" : "/api/admin/jobs";
      const method = editJob ? "PATCH" : "POST";
      const body = editJob
        ? { id: editJob.id, title: jobForm.name, description: jobForm.description, postalCode: jobForm.postalCode, budget: jobForm.budget }
        : { name: jobForm.name, email: jobForm.email, phone: jobForm.phone, description: jobForm.description, postalCode: jobForm.postalCode, budget: jobForm.budget };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.ok) { setJobError(data.error || t("user_error")); return; }
      setShowAddJob(false);
      setEditJob(null);
      setActionSuccess(editJob ? t("job_updated") : t("job_added"));
      fetchData();
    } catch {
      setJobError(t("network_error"));
    }
  }

  async function handleJobStatus(id: string, status: string) {
    await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  }

  function confirmDeleteJob(id: string, label: string) {
    setDeleteConfirm({ type: "job", id, label });
  }

  const filteredContractors = contractors.filter((c) => {
    if (!searchQuery && !serviceAreaFilter) return true;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.username.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || (c.rbqLicense || "").toLowerCase().includes(q) || (c.serviceAreas || []).some(a => a.toLowerCase().includes(q));
    const matchesArea = !serviceAreaFilter || (c.serviceAreas || []).some(a => a.toLowerCase().includes(serviceAreaFilter.toLowerCase()));
    return matchesSearch && matchesArea;
  });

  const allServiceAreas = Array.from(new Set(contractors.flatMap(c => c.serviceAreas || []))).sort();

  const allSources = Array.from(new Set(jobs.map(j => j.leadSource?.utm_source || "direct"))).sort();
  const filteredJobs = sourceFilter ? jobs.filter(j => (j.leadSource?.utm_source || "direct") === sourceFilter) : jobs;

  const tabRef = useRef<HTMLDivElement>(null);
  const [tabScrollLeft, setTabScrollLeft] = useState(false);
  const [tabScrollRight, setTabScrollRight] = useState(false);

  useEffect(() => {
    const el = tabRef.current;
    if (!el) return;
    const check = () => {
      setTabScrollLeft(el.scrollLeft > 4);
      setTabScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">{t("loading")}</p>
      </div>
    );
  }

  const tabList = ["analytics","users","contractors","applications","jobs","bills","health"] as const;
  const pendingApps = applications.length;
  const unpaidBills = bills.filter((b) => b.status !== "paid").length;

  function handleTabKeyDown(e: React.KeyboardEvent, idx: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (idx + 1) % tabList.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + tabList.length) % tabList.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabList.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(tabList[next]);
    tabRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div className="min-h-screen bg-stone-900" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header className="sticky top-0 z-40 bg-stone-800 border-b border-stone-700">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl font-bold text-white">{t("title")}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPwChange(true)} className="text-sm text-stone-400 hover:text-white px-3 py-1.5 min-h-[44px] rounded transition-colors" title={t("pw_title")}>{t("pw_short")}</button>
            <button onClick={handleLogout} className="text-sm text-stone-400 hover:text-white px-3 py-1.5 min-h-[44px] rounded transition-colors">{t("logout")}</button>
          </div>
        </div>
        <div className="relative">
          {tabScrollLeft && <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-stone-800 to-transparent z-10 pointer-events-none" />}
          {tabScrollRight && <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-stone-800 to-transparent z-10 pointer-events-none" />}
          <div ref={tabRef} role="tablist" aria-label="Admin navigation" className="flex gap-1.5 px-4 sm:px-6 pb-2 overflow-x-auto hide-scrollbar">
            {tabList.map((tKey, idx) => (
              <button
                key={tKey}
                role="tab"
                id={`admintab-${tKey}`}
                aria-selected={tab === tKey}
                aria-controls={`admintabpanel-${tKey}`}
                tabIndex={tab === tKey ? 0 : -1}
                onClick={() => setTab(tKey)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`whitespace-nowrap text-sm px-3 py-1.5 min-h-[44px] rounded-t transition-colors shrink-0 relative ${tab === tKey ? "bg-stone-900 text-white font-semibold" : "text-stone-400 hover:text-white hover:bg-stone-700/40"}`}
              >
                {t(`tab_${tKey}`)}
                {tKey === "applications" && pendingApps > 0 && (
                  <span className="ml-1.5 text-[10px] font-medium bg-terracotta text-white px-1.5 py-0.5 rounded-full align-middle">{pendingApps}</span>
                )}
                {tKey === "bills" && unpaidBills > 0 && (
                  <span className="ml-1.5 text-[10px] font-medium bg-amber-600 text-white px-1.5 py-0.5 rounded-full align-middle">{unpaidBills}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div role="tabpanel" id={`admintabpanel-${tab}`} aria-labelledby={`admintab-${tab}`} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {refreshing && (
          <div className="flex justify-center mb-4">
            <span className="text-stone-500 text-xs animate-pulse">{t("refreshing")}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {actionSuccess}
          </div>
        )}

        {fetchError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {fetchError}
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-800 rounded-xl p-5 sm:p-6 w-full max-w-sm">
              <h3 className="text-white font-semibold mb-2">{t("delete_title")}</h3>
              <p className="text-stone-400 text-sm mb-4">{t("delete_confirm")} <strong className="text-white">{deleteConfirm.label}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={executeDelete} className="bg-red-700 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">{t("delete_btn")}</button>
                <button onClick={() => setDeleteConfirm(null)} className="text-stone-400 hover:text-white text-sm px-6 py-2">{t("reset_cancel")}</button>
              </div>
            </div>
          </div>
        )}

        {/* Password change modal */}
        {showPwChange && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-800 rounded-xl p-5 sm:p-6 w-full max-w-md">
              <h3 className="text-white font-semibold mb-4">{t("pw_title")}</h3>
              <form onSubmit={handleChangePw} className="space-y-4">
                <div>
                  <input placeholder={t("pw_current")} type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                </div>
                <div>
                  <input placeholder={t("pw_new")} type="password" value={pwForm.new} onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })} required minLength={6} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                </div>
                {pwMsg && <p className={`text-sm ${pwMsg === t("pw_success") ? "text-green-400" : "text-red-400"}`}>{pwMsg}</p>}
                <div className="flex gap-3">
                  <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">{t("pw_change")}</button>
                  <button type="button" onClick={() => { setShowPwChange(false); setPwMsg(""); }} className="text-stone-400 hover:text-white text-sm px-6 py-2">{t("reset_cancel")}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <>
            {analytics && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="bg-stone-800 rounded-xl p-6">
                    <p className="text-stone-400 text-sm">{t("submissions")}</p>
                    <p className="text-3xl font-bold text-white mt-1">{analytics.totalLeads}</p>
                  </div>
                  <div className="bg-stone-800 rounded-xl p-6">
                    <p className="text-stone-400 text-sm">{t("users")}</p>
                    <p className="text-3xl font-bold text-white mt-1">{analytics.totalUsers}</p>
                  </div>
                  <div className="bg-stone-800 rounded-xl p-6">
                    <p className="text-stone-400 text-sm">{t("active")}</p>
                    <p className="text-3xl font-bold text-white mt-1">{analytics.activeUsers}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-stone-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">{t("by_budget")}</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.leadsByType).map(([range, count]) => {
                        const max = Math.max(...Object.values(analytics.leadsByType));
                        const label = range === "unknown" ? t("budget_unknown") : range === "small" ? t("budget_small") : range === "medium" ? t("budget_medium") : t("budget_large");
                        return (
                          <div key={range}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-stone-400">{label}</span>
                              <span className="text-white">{count}</span>
                            </div>
                            <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                              <div className="h-full bg-terracotta rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-stone-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">{t("by_status")}</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.leadsByStatus).map(([status, count]) => {
                        const max = Math.max(...Object.values(analytics.leadsByStatus));
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-stone-400">{status === "new" ? t("new") : status === "in_progress" ? t("in_progress") : t("completed")}</span>
                              <span className="text-white">{count}</span>
                            </div>
                            <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                              <div className="h-full bg-terracotta rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {analytics.leadsBySource && analytics.leadsBySource.length > 0 && (
                  <div className="bg-stone-800 rounded-xl p-6 mb-6">
                    <h3 className="text-white font-semibold mb-4">{t("by_source")}</h3>
                    <div className="space-y-2">
                      {analytics.leadsBySource.map(({ source, count }) => {
                        const max = Math.max(...analytics.leadsBySource.map((s) => s.count));
                        return (
                          <div key={source}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-stone-400">{getSourceLabel(source, t)}</span>
                              <span className="text-white">{count}</span>
                            </div>
                            <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: source === "google" ? "#ef4444" : source === "facebook" ? "#3b82f6" : source === "instagram" ? "#ec4899" : source === "organic" ? "#22c55e" : source === "referral" ? "#a855f7" : source === "email" ? "#06b6d4" : "#a8a29e" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-stone-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-white font-semibold mb-4">{t("by_day")}</h3>
                  <div className="flex items-end gap-1 h-32">
                    {analytics.leadsPerDay.map((day) => {
                      const max = Math.max(...analytics.leadsPerDay.map((d) => d.count));
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-stone-500">{day.count}</span>
                          <div
                            className="w-full bg-terracotta rounded-t"
                            style={{ height: `${(day.count / max) * 100}%`, minHeight: day.count > 0 ? "4px" : "0" }}
                          />
                          <span className="text-[10px] text-stone-500 -rotate-45 origin-left whitespace-nowrap">
                            {day.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {tab === "users" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">{t("users_title")}</h2>
              <button onClick={() => setShowAdd(!showAdd)} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-4 py-2 min-h-[36px] rounded-lg transition-colors">
                {showAdd ? t("cancel") : t("add")}
              </button>
            </div>

            {showAdd && (
              <form onSubmit={handleAddUser} className="bg-stone-800 rounded-xl p-6 mb-6 space-y-4">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder={t("name_placeholder")} value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                  <input required type="email" placeholder={t("email_placeholder")} value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                  <input placeholder={t("phone_placeholder")} value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                  <input placeholder={t("notes_placeholder")} value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                </div>
                <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">{t("add")}</button>
              </form>
            )}

            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id}>
                  <div className="bg-stone-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => {
                          if (expandedClient === user.id) { setExpandedClient(null); return; }
                          setExpandedClient(user.id);
                          setLoadingClientJobs(user.id);
                          fetch(`/api/admin/client-jobs?clientId=${user.id}`).then(r => r.json()).then(d => {
                            if (d.ok) setClientJobs(p => ({ ...p, [user.id]: d.data }));
                          }).catch(() => {}).finally(() => setLoadingClientJobs(null));
                        }}
                        className="text-white font-semibold truncate hover:text-terracotta transition-colors text-left w-full"
                      >
                        {user.name} {expandedClient === user.id ? "▲" : "▼"}
                      </button>
                      <p className="text-sm text-stone-400 mt-0.5">{user.email}</p>
                      {user.phone && <p className="text-sm text-stone-500">{user.phone}</p>}
                      {user.notes && <p className="text-sm text-stone-500 mt-1">{user.notes}</p>}
                      <p className="text-xs text-stone-600 mt-2">{t("created_prefix")} {new Date(user.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass(user.status)}`}>
                        {user.status === "active" ? t("status_active") : user.status === "paused" ? t("status_paused") : t("status_deleted")}
                      </span>
                      {user.status === "active" && (
                        <button onClick={() => handleStatus(user.id, "paused")} className="text-xs text-stone-500 hover:text-amber-400 px-2 py-1 min-h-[36px] transition-colors">{t("pause_btn")}</button>
                      )}
                      {user.status === "paused" && (
                        <button onClick={() => handleStatus(user.id, "active")} className="text-xs text-stone-500 hover:text-green-400 px-2 py-1 min-h-[36px] transition-colors">{t("activate_btn")}</button>
                      )}
                      {user.status !== "deleted" && (
                        <button onClick={() => confirmDeleteUser(user.id, user.name)} className="text-xs text-stone-500 hover:text-red-400 px-2 py-1 min-h-[36px] transition-colors">{t("delete_btn")}</button>
                      )}
                    </div>
                  </div>
                  {expandedClient === user.id && (
                    <div className="bg-stone-850 rounded-b-xl px-5 pb-4 pt-2 -mt-3 border-t border-stone-700/50">
                      <h5 className="text-sm font-medium text-stone-400 mb-2">{t("tab_job_history")}</h5>
                      {loadingClientJobs === user.id ? (
                        <p className="text-xs text-stone-600">{t("loading")}</p>
                      ) : (clientJobs[user.id]?.length ?? 0) === 0 ? (
                        <p className="text-xs text-stone-600">{t("no_jobs")}</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {clientJobs[user.id]?.map((j) => (
                            <div key={j.id} className="bg-stone-700/50 rounded-lg p-3 text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium truncate">{j.title}</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${jobStatusBadgeClass(j.status)}`}>{t(`job_status_${j.status}`)}</span>
                              </div>
                              {j.description && <p className="text-stone-400 text-xs line-clamp-2">{j.description}</p>}
                              <div className="flex gap-3 mt-1 text-xs text-stone-500">
                                {j.budget && <span className="text-green-400">{j.budget}</span>}
                                {j.postalCode && <span>{j.postalCode}</span>}
                                <span>{new Date(j.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-stone-500 py-8">{t("users_empty")}</p>
              )}
            </div>
          </>
        )}

        {tab === "contractors" && (
          <>
            {contractorActionError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                {contractorActionError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 text-white placeholder-stone-500 outline-none text-sm"
              />
              <select
                value={serviceAreaFilter}
                onChange={(e) => setServiceAreaFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-stone-800 border border-stone-600 text-white text-sm outline-none"
              >
                <option value="">{t("all_areas")}</option>
                {allServiceAreas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button onClick={() => setShowAddContractor(!showAddContractor)} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0">
                {showAddContractor ? t("cancel") : t("add")}
              </button>
            </div>

            {showAddContractor && (
              <form onSubmit={handleAddContractor} className="bg-stone-800 rounded-xl p-6 mb-6 space-y-4">
                {contractorError && <p className="text-red-400 text-sm">{contractorError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder={t("username_placeholder")} value={contractorForm.username} onChange={(e) => setContractorForm({ ...contractorForm, username: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input required type="password" placeholder={t("password_placeholder")} value={contractorForm.password} onChange={(e) => setContractorForm({ ...contractorForm, password: e.target.value })} minLength={6} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input required placeholder={t("company_placeholder")} value={contractorForm.company} onChange={(e) => setContractorForm({ ...contractorForm, company: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input required placeholder={t("phone_placeholder")} value={contractorForm.phone} onChange={(e) => setContractorForm({ ...contractorForm, phone: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input required placeholder={t("email_placeholder")} type="email" value={contractorForm.email} onChange={(e) => setContractorForm({ ...contractorForm, email: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                </div>
                <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">{t("add")}</button>
              </form>
            )}

            {/* Password reset modal */}
            {resetPw && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-stone-800 rounded-xl p-5 sm:p-6 w-full max-w-md">
                  <h3 className="text-white font-semibold mb-4">{t("reset_title")} - {resetPw.username}</h3>
                  <input placeholder={t("reset_placeholder")} type="password" value={resetPwValue} onChange={(e) => setResetPwValue(e.target.value)} minLength={6} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none mb-4" />
                  <div className="flex gap-3">
                    <button onClick={handleResetContractorPw} disabled={resetPwValue.length < 6} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50">{t("reset_confirm")}</button>
                    <button onClick={() => { setResetPw(null); setResetPwValue(""); }} className="text-stone-400 hover:text-white text-sm px-6 py-2">{t("reset_cancel")}</button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {filteredContractors.map((c) => (
                <div key={c.id} className="bg-stone-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-semibold truncate">{c.company}</h4>
                      {c.verified !== undefined && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${c.verified ? "bg-green-900 text-green-300" : "bg-stone-700 text-stone-400"}`}>
                          {c.verified ? t("verified") : t("not_verified")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-400 mt-0.5">@{c.username}</p>
                    <p className="text-sm text-stone-500">{c.email} | {c.phone}</p>
                    {(c.serviceAreas?.length ?? 0) > 0 && (
                      <p className="text-xs text-stone-500 mt-1">{t("contractor_service_areas")} {c.serviceAreas!.join(", ")}</p>
                    )}
                    {c.rbqLicense && (
                      <p className="text-xs text-stone-500">{t("contractor_rbq")} {c.rbqLicense}</p>
                    )}
                    {c.bio && (
                      <p className="text-xs text-stone-500 mt-1 italic line-clamp-2">{c.bio}</p>
                    )}
                    <p className="text-xs text-stone-600 mt-2">{t("created_prefix")} {new Date(c.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass(c.status)}`}>
                      {t(statusLabelKey(c.status))}
                    </span>
                    {c.status === "active" && c.verified !== undefined && (
                      c.verified
                        ? <button onClick={async () => { await fetch(`/api/admin/contractors/${c.id}/verify`, { method: "DELETE" }); fetchData(); }} className="text-xs text-stone-500 hover:text-amber-400 px-2 py-1 min-h-[36px] transition-colors">{t("contractor_unverify")}</button>
                        : <button onClick={async () => { await fetch(`/api/admin/contractors/${c.id}/verify`, { method: "POST" }); fetchData(); }} className="text-xs text-stone-500 hover:text-green-400 px-2 py-1 min-h-[36px] transition-colors">{t("contractor_verify")}</button>
                    )}
                    {c.status === "active" && (
                      <button onClick={() => handleContractorStatus(c.id, "paused")} className="text-xs text-stone-500 hover:text-amber-400 px-2 py-1 min-h-[36px] transition-colors">{t("pause_btn")}</button>
                    )}
                    {c.status === "paused" && (
                      <button onClick={() => handleContractorStatus(c.id, "active")} className="text-xs text-stone-500 hover:text-green-400 px-2 py-1 min-h-[36px] transition-colors">{t("activate_btn")}</button>
                    )}
                    {c.status !== "deleted" && c.status !== "rejected" && (
                      <button onClick={() => { setResetPw({ id: c.id, username: c.username }); setResetPwValue(""); }} className="text-xs text-stone-500 hover:text-blue-400 px-2 py-1 min-h-[36px] transition-colors">{t("reset_btn")}</button>
                    )}
                    {c.status !== "deleted" && (
                      <button onClick={() => confirmDeleteContractor(c.id, c.company)} className="text-xs text-stone-500 hover:text-red-400 px-2 py-1 min-h-[36px] transition-colors">{t("delete_btn")}</button>
                    )}
                  </div>
                </div>
              ))}
              {filteredContractors.length === 0 && (
                <p className="text-center text-stone-500 py-8">{searchQuery || serviceAreaFilter ? t("search_empty") : t("contractors_empty")}</p>
              )}
            </div>
          </>
        )}

        {tab === "jobs" && (
          <>
            {jobError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                {jobError}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">{t("jobs_title")}</h2>
              <button onClick={openAddJob} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {t("add")}
              </button>
            </div>

            {/* Add/Edit job modal */}
            {showAddJob && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-stone-800 rounded-xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-white font-semibold mb-4">{editJob ? t("job_edit_title") : t("job_add_title")}</h3>
                  <form onSubmit={handleSaveJob} className="space-y-4">
                    <div>
                      <label className="text-stone-400 text-sm block mb-1">{t("name_placeholder")}</label>
                      <input required value={jobForm.name} onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-stone-400 text-sm block mb-1">{t("email_placeholder")}</label>
                        <input type="email" value={jobForm.email} onChange={(e) => setJobForm({ ...jobForm, email: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-stone-400 text-sm block mb-1">{t("phone_placeholder")}</label>
                        <input value={jobForm.phone} onChange={(e) => setJobForm({ ...jobForm, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-stone-400 text-sm block mb-1">{t("job_postal")}</label>
                        <input value={jobForm.postalCode} onChange={(e) => setJobForm({ ...jobForm, postalCode: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-stone-400 text-sm block mb-1">{t("job_budget")}</label>
                        <input value={jobForm.budget} onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-stone-400 text-sm block mb-1">{t("job_description")}</label>
                      <textarea required value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">{editJob ? t("job_save") : t("add")}</button>
                      <button type="button" onClick={() => { setShowAddJob(false); setEditJob(null); }} className="text-stone-400 hover:text-white text-sm px-6 py-2">{t("reset_cancel")}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {allSources.length > 0 && (
              <div className="mb-4">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white text-sm outline-none"
                >
                  <option value="">{t("source_filter_all")}</option>
                  {allSources.map((s) => (
                    <option key={s} value={s}>{getSourceLabel(s, t)}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-stone-800 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-white font-semibold truncate">{job.name}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${jobStatusBadgeClass(job.status)}`}>
                          {t(`job_status_${job.status}`)}
                        </span>
                        {job.leadSource && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sourceBadgeClass(job.leadSource.utm_source || "direct")}`}>
                            {getSourceLabel(job.leadSource.utm_source || "direct", t)}
                          </span>
                        )}
                      </div>
                      {job.description && <p className="text-sm text-stone-500 line-clamp-2">{job.description}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-stone-500">
                        <span>{job.email}</span>
                        {job.phone && <span>{job.phone}</span>}
                        {job.postalCode && <span>{t("job_postal")} {job.postalCode}</span>}
                        {job.budget && <span className="text-green-400">{job.budget}</span>}
                        <span>{t("created_prefix")} {new Date(job.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {job.status !== "completed" && (
                        <select
                          value={job.status}
                          onChange={(e) => handleJobStatus(job.id, e.target.value)}
                          className="text-xs bg-stone-700 border border-stone-600 text-white rounded px-2 py-1.5 min-h-[36px] outline-none"
                        >
                          <option value="new">{t("job_status_new")}</option>
                          <option value="published">{t("job_status_published")}</option>
                          <option value="in_progress">{t("job_status_in_progress")}</option>
                          <option value="completed">{t("job_status_completed")}</option>
                        </select>
                      )}
                      <button onClick={() => openEditJob(job)} className="text-xs text-stone-500 hover:text-blue-400 px-2 py-1 min-h-[36px] transition-colors">{t("job_edit")}</button>
                      <button onClick={() => confirmDeleteJob(job.id, job.name)} className="text-xs text-stone-500 hover:text-red-400 px-2 py-1 min-h-[36px] transition-colors">{t("delete_btn")}</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <p className="text-center text-stone-500 py-8">{t("jobs_empty")}</p>
              )}
            </div>
          </>
        )}

        {tab === "applications" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">{t("applications_title")}</h2>
            </div>
            {contractorActionError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                {contractorActionError}
              </div>
            )}
            {applications.length === 0 ? (
              <p className="text-center text-stone-500 py-8">{t("applications_empty")}</p>
            ) : (
              <div className="space-y-3">
                <div className="bg-stone-800 rounded-xl p-4 flex items-center gap-3">
                  <textarea
                    placeholder={t("notes_placeholder") + " (included in email)"}
                    value={appNote}
                    onChange={(e) => setAppNote(e.target.value)}
                    rows={1}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 text-xs outline-none resize-none"
                  />
                  {appNote && (
                    <button onClick={() => setAppNote("")} className="text-xs text-stone-500 hover:text-white shrink-0">{t("reset_cancel")}</button>
                  )}
                </div>
                {applications.map((app) => (
                  <div key={app.id} className="bg-stone-800 rounded-xl p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-semibold truncate">{app.company}</h4>
                        <p className="text-sm text-stone-400 mt-0.5">{app.email} | {app.phone}</p>
                        <p className="text-sm text-stone-500">{t("app_rbq")} {app.rbqLicense}</p>
                        <p className="text-sm text-stone-500">{t("app_years")} {app.yearsInBusiness}</p>
                        {app.serviceAreas.length > 0 && (
                          <p className="text-sm text-stone-500">{t("app_areas")} {app.serviceAreas.join(", ")}</p>
                        )}
                        <p className="text-xs text-stone-600 mt-2">{t("created_prefix")} {new Date(app.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApplicationAction(app.id, "approve")}
                          className="bg-green-700 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 min-h-[36px] rounded-lg transition-colors"
                        >
                          {t("app_approve")}
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, "reject")}
                          className="bg-red-700 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 min-h-[36px] rounded-lg transition-colors"
                        >
                          {t("app_reject")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "bills" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-white">{t("bills_title")}</h2>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setGenerating(true);
                    try {
                      const res = await fetch("/api/admin/bills/generate", { method: "POST" });
                      const d = await res.json();
                      if (d.ok) { setActionSuccess(t("bills_generated")); fetchData(); }
                    } catch { setFetchError(t("network_error")); }
                    setGenerating(false);
                  }}
                  disabled={generating}
                  className="bg-terracotta hover:bg-terracotta-dark text-white text-xs font-semibold px-4 py-2 min-h-[36px] rounded-lg transition-colors disabled:opacity-50"
                >
                  {generating ? t("bills_generating") : t("bills_generate")}
                </button>
                <button
                  onClick={async () => {
                    setReminding(true);
                    try {
                      const res = await fetch("/api/admin/bills/remind", { method: "POST" });
                      const d = await res.json();
                      if (d.ok) { setActionSuccess(t("bills_reminded")); fetchData(); }
                    } catch { setFetchError(t("network_error")); }
                    setReminding(false);
                  }}
                  disabled={reminding}
                  className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 min-h-[36px] rounded-lg transition-colors disabled:opacity-50"
                >
                  {reminding ? t("bills_reminding") : t("bills_remind")}
                </button>
              </div>
            </div>

            {bills.length === 0 ? (
              <p className="text-center text-stone-500 py-8">{t("bills_empty")}</p>
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => {
                  const contractor = contractors.find(c => c.id === bill.contractorId);
                  const total$ = `$${(bill.totalCents / 100).toFixed(2)}`;
                  const startDate = new Date(bill.periodStart).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA");
                  const endDate = new Date(bill.periodEnd).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA");
                  return (
                    <div key={bill.id} className="bg-stone-800 rounded-xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-white font-semibold">{contractor?.company || bill.contractorId.slice(0, 8)}</h4>
                            {bill.paidAt && <span className="text-xs text-green-400">{t("bills_paid_at")} {new Date(bill.paidAt).toLocaleDateString()}</span>}
                          </div>
                          <p className="text-sm text-stone-400">{t("bills_period")} {startDate} — {endDate}</p>
                          <p className="text-lg font-bold text-white mt-1">{total$}</p>
                          {bill.items.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {bill.items.map((item, i) => (
                                <p key={i} className="text-xs text-stone-500">
                                  {item.itemType === "monthly_fee" ? t("bills_monthly_fee") : t("bills_job_fee")}
                                  : ${(item.amountCents / 100).toFixed(2)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bill.status === "paid" ? "bg-green-900 text-green-300" : bill.status === "overdue" ? "bg-red-900 text-red-300" : bill.status === "sent" ? "bg-blue-900 text-blue-300" : "bg-amber-900 text-amber-300"}`}>
                            {t(`bills_status_${bill.status}`)}
                          </span>
                          {bill.status !== "paid" && (
                            <select
                              value={bill.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                if (newStatus === "paid" || newStatus === "overdue") {
                                  await fetch(`/api/admin/bills/${bill.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: newStatus }),
                                  });
                                  fetchData();
                                }
                              }}
                              className="text-xs bg-stone-700 border border-stone-600 text-white rounded px-2 py-1.5 min-h-[36px] outline-none"
                            >
                              <option value={bill.status}>{t(`bills_status_${bill.status}`)}</option>
                              <option value="paid">{t("bills_confirm_paid")}</option>
                              {bill.status !== "overdue" && <option value="overdue">{t("bills_confirm_overdue")}</option>}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "health" && (
          <>
            <h2 className="text-lg font-semibold text-white mb-6">{t("health_title")}</h2>

            {testEmailMsg && (
              <div className={`px-4 py-3 rounded-lg mb-6 text-sm text-center ${testEmailMsg === t("health_test_sent") ? "bg-green-900/50 border border-green-700 text-green-300" : "bg-red-900/50 border border-red-700 text-red-300"}`}>
                {testEmailMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-stone-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{t("health_db")}</h3>
                {healthData ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${healthData.dbConnected ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-sm text-stone-400">{healthData.dbConnected ? t("health_db_ok") : t("health_db_error")}</span>
                    </div>
                    <p className="text-sm text-stone-500">{t("health_migrations")}: {healthData.migrationCount}</p>
                    <p className="text-sm text-stone-500">{t("health_migration_ok")}</p>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">{t("loading")}</p>
                )}
              </div>

              <div className="bg-stone-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{t("health_server")}</h3>
                {healthData && (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-500">{t("health_server_time")}: {new Date(healthData.serverTime).toLocaleString()}</p>
                    <p className="text-sm text-stone-500">{t("health_version")}: {healthData.nodeVersion}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={async () => {
                  setSendingTest(true);
                  setTestEmailMsg("");
                  try {
                    const res = await fetch("/api/admin/test-email", { method: "POST" });
                    const d = await res.json();
                    setTestEmailMsg(d.ok ? t("health_test_sent") : t("health_test_failed"));
                  } catch {
                    setTestEmailMsg(t("health_test_failed"));
                  }
                  setSendingTest(false);
                }}
                disabled={sendingTest}
                className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {sendingTest ? t("loading") : t("health_test_email")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
