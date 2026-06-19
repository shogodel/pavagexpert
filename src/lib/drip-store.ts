import { query } from "./db";

export interface DripCampaign {
  id: string;
  slug: string;
  name: string;
  triggerEvent: string;
  delayMinutes: number;
  subject: string;
  template: string;
  active: boolean;
}

export async function getActiveCampaigns(): Promise<DripCampaign[]> {
  const rows = await query<{ id: string; slug: string; name: string; trigger_event: string; delay_minutes: number; subject: string; template: string; active: boolean }>(
    `SELECT * FROM drip_campaigns WHERE active = true ORDER BY delay_minutes ASC`
  );
  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, triggerEvent: r.trigger_event, delayMinutes: r.delay_minutes, subject: r.subject, template: r.template, active: r.active }));
}

export async function scheduleDrip(campaignSlug: string, recipient: string, jobId: string | null, contractorId: string | null): Promise<void> {
  const campaigns = await query<{ id: string; delay_minutes: number }>(
    `SELECT id, delay_minutes FROM drip_campaigns WHERE slug = $1 AND active = true LIMIT 1`,
    [campaignSlug]
  );
  if (campaigns.length === 0) return;
  await query(
    `INSERT INTO drip_actions (campaign_id, recipient, job_id, contractor_id, scheduled_for) VALUES ($1, $2, $3, $4, now() + make_interval(mins => $5))`,
    [campaigns[0].id, recipient, jobId, contractorId, campaigns[0].delay_minutes]
  );
}

export async function processDripActions(): Promise<number> {
  const actions = await query<{ id: string; campaign_id: string; recipient: string; job_id: string | null; contractor_id: string | null }>(
    `SELECT da.id, da.campaign_id, da.recipient, da.job_id, da.contractor_id
     FROM drip_actions da
     JOIN drip_campaigns dc ON dc.id = da.campaign_id
     WHERE da.scheduled_for <= now() AND da.sent_at IS NULL AND da.error = ''
     ORDER BY da.scheduled_for ASC
     LIMIT 50`
  );

  let sent = 0;
  for (const a of actions) {
    try {
      const campaigns = await query<{ subject: string; template: string }>(
        `SELECT subject, template FROM drip_campaigns WHERE id = $1`,
        [a.campaign_id]
      );
      if (campaigns.length === 0) continue;

      const { sendEmail } = await import("./email");
      await sendEmail({
        to: a.recipient,
        subject: campaigns[0].subject,
        html: campaigns[0].template,
      });

      await query(`UPDATE drip_actions SET sent_at = now() WHERE id = $1`, [a.id]);
      sent++;
    } catch (e) {
      await query(`UPDATE drip_actions SET error = $1 WHERE id = $2`, [String(e), a.id]);
    }
  }
  return sent;
}

export async function getAllCampaigns(): Promise<DripCampaign[]> {
  const rows = await query<{ id: string; slug: string; name: string; trigger_event: string; delay_minutes: number; subject: string; template: string; active: boolean }>(
    `SELECT * FROM drip_campaigns ORDER BY delay_minutes ASC`
  );
  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, triggerEvent: r.trigger_event, delayMinutes: r.delay_minutes, subject: r.subject, template: r.template, active: r.active }));
}

export async function upsertCampaign(input: { slug: string; name: string; triggerEvent: string; delayMinutes: number; subject: string; template: string; active?: boolean }): Promise<void> {
  await query(
    `INSERT INTO drip_campaigns (slug, name, trigger_event, delay_minutes, subject, template, active)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
     ON CONFLICT (slug) DO UPDATE SET name = $2, trigger_event = $3, delay_minutes = $4, subject = $5, template = $6, active = COALESCE($7, true)`,
    [input.slug, input.name, input.triggerEvent, input.delayMinutes, input.subject, input.template, input.active ?? true]
  );
}
