import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  CircleDot,
  MapPin,
  Plus,
} from "lucide-react";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  listClientRequests,
  type ClientRequestListItem,
} from "@/modules/requests/application/list-client-requests";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";
import { supabaseClientRequestQueryRepository } from "@/modules/requests/infrastructure/supabase-client-request-query-repository";

export const metadata = { title: "Mes demandes" };
export const dynamic = "force-dynamic";

function getRequestHref(request: ClientRequestListItem) {
  if (request.status === "published") {
    return `/demandes/${request.id}/offres`;
  }
  if (!request.location) {
    return `/demander/${request.id}/localisation`;
  }
  if (!request.details) {
    return `/demander/${request.id}/details`;
  }
  return `/demander/${request.id}/verification`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(value));
}

export default async function RequestsPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect("/connexion?retour=/demandes");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/connexion?retour=/demandes");
  }

  const requests = await listClientRequests(
    user.id,
    supabaseClientRequestQueryRepository,
  );

  return (
    <main className="requests-page">
      <header className="requests-header">
        <Link className="back-link" href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>Espace client</span>
          <strong>Mes demandes</strong>
        </div>
        <Link className="new-request-link" href="/">
          <Plus aria-hidden="true" /> Nouvelle demande
        </Link>
      </header>

      <section className="requests-content" aria-labelledby="requests-title">
        <div className="requests-heading">
          <div>
            <p className="eyebrow">Interventions</p>
            <h1 id="requests-title">Suivez vos demandes</h1>
          </div>
          <p>{requests.length} demande(s)</p>
        </div>

        {requests.length ? (
          <ul className="request-list">
            {requests.map((request) => {
              const service = serviceCategories.find(
                (item) => item.id === request.service,
              );
              return (
                <li key={request.id}>
                  <Link href={getRequestHref(request)}>
                    <div className="request-list-main">
                      <span className={`request-status ${request.status}`}>
                        <CircleDot aria-hidden="true" />
                        {request.status === "published"
                          ? "Publiee"
                          : "Brouillon"}
                      </span>
                      <h2>{service?.label}</h2>
                      <p>
                        {request.vehicle.make} {request.vehicle.model}
                        {request.vehicle.registration
                          ? ` - ${request.vehicle.registration}`
                          : ""}
                      </p>
                    </div>
                    <div className="request-list-meta">
                      <span>
                        <MapPin aria-hidden="true" />
                        {request.location?.city ?? "Localisation a completer"}
                      </span>
                      <span>
                        <Camera aria-hidden="true" /> {request.photoCount}
                      </span>
                      <time dateTime={request.updatedAt}>
                        {formatDate(request.updatedAt)}
                      </time>
                    </div>
                    <ChevronRight aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="requests-empty">
            <CircleDot aria-hidden="true" />
            <h2>Aucune demande</h2>
            <p>Votre prochaine demande apparaitra ici apres sa creation.</p>
            <Link className="primary-action" href="/">
              Demander un depanneur <Plus aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
