import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { generateBill } from "@/lib/billing-store";
import { sendEmail } from "@/lib/email";
import { invoiceReady } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59);
  const fmt = (d: Date) => d.toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });

  const contractors = await query<{ id: string; company: string; email: string }>(
    "SELECT id, company, email FROM contractors WHERE status = 'active'"
  );

  const results: { contractorId: string; billId: string | null; error?: string }[] = [];
  for (const c of contractors) {
    try {
      const bill = await generateBill(c.id, periodStart, periodEnd);
      results.push({ contractorId: c.id, billId: bill?.id ?? null });
      if (bill && c.email) {
        await sendEmail({
          to: c.email,
          subject: "Votre facture mensuelle — Pavagexpert",
          html: invoiceReady(c.company, bill.totalCents, fmt(periodStart), fmt(periodEnd)),
        });
      }
    } catch (err) {
      results.push({ contractorId: c.id, billId: null, error: String(err) });
    }
  }

  return NextResponse.json({ ok: true, data: results });
}
