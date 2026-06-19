import { query } from "./db";

export async function sendSms(toPhone: string, message: string): Promise<boolean> {
  const provider = process.env.SMS_PROVIDER || "log";

  if (provider === "twilio" && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    try {
      // @ts-ignore - optional dependency
      const { default: twilio } = await import("twilio");
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const msg = await client.messages.create({
        from: process.env.TWILIO_FROM,
        to: toPhone,
        body: message,
      });
      await logSms(toPhone, message, "sent", msg.sid, "");
      return true;
    } catch (e) {
      await logSms(toPhone, message, "failed", "", String(e));
      return false;
    }
  }

  console.log(`[SMS] To: ${toPhone}, Body: ${message}`);
  await logSms(toPhone, message, "logged", "", "no-provider");
  return true;
}

async function logSms(toPhone: string, message: string, status: string, providerId: string, error: string): Promise<void> {
  await query(
    `INSERT INTO sms_log (to_phone, message, status, provider_id, error) VALUES ($1, $2, $3, $4, $5)`,
    [toPhone, message, status, providerId, error]
  );
}
