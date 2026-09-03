"use client";

import { useState, type FormEvent } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

export function PaymentConfirmation() {
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [confirmed, setConfirmed] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <section className="completion-state" role="status">
        <CheckCircle2 aria-hidden="true" />
        <p className="eyebrow">Paiement confirme</p>
        <h2>Reglement enregistre</h2>
        <p>
          Un recu sera disponible dans l&apos;historique de l&apos;intervention.
        </p>
        <button
          className="secondary-command"
          onClick={() => window.print()}
          type="button"
        >
          <ReceiptText aria-hidden="true" /> Imprimer le recu
        </button>
      </section>
    );
  }

  return (
    <form className="payment-form" onSubmit={submit}>
      <section className="payment-amount">
        <span>Montant final</span>
        <strong>250 MAD</strong>
        <small>Prix confirme avant l&apos;intervention</small>
      </section>
      <fieldset className="payment-methods">
        <legend>Mode de paiement</legend>
        <label className={method === "cash" ? "selected" : ""}>
          <input
            checked={method === "cash"}
            name="method"
            onChange={() => setMethod("cash")}
            type="radio"
            value="cash"
          />
          <Banknote aria-hidden="true" />
          <span>
            <strong>Especes</strong>
            <small>A remettre directement au depanneur</small>
          </span>
        </label>
        <label className={method === "card" ? "selected" : ""}>
          <input
            checked={method === "card"}
            name="method"
            onChange={() => setMethod("card")}
            type="radio"
            value="card"
          />
          <CreditCard aria-hidden="true" />
          <span>
            <strong>Carte bancaire</strong>
            <small>Interface de paiement a connecter</small>
          </span>
        </label>
      </fieldset>
      <label className="strong-confirmation">
        <input required type="checkbox" />
        <span>
          Je confirme que le montant final est de <strong>250 MAD</strong> et
          que l&apos;intervention est terminee.
        </span>
      </label>
      <div className="payment-security">
        <ShieldCheck aria-hidden="true" />
        <span>
          Aucune donnee bancaire n&apos;est demandee dans cette interface.
        </span>
      </div>
      <button className="primary-action" type="submit">
        Confirmer le paiement <CheckCircle2 aria-hidden="true" />
      </button>
    </form>
  );
}
