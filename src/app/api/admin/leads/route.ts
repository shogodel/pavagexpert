import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/admin-store";

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const auth = await checkAuth(req);
  if (auth) return auth;
  return NextResponse.json({ ok: true, data: getUsers() });
}

export async function POST(req: NextRequest) {
  const auth = await checkAuth(req);
  if (auth) return auth;

  const body = await req.json();
  if (!body.name || !body.email) {
    return NextResponse.json({ ok: false, error: "Name and email required" }, { status: 400 });
  }

  const user = addUser(body);
  return NextResponse.json({ ok: true, data: user });
}

export async function PATCH(req: NextRequest) {
  const auth = await checkAuth(req);
  if (auth) return auth;

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
  }

  const user = updateUser(body.id, body);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: user });
}

export async function DELETE(req: NextRequest) {
  const auth = await checkAuth(req);
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
  }

  const deleted = deleteUser(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
