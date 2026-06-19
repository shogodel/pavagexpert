import { logAudit } from "./security-store";
import type { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export async function auditAdminAction(
  req: NextRequest,
  action: string,
  entity = "",
  entityId = "",
  details?: Record<string, unknown>
): Promise<void> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return;
  const payload = await verifyToken(token);
  if (!payload) return;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  await logAudit({
    adminId: payload.sub,
    action,
    entity,
    entityId,
    details,
    ipAddress: ip,
  });
}
