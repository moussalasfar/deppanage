"use client";

import { useState, type FormEvent } from "react";
import {
  Bell,
  Car,
  Check,
  Globe2,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  registration: string;
};
type Settings = {
  displayName: string;
  locale: "fr" | "ar";
  smsUpdates: boolean;
  pushUpdates: boolean;
  vehicles: Vehicle[];
};

const initialSettings: Settings = {
  displayName: "",
  locale: "fr",
  smsUpdates: true,
  pushUpdates: true,
  vehicles: [],
};

export function AccountSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return initialSettings;
    const stored = window.localStorage.getItem("depannage.frontend.account");
    return stored ? (JSON.parse(stored) as Settings) : initialSettings;
  });
  const [saved, setSaved] = useState(false);

  function save(next: Settings) {
    setSettings(next);
    window.localStorage.setItem(
      "depannage.frontend.account",
      JSON.stringify(next),
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    save({
      ...settings,
      displayName: String(data.get("displayName") ?? "").trim(),
    });
  }

  function addVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const vehicle = {
      id: crypto.randomUUID(),
      make: String(data.get("make") ?? "").trim(),
      model: String(data.get("model") ?? "").trim(),
      registration: String(data.get("registration") ?? "").trim(),
    };
    save({ ...settings, vehicles: [...settings.vehicles, vehicle] });
    form.reset();
  }

  return (
    <div className="settings-layout">
      <section className="settings-section" aria-labelledby="profile-title">
        <div className="settings-title">
          <UserRound aria-hidden="true" />
          <div>
            <h2 id="profile-title">Profil</h2>
            <p>Informations visibles pendant une intervention.</p>
          </div>
        </div>
        <form className="settings-form" onSubmit={submitProfile}>
          <label>
            Nom affiche
            <input
              defaultValue={settings.displayName}
              key={settings.displayName}
              maxLength={120}
              name="displayName"
              placeholder="Votre nom"
            />
          </label>
          <label>
            Telephone verifie
            <input disabled value="+212 6 00 00 00 00" />
          </label>
          <button className="secondary-command" type="submit">
            Enregistrer <Check aria-hidden="true" />
          </button>
        </form>
      </section>

      <section className="settings-section" aria-labelledby="vehicles-title">
        <div className="settings-title">
          <Car aria-hidden="true" />
          <div>
            <h2 id="vehicles-title">Mes vehicules</h2>
            <p>Retrouvez-les rapidement lors d&apos;une demande.</p>
          </div>
        </div>
        {settings.vehicles.length ? (
          <ul className="saved-vehicle-list">
            {settings.vehicles.map((vehicle) => (
              <li key={vehicle.id}>
                <span>
                  <strong>
                    {vehicle.make} {vehicle.model}
                  </strong>
                  <small>
                    {vehicle.registration || "Sans immatriculation"}
                  </small>
                </span>
                <button
                  aria-label={`Supprimer ${vehicle.make} ${vehicle.model}`}
                  onClick={() =>
                    save({
                      ...settings,
                      vehicles: settings.vehicles.filter(
                        (item) => item.id !== vehicle.id,
                      ),
                    })
                  }
                  title="Supprimer"
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="inline-empty">Aucun vehicule enregistre.</p>
        )}
        <form className="vehicle-inline-form" onSubmit={addVehicle}>
          <label>
            Marque
            <input name="make" required />
          </label>
          <label>
            Modele
            <input name="model" required />
          </label>
          <label>
            Immatriculation
            <input maxLength={20} name="registration" />
          </label>
          <button
            aria-label="Ajouter le vehicule"
            title="Ajouter"
            type="submit"
          >
            <Plus aria-hidden="true" />
          </button>
        </form>
      </section>

      <section className="settings-section" aria-labelledby="preferences-title">
        <div className="settings-title">
          <Globe2 aria-hidden="true" />
          <div>
            <h2 id="preferences-title">Langue et alertes</h2>
            <p>Choisissez comment l&apos;application vous informe.</p>
          </div>
        </div>
        <fieldset className="segmented-setting">
          <legend>Langue</legend>
          <label>
            <input
              checked={settings.locale === "fr"}
              name="locale"
              onChange={() => save({ ...settings, locale: "fr" })}
              type="radio"
            />
            Francais
          </label>
          <label>
            <input
              checked={settings.locale === "ar"}
              name="locale"
              onChange={() => save({ ...settings, locale: "ar" })}
              type="radio"
            />
            العربية
          </label>
        </fieldset>
        <div className="toggle-list">
          <label>
            <span>
              <Bell aria-hidden="true" />
              <strong>Alertes SMS</strong>
            </span>
            <input
              checked={settings.smsUpdates}
              onChange={(event) =>
                save({ ...settings, smsUpdates: event.target.checked })
              }
              type="checkbox"
            />
          </label>
          <label>
            <span>
              <Bell aria-hidden="true" />
              <strong>Notifications navigateur</strong>
            </span>
            <input
              checked={settings.pushUpdates}
              onChange={(event) =>
                save({ ...settings, pushUpdates: event.target.checked })
              }
              type="checkbox"
            />
          </label>
        </div>
      </section>
      {saved ? (
        <p className="settings-saved" role="status">
          <Check aria-hidden="true" /> Reglages enregistres
        </p>
      ) : null}
    </div>
  );
}
