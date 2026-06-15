import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const adminToken = req.cookies.get("admin_token")?.value;
  const contractorToken = req.cookies.get("contractor_token")?.value;

  if (adminToken) {
    const payload = await verifyToken(adminToken);
    if (payload?.role === "admin") {
      return NextResponse.json({ authenticated: true, role: "admin" });
    }
  }

  if (contractorToken) {
    const payload = await verifyToken(contractorToken);
    if (payload?.role === "contractor") {
      return NextResponse.json({ authenticated: true, role: "contractor" });
    }
  }

  return NextResponse.json({ authenticated: false });
}
