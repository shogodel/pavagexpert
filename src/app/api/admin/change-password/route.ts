import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { changeAdminPassword, verifyAdmin } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    const valid = await verifyAdmin(payload.sub, currentPassword);
    if (!valid) return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 403 });
    await changeAdminPassword(newPassword);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
