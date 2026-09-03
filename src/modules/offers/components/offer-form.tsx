"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { ProviderOffer } from "../application/submit-offer";

type OfferFormProps = {
  requestId: string;
  existingOffer: ProviderOffer | null;
};

export function OfferForm({ requestId, existingOffer }: OfferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(Boolean(existingOffer));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setIsSaved(false);

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const etaMinutes = Number(formData.get("etaMinutes"));
    const message = String(formData.get("message") ?? "");

    try {
      const response = await fetch(
        `/api/providers/requests/${requestId}/offers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountMinor: Math.round(amount * 100),
            etaMinutes,
            message,
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? "L'offre n'a pas ete envoyee.",
        );
      }
      setIsSaved(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "L'offre n'a pas ete envoyee.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="offer-form" onSubmit={handleSubmit}>
      <div className="offer-fields">
        <label>
          Prix propose (MAD)
          <input
            defaultValue={existingOffer ? existingOffer.amountMinor / 100 : ""}
            inputMode="decimal"
            max="5000"
            min="50"
            name="amount"
            required
            step="0.01"
            type="number"
          />
        </label>
        <label>
          Arrivee estimee (minutes)
          <input
            defaultValue={existingOffer?.etaMinutes ?? ""}
            max="240"
            min="5"
            name="etaMinutes"
            required
            step="1"
            type="number"
          />
        </label>
      </div>
      <label>
        Message au client (facultatif)
        <textarea
          defaultValue={existingOffer?.message}
          maxLength={240}
          name="message"
          rows={4}
        />
      </label>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {isSaved ? (
        <p className="offer-saved" role="status">
          <CheckCircle2 aria-hidden="true" /> Offre enregistree. Vous pouvez la
          modifier tant que la demande reste disponible.
        </p>
      ) : null}
      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? <LoaderCircle className="spinner" /> : null}
        {existingOffer ? "Mettre a jour l'offre" : "Envoyer l'offre"}
      </button>
    </form>
  );
}
