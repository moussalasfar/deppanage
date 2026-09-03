import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { WorkspaceHeader } from "@/components/workspace-header";
import { AccountSettings } from "@/modules/profiles/components/account-settings";

export const metadata = { title: "Mon compte" };

export default function AccountPage() {
  return (
    <main className="requests-page">
      <WorkspaceHeader
        backHref="/"
        eyebrow="Espace client"
        title="Mon compte"
        action={
          <Link className="provider-section-link" href="/securite">
            <ShieldCheck aria-hidden="true" /> Securite
          </Link>
        }
      />
      <section className="workspace-content" aria-labelledby="account-title">
        <div className="workspace-heading">
          <p className="eyebrow">Reglages</p>
          <h1 id="account-title">Vos informations</h1>
          <p>Gerez vos vehicules, votre langue et vos alertes.</p>
        </div>
        <AccountSettings />
        <nav className="legal-links" aria-label="Informations legales">
          <Link href="/legal/cgu">Conditions d&apos;utilisation</Link>
          <Link href="/legal/confidentialite">Confidentialite</Link>
          <Link href="/legal/cookies">Cookies</Link>
          <Link href="/legal/annulation">Annulation</Link>
        </nav>
      </section>
    </main>
  );
}
