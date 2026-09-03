import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Camera, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { OfferForm } from "@/modules/offers/components/offer-form";
import { supabaseOfferRepository } from "@/modules/offers/infrastructure/supabase-offer-repository";
import { listEligibleRequests } from "@/modules/providers/application/list-eligible-requests";
import { supabaseEligibleRequestRepository } from "@/modules/providers/infrastructure/supabase-eligible-request-repository";
import { supabaseProviderProfileRepository } from "@/modules/providers/infrastructure/supabase-provider-profile-repository";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";

type ProviderRequestPageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Proposer une intervention" };
export const dynamic = "force-dynamic";

export default async function ProviderRequestPage({
  params,
}: ProviderRequestPageProps) {
  const { id } = await params;
  if (!isSupabaseAuthConfigured()) {
    redirect(`/connexion?retour=/pro/demandes/${id}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/connexion?retour=/pro/demandes/${id}`);
  }

  const profile = await supabaseProviderProfileRepository.findByUserId(user.id);
  if (!profile) {
    redirect("/pro/inscription");
  }
  if (profile.verificationStatus !== "verified") {
    redirect("/pro/demandes");
  }

  const requests = await listEligibleRequests(
    user.id,
    supabaseEligibleRequestRepository,
  );
  const request = requests.find((candidate) => candidate.id === id);
  if (!request) {
    notFound();
  }

  const existingOffer = await supabaseOfferRepository.findByRequest(id);
  const service = serviceCategories.find((item) => item.id === request.service);

  return (
    <main className="requests-page">
      <header className="requests-header">
        <Link
          className="back-link"
          href="/pro/demandes"
          aria-label="Retour aux demandes"
        >
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>{service?.label}</span>
          <strong>Proposer une intervention</strong>
        </div>
        <span className="provider-verified">
          <ShieldCheck aria-hidden="true" /> Donnees protegees
        </span>
      </header>

      <section className="provider-request-detail">
        <div className="provider-request-summary">
          <p className="eyebrow">{service?.label}</p>
          <h1>
            {request.vehicle.make} {request.vehicle.model}
          </h1>
          <p className="lead">{request.description}</p>
          <div className="provider-request-meta">
            <span>
              <MapPin aria-hidden="true" /> {request.city}, zone approximative
            </span>
            <span>
              <Clock3 aria-hidden="true" />
              {request.urgency === "now" ? "Maintenant" : "Aujourd'hui"}
            </span>
            <span>
              <Camera aria-hidden="true" /> {request.photoCount} photo(s)
            </span>
          </div>
          <p className="privacy-note">
            L&apos;adresse exacte et les coordonnees du client restent masquees
            jusqu&apos;a l&apos;attribution de l&apos;intervention.
          </p>
        </div>

        <aside className="offer-panel" aria-labelledby="offer-title">
          <p className="eyebrow">Votre proposition</p>
          <h2 id="offer-title">Prix et delai d&apos;arrivee</h2>
          <OfferForm requestId={id} existingOffer={existingOffer} />
        </aside>
      </section>
    </main>
  );
}
