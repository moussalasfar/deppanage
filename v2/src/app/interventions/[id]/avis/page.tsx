import { WorkspaceHeader } from "@/components/workspace-header";
import { ReviewForm } from "@/modules/reviews/components/review-form";

export const metadata = { title: "Votre avis" };

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="requests-page">
      <WorkspaceHeader
        backHref={`/interventions/${id}`}
        eyebrow="Intervention terminee"
        title="Votre avis"
      />
      <section className="compact-workspace" aria-labelledby="review-title">
        <div className="workspace-heading">
          <p className="eyebrow">Qualite du service</p>
          <h1 id="review-title">
            Comment s&apos;est passee l&apos;intervention ?
          </h1>
          <p>Votre avis aide les prochains automobilistes a choisir.</p>
        </div>
        <ReviewForm />
      </section>
    </main>
  );
}
