import crypto from "crypto";
import { query } from "./db";

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

export interface Contractor {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: "active" | "paused" | "deleted";
  createdAt: string;
}

interface ContractorRow {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  created_at: Date;
  password_hash: string;
}

interface AdminRow {
  username: string;
  password_hash: string;
}

function mapContractor(row: ContractorRow): Contractor {
  return {
    id: row.id,
    username: row.username,
    company: row.company,
    phone: row.phone,
    email: row.email,
    status: row.status as Contractor["status"],
    createdAt: row.created_at.toISOString(),
  };
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const rows = await query<AdminRow>(
    "SELECT password_hash FROM admin WHERE username = $1",
    [username]
  );
  if (rows.length === 0) return false;
  return scryptVerify(password, rows[0].password_hash);
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  const hash = scryptHash(newPassword);
  await query("UPDATE admin SET password_hash = $1", [hash]);
}

export async function verifyContractorPassword(username: string, password: string): Promise<Contractor | null> {
  const rows = await query<ContractorRow>(
    "SELECT * FROM contractors WHERE username = $1 AND status = 'active'",
    [username]
  );
  if (rows.length === 0) return null;
  const c = rows[0];
  if (!scryptVerify(password, c.password_hash)) return null;
  return mapContractor(c);
}

export async function getContractors(): Promise<Contractor[]> {
  const rows = await query<ContractorRow>(
    "SELECT * FROM contractors WHERE status != 'deleted' ORDER BY created_at DESC"
  );
  return rows.map(mapContractor);
}

export async function addContractor(input: { username: string; password: string; company: string; phone: string; email: string }): Promise<Contractor> {
  // Check for duplicate active username
  const existing = await query<ContractorRow>(
    "SELECT * FROM contractors WHERE username = $1",
    [input.username]
  );
  if (existing.length > 0) {
    if (existing[0].status !== "deleted") {
      throw new Error("Username already taken");
    }
    // Reactivate soft-deleted contractor
    const hash = scryptHash(input.password);
    const rows = await query<ContractorRow>(
      `UPDATE contractors SET company=$1, email=$2, phone=$3, password_hash=$4, status='active', updated_at=now() WHERE id=$5 RETURNING *`,
      [input.company, input.email, input.phone, hash, existing[0].id]
    );
    return mapContractor(rows[0]);
  }
  // Check for duplicate email on a different contractor
  const emailDup = await query<ContractorRow>(
    "SELECT id FROM contractors WHERE email = $1 AND status != 'deleted'",
    [input.email]
  );
  if (emailDup.length > 0) {
    throw new Error("Email already in use by another contractor");
  }
  const hash = scryptHash(input.password);
  const rows = await query<ContractorRow>(
    `INSERT INTO contractors (username, company, email, phone, password_hash, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING *`,
    [input.username, input.company, input.email, input.phone, hash]
  );
  return mapContractor(rows[0]);
}

export async function updateContractor(id: string, p: Partial<Pick<Contractor, "company" | "phone" | "email" | "status">>): Promise<Contractor | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (p.company !== undefined) { setClauses.push(`company = $${idx++}`); values.push(p.company); }
  if (p.phone !== undefined) { setClauses.push(`phone = $${idx++}`); values.push(p.phone); }
  if (p.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(p.email); }
  if (p.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(p.status); }
  if (setClauses.length === 0) return null;
  setClauses.push(`updated_at = now()`);
  values.push(id);
  const rows = await query<ContractorRow>(
    `UPDATE contractors SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;
  return mapContractor(rows[0]);
}

export async function deleteContractor(id: string): Promise<boolean> {
  const rows = await query<ContractorRow>(
    "UPDATE contractors SET status = 'deleted', updated_at = now() WHERE id = $1 RETURNING id",
    [id]
  );
  return rows.length > 0;
}

export async function verifyContractorPasswordById(id: string, password: string): Promise<boolean> {
  const rows = await query<{ password_hash: string }>(
    "SELECT password_hash FROM contractors WHERE id = $1 AND status = 'active'",
    [id]
  );
  if (rows.length === 0) return false;
  return scryptVerify(password, rows[0].password_hash);
}

export async function changeContractorPassword(id: string, newPassword: string): Promise<boolean> {
  const hash = scryptHash(newPassword);
  const rows = await query<{ id: string }>(
    "UPDATE contractors SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING id",
    [hash, id]
  );
  return rows.length > 0;
}
