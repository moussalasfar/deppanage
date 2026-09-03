import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { listEligibleRequests } from "@/modules/providers/application/list-eligible-requests";
import { supabaseEligibleRequestRepository } from "@/modules/providers/infrastructure/supabase-eligible-request-repository";
import { supabaseProviderProfileRepository } from "@/modules/providers/infrastructure/supabase-provider-profile-repository";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";

export const metadata = { title: "Demandes disponibles" };
export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(value));
}

export default async function ProviderRequestsPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect("/connexion?retour=/pro/demandes");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/connexion?retour=/pro/demandes");
  }

  const profile = await supabaseProviderProfileRepository.findByUserId(user.id);
  if (!profile) {
    redirect("/pro/inscription");
  }

  if (profile.verificationStatus !== "verified") {
    return (
      <main className="provider-status-page">
        <ShieldAlert aria-hidden="true" />
        <p className="eyebrow">Verification du dossier</p>
        <h1>
          {profile.verificationStatus === "pending"
            ? "Controle en cours"
            : "Dossier a corriger"}
        </h1>
        <p>
          {profile.verificationStatus === "pending"
            ? "Nous controlons votre identite, votre permis, votre vehicule et votre assurance."
            : profile.rejectionReason}
        </p>
        {profile.verificationStatus === "rejected" ? (
          <Link className="primary-action" href="/pro/inscription">
            Corriger mon dossier
          </Link>
        ) : null}
        <Link href="/">Retour a l&apos;accueil</Link>
      </main>
    );
  }

  const requests = await listEligibleRequests(
    user.id,
    supabaseEligibleRequestRepository,
  );

  return (
    <main className="requests-page">
      <header className="requests-header">
        <Link className="back-link" href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>{profile.businessName}</span>
          <strong>Demandes disponibles</strong>
        </div>
        <Link className="provider-section-link" href="/pro/interventions">
          <CheckCircle2 aria-hidden="true" /> Mes interventions
        </Link>
      </header>

      <section
        className="requests-content"
        aria-labelledby="provider-requests-title"
      >
        <div className="requests-heading">
          <div>
            <p className="eyebrow">{profile.city}</p>
            <h1 id="provider-requests-title">Interventions eligibles</h1>
          </div>
          <p>{requests.length} demande(s)</p>
        </div>

        {requests.length ? (
          <ul className="provider-request-list">
            {requests.map((request) => {
              const service = serviceCategories.find(
                (item) => item.id === request.service,
              );
              return (
                <li key={request.id}>
                  <Link href={`/pro/demandes/${request.id}`}>
                    <div className="provider-request-title">
                      <span>{service?.label}</span>
                      <time dateTime={request.publishedAt}>
                        {formatDate(request.publishedAt)}
                      </time>
                    </div>
                    <h2>
                      {request.vehicle.make} {request.vehicle.model}
                    </h2>
                    <p>{request.description}</p>
                    <div className="provider-request-meta">
                      <span>
                        <MapPin aria-hidden="true" /> {request.city}
                      </span>
                      <span>
                        <Clock3 aria-hidden="true" />
                        {request.urgency === "now"
                          ? "Maintenant"
                          : "Aujourd'hui"}
                      </span>
                      <span>
                        <Camera aria-hidden="true" /> {request.photoCount}{" "}
                        photo(s)
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="requests-empty">
            <Clock3 aria-hidden="true" />
            <h2>Aucune demande disponible</h2>
            <p>
              Les nouvelles demandes correspondant a votre ville et vos services
              apparaitront ici.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
