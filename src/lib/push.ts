import webpush from "web-push";
import { query } from "./db";

webpush.setVapidDetails(
  "mailto:pavagexpertmtl@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export async function sendPushToAll(payload: PushPayload) {
  const subs = await query<{ endpoint: string; p256dh: string; auth: string }>(
    "SELECT endpoint, p256dh, auth FROM push_subscriptions"
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
