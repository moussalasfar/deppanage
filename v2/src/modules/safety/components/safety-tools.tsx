"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, PhoneCall, Share2, ShieldAlert } from "lucide-react";

export function SafetyTools() {
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("");

  function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(
      new FormData(event.currentTarget).get("contact") ?? "",
    ).trim();
    window.localStorage.setItem("depannage.frontend.emergency-contact", value);
    setContact(value);
    setStatus("Contact enregistre");
  }

  async function shareTrip() {
    const text =
      "Suivez mon intervention DepanUp : https://depanup.ma/suivi/demo";
    if (navigator.share) {
      await navigator.share({ title: "Mon intervention", text });
      setStatus("Lien partage");
      return;
    }
    await navigator.clipboard.writeText(text);
    setStatus("Lien copie");
  }

  return (
    <div className="safety-layout">
      <section className="safety-primary">
        <ShieldAlert aria-hidden="true" />
        <p className="eyebrow">En cas de danger immediat</p>
        <h2>Quittez la chaussee si vous le pouvez</h2>
        <p>
          Allumez vos feux de detresse, placez-vous derriere la glissiere et
          appelez les secours si une personne est en danger.
        </p>
        <a className="emergency-call" href="tel:112">
          <PhoneCall aria-hidden="true" /> Appeler le 112
        </a>
      </section>
      <section className="settings-section">
        <div className="settings-title">
          <Share2 aria-hidden="true" />
          <div>
            <h2>Partager le trajet</h2>
            <p>Envoyez l&apos;identite du depanneur et le suivi a un proche.</p>
          </div>
        </div>
        <button className="secondary-command" onClick={shareTrip} type="button">
          <Copy aria-hidden="true" /> Partager le lien
        </button>
      </section>
      <section className="settings-section">
        <div className="settings-title">
          <PhoneCall aria-hidden="true" />
          <div>
            <h2>Contact de confiance</h2>
            <p>
              Ce numero sera propose lors du partage d&apos;une intervention.
            </p>
          </div>
        </div>
        <form className="settings-form" onSubmit={saveContact}>
          <label>
            Numero de telephone
            <input
              defaultValue={contact}
              inputMode="tel"
              name="contact"
              placeholder="06 12 34 56 78"
              required
              type="tel"
            />
          </label>
          <button className="secondary-command" type="submit">
            Enregistrer <Check aria-hidden="true" />
          </button>
        </form>
      </section>
      {status ? (
        <p className="settings-saved" role="status">
          <Check aria-hidden="true" /> {status}
        </p>
      ) : null}
    </div>
  );
}
