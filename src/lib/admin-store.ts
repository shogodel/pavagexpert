import { query } from "./db";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: "active" | "paused" | "deleted";
  createdAt: string;
}

interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: string;
  created_at: Date;
}

function mapUser(row: ClientRow): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    status: row.status as AdminUser["status"],
    createdAt: row.created_at.toISOString(),
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  const rows = await query<ClientRow>(
    "SELECT * FROM clients ORDER BY created_at DESC"
  );
  return rows.map(mapUser);
}

export async function addUser(input: { name: string; email: string; phone?: string; notes?: string }): Promise<AdminUser> {
  const rows = await query<ClientRow>(
    "INSERT INTO clients (name, email, phone, notes) VALUES ($1, $2, $3, $4) RETURNING *",
    [input.name, input.email, input.phone || "", input.notes || ""]
  );
  return mapUser(rows[0]);
}

export async function updateUser(id: string, data: Partial<Pick<AdminUser, "name" | "email" | "phone" | "notes" | "status">>): Promise<AdminUser | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (data.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(data.name); }
  if (data.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(data.email); }
  if (data.phone !== undefined) { setClauses.push(`phone = $${idx++}`); values.push(data.phone); }
  if (data.notes !== undefined) { setClauses.push(`notes = $${idx++}`); values.push(data.notes); }
  if (data.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(data.status); }
  if (setClauses.length === 0) return null;
  values.push(id);
  const rows = await query<ClientRow>(
    `UPDATE clients SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;
  return mapUser(rows[0]);
}

export async function deleteUser(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "UPDATE clients SET status = 'deleted' WHERE id = $1 RETURNING id",
    [id]
  );
  return rows.length > 0;
}

interface JobWithSource { status: string; created_at: Date; budget: string; lead_source: Record<string, string> | null }

export async function getAnalytics() {
  const jobs = await query<JobWithSource>(
    "SELECT status, created_at, budget, lead_source FROM jobs"
  );
  const clients = await query<{ status: string }>(
    "SELECT status FROM clients"
  );

  const budgetRanges: Record<string, number> = {};
  const statusCount: Record<string, number> = {};
  const dailyCount: Record<string, number> = {};
  const sourceCount: Record<string, number> = {};

  for (const job of jobs) {
    const budgetNum = parseInt(job.budget.replace(/[^0-9]/g, ""), 10);
    let range: string;
    if (!job.budget || isNaN(budgetNum)) {
      range = "unknown";
    } else if (budgetNum < 5000) {
      range = "small";
    } else if (budgetNum < 15000) {
      range = "medium";
    } else {
      range = "large";
    }
    budgetRanges[range] = (budgetRanges[range] || 0) + 1;

    statusCount[job.status] = (statusCount[job.status] || 0) + 1;
    const day = job.created_at.toISOString().slice(0, 10);
    dailyCount[day] = (dailyCount[day] || 0) + 1;

    const source = job.lead_source?.utm_source || "direct";
    sourceCount[source] = (sourceCount[source] || 0) + 1;
  }

  return {
    totalLeads: jobs.length,
    totalUsers: clients.length,
    activeUsers: clients.filter((c) => c.status === "active").length,
    leadsByType: budgetRanges,
    leadsByStatus: statusCount,
    leadsPerDay: Object.entries(dailyCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    leadsBySource: Object.entries(sourceCount)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => ({ source, count })),
  };
}
