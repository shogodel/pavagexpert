import { query } from "./db";

export interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  pctOfPrevious: number | null;
}

export interface FunnelMetric {
  stages: FunnelStage[];
  totalImpressions: number;
  impressionsPerDay: { date: string; count: number }[];
  formStarts: number;
}

export interface ContractorROI {
  id: string;
  company: string;
  email: string;
  totalClaims: number;
  acceptedClaims: number;
  completedJobs: number;
  totalPaidCents: number;
  conversionRate: string;
}

export interface FunnelData {
  funnel: FunnelMetric;
  contractorROI: ContractorROI[];
}

export async function getFunnelMetrics(): Promise<FunnelMetric> {
  const [totalLeads, verifiedLeads, claimedLeads, acceptedLeads, completedJobs, paidInvoices] =
    await Promise.all([
      query<{ c: string }>("SELECT COUNT(*)::text AS c FROM jobs"),
      query<{ c: string }>("SELECT COUNT(*)::text AS c FROM jobs WHERE verified = true"),
      query<{ c: string }>("SELECT COUNT(DISTINCT job_id)::text AS c FROM claims"),
      query<{ c: string }>("SELECT COUNT(DISTINCT job_id)::text AS c FROM claims WHERE status = 'accepted'"),
      query<{ c: string }>("SELECT COUNT(*)::text AS c FROM jobs WHERE status = 'completed'"),
      query<{ c: string }>("SELECT COUNT(*)::text AS c FROM invoices WHERE status = 'paid'"),
    ]);

  const raw: { stage: string; count: number }[] = [
    { stage: "lead_created", count: parseInt(totalLeads[0]?.c || "0", 10) },
    { stage: "lead_verified", count: parseInt(verifiedLeads[0]?.c || "0", 10) },
    { stage: "claimed", count: parseInt(claimedLeads[0]?.c || "0", 10) },
    { stage: "accepted", count: parseInt(acceptedLeads[0]?.c || "0", 10) },
    { stage: "completed", count: parseInt(completedJobs[0]?.c || "0", 10) },
    { stage: "paid", count: parseInt(paidInvoices[0]?.c || "0", 10) },
  ];

  const stages: FunnelStage[] = [];
  const labels: Record<string, string> = {
    lead_created: "Soumissions",
    lead_verified: "Confirmés",
    claimed: "Réclamés",
    accepted: "Acceptés",
    completed: "Terminés",
    paid: "Payés",
  };

  for (let i = 0; i < raw.length; i++) {
    const prev = i > 0 ? raw[i - 1].count : null;
    stages.push({
      stage: raw[i].stage,
      label: labels[raw[i].stage] || raw[i].stage,
      count: raw[i].count,
      pctOfPrevious:
        prev && prev > 0
          ? Math.round((raw[i].count / prev) * 100)
          : null,
    });
  }

  // Impressions & form starts from analytics_events
  const impressions = await query<{ c: string }>(
    "SELECT COUNT(*)::text AS c FROM analytics_events WHERE event = 'impression'"
  );
  const impressionsPerDay = await query<{ date: string; count: string }>(
    `SELECT created_at::date AS date, COUNT(*)::text AS count
     FROM analytics_events WHERE event = 'impression'
     GROUP BY created_at::date ORDER BY date`
  );
  const formStarts = await query<{ c: string }>(
    "SELECT COUNT(*)::text AS c FROM analytics_events WHERE event = 'form_start'"
  );

  return {
    stages,
    totalImpressions: parseInt(impressions[0]?.c || "0", 10),
    impressionsPerDay: impressionsPerDay.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    })),
    formStarts: parseInt(formStarts[0]?.c || "0", 10),
  };
}

export async function getContractorROI(): Promise<ContractorROI[]> {
  const rows = await query<{
    id: string; company: string; email: string;
    total_claims: string; accepted_claims: string;
    completed_jobs: string; total_paid_cents: string;
  }>(
    `SELECT
       c.id, c.company, c.email,
       (SELECT COUNT(*)::text FROM claims WHERE contractor_id = c.id) AS total_claims,
       (SELECT COUNT(*)::text FROM claims WHERE contractor_id = c.id AND status = 'accepted') AS accepted_claims,
       (SELECT COUNT(*)::text FROM jobs j JOIN claims cl ON cl.job_id = j.id WHERE cl.contractor_id = c.id AND j.status = 'completed') AS completed_jobs,
       (SELECT COALESCE(SUM(amount_cents), 0)::text FROM contractor_bills WHERE contractor_id = c.id AND status = 'paid') AS total_paid_cents
     FROM contractors c
     WHERE c.status != 'deleted'
     ORDER BY total_claims DESC`
  );

  return rows.map((r) => {
    const total = parseInt(r.total_claims || "0", 10);
    const accepted = parseInt(r.accepted_claims || "0", 10);
    return {
      id: r.id,
      company: r.company,
      email: r.email,
      totalClaims: total,
      acceptedClaims: accepted,
      completedJobs: parseInt(r.completed_jobs || "0", 10),
      totalPaidCents: parseInt(r.total_paid_cents || "0", 10),
      conversionRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : "0.0",
    };
  });
}
