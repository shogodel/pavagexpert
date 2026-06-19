import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { hardDeleteContractor } from "@/lib/auth-store";
import { transaction } from "@/lib/db";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });
  return null;
}

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing contractor id" }, { status: 400 });
    }

    await transaction(async (q) => {
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
    });

    const deleted = await hardDeleteContractor(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Contractor not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Purge contractor error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
