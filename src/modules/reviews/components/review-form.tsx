"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Star } from "lucide-react";

const reviewTags = [
  "Ponctuel",
  "Professionnel",
  "Prix respecte",
  "Communication claire",
  "Vehicule propre",
];

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating) setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="completion-state" role="status">
        <CheckCircle2 aria-hidden="true" />
        <p className="eyebrow">Avis envoye</p>
        <h2>Merci pour votre retour</h2>
        <p>Votre avis sera associe uniquement a cette intervention terminee.</p>
      </section>
    );
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <fieldset className="rating-control">
        <legend>Note globale</legend>
        <div>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              aria-label={`${value} etoile${value > 1 ? "s" : ""}`}
              aria-pressed={rating === value}
              className={value <= rating ? "active" : ""}
              key={value}
              onClick={() => setRating(value)}
              type="button"
            >
              <Star aria-hidden="true" />
            </button>
          ))}
        </div>
        <p aria-live="polite">
          {rating ? `${rating} sur 5` : "Selectionnez une note"}
        </p>
      </fieldset>
      <fieldset className="review-tags">
        <legend>Ce qui vous a satisfait</legend>
        <div>
          {reviewTags.map((tag) => (
            <label key={tag} className={tags.includes(tag) ? "selected" : ""}>
              <input
                checked={tags.includes(tag)}
                onChange={(event) =>
                  setTags(
                    event.target.checked
                      ? [...tags, tag]
                      : tags.filter((item) => item !== tag),
                  )
                }
                type="checkbox"
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="review-comment">
        Commentaire
        <textarea
          maxLength={500}
          name="comment"
          placeholder="Decrivez votre experience..."
          rows={5}
        />
      </label>
      <button className="primary-action" disabled={!rating} type="submit">
        Publier mon avis <Star aria-hidden="true" />
      </button>
    </form>
  );
}
