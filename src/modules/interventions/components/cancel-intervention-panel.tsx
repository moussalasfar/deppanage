"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import type {
  CancellationReason,
  InterventionParticipantRole,
} from "../domain/intervention-cancellation";
import type { InterventionStatus } from "../domain/intervention-status";

const clientReasons = [
  { value: "client_changed_mind", label: "Je n'ai plus besoin du service" },
  { value: "problem_resolved", label: "Le probleme est resolu" },
  { value: "provider_late", label: "Le depanneur est trop en retard" },
] satisfies { value: CancellationReason; label: string }[];

const providerReasons = [
  { value: "provider_vehicle_issue", label: "Mon vehicule a un probleme" },
  {
    value: "unsafe_location",
    label: "La zone n'est pas accessible en securite",
  },
] satisfies { value: CancellationReason; label: string }[];

export function CancelInterventionPanel({
  interventionId,
  participantRole,
  status,
}: {
  interventionId: string;
  participantRole: InterventionParticipantRole;
  status: InterventionStatus;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] =
    useState<CancellationReason | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const reasons =
    participantRole === "client"
      ? clientReasons
      : status === "arrived"
        ? [
            ...providerReasons,
            { value: "client_no_show" as const, label: "Le client est absent" },
          ]
        : providerReasons;

  async function cancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfirmed || !selectedReason) {
      setError("Confirmez l'annulation avant de continuer.");
      return;
    }

    setError("");
    setIsPending(true);
    const response = await fetch(
      `/api/interventions/${interventionId}/cancel`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: selectedReason }),
      },
    ).catch(() => null);
    if (!response) {
      setError("Connexion interrompue. Reessayez.");
      setIsPending(false);
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "L'annulation a echoue.");
      setIsPending(false);
      router.refresh();
      return;
    }
    router.refresh();
  }

  if (!isOpen) {
    return (
      <button
        className="cancel-trigger"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <X aria-hidden="true" /> Annuler l&apos;intervention
      </button>
    );
  }

  return (
    <form className="cancellation-panel" onSubmit={cancel}>
      <div className="cancellation-warning">
        <AlertTriangle aria-hidden="true" />
        <div>
          <strong>Confirmer l&apos;annulation</strong>
          <p>Cette action ferme l&apos;intervention et la conversation.</p>
        </div>
      </div>
      <label>
        Motif
        <select
          name="reason"
          onChange={(event) => {
            setSelectedReason(
              event.target.value
                ? (event.target.value as CancellationReason)
                : null,
            );
            setError("");
          }}
          required
          value={selectedReason ?? ""}
        >
          <option disabled value="">
            Selectionnez un motif
          </option>
          {reasons.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {reason.label}
            </option>
          ))}
        </select>
      </label>
      <label className="cancellation-confirmation">
        <input
          checked={isConfirmed}
          name="confirmation"
          onChange={(event) => {
            setIsConfirmed(event.target.checked);
            setError("");
          }}
          type="checkbox"
          value="confirmed"
        />
        Je confirme vouloir annuler cette intervention.
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="cancellation-actions">
        <button
          disabled={isPending || !selectedReason || !isConfirmed}
          type="submit"
        >
          {isPending ? "Annulation..." : "Confirmer l'annulation"}
          {isPending ? (
            <LoaderCircle className="spinner" aria-hidden="true" />
          ) : (
            <X aria-hidden="true" />
          )}
        </button>
        <button
          disabled={isPending}
          onClick={() => {
            setIsOpen(false);
            setSelectedReason(null);
            setIsConfirmed(false);
            setError("");
          }}
          type="button"
        >
          Conserver l&apos;intervention
        </button>
      </div>
    </form>
  );
}
