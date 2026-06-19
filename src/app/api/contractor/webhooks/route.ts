import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook, getWebhookLogs } from "@/lib/webhook-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const webhooks = await getWebhooks(payload.sub);
  const webhookId = req.nextUrl.searchParams.get("logs");
  const logs = webhookId ? await getWebhookLogs(webhookId) : [];

  return NextResponse.json({ ok: true, webhooks, logs });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { url, events } = body;
    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "url and events required" }, { status: 400 });
    }

    const wh = await createWebhook({ contractorId: payload.sub, url, events });
    return NextResponse.json({ ok: true, webhook: wh });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, url, events, active } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Verify ownership
    const webhooks = await getWebhooks(payload.sub);
    if (!webhooks.find((w) => w.id === id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await updateWebhook(id, { url, events, active });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const webhooks = await getWebhooks(payload.sub);
    if (!webhooks.find((w) => w.id === id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteWebhook(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
