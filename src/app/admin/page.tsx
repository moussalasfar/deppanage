import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace-header";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  AdminAccessDeniedError,
  listPendingProviders,
} from "@/modules/admin/application/manage-provider-verifications";
import { OperationsConsole } from "@/modules/admin/components/operations-console";
import { supabaseProviderVerificationRepository } from "@/modules/admin/infrastructure/supabase-provider-verification-repository";

export const metadata = { title: "Operations" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect("/connexion?retour=/admin");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/connexion?retour=/admin");
  }

  let providers;
  try {
    providers = await listPendingProviders(
      user.id,
      supabaseProviderVerificationRepository,
    );
  } catch (error) {
    if (error instanceof AdminAccessDeniedError) {
      redirect("/");
    }
    throw error;
  }

  return (
    <main className="requests-page admin-page">
      <WorkspaceHeader
        backHref="/"
        eyebrow="DepanUp"
        title="Operations"
        action={
          <span className="provider-verified">
            <ShieldCheck aria-hidden="true" /> Administrateur
          </span>
        }
      />
      <section className="workspace-content" aria-labelledby="admin-title">
        <div className="workspace-heading">
          <p className="eyebrow">File de travail</p>
          <h1 id="admin-title">Controle operationnel</h1>
          <p>Traitez les exceptions qui demandent une decision humaine.</p>
        </div>
        <OperationsConsole initialProviders={providers} />
      </section>
    </main>
  );
}
