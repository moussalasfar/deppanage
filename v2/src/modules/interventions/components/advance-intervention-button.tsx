"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  LoaderCircle,
  Navigation,
  MapPinCheck,
} from "lucide-react";
import type { AdvanceableInterventionStatus } from "../domain/intervention-status";

const actionByStatus = {
  en_route: { label: "Je pars vers le client", icon: Navigation },
  arrived: { label: "Je suis arrive", icon: MapPinCheck },
  completed: { label: "Terminer l'intervention", icon: CheckCircle2 },
} satisfies Record<
  AdvanceableInterventionStatus,
  { label: string; icon: typeof Navigation }
>;

export function AdvanceInterventionButton({
  interventionId,
  nextStatus,
}: {
  interventionId: string;
  nextStatus: AdvanceableInterventionStatus;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const action = actionByStatus[nextStatus];
  const Icon = action.icon;

  async function advance() {
    setError("");
    setIsPending(true);
    const response = await fetch(
      `/api/interventions/${interventionId}/status`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      },
    ).catch(() => null);
    if (!response) {
      setError("Connexion interrompue. Reessayez.");
      setIsPending(false);
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "L'etat ne peut pas etre modifie.");
      setIsPending(false);
      router.refresh();
      return;
    }
    router.refresh();
    setIsPending(false);
  }

  return (
    <div className="intervention-action">
      <button
        className="primary-action"
        disabled={isPending}
        onClick={advance}
        type="button"
      >
        {isPending ? "Mise a jour..." : action.label}
        {isPending ? (
          <LoaderCircle className="spinner" aria-hidden="true" />
        ) : (
          <Icon aria-hidden="true" />
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
