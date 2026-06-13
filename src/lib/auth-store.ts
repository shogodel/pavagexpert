import fs from "fs";
import path from "path";
import crypto from "crypto";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const authFile = path.join(dataDir, "auth.json");

function scryptHash(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function scryptVerify(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const verify = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === verify;
}

interface StoredAdmin {
  username: string;
  passwordHash: string;
}

export interface Contractor {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: "active" | "paused" | "deleted";
  createdAt: string;
}

interface StoredContractor extends Contractor {
  passwordHash: string;
}

interface AuthData {
  admin: StoredAdmin;
  contractors: StoredContractor[];
}

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readAuth(): AuthData {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(authFile, "utf-8"));
  } catch {
    // Backup corrupted file, then seed from env vars (same logic as entrypoint.sh)
    console.error("[auth-store] auth.json is missing or corrupted.");
    try {
      const bak = authFile + ".bak." + Date.now();
      fs.renameSync(authFile, bak);
      console.error("[auth-store] Corrupted file backed up to", bak);
    } catch {}

    const pw = process.env.ADMIN_PASSWORD || "admin";
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
    const data: AuthData = {
      admin: { username: process.env.ADMIN_USERNAME || "admin", passwordHash: salt + ":" + hash },
      contractors: [],
    };
    writeAuth(data);
    return data;
  }
}

function writeAuth(data: AuthData) {
  ensureDir();
  fs.writeFileSync(authFile, JSON.stringify(data, null, 2), "utf-8");
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const auth = readAuth();
  if (auth.admin.username !== username) return false;
  return scryptVerify(password, auth.admin.passwordHash);
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  const auth = readAuth();
  auth.admin.passwordHash = scryptHash(newPassword);
  writeAuth(auth);
}

export async function verifyContractorPassword(username: string, password: string): Promise<Contractor | null> {
  const auth = readAuth();
  const contractor = auth.contractors.find((c) => c.username === username && c.status === "active");
  if (!contractor) return null;
  if (!scryptVerify(password, contractor.passwordHash)) return null;
  const { passwordHash: _pw, ...safe } = contractor;
  return safe;
}

export function getContractors(): Contractor[] {
  return readAuth().contractors.filter((c) => c.status !== "deleted");
}

export function addContractor(input: { username: string; password: string; company: string; phone: string; email: string }): Contractor {
  const auth = readAuth();
  const contractor: StoredContractor = {
    id: crypto.randomUUID(),
    username: input.username,
    passwordHash: scryptHash(input.password),
    company: input.company,
    phone: input.phone,
    email: input.email,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  auth.contractors.push(contractor);
  writeAuth(auth);
  const { passwordHash: _pw, ...safe } = contractor;
  return safe;
}

export function updateContractor(id: string, p: Partial<Pick<Contractor, "company" | "phone" | "email" | "status">>): Contractor | null {
  const auth = readAuth();
  const idx = auth.contractors.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  auth.contractors[idx] = { ...auth.contractors[idx], ...p };
  writeAuth(auth);
  const { passwordHash: _pw, ...safe } = auth.contractors[idx];
  return safe;
}

export function deleteContractor(id: string): boolean {
  const auth = readAuth();
  const idx = auth.contractors.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  auth.contractors[idx].status = "deleted";
  writeAuth(auth);
  return true;
}

export async function changeContractorPassword(id: string, newPassword: string): Promise<boolean> {
  const auth = readAuth();
  const idx = auth.contractors.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  auth.contractors[idx] = { ...auth.contractors[idx], passwordHash: scryptHash(newPassword) };
  writeAuth(auth);
  return true;
}
