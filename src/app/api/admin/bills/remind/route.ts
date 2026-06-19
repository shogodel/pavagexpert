import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { updateBillStatus } from "@/lib/billing-store";
import { sendEmail } from "@/lib/email";
import { paymentOverdue } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const overdueBills = await query<{
    id: string; contractor_id: string; total_cents: number;
    company: string; email: string;
  }>(
    `SELECT b.id, b.contractor_id, b.total_cents, c.company, c.email
     FROM contractor_bills b
     JOIN contractors c ON c.id = b.contractor_id
     WHERE b.status = 'pending' AND b.created_at < now() - interval '30 days'`
  );

  const results: { billId: string; emailed: boolean }[] = [];
  for (const b of overdueBills) {
    await updateBillStatus(b.id, "overdue");
    if (b.email) {
      try {
        await sendEmail({
          to: b.email,
          subject: "Paiement en retard — Pavagexpert",
          html: paymentOverdue(b.company, b.total_cents),
        });
      } catch { /* best-effort */ }
    }
    results.push({ billId: b.id, emailed: !!b.email });
  }

  return NextResponse.json({ ok: true, data: results });
}
