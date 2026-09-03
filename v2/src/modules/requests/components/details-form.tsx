"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Clock3,
  LoaderCircle,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import {
  acceptedPhotoTypes,
  maxRequestPhotoBytes,
  maxRequestPhotos,
} from "../domain/request-draft";

type DetailsFormProps = { requestId: string };
type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; photoCount: number }
  | { status: "error"; message: string };

export function DetailsForm({ requestId }: DetailsFormProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [state, setState] = useState<FormState>({ status: "idle" });

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const nextPhotos = [...photos, ...selected];
    const invalidPhoto = nextPhotos.find(
      (photo) =>
        !acceptedPhotoTypes.includes(
          photo.type as (typeof acceptedPhotoTypes)[number],
        ) || photo.size > maxRequestPhotoBytes,
    );

    if (nextPhotos.length > maxRequestPhotos || invalidPhoto) {
      setState({
        status: "error",
        message:
          "Ajoutez au maximum 3 images JPEG, PNG ou WebP de moins de 5 Mo.",
      });
      event.target.value = "";
      return;
    }

    setPhotos(nextPhotos);
    setState({ status: "idle" });
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });
    const formData = new FormData(event.currentTarget);
    photos.forEach((photo) => formData.append("photos", photo));

    const response = await fetch(`/api/requests/${requestId}/details`, {
      method: "PATCH",
      body: formData,
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
          result.error?.message ??
          "Les details ne peuvent pas etre enregistres.",
      });
      return;
    }

    router.push(`/demander/${requestId}/verification`);
  }

  const isSubmitting = state.status === "submitting";

  return (
    <form className="details-form" onSubmit={handleSubmit}>
      <label className="description-field">
        Decrivez ce que vous observez
        <textarea
          maxLength={500}
          minLength={10}
          name="description"
          placeholder="Ex. le pneu avant droit est degonfle et je n'ai pas de roue de secours..."
          required
          rows={5}
        />
        <small>
          10 a 500 caracteres. Ne partagez aucune donnee personnelle.
        </small>
      </label>

      <fieldset>
        <legend>
          <Clock3 aria-hidden="true" /> Quand avez-vous besoin
          d&apos;aide&nbsp;?
        </legend>
        <div className="choice-grid two-columns">
          <label>
            <input defaultChecked name="urgency" type="radio" value="now" />
            <span>
              <strong>Maintenant</strong>
              <small>Le vehicule est immobilise</small>
            </span>
          </label>
          <label>
            <input name="urgency" type="radio" value="today" />
            <span>
              <strong>Aujourd&apos;hui</strong>
              <small>Intervention moins urgente</small>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <ShieldAlert aria-hidden="true" /> Votre situation actuelle
        </legend>
        <div className="choice-grid three-columns">
          <label>
            <input
              defaultChecked
              name="safetyStatus"
              type="radio"
              value="safe"
            />
            <span>
              <strong>En securite</strong>
              <small>Lieu protege</small>
            </span>
          </label>
          <label>
            <input name="safetyStatus" type="radio" value="roadside" />
            <span>
              <strong>Bas-cote</strong>
              <small>Pres de la circulation</small>
            </span>
          </label>
          <label className="danger-choice">
            <input name="safetyStatus" type="radio" value="danger" />
            <span>
              <strong>En danger</strong>
              <small>Situation immediate</small>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="photo-field">
        <span className="field-label">Photos facultatives</span>
        <label className="photo-picker">
          <Camera aria-hidden="true" />
          <span>
            <strong>Ajouter des photos</strong>
            <small>3 maximum, 5 Mo chacune</small>
          </span>
          <input
            accept={acceptedPhotoTypes.join(",")}
            disabled={photos.length >= maxRequestPhotos}
            multiple
            onChange={selectPhotos}
            type="file"
          />
        </label>
        {photos.length ? (
          <ul className="photo-list">
            {photos.map((photo, index) => (
              <li key={`${photo.name}-${photo.lastModified}`}>
                <span>
                  <Camera aria-hidden="true" /> {photo.name}
                </span>
                <button
                  aria-label={`Supprimer ${photo.name}`}
                  onClick={() =>
                    setPhotos((items) =>
                      items.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enregistrement..." : "Verifier ma demande"}
        {isSubmitting ? (
          <LoaderCircle className="spinner" aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
