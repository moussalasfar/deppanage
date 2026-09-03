"use client";

import { useState } from "react";
import { Check, FileCheck2, Upload } from "lucide-react";

const requiredDocuments = [
  {
    id: "identity",
    label: "Carte d'identite nationale",
    hint: "Recto et verso lisibles",
  },
  {
    id: "license",
    label: "Permis de conduire",
    hint: "Document en cours de validite",
  },
  {
    id: "registration",
    label: "Carte grise",
    hint: "Vehicule utilise pour les missions",
  },
  {
    id: "insurance",
    label: "Attestation d'assurance",
    hint: "Couverture professionnelle valide",
  },
] as const;

export function VerificationChecklist() {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const complete = requiredDocuments.every((document) => files[document.id]);

  if (submitted) {
    return (
      <section className="completion-state" role="status">
        <FileCheck2 aria-hidden="true" />
        <p className="eyebrow">Dossier transmis</p>
        <h2>Verification en cours</h2>
        <p>
          Les quatre documents seront controles manuellement avant
          l&apos;activation du profil.
        </p>
      </section>
    );
  }

  return (
    <div className="verification-checklist">
      <ol>
        {requiredDocuments.map((document, index) => (
          <li
            className={files[document.id] ? "complete" : ""}
            key={document.id}
          >
            <span className="document-step">
              {files[document.id] ? <Check aria-hidden="true" /> : index + 1}
            </span>
            <div>
              <strong>{document.label}</strong>
              <small>{files[document.id] || document.hint}</small>
            </div>
            <label>
              <Upload aria-hidden="true" />
              <span>{files[document.id] ? "Remplacer" : "Ajouter"}</span>
              <input
                accept="image/jpeg,image/png,application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file)
                    setFiles((current) => ({
                      ...current,
                      [document.id]: file.name,
                    }));
                }}
                type="file"
              />
            </label>
          </li>
        ))}
      </ol>
      <div className="verification-consent">
        <label>
          <input required type="checkbox" />
          Je certifie que ces documents sont valides et m&apos;appartiennent.
        </label>
        <button
          className="primary-action"
          disabled={!complete}
          onClick={() => setSubmitted(true)}
          type="button"
        >
          Envoyer le dossier <FileCheck2 aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
