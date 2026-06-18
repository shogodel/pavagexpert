import { query } from "./db";

interface ReviewRow {
  id: string;
  contractor_id: string;
  job_id: string;
  client_name: string;
  rating: number;
  title: string;
  body: string;
  response: string;
  responded_at: Date | null;
  visible: boolean;
  created_at: Date;
}

export interface Review {
  id: string;
  contractorId: string;
  jobId: string;
  clientName: string;
  rating: number;
  title: string;
  body: string;
  response: string;
  respondedAt: string | null;
  visible: boolean;
  createdAt: string;
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    jobId: row.job_id,
    clientName: row.client_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    response: row.response,
    respondedAt: row.responded_at?.toISOString() ?? null,
    visible: row.visible,
    createdAt: row.created_at.toISOString(),
  };
}

export async function addReview(
  data: { contractorId: string; jobId: string; clientName: string; rating: number; title?: string; body?: string }
): Promise<Review> {
  const rows = await query<ReviewRow>(
    `INSERT INTO contractor_reviews (contractor_id, job_id, client_name, rating, title, body)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.contractorId, data.jobId, data.clientName, data.rating, data.title || "", data.body || ""]
  );
  await recalcRating(data.contractorId);
  return mapReview(rows[0]);
}

export async function respondToReview(reviewId: string, contractorId: string, response: string): Promise<Review | null> {
  const rows = await query<ReviewRow>(
    `UPDATE contractor_reviews SET response = $1, responded_at = now()
     WHERE id = $2 AND contractor_id = $3 RETURNING *`,
    [response, reviewId, contractorId]
  );
  if (rows.length === 0) return null;
  return mapReview(rows[0]);
}

export async function getReviewsByContractor(contractorId: string, visibleOnly = true): Promise<Review[]> {
  const cond = visibleOnly ? "AND visible = true" : "";
  const rows = await query<ReviewRow>(
    `SELECT * FROM contractor_reviews WHERE contractor_id = $1 ${cond} ORDER BY created_at DESC`,
    [contractorId]
  );
  return rows.map(mapReview);
}

async function recalcRating(contractorId: string): Promise<void> {
  const stats = await query<{ avg: string; count: number }>(
    `SELECT COALESCE(AVG(rating), 0)::numeric(2,1) as avg, COUNT(*)::int as count
     FROM contractor_reviews WHERE contractor_id = $1 AND visible = true`,
    [contractorId]
  );
  await query(
    `UPDATE contractors SET rating = $1, review_count = $2, updated_at = now() WHERE id = $3`,
    [stats[0].avg, stats[0].count, contractorId]
  );
}

export async function hideReview(reviewId: string): Promise<Review | null> {
  const rows = await query<ReviewRow>(
    `UPDATE contractor_reviews SET visible = false WHERE id = $1 RETURNING *`,
    [reviewId]
  );
  if (rows.length === 0) return null;
  await recalcRating(rows[0].contractor_id);
  return mapReview(rows[0]);
}
