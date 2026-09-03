"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";
import type { ProviderProfile } from "../application/submit-provider-application";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function ProviderApplicationForm({
  profile,
}: {
  profile: ProviderProfile | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/providers/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: formData.get("businessName"),
        city: formData.get("city"),
        vehicleType: formData.get("vehicleType"),
        vehicleRegistration: formData.get("vehicleRegistration"),
        serviceIds: formData.getAll("serviceIds"),
      }),
    }).catch(() => null);

    if (!response) {
      setState({
        status: "error",
        message: "Connexion interrompue. Verifiez votre reseau puis reessayez.",
      });
      return;
    }

    const result = await response.json();
    if (!response.ok) {
      setState({
        status: "error",
        message:
          result.error?.message ??
          "Votre dossier ne peut pas etre enregistre pour le moment.",
      });
      return;
    }

    router.replace("/pro/demandes");
    router.refresh();
  }

  const isSubmitting = state.status === "submitting";

  return (
    <form className="provider-form" onSubmit={submitApplication}>
      <div className="provider-form-grid">
        <label>
          Nom de l&apos;activite
          <input
            defaultValue={profile?.businessName}
            name="businessName"
            placeholder="Ex. Assistance Atlas"
            required
          />
        </label>
        <label>
          Ville d&apos;intervention
          <select defaultValue={profile?.city ?? "Casablanca"} name="city">
            <option>Casablanca</option>
            <option>Rabat</option>
          </select>
        </label>
        <label>
          Vehicule d&apos;intervention
          <select
            defaultValue={profile?.vehicleType ?? "tow_truck"}
            name="vehicleType"
          >
            <option value="tow_truck">Depanneuse</option>
            <option value="service_vehicle">Vehicule de service</option>
          </select>
        </label>
        <label>
          Immatriculation
          <input
            defaultValue={profile?.vehicleRegistration}
            name="vehicleRegistration"
            placeholder="Ex. 12345-A-6"
            required
          />
        </label>
      </div>

      <fieldset>
        <legend>Services proposes</legend>
        <div className="provider-service-grid">
          {serviceCategories.map((service) => (
            <label key={service.id}>
              <input
                defaultChecked={profile?.serviceIds.includes(service.id)}
                name="serviceIds"
                type="checkbox"
                value={service.id}
              />
              <span>{service.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enregistrement..." : "Envoyer pour verification"}
        {isSubmitting ? (
          <LoaderCircle className="spinner" aria-hidden="true" />
        ) : (
          <Send aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
