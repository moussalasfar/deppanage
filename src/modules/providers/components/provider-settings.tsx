"use client";

import { useState } from "react";
import {
  BatteryCharging,
  Check,
  MapPinned,
  Save,
  Truck,
  Wrench,
} from "lucide-react";

export function ProviderSettings() {
  const [available, setAvailable] = useState(true);
  const [city, setCity] = useState("Casablanca");
  const [radius, setRadius] = useState(25);
  const [services, setServices] = useState(["battery", "tire", "towing"]);
  const [saved, setSaved] = useState(false);
  const options = [
    { id: "battery", label: "Batterie", icon: BatteryCharging },
    { id: "tire", label: "Pneu", icon: Wrench },
    { id: "towing", label: "Remorquage", icon: Truck },
  ];
  function save() {
    window.localStorage.setItem(
      "depannage.frontend.provider",
      JSON.stringify({ available, city, radius, services }),
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="settings-layout">
      <section className="settings-section">
        <div className="availability-setting">
          <div>
            <p className="eyebrow">Disponibilite</p>
            <h2>{available ? "Disponible pour les missions" : "Hors ligne"}</h2>
          </div>
          <label className="switch-control">
            <input
              checked={available}
              onChange={(event) => setAvailable(event.target.checked)}
              type="checkbox"
            />
            <span />
          </label>
        </div>
      </section>
      <section className="settings-section">
        <div className="settings-title">
          <MapPinned aria-hidden="true" />
          <div>
            <h2>Zone d&apos;intervention</h2>
            <p>Definissez votre secteur principal et la distance maximale.</p>
          </div>
        </div>
        <div className="provider-zone-controls">
          <label>
            Ville
            <select
              onChange={(event) => setCity(event.target.value)}
              value={city}
            >
              <option>Casablanca</option>
              <option>Rabat</option>
            </select>
          </label>
          <label>
            Rayon : <strong>{radius} km</strong>
            <input
              max={80}
              min={5}
              onChange={(event) => setRadius(Number(event.target.value))}
              step={5}
              type="range"
              value={radius}
            />
          </label>
        </div>
      </section>
      <section className="settings-section">
        <div className="settings-title">
          <Wrench aria-hidden="true" />
          <div>
            <h2>Services proposes</h2>
            <p>Seules les demandes correspondantes seront affichees.</p>
          </div>
        </div>
        <div className="provider-service-toggles">
          {options.map(({ id, label, icon: Icon }) => (
            <label className={services.includes(id) ? "selected" : ""} key={id}>
              <input
                checked={services.includes(id)}
                onChange={(event) =>
                  setServices(
                    event.target.checked
                      ? [...services, id]
                      : services.filter((service) => service !== id),
                  )
                }
                type="checkbox"
              />
              <Icon aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>
        <button
          className="secondary-command"
          disabled={!services.length}
          onClick={save}
          type="button"
        >
          <Save aria-hidden="true" /> Enregistrer
        </button>
      </section>
      {saved ? (
        <p className="settings-saved" role="status">
          <Check aria-hidden="true" /> Reglages enregistres
        </p>
      ) : null}
    </div>
  );
}
