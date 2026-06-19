import webpush from "web-push";
import fs from "fs";
import path from "path";
import { query } from "./db";

function loadVapidKeys(): { publicKey: string; privateKey: string } {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (pub && priv) return { publicKey: pub, privateKey: priv };

  try {
    const p = path.join(process.env.DATA_DIR || "/data", "vapid-keys.json");
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
  } catch {
    // ignore
  }

  return { publicKey: "", privateKey: "" };
}

const vapid = loadVapidKeys();

if (vapid.publicKey && vapid.privateKey) {
  webpush.setVapidDetails(
    "mailto:pavagexpertmtl@gmail.com",
    vapid.publicKey,
    vapid.privateKey
  );
}

interface PushPayload {
  title: string;
  body: string;
  url: string;
  phone?: string;
}

export async function sendPushToAll(payload: PushPayload) {
  const subs = await query<{ endpoint: string; p256dh: string; auth: string }>(
    `SELECT ps.endpoint, ps.p256dh, ps.auth
     FROM push_subscriptions ps
     JOIN contractors c ON c.id = ps.contractor_id
     WHERE c.status = 'active' AND ps.paused = false`
  );
  if (subs.length === 0) return;

  for (const sub of subs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }, JSON.stringify(payload));
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        await query("DELETE FROM push_subscriptions WHERE endpoint = $1", [sub.endpoint]);
      }
    }
  }
}
