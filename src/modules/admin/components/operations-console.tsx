"use client";

import { useDeferredValue, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  Search,
  XCircle,
} from "lucide-react";
import type { PendingProvider } from "../domain/provider-verification";

export function OperationsConsole({
  initialProviders,
}: {
  initialProviders: PendingProvider[];
}) {
  const [providers, setProviders] = useState(initialProviders);
  const [query, setQuery] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const visibleProviders = providers.filter(
    (provider) =>
      provider.businessName.toLowerCase().includes(deferredQuery) ||
      provider.city.toLowerCase().includes(deferredQuery) ||
      provider.vehicleRegistration.toLowerCase().includes(deferredQuery),
  );

  async function decide(providerId: string, status: "verified" | "rejected") {
    setError("");
    setPendingId(providerId);
    const response = await fetch(
      `/api/admin/providers/${providerId}/verification`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "rejected" ? { reason: rejectionReason } : {}),
        }),
      },
    ).catch(() => null);

    if (!response) {
      setError("Connexion interrompue. Reessayez.");
      setPendingId(null);
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "La decision a echoue.");
      setPendingId(null);
      return;
    }

    setProviders((current) =>
      current.filter((provider) => provider.id !== providerId),
    );
    setRejectingId(null);
    setRejectionReason("");
    setPendingId(null);
  }

  return (
    <div className="admin-console">
      <div className="admin-queue-summary">
        <ClipboardCheck aria-hidden="true" />
        <span>
          <strong>{providers.length}</strong> candidature(s) en attente
        </span>
      </div>
      <label className="admin-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Rechercher une candidature</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Entreprise, ville ou immatriculation"
          value={query}
        />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <section className="operations-list" aria-labelledby="providers-title">
        <header>
          <div>
            <p className="eyebrow">File de controle</p>
            <h2 id="providers-title">Profils a verifier</h2>
          </div>
          <span>{visibleProviders.length} resultat(s)</span>
        </header>
        {visibleProviders.length ? (
          visibleProviders.map((provider) => (
            <article key={provider.id}>
              <span className="operation-icon">
                <ClipboardCheck aria-hidden="true" />
              </span>
              <div>
                <strong>{provider.businessName}</strong>
                <small>
                  {provider.city} · {provider.vehicleRegistration} ·{" "}
                  {provider.vehicleType === "tow_truck"
                    ? "Depanneuse"
                    : "Vehicule de service"}
                </small>
                <small>{provider.serviceIds.join(" · ")}</small>
              </div>
              {rejectingId === provider.id ? (
                <div className="admin-rejection">
                  <label>
                    Motif du rejet
                    <textarea
                      autoFocus
                      maxLength={300}
                      onChange={(event) =>
                        setRejectionReason(event.target.value)
                      }
                      rows={2}
                      value={rejectionReason}
                    />
                  </label>
                  <div>
                    <button
                      disabled={
                        pendingId === provider.id || !rejectionReason.trim()
                      }
                      onClick={() => void decide(provider.id, "rejected")}
                      type="button"
                    >
                      {pendingId === provider.id ? (
                        <LoaderCircle className="spinner" aria-hidden="true" />
                      ) : (
                        <XCircle aria-hidden="true" />
                      )}
                      Confirmer le rejet
                    </button>
                    <button
                      disabled={pendingId === provider.id}
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason("");
                      }}
                      type="button"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              ) : (
                <div className="operation-actions">
                  <button
                    disabled={pendingId === provider.id}
                    onClick={() => void decide(provider.id, "verified")}
                    type="button"
                  >
                    {pendingId === provider.id ? (
                      <LoaderCircle className="spinner" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 aria-hidden="true" />
                    )}
                    Valider
                  </button>
                  <button
                    disabled={pendingId === provider.id}
                    onClick={() => setRejectingId(provider.id)}
                    type="button"
                  >
                    <XCircle aria-hidden="true" /> Rejeter
                  </button>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="admin-empty">
            <CheckCircle2 aria-hidden="true" />
            <h3>Aucune candidature a traiter</h3>
            <p>Les nouveaux dossiers apparaitront dans cette file.</p>
          </div>
        )}
      </section>
    </div>
  );
}
