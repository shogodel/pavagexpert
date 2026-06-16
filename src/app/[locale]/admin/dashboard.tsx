"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/use-translations";

interface Analytics {
  totalLeads: number;
  totalUsers: number;
  activeUsers: number;
  leadsByType: Record<string, number>;
  leadsByStatus: Record<string, number>;
  leadsPerDay: { date: string; count: number }[];
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

interface Contractor {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
}

type Tab = "analytics" | "users" | "contractors" | "applications";

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

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useLocale() as "fr" | "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as Tab | null;
  const validTabs: Tab[] = ["analytics", "users", "contractors", "applications"];
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

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "user" | "contractor"; id: string; label: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showPwChange, setShowPwChange] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", new: "" });
  const [pwMsg, setPwMsg] = useState("");

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setRefreshing(true);
    setFetchError("");
    setActionSuccess("");
    try {
      const [aRes, uRes, cRes, appRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/leads"),
        fetch("/api/admin/contractors"),
        fetch("/api/admin/applications"),
      ]);
      if (aRes.status === 401 || uRes.status === 401 || cRes.status === 401 || appRes.status === 401) {
        router.push(`/${locale}/login`);
        return;
      }
      const ok = aRes.ok && uRes.ok && cRes.ok && appRes.ok;
      const aData = ok ? await aRes.json() : null;
      const uData = ok ? await uRes.json() : null;
      const cData = ok ? await cRes.json() : null;
      const appData = ok ? await appRes.json() : null;
      if (aData?.ok) setAnalytics(aData.data);
      if (uData?.ok) setUsers(uData.data);
      if (cData?.ok) setContractors(cData.data);
      if (appData?.ok) setApplications(appData.data);
      if (!ok) setFetchError(t("fetch_error"));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setFetchError(t("network_error"));
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [router, locale, t]);

  useEffect(() => { fetchData(true); }, [fetchData]);

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
    const data = await res.json();
    if (!data.ok) { setError(t("user_error")); return; }
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
    if (deleteConfirm.type === "user") {
      await fetch(`/api/admin/leads?id=${deleteConfirm.id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/admin/contractors?id=${deleteConfirm.id}`, { method: "DELETE" });
    }
    setDeleteConfirm(null);
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
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!data.ok) { setContractorActionError(data.error || t("contractor_error")); return; }
      setActionSuccess(action === "approve" ? t("app_approved") : t("app_rejected"));
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

  const filteredContractors = contractors.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.username.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
  });

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900">
      <header className="bg-stone-800 border-b border-stone-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setTab("analytics")} className={`text-sm px-3 py-1.5 rounded transition-colors ${tab === "analytics" ? "bg-terracotta text-white" : "text-stone-400 hover:text-white"}`}>{t("tab_analytics")}</button>
          <button onClick={() => setTab("users")} className={`text-sm px-3 py-1.5 rounded transition-colors ${tab === "users" ? "bg-terracotta text-white" : "text-stone-400 hover:text-white"}`}>{t("tab_users")}</button>
          <button onClick={() => setTab("contractors")} className={`text-sm px-3 py-1.5 rounded transition-colors ${tab === "contractors" ? "bg-terracotta text-white" : "text-stone-400 hover:text-white"}`}>{t("tab_contractors")}</button>
          <button onClick={() => setTab("applications")} className={`text-sm px-3 py-1.5 rounded transition-colors ${tab === "applications" ? "bg-terracotta text-white" : "text-stone-400 hover:text-white"}`}>{t("tab_applications")}</button>
          <button onClick={() => setShowPwChange(true)} className="text-sm text-stone-500 hover:text-white transition-colors ml-2" title={t("pw_title")}>{t("pw_short")}</button>
          <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-white transition-colors ml-2">{t("logout")}</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-stone-800 rounded-xl p-6 w-full max-w-sm mx-4">
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-stone-800 rounded-xl p-6 w-full max-w-md mx-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-stone-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">{t("by_type")}</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.leadsByType).map(([type, count]) => {
                        const max = Math.max(...Object.values(analytics.leadsByType));
                        return (
                          <div key={type}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-stone-400">{type}</span>
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

                <div className="bg-stone-800 rounded-xl p-6 mb-8">
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
              <button onClick={() => setShowAdd(!showAdd)} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
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
                <div key={user.id} className="bg-stone-800 rounded-xl p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold truncate">{user.name}</h4>
                    <p className="text-sm text-stone-400 mt-0.5">{user.email}</p>
                    {user.phone && <p className="text-sm text-stone-500">{user.phone}</p>}
                    {user.notes && <p className="text-sm text-stone-500 mt-1">{user.notes}</p>}
                    <p className="text-xs text-stone-600 mt-2">{t("created_prefix")} {new Date(user.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass(user.status)}`}>
                      {user.status === "active" ? t("status_active") : user.status === "paused" ? t("status_paused") : t("status_deleted")}
                    </span>
                    {user.status === "active" && (
                      <button onClick={() => handleStatus(user.id, "paused")} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">{t("pause_btn")}</button>
                    )}
                    {user.status === "paused" && (
                      <button onClick={() => handleStatus(user.id, "active")} className="text-xs text-stone-500 hover:text-green-400 transition-colors">{t("activate_btn")}</button>
                    )}
                    {user.status !== "deleted" && (
                      <button onClick={() => confirmDeleteUser(user.id, user.name)} className="text-xs text-stone-500 hover:text-red-400 transition-colors">{t("delete_btn")}</button>
                    )}
                  </div>
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
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-stone-800 rounded-xl p-6 w-full max-w-md mx-4">
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
                <div key={c.id} className="bg-stone-800 rounded-xl p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold truncate">{c.company}</h4>
                    <p className="text-sm text-stone-400 mt-0.5">@{c.username}</p>
                    <p className="text-sm text-stone-500">{c.email} | {c.phone}</p>
                    <p className="text-xs text-stone-600 mt-2">{t("created_prefix")} {new Date(c.createdAt).toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass(c.status)}`}>
                      {t(statusLabelKey(c.status))}
                    </span>
                    {c.status === "active" && (
                      <button onClick={() => handleContractorStatus(c.id, "paused")} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">{t("pause_btn")}</button>
                    )}
                    {c.status === "paused" && (
                      <button onClick={() => handleContractorStatus(c.id, "active")} className="text-xs text-stone-500 hover:text-green-400 transition-colors">{t("activate_btn")}</button>
                    )}
                    {c.status !== "deleted" && c.status !== "rejected" && (
                      <button onClick={() => { setResetPw({ id: c.id, username: c.username }); setResetPwValue(""); }} className="text-xs text-stone-500 hover:text-blue-400 transition-colors">{t("reset_btn")}</button>
                    )}
                    {c.status !== "deleted" && (
                      <button onClick={() => confirmDeleteContractor(c.id, c.company)} className="text-xs text-stone-500 hover:text-red-400 transition-colors">{t("delete_btn")}</button>
                    )}
                  </div>
                </div>
              ))}
              {filteredContractors.length === 0 && (
                <p className="text-center text-stone-500 py-8">{searchQuery ? t("search_empty") : t("contractors_empty")}</p>
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
                {applications.map((app) => (
                  <div key={app.id} className="bg-stone-800 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
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
                          className="bg-green-700 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          {t("app_approve")}
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, "reject")}
                          className="bg-red-700 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
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
      </div>
    </div>
  );
}
