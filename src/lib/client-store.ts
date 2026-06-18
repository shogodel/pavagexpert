import { query, transaction } from "./db";

interface EmailTokenRow {
  id: string;
  job_id: string;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export async function generateMagicLink(jobId: string): Promise<{ token: string }> {
  const rows = await query<EmailTokenRow>(
    `INSERT INTO email_tokens (job_id, expires_at)
     VALUES ($1, now() + interval '7 days')
     RETURNING token`,
    [jobId]
  );
  return { token: rows[0].token };
}

export async function getOrCreateMagicLink(jobId: string): Promise<{ token: string } | null> {
  const existing = await query<EmailTokenRow>(
    `SELECT token FROM email_tokens
     WHERE job_id = $1 AND used_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [jobId]
  );
  if (existing.length > 0) {
    return { token: existing[0].token };
  }
  return generateMagicLink(jobId);
}

export async function verifyMagicLink(token: string): Promise<{ jobId: string } | null> {
  const rows = await query<EmailTokenRow>(
    `SELECT job_id FROM email_tokens
     WHERE token = $1 AND used_at IS NULL AND expires_at > now()`,
    [token]
  );
  if (rows.length === 0) return null;
  await query("UPDATE email_tokens SET used_at = now() WHERE token = $1", [token]);
  return { jobId: rows[0].job_id };
}
