import { query } from "./db";

export async function getLeadCountByIP(ipAddress: string, windowHours = 24): Promise<number> {
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM jobs WHERE ip_address = $1 AND created_at > now() - make_interval(hours => $2)`,
    [ipAddress, windowHours]
  );
  return parseInt(rows[0]?.c || "0", 10);
}

export async function getLeadCountByPhone(phone: string, windowDays = 30): Promise<number> {
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM jobs WHERE phone = $1 AND created_at > now() - make_interval(days => $2)`,
    [phone, windowDays]
  );
  return parseInt(rows[0]?.c || "0", 10);
}

export async function getPostalCodePrefix(postalCode: string): Promise<string> {
  return postalCode.replace(/\s/g, "").substring(0, 3).toUpperCase();
}

export async function flagIfSuspicious(jobId: string, ipAddress: string, phone: string): Promise<string[]> {
  const flags: string[] = [];

  const ipCount = await getLeadCountByIP(ipAddress);
  if (ipCount > 3) {
    flags.push("high_ip_volume");
  }

  if (phone && phone.length >= 7) {
    const phoneCount = await getLeadCountByPhone(phone);
    if (phoneCount > 1) {
      flags.push("phone_reuse");
    }
  }

  if (flags.length > 0) {
    await query(
      `UPDATE jobs SET flag_reason = CASE
        WHEN flag_reason IS NULL OR flag_reason = '' THEN $1
        ELSE flag_reason || ', ' || $1
      END WHERE id = $2`,
      [flags.join(", "), jobId]
    );
  }

  return flags;
}
