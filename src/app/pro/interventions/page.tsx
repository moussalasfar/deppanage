import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, Clock3, MapPin, Truck } from "lucide-react";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { listProviderInterventions } from "@/modules/interventions/application/list-provider-interventions";
import { supabaseProviderInterventionRepository } from "@/modules/interventions/infrastructure/supabase-provider-intervention-repository";
import { supabaseProviderProfileRepository } from "@/modules/providers/infrastructure/supabase-provider-profile-repository";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";

export const metadata = { title: "Mes interventions" };
export const dynamic = "force-dynamic";

const statusLabels = {
  assigned: "A demarrer",
  en_route: "En route",
  arrived: "Sur place",
  completed: "Terminee",
  cancelled: "Annulee",
};

export default async function ProviderInterventionsPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect("/connexion?retour=/pro/interventions");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/connexion?retour=/pro/interventions");
  }
  const profile = await supabaseProviderProfileRepository.findByUserId(user.id);
  if (!profile || profile.verificationStatus !== "verified") {
    redirect("/pro/demandes");
  }
  const interventions = await listProviderInterventions(
    user.id,
    supabaseProviderInterventionRepository,
  );

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
          <span>{profile.businessName}</span>
          <strong>Mes interventions</strong>
        </div>
        <Link className="provider-section-link" href="/pro/demandes">
          Nouvelles demandes
        </Link>
      </header>
      <section
        className="requests-content"
        aria-labelledby="provider-interventions-title"
      >
        <div className="requests-heading">
          <div>
            <p className="eyebrow">Activite</p>
            <h1 id="provider-interventions-title">Missions attribuees</h1>
          </div>
          <p>{interventions.length} intervention(s)</p>
        </div>
        {interventions.length ? (
          <ul className="provider-intervention-list">
            {interventions.map((intervention) => {
              const vehicle = intervention.vehicle as {
                make?: string;
                model?: string;
              };
              const service = serviceCategories.find(
                (item) => item.id === intervention.service,
              );
              return (
                <li key={intervention.id}>
                  <Link href={`/interventions/${intervention.id}`}>
                    <span className={`request-status ${intervention.status}`}>
                      <Truck aria-hidden="true" />
                      {statusLabels[intervention.status]}
                    </span>
                    <div>
                      <h2>
                        {service?.label} - {vehicle.make} {vehicle.model}
                      </h2>
                      <p>
                        <MapPin aria-hidden="true" /> {intervention.city}
                      </p>
                    </div>
                    <span>
                      <Clock3 aria-hidden="true" /> {intervention.etaMinutes}{" "}
                      min
                    </span>
                    <ChevronRight aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="requests-empty">
            <Truck aria-hidden="true" />
            <h2>Aucune intervention attribuee</h2>
            <p>
              Une mission apparaitra ici lorsqu&apos;un client acceptera votre
              offre.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
