"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, MapPin, Send, Wrench } from "lucide-react";
import { serviceCategories } from "../domain/service-catalog";
import type { RequestDetails, RequestLocation } from "../domain/request-draft";

type ReviewData = {
  id: string;
  status: "draft" | "published";
  service: (typeof serviceCategories)[number]["id"];
  vehicle: { make: string; model: string; registration: string };
  location?: RequestLocation;
  details?: RequestDetails;
  photoCount: number;
  publishedAt?: string;
};

type ReviewState =
  | { status: "loading" }
  | { status: "ready"; request: ReviewData }
  | { status: "publishing"; request: ReviewData }
  | { status: "published" }
  | { status: "error"; message: string };

export function RequestReview({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [state, setState] = useState<ReviewState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    fetch(`/api/requests/${requestId}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error?.message ?? "Demande introuvable.");
        }
        return result.data as ReviewData;
      })
      .then((request) => {
        if (active) {
          setState(
            request.status === "published"
              ? { status: "published" }
              : { status: "ready", request },
          );
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "La demande ne peut pas etre chargee.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [requestId]);

  async function publish(request: ReviewData) {
    setState({ status: "publishing", request });
    const response = await fetch(`/api/requests/${requestId}/publish`, {
      method: "POST",
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
      if (
        response.status === 401 ||
        result.error?.code === "AUTH_UNAVAILABLE"
      ) {
        router.push(
          `/connexion?retour=${encodeURIComponent(`/demander/${requestId}/verification`)}`,
        );
        return;
      }
      setState({
        status: "error",
        message:
          result.error?.message ??
          "La demande ne peut pas etre publiee pour le moment.",
      });
      return;
    }

    setState({ status: "published" });
  }

  if (state.status === "loading") {
    return (
      <p className="review-loading" aria-live="polite">
        <LoaderCircle className="spinner" aria-hidden="true" /> Chargement de la
        demande...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="form-error" role="alert">
        {state.message}
      </p>
    );
  }

  if (state.status === "published") {
    return (
      <section className="draft-confirmation" aria-live="polite">
        <span className="confirmation-icon">
          <Check aria-hidden="true" />
        </span>
        <div>
          <strong>Demande publiee</strong>
          <p>Les depanneurs eligibles peuvent maintenant la consulter.</p>
          <small>Vous serez informe lorsqu&apos;une offre arrivera.</small>
        </div>
      </section>
    );
  }

  const request = state.request;
  const service = serviceCategories.find((item) => item.id === request.service);
  const location = request.location;
  const details = request.details;

  return (
    <div className="request-review">
      <dl className="review-list">
        <div>
          <dt>
            <Wrench aria-hidden="true" /> Intervention
          </dt>
          <dd>{service?.label}</dd>
        </div>
        <div>
          <dt>Vehicule</dt>
          <dd>
            {request.vehicle.make} {request.vehicle.model}
            {request.vehicle.registration
              ? ` - ${request.vehicle.registration}`
              : ""}
          </dd>
        </div>
        <div>
          <dt>
            <MapPin aria-hidden="true" /> Localisation
          </dt>
          <dd>
            {location
              ? `${location.city}${location.address ? ` - ${location.address}` : ""}`
              : "Non renseignee"}
          </dd>
        </div>
        <div>
          <dt>Description</dt>
          <dd>{details?.description ?? "Non renseignee"}</dd>
        </div>
        <div>
          <dt>Intervention souhaitee</dt>
          <dd>{details?.urgency === "now" ? "Maintenant" : "Aujourd'hui"}</dd>
        </div>
        <div>
          <dt>Photos</dt>
          <dd>{request.photoCount}</dd>
        </div>
      </dl>

      <button
        className="primary-action"
        disabled={state.status === "publishing"}
        onClick={() => publish(request)}
        type="button"
      >
        {state.status === "publishing"
          ? "Publication..."
          : "Publier ma demande"}
        {state.status === "publishing" ? (
          <LoaderCircle className="spinner" aria-hidden="true" />
        ) : (
          <Send aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
