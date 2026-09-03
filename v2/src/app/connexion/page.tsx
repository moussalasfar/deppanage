import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { PhoneOtpForm } from "@/modules/auth/components/phone-otp-form";

export const metadata = { title: "Connexion" };

type ConnexionPageProps = {
  searchParams: Promise<{ retour?: string }>;
};

export default async function ConnexionPage({
  searchParams,
}: ConnexionPageProps) {
  const { retour } = await searchParams;
  const returnTo =
    retour?.startsWith("/") && !retour.startsWith("//") ? retour : "/demandes";

  return (
    <main className="flow-page auth-page">
      <header className="flow-header">
        <Link className="back-link" href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div>
          <span>Espace personnel</span>
          <strong>Connexion securisee</strong>
        </div>
        <span className="saved-state">
          <LockKeyhole aria-hidden="true" /> Code temporaire
        </span>
      </header>

      <section className="auth-step" aria-labelledby="auth-title">
        <p className="eyebrow">Votre compte</p>
        <h1 id="auth-title">Connectez-vous par telephone</h1>
        <p className="lead">
          Nous vous envoyons un code a six chiffres. Aucun mot de passe a
          retenir.
        </p>
        <PhoneOtpForm returnTo={returnTo} />
      </section>
    </main>
  );
}
