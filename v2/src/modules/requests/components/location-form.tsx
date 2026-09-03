"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Navigation,
} from "lucide-react";

type SupportedCity = "Casablanca" | "Rabat";
type LocationMode = "gps" | "manual";

type LocationFormProps = {
  requestId: string;
};

type FormState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "submitting" }
  | { status: "success"; source: LocationMode }
  | { status: "error"; message: string };

export function LocationForm({ requestId }: LocationFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<LocationMode>("gps");
  const [city, setCity] = useState<SupportedCity>("Casablanca");
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function saveLocation(payload: object, source: LocationMode) {
    setState({ status: "submitting" });
    const response = await fetch(`/api/requests/${requestId}/location`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
          result.error?.message ?? "La position ne peut pas etre enregistree.",
      });
      return;
    }

    setState({ status: "success", source });
    router.push(`/demander/${requestId}/details`);
  }

  function requestBrowserLocation() {
    if (!navigator.geolocation) {
      setMode("manual");
      setState({
        status: "error",
        message: "La geolocalisation n'est pas disponible. Indiquez un repere.",
      });
      return;
    }

    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void saveLocation(
          {
            source: "gps",
            city,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
            address: "",
          },
          "gps",
        );
      },
      () => {
        setMode("manual");
        setState({
          status: "error",
          message:
            "Position non accessible. Autorisez le GPS ou indiquez un repere.",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }

  function submitManualLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void saveLocation(
      { source: "manual", city, address: formData.get("address") },
      "manual",
    );
  }

  if (state.status === "success") {
    return (
      <section className="draft-confirmation" aria-live="polite">
        <span className="confirmation-icon">
          <Check aria-hidden="true" />
        </span>
        <div>
          <strong>Localisation enregistree</strong>
          <p>
            {state.source === "gps"
              ? "La position exacte reste privee jusqu'au choix d'un depanneur."
              : "Le repere sera confirme avant la publication de la demande."}
          </p>
          <small>Etape 2 terminee</small>
        </div>
      </section>
    );
  }

  const isBusy = state.status === "locating" || state.status === "submitting";

  return (
    <div className="location-form">
      <fieldset className="city-fieldset">
        <legend>Ville d&apos;intervention</legend>
        <div className="segmented-control">
          {(["Casablanca", "Rabat"] as const).map((item) => (
            <label key={item} data-selected={city === item}>
              <input
                checked={city === item}
                name="city"
                onChange={() => setCity(item)}
                type="radio"
                value={item}
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <div
        className="location-mode-tabs"
        role="tablist"
        aria-label="Methode de localisation"
      >
        <button
          aria-selected={mode === "gps"}
          onClick={() => setMode("gps")}
          role="tab"
          type="button"
        >
          <Navigation aria-hidden="true" /> GPS
        </button>
        <button
          aria-selected={mode === "manual"}
          onClick={() => setMode("manual")}
          role="tab"
          type="button"
        >
          <MapPin aria-hidden="true" /> Repere manuel
        </button>
      </div>

      {mode === "gps" ? (
        <section className="gps-panel" role="tabpanel">
          <span className="map-target" aria-hidden="true">
            <LocateFixed />
          </span>
          <strong>Partager votre position actuelle</strong>
          <p>
            Votre navigateur demandera votre autorisation avant tout partage.
          </p>
          <button
            className="primary-action"
            disabled={isBusy}
            onClick={requestBrowserLocation}
            type="button"
          >
            {isBusy ? "Localisation..." : "Utiliser ma position"}
            {isBusy ? (
              <LoaderCircle className="spinner" aria-hidden="true" />
            ) : (
              <Navigation aria-hidden="true" />
            )}
          </button>
        </section>
      ) : (
        <form
          className="manual-location-form"
          onSubmit={submitManualLocation}
          role="tabpanel"
        >
          <label>
            Adresse ou point de repere
            <textarea
              name="address"
              placeholder="Ex. devant la gare Casa-Voyageurs, cote boulevard..."
              required
              rows={4}
            />
          </label>
          <button className="primary-action" disabled={isBusy} type="submit">
            {isBusy ? "Enregistrement..." : "Enregistrer ce repere"}
            {isBusy ? (
              <LoaderCircle className="spinner" aria-hidden="true" />
            ) : (
              <MapPin aria-hidden="true" />
            )}
          </button>
        </form>
      )}

      {state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
