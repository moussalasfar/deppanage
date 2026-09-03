import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { DetailsForm } from "@/modules/requests/components/details-form";

type DetailsPageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Details de la panne" };

export default async function DetailsPage({ params }: DetailsPageProps) {
  const { id } = await params;

  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link className="back-link" href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>Etape 3 sur 4</span>
          <strong>Details de la panne</strong>
        </div>
        <span className="saved-state">
          <ShieldCheck aria-hidden="true" /> Donnees protegees
        </span>
      </header>
      <div
        className="progress-track details-progress"
        aria-label="Progression de la demande"
        aria-valuemax={4}
        aria-valuemin={1}
        aria-valuenow={3}
        role="progressbar"
      >
        <span />
      </div>

      <section
        className="vehicle-step details-step"
        aria-labelledby="details-title"
      >
        <p className="eyebrow">Diagnostic initial</p>
        <h1 id="details-title">Que se passe-t-il&nbsp;?</h1>
        <p className="lead">
          Quelques details permettent au depanneur de preparer le bon materiel.
        </p>
        <DetailsForm requestId={id} />
      </section>
    </main>
  );
}
