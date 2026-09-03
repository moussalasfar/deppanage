import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { listClientOffers } from "@/modules/offers/application/list-client-offers";
import { OfferComparison } from "@/modules/offers/components/offer-comparison";
import { supabaseClientOfferRepository } from "@/modules/offers/infrastructure/supabase-client-offer-repository";
import { listClientRequests } from "@/modules/requests/application/list-client-requests";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";
import { supabaseClientRequestQueryRepository } from "@/modules/requests/infrastructure/supabase-client-request-query-repository";

type ClientOffersPageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Comparer les offres" };
export const dynamic = "force-dynamic";

export default async function ClientOffersPage({
  params,
}: ClientOffersPageProps) {
  const { id } = await params;
  if (!isSupabaseAuthConfigured()) {
    redirect(`/connexion?retour=/demandes/${id}/offres`);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/connexion?retour=/demandes/${id}/offres`);
  }

  const requests = await listClientRequests(
    user.id,
    supabaseClientRequestQueryRepository,
  );
  const request = requests.find((candidate) => candidate.id === id);
  if (!request || request.status !== "published") {
    notFound();
  }
  const offers = await listClientOffers(
    user.id,
    id,
    supabaseClientOfferRepository,
  );
  const acceptedOffer = offers.find(
    (offer) => offer.status === "accepted" && offer.interventionId,
  );
  if (acceptedOffer?.interventionId) {
    redirect(`/interventions/${acceptedOffer.interventionId}`);
  }
  const activeOffers = offers.filter(
    (offer) =>
      offer.status === "submitted" && new Date(offer.expiresAt) > new Date(),
  );
  const service = serviceCategories.find((item) => item.id === request.service);

  return (
    <main className="requests-page">
      <header className="requests-header">
        <Link
          className="back-link"
          href="/demandes"
          aria-label="Retour aux demandes"
        >
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>{service?.label}</span>
          <strong>Comparer les offres</strong>
        </div>
        <span className="provider-verified">
          {activeOffers.length} offre(s)
        </span>
      </header>

      <section className="client-offers-content" aria-labelledby="offers-title">
        <div className="requests-heading">
          <div>
            <p className="eyebrow">Votre demande</p>
            <h1 id="offers-title">Prix et delais proposes</h1>
          </div>
          <p>
            {request.vehicle.make} {request.vehicle.model}
          </p>
        </div>
        {activeOffers.length ? (
          <OfferComparison offers={activeOffers} />
        ) : (
          <div className="requests-empty">
            <Clock3 aria-hidden="true" />
            <h2>En attente de propositions</h2>
            <p>Les offres des depanneurs verifies apparaitront ici.</p>
          </div>
        )}
      </section>
    </main>
  );
}
