import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { LocationForm } from "@/modules/requests/components/location-form";

type LocationPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = { title: "Votre localisation" };

export default async function LocationPage({ params }: LocationPageProps) {
  const { id } = await params;

  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link className="back-link" href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>Etape 2 sur 4</span>
          <strong>Votre localisation</strong>
        </div>
        <span className="saved-state">
          <LockKeyhole aria-hidden="true" /> Position protegee
        </span>
      </header>
      <div
        className="progress-track location-progress"
        aria-label="Progression de la demande"
        aria-valuemax={4}
        aria-valuemin={1}
        aria-valuenow={2}
        role="progressbar"
      >
        <span />
      </div>

      <section
        className="vehicle-step location-step"
        aria-labelledby="location-title"
      >
        <p className="eyebrow">Zone pilote : Casablanca et Rabat</p>
        <h1 id="location-title">Ou se trouve le vehicule&nbsp;?</h1>
        <p className="lead">
          Utilisez votre position actuelle ou indiquez un repere facilement
          identifiable.
        </p>
        <LocationForm requestId={id} />
      </section>
    </main>
  );
}
