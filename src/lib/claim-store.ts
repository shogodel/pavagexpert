import { query, transaction } from "./db";

interface ClaimRow {
  id: string;
  job_id: string;
  contractor_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  assigned_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
}

export interface Claim {
  id: string;
  jobId: string;
  contractorId: string;
  message: string;
  status: ClaimRow["status"];
  assignedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

function mapClaim(row: ClaimRow): Claim {
  return {
    id: row.id,
    jobId: row.job_id,
    contractorId: row.contractor_id,
    message: row.message,
    status: row.status,
    assignedAt: row.assigned_at?.toISOString() ?? null,
    completedAt: row.completed_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function expressInterest(
  jobId: string,
  contractorId: string,
  message: string
): Promise<Claim> {
  const existing = await query<ClaimRow>(
    "SELECT * FROM claims WHERE job_id = $1 AND contractor_id = $2",
    [jobId, contractorId]
  );
  if (existing.length > 0) {
    throw new Error("ALREADY_EXISTS");
  }
  const rows = await query<ClaimRow>(
    `INSERT INTO claims (job_id, contractor_id, message)
     VALUES ($1, $2, $3) RETURNING *`,
    [jobId, contractorId, message]
  );
  return mapClaim(rows[0]);
}

export async function acceptClaim(claimId: string): Promise<Claim | null> {
  const rows = await query<ClaimRow>(
    `UPDATE claims SET status = 'accepted', assigned_at = now(), updated_at = now()
     WHERE id = $1 AND status = 'pending' RETURNING *`,
    [claimId]
  );
  if (rows.length === 0) return null;
  return mapClaim(rows[0]);
}

export async function completeClaim(claimId: string): Promise<Claim | null> {
  const rows = await query<ClaimRow>(
    `UPDATE claims SET status = 'completed', completed_at = now(), updated_at = now()
     WHERE id = $1 AND status = 'accepted' RETURNING *`,
    [claimId]
  );
  if (rows.length === 0) return null;
  return mapClaim(rows[0]);
}

export async function getClaimsByJob(jobId: string): Promise<Claim[]> {
  const rows = await query<ClaimRow>(
    "SELECT * FROM claims WHERE job_id = $1 ORDER BY created_at DESC",
    [jobId]
  );
  return rows.map(mapClaim);
}

export async function getClaimsByContractor(contractorId: string): Promise<Claim[]> {
  const rows = await query<ClaimRow>(
    "SELECT * FROM claims WHERE contractor_id = $1 ORDER BY created_at DESC",
    [contractorId]
  );
  return rows.map(mapClaim);
}

export async function getAcceptedClaimsInRange(
  contractorId: string,
  from: Date,
  to: Date
): Promise<Claim[]> {
  const rows = await query<ClaimRow>(
    `SELECT * FROM claims
     WHERE contractor_id = $1
       AND status IN ('accepted', 'completed')
       AND assigned_at >= $2
       AND assigned_at < $3
     ORDER BY assigned_at`,
    [contractorId, from, to]
  );
  return rows.map(mapClaim);
}
