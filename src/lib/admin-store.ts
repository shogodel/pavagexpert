import fs from "fs";
import path from "path";
import { getJobs } from "./job-store";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "admin-users.json");

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: "active" | "paused" | "deleted";
  createdAt: string;
}

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readUsers(): AdminUser[] {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(users: AdminUser[]) {
  ensureDir();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf-8");
}

export function getUsers(): AdminUser[] {
  return readUsers().reverse();
}

export function addUser(input: { name: string; email: string; phone?: string; notes?: string }): AdminUser {
  const users = readUsers();
  const user: AdminUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone || "",
    notes: input.notes || "",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function updateUser(id: string, data: Partial<Pick<AdminUser, "name" | "email" | "phone" | "notes" | "status">>): AdminUser | null {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  writeUsers(users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = readUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeUsers(filtered);
  return true;
}

export function getAnalytics() {
  const jobs = getJobs();
  const users = readUsers();

  const projectTypeCount: Record<string, number> = {};
  const statusCount: Record<string, number> = {};
  const dailyCount: Record<string, number> = {};

  for (const job of jobs) {
    const type = job.projectType || "other";
    projectTypeCount[type] = (projectTypeCount[type] || 0) + 1;

    statusCount[job.status] = (statusCount[job.status] || 0) + 1;

    const day = job.createdAt.slice(0, 10);
    dailyCount[day] = (dailyCount[day] || 0) + 1;
  }

  return {
    totalLeads: jobs.length,
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    leadsByType: projectTypeCount,
    leadsByStatus: statusCount,
    leadsPerDay: Object.entries(dailyCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
  };
}
