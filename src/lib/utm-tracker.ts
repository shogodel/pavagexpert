export interface LeadSource {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
}

const STORAGE_KEY = "pavagexpert_lead_source";

export function captureTracking(): void {
  if (typeof window === "undefined") return;
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (existing) return;
  const params = new URLSearchParams(window.location.search);
  const source: LeadSource = {};
  const utmSource = params.get("utm_source");
  if (utmSource) source.utm_source = utmSource;
  const utmMedium = params.get("utm_medium");
  if (utmMedium) source.utm_medium = utmMedium;
  const utmCampaign = params.get("utm_campaign");
  if (utmCampaign) source.utm_campaign = utmCampaign;
  const utmContent = params.get("utm_content");
  if (utmContent) source.utm_content = utmContent;
  const utmTerm = params.get("utm_term");
  if (utmTerm) source.utm_term = utmTerm;
  if (document.referrer) source.referrer = document.referrer;
  source.landing_page = window.location.pathname;
  if (Object.keys(source).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(source));
  }
}

export function getTrackingData(): LeadSource | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as LeadSource; } catch { return null; }
}

export function clearTracking(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
