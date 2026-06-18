import { query } from "./db";

interface SocialRow {
  id: string;
  contractor_id: string;
  platform: string;
  url: string;
  label: string;
  created_at: Date;
}

export interface SocialProfile {
  id: string;
  contractorId: string;
  platform: string;
  url: string;
  label: string;
  createdAt: string;
}

const PLATFORMS = [
  "google_business", "facebook", "instagram", "linkedin",
  "youtube", "tiktok", "twitter", "houzz", "homestars", "pinterest",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  google_business: "Google Business Profile",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  twitter: "X (Twitter)",
  houzz: "Houzz",
  homestars: "HomeStars",
  pinterest: "Pinterest",
};

export const PLATFORM_ICONS: Record<Platform, string> = {
  google_business: "building-storefront",
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  youtube: "youtube",
  tiktok: "music-note",
  twitter: "x",
  houzz: "house",
  homestars: "star",
  pinterest: "pinterest",
};

function mapSocial(row: SocialRow): SocialProfile {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    platform: row.platform,
    url: row.url,
    label: row.label,
    createdAt: row.created_at.toISOString(),
  };
}

export async function upsertSocialProfile(
  contractorId: string,
  data: { platform: string; url: string; label?: string }
): Promise<SocialProfile> {
  const rows = await query<SocialRow>(
    `INSERT INTO contractor_social_profiles (contractor_id, platform, url, label)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (contractor_id, platform)
     DO UPDATE SET url = EXCLUDED.url, label = COALESCE(EXCLUDED.label, contractor_social_profiles.label)
     RETURNING *`,
    [contractorId, data.platform, data.url, data.label || ""]
  );
  return mapSocial(rows[0]);
}

export async function deleteSocialProfile(id: string, contractorId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM contractor_social_profiles WHERE id = $1 AND contractor_id = $2 RETURNING id",
    [id, contractorId]
  );
  return rows.length > 0;
}

export async function getSocialProfiles(contractorId: string): Promise<SocialProfile[]> {
  const rows = await query<SocialRow>(
    "SELECT * FROM contractor_social_profiles WHERE contractor_id = $1 ORDER BY platform",
    [contractorId]
  );
  return rows.map(mapSocial);
}

export async function getSocialProfilesByContractor(contractorId: string): Promise<SocialProfile[]> {
  return getSocialProfiles(contractorId);
}

export function buildSameAsUrls(profiles: SocialProfile[]): string[] {
  return profiles.filter((p) => p.url).map((p) => p.url);
}
