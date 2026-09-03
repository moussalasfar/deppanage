"use client";

import { useEffect, useState } from "react";
import {
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  Truck,
  WifiOff,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { InterventionStatus } from "@/modules/interventions/domain/intervention-status";

const minZoom = 0;
const maxZoom = 2;

export function ProviderTracker({
  city,
  etaMinutes,
  providerName,
  status,
}: {
  city: string;
  etaMinutes: number;
  providerName: string;
  status: InterventionStatus;
}) {
  const isMoving = status === "assigned" || status === "en_route";
  const isArrived = status === "arrived" || status === "completed";
  const [isOnline, setIsOnline] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function updateConnection() {
      setIsOnline(navigator.onLine);
    }

    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  return (
    <section className="provider-tracker" aria-labelledby="tracking-title">
      <div className="tracker-copy">
        <p className="eyebrow">Suivi du trajet</p>
        <h2 id="tracking-title">
          {isMoving
            ? `${providerName} se rapproche`
            : isArrived
              ? "Le depanneur est sur place"
              : "Suivi du trajet termine"}
        </h2>
        <p>
          {isMoving
            ? `Arrivee estimee dans ${etaMinutes} minutes.`
            : isArrived
              ? `Rendez-vous au point indique a ${city}.`
              : "La position n'est plus partagee."}
        </p>
        <span
          aria-live="polite"
          className={`tracker-accuracy ${isOnline ? "online" : "offline"}`}
        >
          {isOnline ? (
            <Navigation aria-hidden="true" />
          ) : (
            <WifiOff aria-hidden="true" />
          )}
          {isOnline
            ? isMoving
              ? "Position actualisee a l'instant"
              : "Derniere position recue"
            : "Hors connexion - derniere position conservee"}
        </span>
      </div>
      <div
        aria-label={`Apercu du trajet vers ${city}`}
        className={`tracking-map ${isMoving ? "moving" : ""} zoom-${zoom}`}
        role="img"
      >
        <div className="tracking-map-canvas">
          <span className="tracking-road" aria-hidden="true" />
          <span className="tracking-provider" aria-hidden="true">
            <Truck />
          </span>
          <span className="tracking-destination" aria-hidden="true">
            <MapPin />
          </span>
        </div>
        <div
          className="tracking-map-controls"
          aria-label="Controle de la carte"
        >
          <button
            aria-label="Zoom avant"
            disabled={zoom === maxZoom}
            onClick={() => setZoom((value) => Math.min(maxZoom, value + 1))}
            title="Zoom avant"
            type="button"
          >
            <ZoomIn aria-hidden="true" />
          </button>
          <button
            aria-label="Zoom arriere"
            disabled={zoom === minZoom}
            onClick={() => setZoom((value) => Math.max(minZoom, value - 1))}
            title="Zoom arriere"
            type="button"
          >
            <ZoomOut aria-hidden="true" />
          </button>
          <button
            aria-label="Recentrer le trajet"
            onClick={() => setZoom(1)}
            title="Recentrer le trajet"
            type="button"
          >
            <LocateFixed aria-hidden="true" />
          </button>
        </div>
        <div className="tracking-map-label">
          <Route aria-hidden="true" />
          <span>
            <small>Destination</small>
            <strong>{city}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
