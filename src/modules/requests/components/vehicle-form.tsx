"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CarFront, LoaderCircle } from "lucide-react";
import type { ServiceCategoryId } from "../domain/service-catalog";

type VehicleFormProps = {
  service: ServiceCategoryId;
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

const subscribeToHydration = () => () => {};

export function VehicleForm({ service }: VehicleFormProps) {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission({ status: "submitting" });

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service,
        vehicle: {
          make: formData.get("make"),
          model: formData.get("model"),
          registration: formData.get("registration"),
        },
      }),
    }).catch(() => null);

    if (!response) {
      setSubmission({
        status: "error",
        message: "Connexion interrompue. Verifiez votre reseau puis reessayez.",
      });
      return;
    }

    const payload = await response.json();
    if (!response.ok) {
      setSubmission({
        status: "error",
        message:
          payload.error?.message ??
          "La demande ne peut pas etre enregistree pour le moment.",
      });
      return;
    }

    router.push(`/demander/${payload.data.id}/localisation`);
  }

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <label>
        Marque
        <input
          autoComplete="organization"
          name="make"
          placeholder="Ex. Dacia"
          required
        />
      </label>
      <label>
        Modele
        <input name="model" placeholder="Ex. Logan" required />
      </label>
      <label>
        Immatriculation
        <input
          autoCapitalize="characters"
          name="registration"
          placeholder="Ex. 12345-A-6"
        />
      </label>

      {submission.status === "error" ? (
        <p className="form-error" role="alert">
          {submission.message}
        </p>
      ) : null}

      <button
        className="primary-action"
        disabled={!isHydrated || submission.status === "submitting"}
        type="submit"
      >
        {submission.status === "submitting" ? "Enregistrement..." : "Continuer"}
        {submission.status === "submitting" ? (
          <LoaderCircle className="spinner" aria-hidden="true" />
        ) : (
          <CarFront aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
