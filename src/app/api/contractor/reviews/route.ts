import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { addReview, respondToReview, getReviewsByContractor } from "@/lib/contractor-review-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const reviews = await getReviewsByContractor(payload.sub, false);
  return NextResponse.json({ ok: true, data: reviews });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.reviewId || !body.response) {
    return NextResponse.json({ ok: false, error: "Missing reviewId or response" }, { status: 400 });
  }
  const review = await respondToReview(body.reviewId, payload.sub, body.response);
  if (!review) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, data: review });
}
