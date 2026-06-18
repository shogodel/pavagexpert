import { query } from "./db";

interface PortfolioRow {
  id: string;
  contractor_id: string;
  job_id: string | null;
  caption: string;
  category: string;
  sort_order: number;
  created_at: Date;
}

export interface PortfolioItem {
  id: string;
  contractorId: string;
  jobId: string | null;
  caption: string;
  category: string;
  sortOrder: number;
  createdAt: string;
}

function mapItem(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    jobId: row.job_id,
    caption: row.caption,
    category: row.category,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
  };
}

export async function addPortfolioPhoto(
  contractorId: string,
  data: { jobId?: string; caption?: string; category?: string; sortOrder?: number }
): Promise<PortfolioItem> {
  const maxRow = await query<{ max_sort: number | null }>(
    "SELECT MAX(sort_order) as max_sort FROM contractor_portfolio WHERE contractor_id = $1",
    [contractorId]
  );
  const nextSort = (maxRow[0]?.max_sort ?? -1) + 1;
  const rows = await query<PortfolioRow>(
    `INSERT INTO contractor_portfolio (contractor_id, job_id, caption, category, sort_order)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      contractorId,
      data.jobId || null,
      data.caption || "",
      data.category || "other",
      data.sortOrder ?? nextSort,
    ]
  );
  return mapItem(rows[0]);
}

export async function getPortfolio(contractorId: string): Promise<PortfolioItem[]> {
  const rows = await query<PortfolioRow>(
    "SELECT * FROM contractor_portfolio WHERE contractor_id = $1 ORDER BY sort_order",
    [contractorId]
  );
  return rows.map(mapItem);
}

export async function deletePortfolioPhoto(id: string, contractorId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM contractor_portfolio WHERE id = $1 AND contractor_id = $2 RETURNING id",
    [id, contractorId]
  );
  return rows.length > 0;
}

export async function updatePortfolioPhoto(
  id: string,
  contractorId: string,
  data: { caption?: string; category?: string; sortOrder?: number }
): Promise<PortfolioItem | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (data.caption !== undefined) { setClauses.push(`caption = $${idx++}`); values.push(data.caption); }
  if (data.category !== undefined) { setClauses.push(`category = $${idx++}`); values.push(data.category); }
  if (data.sortOrder !== undefined) { setClauses.push(`sort_order = $${idx++}`); values.push(data.sortOrder); }
  if (setClauses.length === 0) return null;
  values.push(id, contractorId);
  const rows = await query<PortfolioRow>(
    `UPDATE contractor_portfolio SET ${setClauses.join(", ")} WHERE id = $${idx++} AND contractor_id = $${idx} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;
  return mapItem(rows[0]);
}
