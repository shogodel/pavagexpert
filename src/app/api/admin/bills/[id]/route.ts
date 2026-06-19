import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { updateBillStatus, getBills } from "@/lib/billing-store";
import { sendEmail } from "@/lib/email";
import { paymentReceived, paymentOverdue } from "@/lib/email-templates";
import { query } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const status = body.status;
  if (!status || !["pending", "sent", "paid", "overdue"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const bill = await updateBillStatus(id, status);
  if (!bill) return NextResponse.json({ ok: false }, { status: 404 });

  try {
    const contractor = await query<{ company: string; email: string }>(
      "SELECT company, email FROM contractors WHERE id = $1",
      [bill.contractorId]
    );
    if (contractor.length > 0 && contractor[0].email) {
      if (status === "paid") {
        await sendEmail({
          to: contractor[0].email,
          subject: "Paiement reçu — Pavagexpert",
          html: paymentReceived(contractor[0].company, bill.totalCents),
        });
      } else if (status === "overdue") {
        await sendEmail({
          to: contractor[0].email,
          subject: "Paiement en retard — Pavagexpert",
          html: paymentOverdue(contractor[0].company, bill.totalCents),
        });
      }
    }
  } catch { /* billing notification emails are best-effort */ }

  return NextResponse.json({ ok: true, data: bill });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const bills = await getBills();
  return NextResponse.json({ ok: true, data: bills });
}
