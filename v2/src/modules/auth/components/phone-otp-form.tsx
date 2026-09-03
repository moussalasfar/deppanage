"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, MessageSquareText, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { normalizeMoroccanPhone } from "../domain/phone-number";

type AuthState =
  | { status: "phone" }
  | { status: "sending" }
  | { status: "code"; phone: string }
  | { status: "verifying"; phone: string }
  | { status: "success"; claimedCount: number }
  | { status: "error"; message: string; phone?: string };

export function PhoneOtpForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "phone" });

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let phone: string;
    try {
      phone = normalizeMoroccanPhone(
        String(new FormData(event.currentTarget).get("phone") ?? ""),
      );
    } catch {
      setState({
        status: "error",
        message: "Saisissez un numero mobile marocain valide.",
      });
      return;
    }

    setState({ status: "sending" });
    try {
      const { error } = await createClient().auth.signInWithOtp({
        phone,
        options: { data: { locale: "fr" }, shouldCreateUser: true },
      });
      if (error) {
        throw error;
      }
      setState({ status: "code", phone });
    } catch {
      setState({
        status: "error",
        message: "Le code ne peut pas etre envoye pour le moment.",
        phone,
      });
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "code" && state.status !== "error") {
      return;
    }
    const phone = state.phone;
    if (!phone) {
      setState({ status: "phone" });
      return;
    }

    const token = String(
      new FormData(event.currentTarget).get("token") ?? "",
    ).replace(/\s/g, "");
    if (!/^\d{6}$/.test(token)) {
      setState({
        status: "error",
        message: "Saisissez le code a six chiffres recu par SMS.",
        phone,
      });
      return;
    }

    setState({ status: "verifying", phone });
    const { error } = await createClient().auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) {
      setState({
        status: "error",
        message: "Ce code est invalide ou a expire.",
        phone,
      });
      return;
    }

    const response = await fetch("/api/auth/claim-requests", {
      method: "POST",
    }).catch(() => null);
    if (!response) {
      setState({
        status: "error",
        message: "Connexion interrompue. Reessayez dans un instant.",
        phone,
      });
      return;
    }

    const result = await response.json();
    if (!response.ok) {
      setState({
        status: "error",
        message:
          result.error?.message ?? "Le compte ne peut pas etre finalise.",
        phone,
      });
      return;
    }

    setState({ status: "success", claimedCount: result.data.claimedCount });
    router.replace(returnTo);
    router.refresh();
  }

  if (state.status === "success") {
    return (
      <section className="draft-confirmation" aria-live="polite">
        <span className="confirmation-icon">
          <Check aria-hidden="true" />
        </span>
        <div>
          <strong>Telephone verifie</strong>
          <p>Votre compte est maintenant connecte.</p>
          <small>
            {state.claimedCount
              ? `${state.claimedCount} demande(s) rattachee(s) a votre compte.`
              : "Aucune demande en attente de rattachement."}
          </small>
        </div>
      </section>
    );
  }

  const expectsCode =
    state.status === "code" ||
    state.status === "verifying" ||
    (state.status === "error" && Boolean(state.phone));
  const isBusy = state.status === "sending" || state.status === "verifying";

  return (
    <form className="auth-form" onSubmit={expectsCode ? verifyCode : sendCode}>
      {expectsCode ? (
        <>
          <p className="otp-destination">
            <MessageSquareText aria-hidden="true" /> Code envoye au{" "}
            <strong>{state.phone}</strong>
          </p>
          <label>
            Code de verification
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              name="token"
              pattern="[0-9]{6}"
              placeholder="000000"
              required
            />
          </label>
        </>
      ) : (
        <label>
          Numero de telephone
          <input
            autoComplete="tel"
            inputMode="tel"
            name="phone"
            placeholder="06 12 34 56 78"
            required
            type="tel"
          />
        </label>
      )}

      {state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="primary-action" disabled={isBusy} type="submit">
        {state.status === "sending"
          ? "Envoi..."
          : state.status === "verifying"
            ? "Verification..."
            : expectsCode
              ? "Verifier le code"
              : "Recevoir mon code"}
        {isBusy ? (
          <LoaderCircle className="spinner" aria-hidden="true" />
        ) : (
          <Phone aria-hidden="true" />
        )}
      </button>

      {expectsCode && !isBusy ? (
        <button
          className="text-action"
          onClick={() => setState({ status: "phone" })}
          type="button"
        >
          Utiliser un autre numero
        </button>
      ) : null}
    </form>
  );
}
