"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";

export function AcceptOfferButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function accept() {
    setError("");
    setIsPending(true);
    const response = await fetch(`/api/offers/${offerId}/accept`, {
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setError("Connexion interrompue. Reessayez.");
      setIsPending(false);
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "Cette offre n'est plus disponible.");
      setIsPending(false);
      router.refresh();
      return;
    }

    router.push(`/interventions/${result.data.id}`);
    router.refresh();
  }

  return (
    <div className="accept-offer-action">
      <button
        className="primary-action"
        disabled={isPending}
        onClick={accept}
        type="button"
      >
        {isPending ? "Attribution..." : "Choisir cette offre"}
        {isPending ? (
          <LoaderCircle className="spinner" aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
      </button>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
