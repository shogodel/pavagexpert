import { query } from "./db";
import { getAcceptedClaimsInRange } from "./claim-store";

const MONTHLY_FEE_CENTS = 7500; // $75
const JOB_FEE_CENTS = 10000; // $100

interface ContractorBillRow {
  id: string;
  contractor_id: string;
  period_start: string;
  period_end: string;
  total_cents: number;
  status: "pending" | "sent" | "paid" | "overdue";
  paid_at: Date | null;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

interface BillItemRow {
  id: string;
  bill_id: string;
  item_type: "monthly_fee" | "job_fee";
  job_id: string | null;
  claim_id: string | null;
  amount_cents: number;
  description: string;
  created_at: Date;
}

export interface Bill {
  id: string;
  contractorId: string;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  status: string;
  paidAt: string | null;
  notes: string;
  createdAt: string;
  items: BillItem[];
}

export interface BillItem {
  id: string;
  itemType: string;
  jobId: string | null;
  claimId: string | null;
  amountCents: number;
  description: string;
}

function mapBill(row: ContractorBillRow, items: BillItem[] = []): Bill {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    totalCents: row.total_cents,
    status: row.status,
    paidAt: row.paid_at?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.created_at.toISOString(),
    items,
  };
}

function mapBillItem(row: BillItemRow): BillItem {
  return {
    id: row.id,
    itemType: row.item_type,
    jobId: row.job_id,
    claimId: row.claim_id,
    amountCents: row.amount_cents,
    description: row.description,
  };
}

export async function generateBill(contractorId: string, periodStart: Date, periodEnd: Date): Promise<Bill | null> {
  const existing = await query<ContractorBillRow>(
    `SELECT id FROM contractor_bills
     WHERE contractor_id = $1 AND period_start = $2 AND period_end = $3`,
    [contractorId, periodStart.toISOString().slice(0, 10), periodEnd.toISOString().slice(0, 10)]
  );
  if (existing.length > 0) return null;

  const claims = await getAcceptedClaimsInRange(contractorId, periodStart, periodEnd);
  const jobFeeCount = claims.length;
  const totalCents = MONTHLY_FEE_CENTS + jobFeeCount * JOB_FEE_CENTS;

  const billRows = await query<ContractorBillRow>(
    `INSERT INTO contractor_bills (contractor_id, period_start, period_end, total_cents)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [contractorId, periodStart.toISOString().slice(0, 10), periodEnd.toISOString().slice(0, 10), totalCents]
  );
  const bill = billRows[0];
  const items: BillItem[] = [];

  const monthlyItem = await query<BillItemRow>(
    `INSERT INTO bill_items (bill_id, item_type, amount_cents, description)
     VALUES ($1, 'monthly_fee', $2, 'Abonnement mensuel') RETURNING *`,
    [bill.id, MONTHLY_FEE_CENTS]
  );
  items.push(mapBillItem(monthlyItem[0]));

  for (const claim of claims) {
    const jobItem = await query<BillItemRow>(
      `INSERT INTO bill_items (bill_id, item_type, job_id, claim_id, amount_cents, description)
       VALUES ($1, 'job_fee', $2, $3, $4, 'Frais par mandat') RETURNING *`,
      [bill.id, claim.jobId, claim.id, JOB_FEE_CENTS]
    );
    items.push(mapBillItem(jobItem[0]));
  }

  return mapBill(bill, items);
}

export async function getBillsByContractor(contractorId: string): Promise<Bill[]> {
  const rows = await query<ContractorBillRow>(
    "SELECT * FROM contractor_bills WHERE contractor_id = $1 ORDER BY period_start DESC",
    [contractorId]
  );
  const bills: Bill[] = [];
  for (const row of rows) {
    const itemRows = await query<BillItemRow>(
      "SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY created_at",
      [row.id]
    );
    bills.push(mapBill(row, itemRows.map(mapBillItem)));
  }
  return bills;
}

export async function getBills(): Promise<Bill[]> {
  const rows = await query<ContractorBillRow>(
    "SELECT * FROM contractor_bills ORDER BY period_start DESC"
  );
  const bills: Bill[] = [];
  for (const row of rows) {
    const itemRows = await query<BillItemRow>(
      "SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY created_at",
      [row.id]
    );
    bills.push(mapBill(row, itemRows.map(mapBillItem)));
  }
  return bills;
}

export async function updateBillStatus(billId: string, status: string): Promise<Bill | null> {
  const setClauses: string[] = ["status = $1", "updated_at = now()"];
  const values: unknown[] = [status];

  if (status === "paid") {
    setClauses.push("paid_at = now()");
  }

  values.push(billId);
  const rows = await query<ContractorBillRow>(
    `UPDATE contractor_bills SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;

  const itemRows = await query<BillItemRow>(
    "SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY created_at",
    [billId]
  );
  return mapBill(rows[0], itemRows.map(mapBillItem));
}
