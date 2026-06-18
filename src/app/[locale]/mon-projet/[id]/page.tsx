import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getJobById } from "@/lib/job-store";
import ClientProjectView from "./client-view";
import ResendLink from "./resend-link";

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("client_token")?.value;
  let job = null;
  let authenticated = false;

  if (token) {
    const payload = await verifyToken(token);
    if (payload?.role === "client" && payload.sub === id) {
      authenticated = true;
      job = await getJobById(id);
    }
  }

  if (authenticated && job) {
    return <ClientProjectView job={job} locale={locale} />;
  }

  return <ResendLink jobId={id} locale={locale} />;
}
