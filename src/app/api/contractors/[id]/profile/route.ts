import { NextRequest, NextResponse } from "next/server";
import { getContractorProfile } from "@/lib/contractor-profile-store";
import { getPortfolio } from "@/lib/contractor-portfolio-store";
import { getReviewsByContractor } from "@/lib/contractor-review-store";
import { getSocialProfiles, buildSameAsUrls } from "@/lib/contractor-social-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await getContractorProfile(id);
  if (!profile || profile.status !== "active") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const [portfolio, reviews, socials] = await Promise.all([
    getPortfolio(id),
    getReviewsByContractor(id, true),
    getSocialProfiles(id),
  ]);
  return NextResponse.json({
    ok: true,
    data: {
      ...profile,
      portfolio,
      reviews,
      socials,
      sameAs: buildSameAsUrls(socials),
    },
  });
}
