import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getWallet, ensureWallet, getTransactions, getLeadPricing } from "@/lib/wallet-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureWallet(payload.sub);
  const wallet = await getWallet(payload.sub);
  const transactions = await getTransactions(payload.sub);
  const pricing = await getLeadPricing();

  return NextResponse.json({ ok: true, wallet, transactions, pricing });
}
