import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const authFile = path.join(dataDir, "auth.json");

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
  let data: AuthData;
  try {
    data = JSON.parse(fs.readFileSync(authFile, "utf-8"));
  } catch {
    data = { admin: { username: "admin", passwordHash: "" }, contractors: [] };
  }
  // Always sync admin credentials from env vars so .env changes take effect
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  if (envUser && envPass) {
    data.admin = {
      username: envUser,
      passwordHash: bcrypt.hashSync(envPass, 10),
    };
    writeAuth(data);
  }
  return data;
}

function writeAuth(data: AuthData) {
  ensureDir();
  fs.writeFileSync(authFile, JSON.stringify(data, null, 2), "utf-8");
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const auth = readAuth();
  return auth.admin.username === username && bcrypt.compareSync(password, auth.admin.passwordHash);
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  const auth = readAuth();
  auth.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeAuth(auth);
}

export async function verifyContractorPassword(username: string, password: string): Promise<Contractor | null> {
  const auth = readAuth();
  const contractor = auth.contractors.find((c) => c.username === username && c.status === "active");
  if (!contractor) return null;
  const match = bcrypt.compareSync(password, contractor.passwordHash);
  if (!match) return null;
  const { passwordHash: _pw, ...safe } = contractor; // eslint-disable-line @typescript-eslint/no-unused-vars
  return safe;
}

export function getContractors(): Contractor[] {
  return readAuth().contractors.filter((c) => c.status !== "deleted");
}

export function addContractor(input: { username: string; password: string; company: string; phone: string; email: string }): Contractor {
  const auth = readAuth();
  const contractor = {
    id: crypto.randomUUID(),
    username: input.username,
    passwordHash: bcrypt.hashSync(input.password, 10),
    company: input.company,
    phone: input.phone,
    email: input.email,
    status: "active" as const,
    createdAt: new Date().toISOString(),
  };
  auth.contractors.push(contractor);
  writeAuth(auth);
  const { passwordHash: _pw, ...safe } = contractor; // eslint-disable-line @typescript-eslint/no-unused-vars
  return safe;
}

export function updateContractor(id: string, data: Partial<Pick<Contractor, "company" | "phone" | "email" | "status">>): Contractor | null {
  const auth = readAuth();
  const idx = auth.contractors.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  auth.contractors[idx] = { ...auth.contractors[idx], ...data };
  writeAuth(auth);
  const { passwordHash: _pw, ...safe } = auth.contractors[idx]; // eslint-disable-line @typescript-eslint/no-unused-vars
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
  auth.contractors[idx] = { ...auth.contractors[idx], passwordHash: bcrypt.hashSync(newPassword, 10) };
  writeAuth(auth);
  return true;
}
