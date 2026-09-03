import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getIntervention } from "@/modules/interventions/application/get-intervention";
import { AdvanceInterventionButton } from "@/modules/interventions/components/advance-intervention-button";
import { CancelInterventionPanel } from "@/modules/interventions/components/cancel-intervention-panel";
import { InterventionLiveRefresh } from "@/modules/interventions/components/intervention-live-refresh";
import { InterventionTimeline } from "@/modules/interventions/components/intervention-timeline";
import { ProviderTracker } from "@/modules/interventions/components/provider-tracker";
import { getNextInterventionStatus } from "@/modules/interventions/domain/intervention-status";
import { supabaseInterventionRepository } from "@/modules/interventions/infrastructure/supabase-intervention-repository";
import { listMessages } from "@/modules/messaging/application/list-messages";
import { MessagePanel } from "@/modules/messaging/components/message-panel";
import { supabaseMessageRepository } from "@/modules/messaging/infrastructure/supabase-message-repository";
import { requestLocationSchema } from "@/modules/requests/domain/request-draft";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";

type InterventionPageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Votre intervention" };
export const dynamic = "force-dynamic";

export default async function InterventionPage({
  params,
}: InterventionPageProps) {
  const { id } = await params;
  if (!isSupabaseAuthConfigured()) {
    redirect(`/connexion?retour=/interventions/${id}`);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/connexion?retour=/interventions/${id}`);
  }
  const intervention = await getIntervention(
    user.id,
    id,
    supabaseInterventionRepository,
  );
  if (!intervention) {
    notFound();
  }
  const messages = await listMessages(user.id, id, supabaseMessageRepository);
  const location = requestLocationSchema.parse(intervention.location);
  const vehicle = intervention.vehicle as { make?: string; model?: string };
  const service = serviceCategories.find(
    (item) => item.id === intervention.service,
  );
  const price = new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(intervention.amountMinor / 100);
  const statusContent = {
    assigned: {
      title: "Intervention attribuee",
      description: "Le depanneur confirme son depart depuis cet ecran.",
    },
    en_route: {
      title: "Depanneur en route",
      description: `Arrivee estimee dans ${intervention.etaMinutes} minutes.`,
    },
    arrived: {
      title: "Depanneur arrive",
      description: "Le professionnel est arrive au lieu indique.",
    },
    completed: {
      title: "Intervention terminee",
      description: "L'intervention a ete marquee comme terminee.",
    },
    cancelled: {
      title: "Intervention annulee",
      description:
        intervention.cancellationReason === "client_no_show"
          ? "Le depanneur a signale l'absence du client."
          : "Cette intervention ne peut plus etre poursuivie.",
    },
  }[intervention.status];
  const nextStatus = getNextInterventionStatus(intervention.status);
  const cancellationLabels = {
    client_changed_mind: "Service devenu inutile",
    problem_resolved: "Probleme resolu",
    provider_late: "Retard du depanneur",
    provider_vehicle_issue: "Probleme du vehicule professionnel",
    unsafe_location: "Zone inaccessible en securite",
    client_no_show: "Client absent au lieu indique",
  };

  return (
    <main className="requests-page">
      <InterventionLiveRefresh interventionId={intervention.id} />
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
          <strong>{statusContent.title}</strong>
        </div>
        <span className="provider-verified">
          <ShieldCheck aria-hidden="true" /> Offre confirmee
        </span>
      </header>
      <section
        className="intervention-content"
        aria-labelledby="intervention-title"
      >
        <div
          className={`live-intervention-status ${intervention.status}`}
          aria-live="polite"
        >
          <strong>{statusContent.title}</strong>
          <span>{statusContent.description}</span>
        </div>
        <InterventionTimeline status={intervention.status} />
        <div className="intervention-status">
          <span>
            <Truck aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">Depanneur attribue</p>
            <h1 id="intervention-title">{intervention.providerName}</h1>
            <p>
              {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>
        <div className="intervention-facts">
          <article>
            <Clock3 aria-hidden="true" />
            <span>
              <small>Arrivee estimee</small>
              <strong>{intervention.etaMinutes} minutes</strong>
            </span>
          </article>
          <article>
            <ReceiptText aria-hidden="true" />
            <span>
              <small>Prix accepte</small>
              <strong>{price}</strong>
            </span>
          </article>
          <article>
            <MapPin aria-hidden="true" />
            <span>
              <small>Lieu d&apos;intervention</small>
              <strong>
                {location.city}
                {location.address ? ` - ${location.address}` : ""}
              </strong>
            </span>
          </article>
        </div>
        <p className="privacy-note">
          L&apos;adresse exacte est maintenant partagee uniquement avec le
          depanneur selectionne. Vehicule professionnel :{" "}
          {intervention.providerVehicleRegistration}.
        </p>
        {intervention.status !== "cancelled" ? (
          <ProviderTracker
            city={location.city}
            etaMinutes={intervention.etaMinutes}
            providerName={intervention.providerName}
            status={intervention.status}
          />
        ) : null}
        {intervention.participantRole === "provider" && nextStatus ? (
          <AdvanceInterventionButton
            interventionId={intervention.id}
            nextStatus={nextStatus}
          />
        ) : null}
        {intervention.status !== "completed" &&
        intervention.status !== "cancelled" ? (
          <CancelInterventionPanel
            interventionId={intervention.id}
            participantRole={intervention.participantRole}
            status={intervention.status}
          />
        ) : null}
        {intervention.status === "cancelled" &&
        intervention.cancellationReason ? (
          <p className="cancellation-summary">
            <strong>
              {cancellationLabels[intervention.cancellationReason]}
            </strong>
            <span>
              Annulation enregistree par le
              {intervention.cancelledByRole === "provider"
                ? " depanneur."
                : " client."}
            </span>
          </p>
        ) : null}
        <MessagePanel
          currentUserId={user.id}
          initialMessages={messages}
          interventionId={intervention.id}
          isClosed={
            intervention.status === "completed" ||
            intervention.status === "cancelled"
          }
        />
      </section>
    </main>
  );
}
