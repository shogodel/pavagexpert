import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getContractors, addContractor, updateContractor, deleteContractor, changeContractorPassword } from "@/lib/auth-store";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  return NextResponse.json({ ok: true, data: await getContractors() });
}

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const body = await req.json();
    if (!body.username || !body.password || !body.company || !body.phone) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }
    const contractor = await addContractor(body);
    return NextResponse.json({ ok: true, data: contractor });
  } catch (err) {
    console.error("Add contractor error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
    if (body.password) {
      const ok = await changeContractorPassword(body.id, body.password);
      if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...rest } = body;
    const updated = await updateContractor(body.id, rest);
    if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
  const deleted = await deleteContractor(id);
  if (!deleted) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
