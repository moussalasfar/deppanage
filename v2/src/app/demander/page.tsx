import Link from "next/link";
import { ArrowLeft, Check, Info } from "lucide-react";
import {
  isServiceCategoryId,
  serviceCategories,
} from "@/modules/requests/domain/service-catalog";
import { VehicleForm } from "@/modules/requests/components/vehicle-form";

type RequestPageProps = {
  searchParams: Promise<{ service?: string }>;
};

export const metadata = {
  title: "Votre vehicule",
};

export default async function RequestPage({ searchParams }: RequestPageProps) {
  const { service } = await searchParams;
  const serviceId = service && isServiceCategoryId(service) ? service : "other";
  const selectedService = serviceCategories.find(
    (item) => item.id === serviceId,
  );

  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link className="back-link" href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>Etape 1 sur 4</span>
          <strong>Votre vehicule</strong>
        </div>
        <span className="saved-state">
          <Check aria-hidden="true" /> Demande en cours
        </span>
      </header>
      <div
        className="progress-track"
        aria-label="Progression de la demande"
        aria-valuemax={4}
        aria-valuemin={1}
        aria-valuenow={1}
        role="progressbar"
      >
        <span />
      </div>

      <section className="vehicle-step" aria-labelledby="vehicle-title">
        <p className="eyebrow">
          Probleme selectionne : {selectedService?.label}
        </p>
        <h1 id="vehicle-title">Quel vehicule est en panne&nbsp;?</h1>
        <p className="lead">
          Ces informations permettront au depanneur de venir avec le bon
          equipement.
        </p>

        <div className="privacy-note">
          <Info aria-hidden="true" />
          <span>
            Vos informations sont partagees uniquement avec le depanneur choisi.
          </span>
        </div>
        <VehicleForm service={serviceId} />
      </section>
    </main>
  );
}
