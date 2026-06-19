import { query, transaction } from "./db";

export interface ConsentLog {
  id: string;
  visitorId: string;
  consentType: string;
  consentGiven: boolean;
  categories: string[];
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export async function logConsent(input: {
  visitorId: string;
  consentType: string;
  consentGiven: boolean;
  categories: string[];
  ipAddress: string;
  userAgent: string;
}): Promise<void> {
  await query(
    `INSERT INTO consent_logs (visitor_id, consent_type, consent_given, categories, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [input.visitorId, input.consentType, input.consentGiven, input.categories, input.ipAddress, input.userAgent]
  );
}

export async function createDataRequest(input: {
  email: string;
  requestType: "deletion" | "export";
  token: string;
}): Promise<void> {
  await query(
    `INSERT INTO data_requests (email, request_type, token) VALUES ($1, $2, $3)`,
    [input.email, input.requestType, input.token]
  );
}

export async function verifyDataRequest(token: string): Promise<{ id: string; email: string; requestType: string } | null> {
  const rows = await query<{ id: string; email: string; request_type: string }>(
    `UPDATE data_requests SET status = 'verified'
     WHERE token = $1 AND status = 'pending' AND expires_at > now()
     RETURNING id, email, request_type`,
    [token]
  );
  return rows.length > 0 ? { id: rows[0].id, email: rows[0].email, requestType: rows[0].request_type } : null;
}

export async function completeDataRequest(id: string): Promise<void> {
  await query(
    `UPDATE data_requests SET status = 'completed', completed_at = now() WHERE id = $1`,
    [id]
  );
}

export async function getDataRequestByEmail(email: string): Promise<{ id: string; status: string; requestType: string; createdAt: string }[]> {
  const rows = await query<{ id: string; status: string; request_type: string; created_at: Date }>(
    `SELECT id, status, request_type, created_at FROM data_requests WHERE email = $1 ORDER BY created_at DESC`,
    [email]
  );
  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    requestType: r.request_type,
    createdAt: r.created_at.toISOString(),
  }));
}

export async function anonPseudonymizeLeadsByEmail(email: string): Promise<void> {
  await query(
    `UPDATE jobs SET
       client_name = 'Anonymisé',
       email = 'redacted-' || gen_random_uuid()::text || '@redacted.local',
       phone = '',
       postal_code = '',
       description = '[Supprimé sur demande]',
       ip_address = '',
       browser_fingerprint = '',
       flag_reason = NULL,
       scheduled_deletion_at = now()
     WHERE email = $1`,
    [email]
  );
}

export async function exportUserData(email: string): Promise<Record<string, unknown>> {
  const jobs = await query(
    `SELECT id, client_name, email, phone, postal_code, city, budget, description, lead_source, status, verified, score, created_at
     FROM jobs WHERE email = $1 ORDER BY created_at DESC`,
    [email]
  );

  const consentLogs = await query(
    `SELECT consent_type, consent_given, categories, created_at FROM consent_logs
     WHERE visitor_id = $1 ORDER BY created_at DESC`,
    [email]
  );

  return {
    exportedAt: new Date().toISOString(),
    jobs,
    consentLogs,
  };
}

export async function recordTermsAcceptance(input: {
  userType: "client" | "contractor" | "admin";
  userId: string;
  termsVersion: string;
  ipAddress: string;
}): Promise<void> {
  await transaction(async (tx) => {
    await tx(
      `INSERT INTO terms_acceptance (user_type, user_id, terms_version, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [input.userType, input.userId, input.termsVersion, input.ipAddress]
    );

    if (input.userType === "contractor") {
      await tx(
        `UPDATE contractors SET terms_accepted_at = now(), terms_version = $1 WHERE id = $2`,
        [input.termsVersion, input.userId]
      );
    }
  });
}

export async function needsTermsAcceptance(userType: string, userId: string): Promise<boolean> {
  if (userType === "contractor") {
    const rows = await query<{ terms_version: string }>(
      `SELECT terms_version FROM contractors WHERE id = $1`,
      [userId]
    );
    if (rows.length === 0) return false;
    return rows[0].terms_version !== "2025-01";
  }
  const rows = await query<{ id: string }>(
    `SELECT id FROM terms_acceptance
     WHERE user_type = $1 AND user_id = $2 AND terms_version = '2025-01'
     LIMIT 1`,
    [userType, userId]
  );
  return rows.length === 0;
}

export async function purgeOldData(): Promise<{ deleted: number; anon: number }> {
  const expired = await query<{ id: string }>(
    `UPDATE data_requests SET status = 'rejected'
     WHERE status = 'pending' AND expires_at < now()
     RETURNING id`
  );

  const oldConsentLogs = await query(
    `DELETE FROM consent_logs WHERE created_at < now() - interval '3 years'`
  );

  const accounts = await query<{ email: string }>(
    `SELECT DISTINCT email FROM jobs
     WHERE scheduled_deletion_at IS NOT NULL AND scheduled_deletion_at <= now()`
  );

  for (const a of accounts) {
    await anonPseudonymizeLeadsByEmail(a.email);
  }

  return {
    deleted: expired.length + accounts.length,
    anon: accounts.length,
  };
}
