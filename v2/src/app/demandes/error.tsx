"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function RequestsError({ reset }: { reset: () => void }) {
  return (
    <main className="requests-error">
      <AlertTriangle aria-hidden="true" />
      <h1>Vos demandes ne peuvent pas etre chargees</h1>
      <p>Verifiez votre connexion puis reessayez.</p>
      <button className="primary-action" onClick={reset} type="button">
        Reessayer <RotateCcw aria-hidden="true" />
      </button>
      <Link href="/">Retour a l&apos;accueil</Link>
    </main>
  );
}
