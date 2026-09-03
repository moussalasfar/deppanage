import { WorkspaceHeader } from "@/components/workspace-header";
import { PaymentConfirmation } from "@/modules/payments/components/payment-confirmation";

export const metadata = { title: "Paiement" };

export default async function PaymentPage({
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
        title="Paiement"
      />
      <section className="compact-workspace" aria-labelledby="payment-title">
        <div className="workspace-heading">
          <p className="eyebrow">Reglement</p>
          <h1 id="payment-title">Confirmez le montant final</h1>
          <p>Le paiement en especes reste disponible comme mode principal.</p>
        </div>
        <PaymentConfirmation />
      </section>
    </main>
  );
}
