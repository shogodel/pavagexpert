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
  status: "pending" | "active" | "paused" | "deleted" | "rejected";
  createdAt: string;
  rbqLicense: string;
  yearsInBusiness: number;
  serviceAreas: string[];
  verified: boolean;
  bio: string;
}

export type Application = Contractor;

interface ContractorRow {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  created_at: Date;
  password_hash: string;
  rbq_license?: string;
  years_in_business?: number;
  service_areas?: string[];
  verified?: boolean;
  bio?: string;
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
    rbqLicense: row.rbq_license || "",
    yearsInBusiness: row.years_in_business || 0,
    serviceAreas: row.service_areas || [],
    verified: row.verified ?? false,
    bio: row.bio ?? "",
  };
}

export async function getPendingApplications(): Promise<Application[]> {
  const rows = await query<ContractorRow>(
    `SELECT id, username, company, email, phone, rbq_license, years_in_business, service_areas,
            password_hash, status, created_at
     FROM contractors WHERE status = 'pending' ORDER BY created_at DESC`
  );
  return rows.map(mapContractor);
}

export async function createApplication(input: {
  company: string; rbqLicense: string; phone: string; email: string;
  yearsInBusiness: number; serviceAreas: string[];
}): Promise<{ username: string }> {
  const existing = await query<{ id: string }>(
    "SELECT id FROM contractors WHERE email = $1 AND status != 'deleted'",
    [input.email]
  );
  if (existing.length > 0) {
    throw new Error("Email already registered");
  }

  const slug = input.company.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 20);
  const prefix = slug || "contractor";

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const username = `${prefix}_${suffix}`;

    const taken = await query<{ id: string }>(
      "SELECT id FROM contractors WHERE username = $1",
      [username]
    );
    if (taken.length > 0) continue;

    const rows = await query<{ username: string }>(
      `INSERT INTO contractors (company, email, phone, rbq_license, years_in_business, service_areas, username, status, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', '')
       RETURNING username`,
      [input.company, input.email, input.phone, input.rbqLicense, input.yearsInBusiness, input.serviceAreas, username]
    );
    return { username: rows[0].username };
  }

  throw new Error("Failed to generate unique username");
}

export async function approveApplication(id: string): Promise<{ company: string; email: string; username: string; password: string } | null> {
  const rows = await query<ContractorRow>(
    "SELECT company, email, username FROM contractors WHERE id = $1 AND status = 'pending'",
    [id]
  );
  if (rows.length === 0) return null;
  const c = rows[0];
  const password = crypto.randomBytes(6).toString("hex");
  const hash = scryptHash(password);
  await query(
    "UPDATE contractors SET status = 'active', password_hash = $1, updated_at = now() WHERE id = $2",
    [hash, id]
  );
  return { company: c.company, email: c.email, username: c.username, password };
}

export async function rejectApplication(id: string): Promise<{ company: string; email: string } | null> {
  const rows = await query<{ company: string; email: string }>(
    "UPDATE contractors SET status = 'rejected', updated_at = now() WHERE id = $1 AND status = 'pending' RETURNING company, email",
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const rows = await query<AdminRow>(
    "SELECT password_hash FROM admin WHERE username = $1",
    [username]
  );
  if (rows.length === 0) return false;
  return scryptVerify(password, rows[0].password_hash);
}

export async function changeAdminPassword(newPassword: string, username?: string): Promise<void> {
  const hash = scryptHash(newPassword);
  if (username) {
    await query("UPDATE admin SET password_hash = $1 WHERE username = $2", [hash, username]);
  } else {
    await query("UPDATE admin SET password_hash = $1", [hash]);
  }
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

export async function updateContractor(id: string, p: Partial<Pick<Contractor, "company" | "phone" | "email" | "status" | "rbqLicense" | "yearsInBusiness" | "serviceAreas">>): Promise<Contractor | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (p.company !== undefined) { setClauses.push(`company = $${idx++}`); values.push(p.company); }
  if (p.phone !== undefined) { setClauses.push(`phone = $${idx++}`); values.push(p.phone); }
  if (p.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(p.email); }
  if (p.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(p.status); }
  if (p.rbqLicense !== undefined) { setClauses.push(`rbq_license = $${idx++}`); values.push(p.rbqLicense); }
  if (p.yearsInBusiness !== undefined) { setClauses.push(`years_in_business = $${idx++}`); values.push(p.yearsInBusiness); }
  if (p.serviceAreas !== undefined) { setClauses.push(`service_areas = $${idx++}`); values.push(p.serviceAreas); }
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

export async function hardDeleteContractor(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM contractors WHERE id = $1 RETURNING id",
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
