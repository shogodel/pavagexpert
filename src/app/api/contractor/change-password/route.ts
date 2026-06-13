import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { changeContractorPassword, verifyContractorPasswordById } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    if (!verifyContractorPasswordById(payload.sub, currentPassword)) {
      return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 403 });
    }
    const ok = await changeContractorPassword(payload.sub, newPassword);
    if (!ok) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
