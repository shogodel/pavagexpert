"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

interface Contractor {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"analytics" | "users" | "contractors">("analytics");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  const [showAddContractor, setShowAddContractor] = useState(false);
  const [contractorForm, setContractorForm] = useState({ username: "", password: "", company: "", phone: "", email: "" });
  const [contractorError, setContractorError] = useState("");
  const [resetPw, setResetPw] = useState<{ id: string; username: string } | null>(null);
  const [resetPwValue, setResetPwValue] = useState("");

  const [pwForm, setPwForm] = useState({ current: "", new: "" });
  const [pwMsg, setPwMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [aRes, uRes, cRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/leads"),
        fetch("/api/admin/contractors"),
      ]);
      if (aRes.status === 401 || uRes.status === 401 || cRes.status === 401) {
        router.push("/login");
        return;
      }
      const ok = aRes.ok && uRes.ok && cRes.ok;
      const aData = ok ? await aRes.json() : null;
      const uData = ok ? await uRes.json() : null;
      const cData = ok ? await cRes.json() : null;
      if (aData?.ok) setAnalytics(aData.data);
      if (uData?.ok) setUsers(uData.data);
      if (cData?.ok) setContractors(cData.data);
      if (!ok) setFetchError("Erreur de chargement. Reconnectez-vous.");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setFetchError("Erreur réseau. Reconnectez-vous.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]); // eslint-disable-line react-hooks/set-state-in-effect

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
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
    if (!data.ok) { setError("Erreur"); return; }
    setShowAdd(false);
    setAddForm({ name: "", email: "", phone: "", notes: "" });
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

  async function handleDelete(id: string) {
    await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
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
    if (!data.ok) { setContractorError(data.error || "Erreur"); return; }
    setShowAddContractor(false);
    setContractorForm({ username: "", password: "", company: "", phone: "", email: "" });
    fetchData();
  }

  async function handleContractorStatus(id: string, status: string) {
    await fetch("/api/admin/contractors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  }

  async function handleDeleteContractor(id: string) {
    await fetch(`/api/admin/contractors?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleResetContractorPw() {
    if (!resetPw || !resetPwValue || resetPwValue.length < 6) return;
    await fetch("/api/admin/contractors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resetPw.id, password: resetPwValue }),
    });
    setResetPw(null);
    setResetPwValue("");
    fetchData();
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    if (!pwForm.current || !pwForm.new || pwForm.new.length < 6) {
      setPwMsg("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }),
    });
    const d = await res.json();
    if (d.ok) {
      setPwMsg("Mot de passe changé avec succès");
      setPwForm({ current: "", new: "" });
    } else {
      setPwMsg(d.error || "Erreur");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900">
      <header className="bg-stone-800 border-b border-stone-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Admin</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setTab("analytics")} className={`text-sm px-3 py-1.5 rounded transition-colors ${tab === "analytics" ? "bg-terracotta text-white" : "text-stone-400 hover:text-white"}`}>Analytiques</button>
          <button onClick={() => setTab("users")} className={`text-sm px-3 py-1.5 rounded transition-colors ${tab === "users" ? "bg-terracotta text-white" : "text-stone-400 hover:text-white"}`}>Clients</button>
          <button onClick={() => setTab("contractors")} className={`text-sm px-3 py-1.5 rounded transition-colors ${tab === "contractors" ? "bg-terracotta text-white" : "text-stone-400 hover:text-white"}`}>Entrepreneurs</button>
          <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-white transition-colors ml-4">Déconnexion</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {fetchError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {fetchError}
          </div>
        )}

        {/* Password Change - visible on analytics tab */}
        {tab === "analytics" && (
          <>
            {analytics && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-stone-800 rounded-xl p-6">
                    <p className="text-stone-400 text-sm">Soumissions</p>
                    <p className="text-3xl font-bold text-white mt-1">{analytics.totalLeads}</p>
                  </div>
                  <div className="bg-stone-800 rounded-xl p-6">
                    <p className="text-stone-400 text-sm">Clients</p>
                    <p className="text-3xl font-bold text-white mt-1">{analytics.totalUsers}</p>
                  </div>
                  <div className="bg-stone-800 rounded-xl p-6">
                    <p className="text-stone-400 text-sm">Actifs</p>
                    <p className="text-3xl font-bold text-white mt-1">{analytics.activeUsers}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-stone-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Par type de projet</h3>
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
                    <h3 className="text-white font-semibold mb-4">Par statut</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.leadsByStatus).map(([status, count]) => {
                        const max = Math.max(...Object.values(analytics.leadsByStatus));
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-stone-400">{status === "new" ? "Nouveau" : status === "in_progress" ? "En cours" : "Terminé"}</span>
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
                  <h3 className="text-white font-semibold mb-4">Soumissions par jour</h3>
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

            {/* Admin Password Change */}
            <div className="bg-stone-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Changer le mot de passe admin</h3>
              <form onSubmit={handleChangePw} className="space-y-4 max-w-md">
                <div>
                  <input placeholder="Mot de passe actuel" type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                </div>
                <div>
                  <input placeholder="Nouveau mot de passe" type="password" value={pwForm.new} onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })} required minLength={6} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                </div>
                {pwMsg && <p className={`text-sm ${pwMsg.includes("succès") ? "text-green-400" : "text-red-400"}`}>{pwMsg}</p>}
                <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">Changer</button>
              </form>
            </div>
          </>
        )}

        {tab === "users" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Clients</h2>
              <button onClick={() => setShowAdd(!showAdd)} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {showAdd ? "Annuler" : "Ajouter"}
              </button>
            </div>

            {showAdd && (
              <form onSubmit={handleAddUser} className="bg-stone-800 rounded-xl p-6 mb-6 space-y-4">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="Nom" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                  <input required type="email" placeholder="Email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                  <input placeholder="Téléphone" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                  <input placeholder="Notes" value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-terracotta/50 outline-none" />
                </div>
                <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">Ajouter</button>
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
                    <p className="text-xs text-stone-600 mt-2">Créé le {new Date(user.createdAt).toLocaleDateString("fr-CA")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.status === "active" ? "bg-green-900 text-green-300" : user.status === "paused" ? "bg-amber-900 text-amber-300" : "bg-red-900 text-red-300"}`}>
                      {user.status === "active" ? "Actif" : user.status === "paused" ? "En pause" : "Supprimé"}
                    </span>
                    {user.status === "active" && (
                      <button onClick={() => handleStatus(user.id, "paused")} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">Pause</button>
                    )}
                    {user.status === "paused" && (
                      <button onClick={() => handleStatus(user.id, "active")} className="text-xs text-stone-500 hover:text-green-400 transition-colors">Activer</button>
                    )}
                    {user.status !== "deleted" && (
                      <button onClick={() => handleDelete(user.id)} className="text-xs text-stone-500 hover:text-red-400 transition-colors">Suppr.</button>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-stone-500 py-8">Aucun client pour le moment.</p>
              )}
            </div>
          </>
        )}

        {tab === "contractors" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Entrepreneurs</h2>
              <button onClick={() => setShowAddContractor(!showAddContractor)} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {showAddContractor ? "Annuler" : "Ajouter"}
              </button>
            </div>

            {showAddContractor && (
              <form onSubmit={handleAddContractor} className="bg-stone-800 rounded-xl p-6 mb-6 space-y-4">
                {contractorError && <p className="text-red-400 text-sm">{contractorError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="Nom d'utilisateur" value={contractorForm.username} onChange={(e) => setContractorForm({ ...contractorForm, username: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input required type="password" placeholder="Mot de passe" value={contractorForm.password} onChange={(e) => setContractorForm({ ...contractorForm, password: e.target.value })} minLength={6} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input required placeholder="Entreprise" value={contractorForm.company} onChange={(e) => setContractorForm({ ...contractorForm, company: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input required placeholder="Téléphone" value={contractorForm.phone} onChange={(e) => setContractorForm({ ...contractorForm, phone: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                  <input placeholder="Courriel" type="email" value={contractorForm.email} onChange={(e) => setContractorForm({ ...contractorForm, email: e.target.value })} className="px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none" />
                </div>
                <button type="submit" className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">Ajouter</button>
              </form>
            )}

            {/* Password reset modal */}
            {resetPw && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-stone-800 rounded-xl p-6 w-full max-w-md mx-4">
                  <h3 className="text-white font-semibold mb-4">Réinitialiser mot de passe - {resetPw.username}</h3>
                  <input placeholder="Nouveau mot de passe (min 6 car.)" type="password" value={resetPwValue} onChange={(e) => setResetPwValue(e.target.value)} minLength={6} className="w-full px-4 py-2 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-stone-500 outline-none mb-4" />
                  <div className="flex gap-3">
                    <button onClick={handleResetContractorPw} disabled={resetPwValue.length < 6} className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50">Confirmer</button>
                    <button onClick={() => { setResetPw(null); setResetPwValue(""); }} className="text-stone-400 hover:text-white text-sm px-6 py-2">Annuler</button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {contractors.map((c) => (
                <div key={c.id} className="bg-stone-800 rounded-xl p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold truncate">{c.company}</h4>
                    <p className="text-sm text-stone-400 mt-0.5">@{c.username}</p>
                    <p className="text-sm text-stone-500">{c.email} | {c.phone}</p>
                    <p className="text-xs text-stone-600 mt-2">Créé le {new Date(c.createdAt).toLocaleDateString("fr-CA")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-900 text-green-300" : c.status === "paused" ? "bg-amber-900 text-amber-300" : "bg-red-900 text-red-300"}`}>
                      {c.status === "active" ? "Actif" : c.status === "paused" ? "En pause" : "Supprimé"}
                    </span>
                    {c.status === "active" && (
                      <button onClick={() => handleContractorStatus(c.id, "paused")} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">Pause</button>
                    )}
                    {c.status === "paused" && (
                      <button onClick={() => handleContractorStatus(c.id, "active")} className="text-xs text-stone-500 hover:text-green-400 transition-colors">Activer</button>
                    )}
                    {c.status !== "deleted" && (
                      <button onClick={() => { setResetPw({ id: c.id, username: c.username }); setResetPwValue(""); }} className="text-xs text-stone-500 hover:text-blue-400 transition-colors">MDP</button>
                    )}
                    {c.status !== "deleted" && (
                      <button onClick={() => handleDeleteContractor(c.id)} className="text-xs text-stone-500 hover:text-red-400 transition-colors">Suppr.</button>
                    )}
                  </div>
                </div>
              ))}
              {contractors.length === 0 && (
                <p className="text-center text-stone-500 py-8">Aucun entrepreneur pour le moment.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
