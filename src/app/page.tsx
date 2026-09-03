import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ServiceSelector } from "@/modules/requests/components/service-selector";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="DepanUp, accueil">
          <Image
            src="/brand/logo-mark.svg"
            alt=""
            width={42}
            height={42}
            priority
          />
          <span>DepanUp</span>
        </Link>

        <nav className="main-nav" aria-label="Navigation principale">
          <Link className="active" href="#demander">
            Demander
          </Link>
          <Link href="/demandes">Interventions</Link>
        </nav>

        <Link
          className="account-link"
          href="/connexion"
          aria-label="Ouvrir le compte"
        >
          <UserRound aria-hidden="true" />
        </Link>
      </header>

      <main>
        <section
          className="request-section"
          id="demander"
          aria-labelledby="home-title"
        >
          <div className="request-copy">
            <p className="eyebrow">Assistance routiere a Casablanca et Rabat</p>
            <h1 id="home-title">De quel depannage avez-vous besoin&nbsp;?</h1>
            <p className="lead">
              Indiquez le probleme. Des professionnels verifies vous proposent
              leur prix et leur delai.
            </p>
            <ServiceSelector services={serviceCategories} />
          </div>

          <div
            className="visual-panel"
            aria-label="Service de depannage automobile"
          >
            <div className="road-lines" aria-hidden="true" />
            <Image
              className="visual-mark"
              src="/brand/logo-mark-inverse.svg"
              alt=""
              width={192}
              height={192}
              priority
            />
            <p>
              Un depanneur.
              <br />
              Un prix. Maintenant.
            </p>
            <div className="verification-note">
              <ShieldCheck aria-hidden="true" />
              <span>
                <strong>Professionnels verifies</strong>
                <small>Identite, permis, vehicule et assurance controles</small>
              </span>
            </div>
          </div>
        </section>

        <section
          className="trust-strip"
          id="engagements"
          aria-label="Nos engagements"
        >
          <article>
            <BadgeCheck aria-hidden="true" />
            <span>
              <strong>Identite controlee</strong>
              <small>Documents verifies manuellement</small>
            </span>
          </article>
          <article>
            <ReceiptText aria-hidden="true" />
            <span>
              <strong>Prix connu avant depart</strong>
              <small>Vous choisissez l&apos;offre</small>
            </span>
          </article>
          <article>
            <MapPinned aria-hidden="true" />
            <span>
              <strong>Suivi de l&apos;arrivee</strong>
              <small>Position partagee apres acceptation</small>
            </span>
          </article>
        </section>
      </main>
    </div>
  );
}
