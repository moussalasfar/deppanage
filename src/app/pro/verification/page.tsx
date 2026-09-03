import Link from "next/link";
import { Settings } from "lucide-react";
import { WorkspaceHeader } from "@/components/workspace-header";
import { VerificationChecklist } from "@/modules/providers/components/verification-checklist";

export const metadata = { title: "Verification professionnelle" };

export default function ProviderVerificationPage() {
  return (
    <main className="requests-page">
      <WorkspaceHeader
        backHref="/pro/demandes"
        eyebrow="Espace professionnel"
        title="Verification"
        action={
          <Link className="provider-section-link" href="/pro/compte">
            <Settings aria-hidden="true" /> Compte
          </Link>
        }
      />
      <section
        className="workspace-content"
        aria-labelledby="verification-title"
      >
        <div className="workspace-heading">
          <p className="eyebrow">Dossier professionnel</p>
          <h1 id="verification-title">Documents a controler</h1>
          <p>
            Chaque document est examine manuellement avant l&apos;acces aux
            demandes.
          </p>
        </div>
        <VerificationChecklist />
      </section>
    </main>
  );
}
