import { redirect } from "next/navigation";

export default async function ContractorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/contractor/dashboard`);
}
