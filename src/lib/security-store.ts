import { query, transaction } from "./db";
import crypto from "crypto";

export async function logAudit(input: {
  adminId: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
}): Promise<void> {
  await query(
    `INSERT INTO audit_log (admin_id, action, entity, entity_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)`,
    [input.adminId, input.action, input.entity || "", input.entityId || "", input.details ? JSON.stringify(input.details) : null, input.ipAddress]
  );
}

export async function getAuditLog(limit = 100, offset = 0) {
  const rows = await query<{ id: string; admin_id: string; action: string; entity: string; entity_id: string; details: unknown; ip_address: string; created_at: Date }>(
    `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows.map((r) => ({ ...r, details: r.details ? JSON.parse(r.details as string) : null, createdAt: r.created_at.toISOString() }));
}

export async function recordLoginAttempt(identifier: string, ipAddress: string, success: boolean): Promise<void> {
  try {
    await query(
      `INSERT INTO login_attempts (identifier, ip_address, success) VALUES ($1, $2, $3)`,
      [identifier, ipAddress, success]
    );
  } catch {
    /* table may not exist — non-critical */
  }
}

export async function getRecentFailedAttempts(identifier: string, windowMinutes = 15): Promise<number> {
  try {
    const rows = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM login_attempts WHERE identifier = $1 AND success = false AND created_at > now() - make_interval(mins => $2)`,
      [identifier, windowMinutes]
    );
    return parseInt(rows[0]?.c || "0", 10);
  } catch {
    return 0;
  }
}

export async function getRecentFailedAttemptsByIP(ipAddress: string, windowMinutes = 15): Promise<number> {
  try {
    const rows = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM login_attempts WHERE ip_address = $1 AND success = false AND created_at > now() - make_interval(mins => $2)`,
      [ipAddress, windowMinutes]
    );
    return parseInt(rows[0]?.c || "0", 10);
  } catch {
    return 0;
  }
}

export async function createCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await query(
    `INSERT INTO csrf_tokens (token, expires_at) VALUES ($1, now() + interval '1 hour')`,
    [token]
  );
  return token;
}

export async function validateAndConsumeCsrfToken(token: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE csrf_tokens SET used = true WHERE token = $1 AND used = false AND expires_at > now() RETURNING id`,
    [token]
  );
  return rows.length > 0;
}

export async function getTwoFactorStatus(role: "admin" | "contractor", userId: string): Promise<{ enabled: boolean; hasSecret: boolean; secret: string }> {
  const table = role === "admin" ? "admin" : "contractors";
  const rows = await query<{ two_factor_secret: string; two_factor_enabled: boolean }>(
    `SELECT two_factor_secret, two_factor_enabled FROM ${table} WHERE id = $1`,
    [userId]
  );
  if (rows.length === 0) return { enabled: false, hasSecret: false, secret: "" };
  return { enabled: rows[0].two_factor_enabled, hasSecret: rows[0].two_factor_secret.length > 0, secret: rows[0].two_factor_secret };
}

export async function setTwoFactorSecret(role: "admin" | "contractor", userId: string, secret: string): Promise<void> {
  const table = role === "admin" ? "admin" : "contractors";
  await query(
    `UPDATE ${table} SET two_factor_secret = $1 WHERE id = $2`,
    [secret, userId]
  );
}

export async function enableTwoFactor(role: "admin" | "contractor", userId: string): Promise<void> {
  const table = role === "admin" ? "admin" : "contractors";
  await query(
    `UPDATE ${table} SET two_factor_enabled = true WHERE id = $1`,
    [userId]
  );
}

export async function disableTwoFactor(role: "admin" | "contractor", userId: string): Promise<void> {
  const table = role === "admin" ? "admin" : "contractors";
  await query(
    `UPDATE ${table} SET two_factor_enabled = false, two_factor_secret = '' WHERE id = $1`,
    [userId]
  );
}

export async function getContractorActiveSessions(contractorId: string): Promise<{ id: string; createdAt: string }[]> {
  const rows = await query<{ id: string; created_at: Date }>(
    `SELECT id, created_at FROM sessions WHERE contractor_id = $1 AND expires_at > now() ORDER BY created_at DESC`,
    [contractorId]
  );
  return rows.map((r) => ({ id: r.id, createdAt: r.created_at.toISOString() }));
}

export async function revokeSession(sessionId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export async function revokeAllSessions(contractorId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE contractor_id = $1`, [contractorId]);
}
