import { redirect } from "next/navigation";

export default async function ProviderInterventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/interventions/${id}`);
}
