import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { WorkspaceHeader } from "@/components/workspace-header";
import { ProviderSettings } from "@/modules/providers/components/provider-settings";

export const metadata = { title: "Compte professionnel" };

export default function ProviderAccountPage() {
  return (
    <main className="requests-page">
      <WorkspaceHeader
        backHref="/pro/demandes"
        eyebrow="Espace professionnel"
        title="Mon activite"
        action={
          <Link className="provider-section-link" href="/pro/verification">
            <FileCheck2 aria-hidden="true" /> Documents
          </Link>
        }
      />
      <section
        className="workspace-content"
        aria-labelledby="provider-account-title"
      >
        <div className="workspace-heading">
          <p className="eyebrow">Reglages</p>
          <h1 id="provider-account-title">Disponibilite et secteur</h1>
          <p>Controlez les missions que vous souhaitez recevoir.</p>
        </div>
        <ProviderSettings />
      </section>
    </main>
  );
}
