import fs from "fs";
import path from "path";
import { query, transaction } from "./db";

export type JobStatus = "new" | "in_progress" | "completed";

export interface Job {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  budget: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  photos: string[];
}

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");

export function getPhotoPath(jobId: string, filename: string): string {
  return path.join(dataDir, "photos", jobId, filename);
}

export function ensureJobPhotoDir(jobId: string): string {
  const dir = path.join(dataDir, "photos", jobId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

interface JobRow {
  id: string;
  client_id: string;
  title: string;
  description: string;
  postal_code: string;
  budget: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  email: string;
  phone: string;
}

interface PhotoRow {
  filename: string;
}

function mapJob(row: JobRow, photos: string[] = []): Job {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    postalCode: row.postal_code,
    budget: row.budget,
    description: row.description,
    status: row.status as JobStatus,
    createdAt: row.created_at.toISOString(),
    photos,
  };
}

export async function getJobs(): Promise<Job[]> {
  const rows = await query<JobRow>(
    `SELECT j.*, c.name, c.email, c.phone
     FROM jobs j
     JOIN clients c ON c.id = j.client_id
     ORDER BY j.created_at DESC`
  );
  const jobs: Job[] = [];
  for (const row of rows) {
    const photos = await query<PhotoRow>(
      "SELECT filename FROM job_photos WHERE job_id = $1 ORDER BY created_at",
      [row.id]
    );
    jobs.push(mapJob(row, photos.map((p) => p.filename)));
  }
  return jobs;
}

export async function getJobById(id: string): Promise<Job | null> {
  const rows = await query<JobRow>(
    `SELECT j.*, c.name, c.email, c.phone
     FROM jobs j
     JOIN clients c ON c.id = j.client_id
     WHERE j.id = $1`,
    [id]
  );
  if (rows.length === 0) return null;
  const photos = await query<PhotoRow>(
    "SELECT filename FROM job_photos WHERE job_id = $1 ORDER BY created_at",
    [id]
  );
  return mapJob(rows[0], photos.map((p) => p.filename));
}

export async function addJob(
  input: { name: string; email: string; phone: string; postalCode: string; budget: string; description: string } & { photos?: string[] }
): Promise<Job> {
  return transaction(async (q) => {
    const clientRows = await q<{ id: string }>(
      "INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
      [input.name, input.email, input.phone]
    );
    const clientId = clientRows[0].id;

    const jobRows = await q<JobRow>(
      `INSERT INTO jobs (client_id, title, description, postal_code, budget, status)
       VALUES ($1, $2, $3, $4, $5, 'new')
       RETURNING *`,
      [clientId, `Projet de ${input.name}`, input.description, input.postalCode, input.budget]
    );
    const job = jobRows[0];

    const photoFiles = input.photos || [];
    for (const filename of photoFiles) {
      await q(
        "INSERT INTO job_photos (job_id, filename) VALUES ($1, $2)",
        [job.id, filename]
      );
    }

    return mapJob(job, photoFiles);
  });
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "UPDATE jobs SET status = $1, updated_at = now() WHERE id = $2 RETURNING id",
    [status, id]
  );
  return rows.length > 0;
}

export async function updateJob(
  id: string,
  input: Partial<{ title: string; description: string; postalCode: string; budget: string; status: string }>
): Promise<boolean> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (input.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(input.title); }
  if (input.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(input.description); }
  if (input.postalCode !== undefined) { setClauses.push(`postal_code = $${idx++}`); values.push(input.postalCode); }
  if (input.budget !== undefined) { setClauses.push(`budget = $${idx++}`); values.push(input.budget); }
  if (input.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(input.status); }
  if (setClauses.length === 0) return false;
  setClauses.push("updated_at = now()");
  values.push(id);
  const rows = await query<{ id: string }>(
    `UPDATE jobs SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING id`,
    values
  );
  return rows.length > 0;
}

export async function deleteJob(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM jobs WHERE id = $1 RETURNING id",
    [id]
  );
  return rows.length > 0;
}
