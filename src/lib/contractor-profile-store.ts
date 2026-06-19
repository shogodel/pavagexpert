import { query } from "./db";

interface ContractorRow {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  created_at: Date;
  rbq_license: string;
  years_in_business: number;
  service_areas: string[];
  bio: string;
  photo_url: string;
  verified: boolean;
  verified_at: Date | null;
  insurance_info: string;
  warranty_info: string;
  availability_status: string;
  rating: string;
  review_count: number;
  response_time_hours: number | null;
  profile_completion_pct: number;
  terms_accepted_at: Date | null;
  terms_version: string;
}

export interface ContractorProfile {
  id: string;
  username: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  rbqLicense: string;
  yearsInBusiness: number;
  serviceAreas: string[];
  bio: string;
  photoUrl: string;
  verified: boolean;
  verifiedAt: string | null;
  insuranceInfo: string;
  warrantyInfo: string;
  availabilityStatus: string;
  rating: number;
  reviewCount: number;
  responseTimeHours: number | null;
  profileCompletionPct: number;
  termsVersion: string;
  termsAcceptedAt: string | null;
}

function mapProfile(row: ContractorRow): ContractorProfile {
  return {
    id: row.id,
    username: row.username,
    company: row.company,
    phone: row.phone,
    email: row.email,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    rbqLicense: row.rbq_license || "",
    yearsInBusiness: row.years_in_business || 0,
    serviceAreas: row.service_areas || [],
    bio: row.bio || "",
    photoUrl: row.photo_url || "",
    verified: row.verified || false,
    verifiedAt: row.verified_at?.toISOString() ?? null,
    insuranceInfo: row.insurance_info || "",
    warrantyInfo: row.warranty_info || "",
    availabilityStatus: row.availability_status || "available",
    rating: parseFloat(row.rating) || 0,
    reviewCount: row.review_count || 0,
    responseTimeHours: row.response_time_hours ?? null,
    profileCompletionPct: row.profile_completion_pct || 0,
    termsVersion: row.terms_version || "",
    termsAcceptedAt: row.terms_accepted_at?.toISOString() ?? null,
  };
}

function computeCompletion(row: Partial<ContractorRow>): number {
  const fields = [
    row.company, row.phone, row.email, row.bio,
    row.rbq_license, row.photo_url, row.insurance_info, row.warranty_info,
  ];
  const filled = fields.filter(Boolean).length;
  const areaBonus = (row.service_areas?.length ?? 0) > 0 ? 1 : 0;
  const socialCheck = 0; // computed externally
  return Math.min(100, Math.round(((filled + areaBonus) / 9) * 100));
}

export async function getContractorProfile(id: string): Promise<ContractorProfile | null> {
  const rows = await query<ContractorRow>(
    `SELECT * FROM contractors WHERE id = $1`,
    [id]
  );
  if (rows.length === 0) return null;
  return mapProfile(rows[0]);
}

export async function updateContractorProfile(
  id: string,
  data: Partial<{
    company: string; phone: string; email: string;
    rbqLicense: string; yearsInBusiness: number; serviceAreas: string[];
    bio: string; photoUrl: string;
    insuranceInfo: string; warrantyInfo: string;
    availabilityStatus: string;
  }>
): Promise<ContractorProfile | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const map: Record<string, unknown> = {};
  if (data.company !== undefined) map["company"] = data.company;
  if (data.phone !== undefined) map["phone"] = data.phone;
  if (data.email !== undefined) map["email"] = data.email;
  if (data.rbqLicense !== undefined) map["rbq_license"] = data.rbqLicense;
  if (data.yearsInBusiness !== undefined) map["years_in_business"] = data.yearsInBusiness;
  if (data.serviceAreas !== undefined) map["service_areas"] = data.serviceAreas;
  if (data.bio !== undefined) map["bio"] = data.bio;
  if (data.photoUrl !== undefined) map["photo_url"] = data.photoUrl;
  if (data.insuranceInfo !== undefined) map["insurance_info"] = data.insuranceInfo;
  if (data.warrantyInfo !== undefined) map["warranty_info"] = data.warrantyInfo;
  if (data.availabilityStatus !== undefined) map["availability_status"] = data.availabilityStatus;

  for (const [col, val] of Object.entries(map)) {
    setClauses.push(`${col} = $${idx++}`);
    values.push(val);
  }
  if (setClauses.length === 0) return getContractorProfile(id);

  const checkRow = await query<ContractorRow>("SELECT * FROM contractors WHERE id = $1", [id]);
  if (checkRow.length === 0) return null;
  const current = checkRow[0];
  const merged = { ...current, ...map };
  const pct = computeCompletion(merged as ContractorRow);
  setClauses.push(`profile_completion_pct = $${idx++}`);
  values.push(pct);

  setClauses.push("updated_at = now()");
  values.push(id);

  const rows = await query<ContractorRow>(
    `UPDATE contractors SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;
  return mapProfile(rows[0]);
}

export async function verifyContractor(contractorId: string): Promise<ContractorProfile | null> {
  const rows = await query<ContractorRow>(
    `UPDATE contractors SET verified = true, verified_at = now(), updated_at = now()
     WHERE id = $1 RETURNING *`,
    [contractorId]
  );
  if (rows.length === 0) return null;
  return mapProfile(rows[0]);
}

export async function unverifyContractor(contractorId: string): Promise<ContractorProfile | null> {
  const rows = await query<ContractorRow>(
    `UPDATE contractors SET verified = false, verified_at = NULL, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [contractorId]
  );
  if (rows.length === 0) return null;
  return mapProfile(rows[0]);
}

export async function getPublicContractors(): Promise<(ContractorProfile & { portfolioCount: number })[]> {
  const rows = await query<ContractorRow>(
    `SELECT c.*, (SELECT COUNT(*) FROM contractor_portfolio WHERE contractor_id = c.id) as portfolio_count
     FROM contractors c
     WHERE c.status = 'active'
     ORDER BY c.rating DESC, c.review_count DESC`
  );
  return rows.map((r) => ({
    ...mapProfile(r),
    portfolioCount: parseInt((r as unknown as Record<string, unknown>).portfolio_count as string) || 0,
  }));
}
