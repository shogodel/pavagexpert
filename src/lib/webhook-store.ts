import { query } from "./db";
import crypto from "crypto";

export interface Webhook {
  id: string;
  contractorId: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  lastSentAt: string | null;
  createdAt: string;
}

export async function getWebhooks(contractorId: string): Promise<Webhook[]> {
  const rows = await query<{ id: string; contractor_id: string; url: string; secret: string; events: string[]; active: boolean; last_sent_at: Date | null; created_at: Date }>(
    `SELECT * FROM webhooks WHERE contractor_id = $1 ORDER BY created_at DESC`,
    [contractorId]
  );
  return rows.map((r) => ({
    id: r.id, contractorId: r.contractor_id, url: r.url, secret: r.secret,
    events: r.events, active: r.active, lastSentAt: r.last_sent_at?.toISOString() ?? null,
    createdAt: r.created_at.toISOString(),
  }));
}

export async function createWebhook(input: { contractorId: string; url: string; events: string[] }): Promise<Webhook> {
  const secret = crypto.randomBytes(32).toString("hex");
  const rows = await query<{ id: string; contractor_id: string; url: string; secret: string; events: string[]; active: boolean; last_sent_at: null; created_at: Date }>(
    `INSERT INTO webhooks (contractor_id, url, secret, events) VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.contractorId, input.url, secret, input.events]
  );
  return { id: rows[0].id, contractorId: rows[0].contractor_id, url: rows[0].url, secret: rows[0].secret, events: rows[0].events, active: rows[0].active, lastSentAt: null, createdAt: rows[0].created_at.toISOString() };
}

export async function updateWebhook(id: string, data: { url?: string; events?: string[]; active?: boolean }): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;
  if (data.url !== undefined) { sets.push(`url = $${idx++}`); vals.push(data.url); }
  if (data.events !== undefined) { sets.push(`events = $${idx++}`); vals.push(data.events); }
  if (data.active !== undefined) { sets.push(`active = $${idx++}`); vals.push(data.active); }
  if (sets.length === 0) return;
  sets.push(`updated_at = now()`);
  vals.push(id);
  await query(`UPDATE webhooks SET ${sets.join(", ")} WHERE id = $${idx}`, vals);
}

export async function deleteWebhook(id: string): Promise<void> {
  await query(`DELETE FROM webhooks WHERE id = $1`, [id]);
}

export async function dispatchWebhook(event: string, payload: Record<string, unknown>): Promise<void> {
  const hooks = await query<{ id: string; url: string; secret: string }>(
    `SELECT id, url, secret FROM webhooks WHERE active = true AND $1 = ANY(events)`,
    [event]
  );
  for (const hook of hooks) {
    const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    const signature = crypto.createHmac("sha256", hook.secret).update(body).digest("hex");
    try {
      const res = await fetch(hook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Webhook-Signature": signature },
        body,
      });
      await query(
        `INSERT INTO webhook_logs (webhook_id, event, status, request_body, response_body, response_code) VALUES ($1, $2, $3, $4, $5, $6)`,
        [hook.id, event, res.ok ? "success" : "failed", body, await res.text(), res.status]
      );
      await query(`UPDATE webhooks SET last_sent_at = now() WHERE id = $1`, [hook.id]);
    } catch (e) {
      await query(
        `INSERT INTO webhook_logs (webhook_id, event, status, request_body, response_body, response_code) VALUES ($1, $2, 'error', $3, $4, 0)`,
        [hook.id, event, body, String(e)]
      );
    }
  }
}

export async function getWebhookLogs(webhookId: string, limit = 20) {
  const rows = await query<{ id: string; event: string; status: string; response_code: number; created_at: Date }>(
    `SELECT id, event, status, response_code, created_at FROM webhook_logs WHERE webhook_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [webhookId, limit]
  );
  return rows.map((r) => ({ ...r, createdAt: r.created_at.toISOString() }));
}
