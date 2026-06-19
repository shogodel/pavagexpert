import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query, transaction } from "@/lib/db";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });
  return null;
}

async function purgeById(id: string): Promise<boolean> {
  return transaction(async (q) => {
    await q("DELETE FROM contractor_bills WHERE contractor_id = $1", [id]);
    await q("DELETE FROM notifications WHERE contractor_id = $1", [id]);
    await q("DELETE FROM push_subscriptions WHERE contractor_id = $1", [id]);
    await q("DELETE FROM sessions WHERE contractor_id = $1", [id]);
    await q("DELETE FROM contractor_social_profiles WHERE contractor_id = $1", [id]);
    await q("DELETE FROM contractor_certifications WHERE contractor_id = $1", [id]);
    await q("DELETE FROM contractor_portfolio WHERE contractor_id = $1", [id]);
    await q("DELETE FROM contractor_reviews WHERE contractor_id = $1", [id]);
    await q("DELETE FROM claims WHERE contractor_id = $1", [id]);
    await q("DELETE FROM quotes WHERE contractor_id = $1", [id]);
    await q("DELETE FROM invoices WHERE contractor_id = $1", [id]);
    const rows = await q<{ id: string }>("DELETE FROM contractors WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  });
}

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const { id, company } = await req.json();
    if (!id && !company) {
      return NextResponse.json({ ok: false, error: "Missing contractor id or company name" }, { status: 400 });
    }

    let targetId = id;
    if (!targetId && company) {
      const rows = await query<{ id: string }>(
        "SELECT id FROM contractors WHERE LOWER(company) = LOWER($1) LIMIT 1",
        [company]
      );
      if (rows.length === 0) {
        return NextResponse.json({ ok: false, error: "No contractor found with that company name" }, { status: 404 });
      }
      targetId = rows[0].id;
    }

    const deleted = await purgeById(targetId!);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Contractor not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Purge contractor error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
