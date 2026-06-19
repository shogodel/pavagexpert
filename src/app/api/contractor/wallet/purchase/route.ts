import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { ensureWallet, addCredits, getLeadPricing } from "@/lib/wallet-store";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pricingId } = await req.json();
    if (!pricingId) return NextResponse.json({ error: "pricingId required" }, { status: 400 });

    const pricing = await getLeadPricing();
    const plan = pricing.find((p) => p.id === pricingId);
    if (!plan) return NextResponse.json({ error: "Invalid pricing plan" }, { status: 400 });

    await ensureWallet(payload.sub);
    await addCredits(payload.sub, plan.credits, "purchase", `Achat de ${plan.credits} crédits (${plan.category})`);

    return NextResponse.json({ ok: true, credits: plan.credits });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
