import Link from "next/link";
import { UserRound } from "lucide-react";
import { WorkspaceHeader } from "@/components/workspace-header";
import { SafetyTools } from "@/modules/safety/components/safety-tools";

export const metadata = { title: "Securite" };

export default function SafetyPage() {
  return (
    <main className="requests-page">
      <WorkspaceHeader
        backHref="/"
        eyebrow="Assistance"
        title="Securite"
        action={
          <Link className="provider-section-link" href="/compte">
            <UserRound aria-hidden="true" /> Compte
          </Link>
        }
      />
      <section className="workspace-content" aria-labelledby="safety-title">
        <div className="workspace-heading">
          <p className="eyebrow">Votre protection</p>
          <h1 id="safety-title">Restez visible et accompagne</h1>
          <p>
            Les informations exactes ne sont partagees qu&apos;apres
            attribution.
          </p>
        </div>
        <SafetyTools />
      </section>
    </main>
  );
}
