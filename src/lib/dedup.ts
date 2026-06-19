import { query } from "./db";
import { isDisposableEmail } from "./disposable-domains";
import { checkContentSpam } from "./spam-patterns";
import dns from "dns/promises";

export interface DedupResult {
  isDuplicate: boolean;
  reason: string;
  existingId?: string;
}

export interface SpamResult {
  isSpam: boolean;
  reason: string;
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function normalizePostalCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, "").trim();
}

export function getNamePrefix(name: string): string {
  return name.toLowerCase().trim().slice(0, 3);
}

export function getPostalArea(code: string): string {
  return normalizePostalCode(code).slice(0, 3);
}

// --- Email dedup ---
export async function checkEmailDedup(
  email: string,
  windowDays = 30
): Promise<DedupResult> {
  const normalized = normalizeEmail(email);
  const rows = await query<{ id: string; created_at: Date }>(
    `SELECT j.id, j.created_at
     FROM jobs j
     JOIN clients c ON c.id = j.client_id
     WHERE LOWER(TRIM(c.email)) = $1
       AND j.created_at > now() - ($2 || ' days')::interval
     ORDER BY j.created_at DESC LIMIT 1`,
    [normalized, String(windowDays)]
  );
  if (rows.length > 0) {
    return {
      isDuplicate: true,
      reason: `email_duplicate:${windowDays}d`,
      existingId: rows[0].id,
    };
  }
  return { isDuplicate: false, reason: "" };
}

// --- Phone dedup ---
export async function checkPhoneDedup(
  phone: string,
  windowDays = 30
): Promise<DedupResult> {
  const normalized = normalizePhone(phone);
  if (!normalized || normalized.length < 6) return { isDuplicate: false, reason: "" };
  const rows = await query<{ id: string; created_at: Date }>(
    `SELECT j.id, j.created_at
     FROM jobs j
     JOIN clients c ON c.id = j.client_id
     WHERE REGEXP_REPLACE(c.phone, '\D', '', 'g') = $1
       AND j.created_at > now() - ($2 || ' days')::interval
     ORDER BY j.created_at DESC LIMIT 1`,
    [normalized, String(windowDays)]
  );
  if (rows.length > 0) {
    return {
      isDuplicate: true,
      reason: `phone_duplicate:${windowDays}d`,
      existingId: rows[0].id,
    };
  }
  return { isDuplicate: false, reason: "" };
}

// --- Postal code + name fuzzy match ---
export async function checkPostalCodeNameMatch(
  postalCode: string,
  name: string,
  windowDays = 14
): Promise<DedupResult> {
  const area = getPostalArea(postalCode);
  if (!area) return { isDuplicate: false, reason: "" };
  const rows = await query<{ id: string; similarity: number }>(
    `SELECT j.id, similarity(c.name, $1) AS sim
     FROM jobs j
     JOIN clients c ON c.id = j.client_id
     WHERE LEFT(REPLACE(UPPER(j.postal_code), ' ', ''), 3) = $2
       AND similarity(c.name, $3) > 0.3
       AND j.created_at > now() - ($4 || ' days')::interval
     ORDER BY sim DESC LIMIT 1`,
    [name, area, name, String(windowDays)]
  );
  if (rows.length > 0) {
    return {
      isDuplicate: true,
      reason: `name_postal_match:${rows[0].similarity.toFixed(2)}`,
      existingId: rows[0].id,
    };
  }
  return { isDuplicate: false, reason: "" };
}

// --- Address prefix (postal area + name prefix) ---
export async function checkAddressPrefix(
  postalCode: string,
  name: string,
  windowDays = 14
): Promise<DedupResult> {
  const area = getPostalArea(postalCode);
  const prefix = getNamePrefix(name);
  if (!area || !prefix) return { isDuplicate: false, reason: "" };
  const rows = await query<{ id: string }>(
    `SELECT j.id
     FROM jobs j
     JOIN clients c ON c.id = j.client_id
     WHERE LEFT(REPLACE(UPPER(j.postal_code), ' ', ''), 3) = $1
       AND LOWER(LEFT(c.name, 3)) = $2
       AND j.created_at > now() - ($3 || ' days')::interval
     ORDER BY j.created_at DESC LIMIT 1`,
    [area, prefix, String(windowDays)]
  );
  if (rows.length > 0) {
    return {
      isDuplicate: true,
      reason: "address_prefix_match",
      existingId: rows[0].id,
    };
  }
  return { isDuplicate: false, reason: "" };
}

// --- IP + time window ---
export async function checkIPWindow(
  ip: string,
  windowHours = 24
): Promise<DedupResult> {
  if (!ip || ip === "unknown") return { isDuplicate: false, reason: "" };
  const rows = await query<{ id: string }>(
    `SELECT id FROM jobs
     WHERE ip_address = $1
       AND created_at > now() - ($2 || ' hours')::interval
     ORDER BY created_at DESC LIMIT 1`,
    [ip, String(windowHours)]
  );
  if (rows.length > 0) {
    return {
      isDuplicate: true,
      reason: `ip_window:${windowHours}h`,
      existingId: rows[0].id,
    };
  }
  return { isDuplicate: false, reason: "" };
}

// --- Browser fingerprint ---
export async function checkBrowserFingerprint(
  fingerprint: string,
  email: string,
  windowDays = 30
): Promise<DedupResult> {
  if (!fingerprint) return { isDuplicate: false, reason: "" };
  const normalizedEmail = normalizeEmail(email);
  const rows = await query<{ id: string; email: string }>(
    `SELECT j.id, c.email
     FROM jobs j
     JOIN clients c ON c.id = j.client_id
     WHERE j.browser_fingerprint = $1
       AND LOWER(TRIM(c.email)) != $2
       AND j.created_at > now() - ($3 || ' days')::interval
     ORDER BY j.created_at DESC LIMIT 1`,
    [fingerprint, normalizedEmail, String(windowDays)]
  );
  if (rows.length > 0) {
    return {
      isDuplicate: true,
      reason: "browser_fingerprint_match",
      existingId: rows[0].id,
    };
  }
  return { isDuplicate: false, reason: "" };
}

// --- Email domain rate limit ---
const domainRateStore = new Map<string, number[]>();
const DOMAIN_WINDOW_MS = 60 * 60 * 1000;
const DOMAIN_MAX_REQUESTS = 3;

export function checkEmailDomainRate(email: string): {
  allowed: boolean;
  remaining: number;
} {
  const domain = email.split("@").pop()?.toLowerCase();
  if (!domain) return { allowed: true, remaining: 99 };
  const now = Date.now();
  const windowStart = now - DOMAIN_WINDOW_MS;
  let timestamps = domainRateStore.get(domain) || [];
  timestamps = timestamps.filter((t) => t > windowStart);
  if (timestamps.length >= DOMAIN_MAX_REQUESTS) {
    domainRateStore.set(domain, timestamps);
    return { allowed: false, remaining: 0 };
  }
  timestamps.push(now);
  domainRateStore.set(domain, timestamps);
  return {
    allowed: true,
    remaining: DOMAIN_MAX_REQUESTS - timestamps.length,
  };
}

// Cleanup domain rate store every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - DOMAIN_WINDOW_MS;
  for (const [domain, timestamps] of domainRateStore) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) domainRateStore.delete(domain);
    else domainRateStore.set(domain, filtered);
  }
}, 10 * 60 * 1000);

// --- Email validation ---
export async function validateEmail(email: string): Promise<SpamResult> {
  const domain = email.split("@").pop()?.toLowerCase();
  if (!domain) return { isSpam: true, reason: "invalid_email" };

  if (isDisposableEmail(email)) {
    return { isSpam: true, reason: "disposable_email" };
  }

  try {
    const mxEntries = await dns.resolveMx(domain);
    if (!mxEntries || mxEntries.length === 0) {
      return { isSpam: true, reason: "no_mx_record" };
    }
  } catch {
    return { isSpam: true, reason: "mx_lookup_failed" };
  }

  return { isSpam: false, reason: "" };
}

// --- Content analysis ---
export function checkContent(input: string): SpamResult {
  return checkContentSpam(input);
}

// --- Aggregate dedup check ---
export interface DedupMeta {
  email: string;
  phone: string;
  name: string;
  postalCode: string;
  ip: string;
  browserFingerprint: string;
}

export interface DedupReport {
  isDuplicate: boolean;
  flagReasons: string[];
  isSpam: boolean;
  spamReasons: string[];
  emailAllowed: boolean;
  emailDomainRemaining: number;
}

export async function runDedupChecks(meta: DedupMeta): Promise<DedupReport> {
  const report: DedupReport = {
    isDuplicate: false,
    flagReasons: [],
    isSpam: false,
    spamReasons: [],
    emailAllowed: true,
    emailDomainRemaining: 99,
  };

  const [emailDedup, phoneDedup, postalNameMatch, addressPrefix, ipWindow, fingerprintCheck] =
    await Promise.all([
      checkEmailDedup(meta.email),
      checkPhoneDedup(meta.phone),
      checkPostalCodeNameMatch(meta.postalCode, meta.name),
      checkAddressPrefix(meta.postalCode, meta.name),
      checkIPWindow(meta.ip),
      checkBrowserFingerprint(meta.browserFingerprint, meta.email),
    ]);

  if (emailDedup.isDuplicate) {
    report.isDuplicate = true;
    report.flagReasons.push(emailDedup.reason);
  }
  if (phoneDedup.isDuplicate) {
    report.isDuplicate = true;
    report.flagReasons.push(phoneDedup.reason);
  }
  if (postalNameMatch.isDuplicate) {
    report.isDuplicate = true;
    report.flagReasons.push(postalNameMatch.reason);
  }
  if (addressPrefix.isDuplicate) {
    report.isDuplicate = true;
    report.flagReasons.push(addressPrefix.reason);
  }
  if (ipWindow.isDuplicate) {
    report.isDuplicate = true;
    report.flagReasons.push(ipWindow.reason);
  }
  if (fingerprintCheck.isDuplicate) {
    report.isDuplicate = true;
    report.flagReasons.push(fingerprintCheck.reason);
  }

  const domainRate = checkEmailDomainRate(meta.email);
  report.emailAllowed = domainRate.allowed;
  report.emailDomainRemaining = domainRate.remaining;

  return report;
}
