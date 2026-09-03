import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ProviderApplicationForm } from "@/modules/providers/components/provider-application-form";
import { supabaseProviderProfileRepository } from "@/modules/providers/infrastructure/supabase-provider-profile-repository";

export const metadata = { title: "Inscription depanneur" };
export const dynamic = "force-dynamic";

export default async function ProviderRegistrationPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect("/connexion?retour=/pro/inscription");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/connexion?retour=/pro/inscription");
  }

  const profile = await supabaseProviderProfileRepository.findByUserId(user.id);
  if (
    profile?.verificationStatus === "pending" ||
    profile?.verificationStatus === "verified"
  ) {
    redirect("/pro/demandes");
  }

  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link className="back-link" href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>Espace professionnel</span>
          <strong>Inscription depanneur</strong>
        </div>
        <span className="saved-state">
          <BadgeCheck aria-hidden="true" /> Controle manuel
        </span>
      </header>

      <section className="provider-step" aria-labelledby="provider-title">
        <p className="eyebrow">Rejoindre le reseau</p>
        <h1 id="provider-title">Presentez votre activite</h1>
        <p className="lead">
          Votre dossier sera examine avant tout acces aux demandes clients.
        </p>
        {profile?.rejectionReason ? (
          <p className="provider-rejection" role="alert">
            <strong>Dossier a corriger :</strong> {profile.rejectionReason}
          </p>
        ) : null}
        <ProviderApplicationForm profile={profile} />
      </section>
    </main>
  );
}
