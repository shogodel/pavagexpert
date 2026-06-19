import { query } from "./db";

export async function getWallet(contractorId: string): Promise<{ balance: number; updatedAt: string } | null> {
  const rows = await query<{ balance: number; updated_at: Date }>(
    `SELECT balance, updated_at FROM lead_wallet WHERE contractor_id = $1`,
    [contractorId]
  );
  if (rows.length === 0) return null;
  return { balance: rows[0].balance, updatedAt: rows[0].updated_at.toISOString() };
}

export async function ensureWallet(contractorId: string): Promise<void> {
  await query(
    `INSERT INTO lead_wallet (contractor_id, balance) VALUES ($1, 0) ON CONFLICT (contractor_id) DO NOTHING`,
    [contractorId]
  );
}

export async function spendCredit(contractorId: string, amount: number, description: string): Promise<boolean> {
  const rows = await query<{ balance: number }>(
    `UPDATE lead_wallet SET balance = balance - $1, updated_at = now() WHERE contractor_id = $2 AND balance >= $1 RETURNING balance`,
    [amount, contractorId]
  );
  if (rows.length === 0) return false;
  await query(
    `INSERT INTO lead_credit_transactions (contractor_id, amount, type, description) VALUES ($1, $2, 'spend', $3)`,
    [contractorId, -amount, description]
  );
  return true;
}

export async function addCredits(contractorId: string, amount: number, type: "purchase" | "refund" | "bonus", description: string, stripePaymentId = ""): Promise<void> {
  await query(
    `UPDATE lead_wallet SET balance = balance + $1, updated_at = now() WHERE contractor_id = $2`,
    [amount, contractorId]
  );
  await query(
    `INSERT INTO lead_credit_transactions (contractor_id, amount, type, description, stripe_payment_id) VALUES ($1, $2, $3, $4, $5)`,
    [contractorId, amount, type, description, stripePaymentId]
  );
}

export async function getTransactions(contractorId: string, limit = 50, offset = 0) {
  const rows = await query<{ id: string; amount: number; type: string; description: string; stripe_payment_id: string; created_at: Date }>(
    `SELECT id, amount, type, description, stripe_payment_id, created_at FROM lead_credit_transactions WHERE contractor_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [contractorId, limit, offset]
  );
  return rows.map((r) => ({ ...r, createdAt: r.created_at.toISOString() }));
}

export async function getLeadPricing() {
  const rows = await query<{ id: string; category: string; credits: number; price_cents: number; active: boolean }>(
    `SELECT id, category, credits, price_cents, active FROM lead_pricing WHERE active = true ORDER BY price_cents ASC`
  );
  return rows;
}

export async function createPricingPlan(category: string, credits: number, priceCents: number): Promise<void> {
  await query(
    `INSERT INTO lead_pricing (category, credits, price_cents) VALUES ($1, $2, $3) ON CONFLICT (category) DO UPDATE SET credits = $2, price_cents = $3, active = true`,
    [category, credits, priceCents]
  );
}
