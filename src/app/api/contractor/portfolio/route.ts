import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPortfolio, addPortfolioPhoto, deletePortfolioPhoto, updatePortfolioPhoto } from "@/lib/contractor-portfolio-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const items = await getPortfolio(payload.sub);
  return NextResponse.json({ ok: true, data: items });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const item = await addPortfolioPhoto(payload.sub, {
    jobId: body.jobId,
    caption: body.caption,
    category: body.category,
    sortOrder: body.sortOrder,
  });
  return NextResponse.json({ ok: true, data: item });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const ok = await deletePortfolioPhoto(id, payload.sub);
  if (!ok) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const updated = await updatePortfolioPhoto(body.id, payload.sub, {
    caption: body.caption,
    category: body.category,
    sortOrder: body.sortOrder,
  });
  if (!updated) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}
