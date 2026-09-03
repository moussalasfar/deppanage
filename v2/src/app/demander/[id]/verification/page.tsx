import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { RequestReview } from "@/modules/requests/components/request-review";

type VerificationPageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Verifier la demande" };

export default async function VerificationPage({
  params,
}: VerificationPageProps) {
  const { id } = await params;

  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link
          className="back-link"
          href={`/demander/${id}/details`}
          aria-label="Modifier les details"
        >
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>Etape 4 sur 4</span>
          <strong>Verification</strong>
        </div>
        <span className="saved-state">
          <ShieldCheck aria-hidden="true" /> Donnees protegees
        </span>
      </header>
      <div
        className="progress-track review-progress"
        aria-label="Progression de la demande"
        aria-valuemax={4}
        aria-valuemin={1}
        aria-valuenow={4}
        role="progressbar"
      >
        <span />
      </div>

      <section
        className="vehicle-step review-step"
        aria-labelledby="review-title"
      >
        <p className="eyebrow">Derniere verification</p>
        <h1 id="review-title">Votre demande est-elle correcte&nbsp;?</h1>
        <p className="lead">
          Apres publication, les informations seront figees et partagees avec
          les depanneurs eligibles.
        </p>
        <RequestReview requestId={id} />
      </section>
    </main>
  );
}
