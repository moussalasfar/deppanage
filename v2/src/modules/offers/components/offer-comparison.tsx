"use client";

import { useState } from "react";
import {
  ArrowDownUp,
  BadgeCheck,
  Banknote,
  ChevronDown,
  Clock3,
  Truck,
} from "lucide-react";
import type { ClientOffer } from "@/modules/offers/application/list-client-offers";
import { AcceptOfferButton } from "@/modules/offers/components/accept-offer-button";

type SortMode = "recommended" | "price" | "eta";

function formatPrice(amountMinor: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export function OfferComparison({ offers }: { offers: ClientOffer[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const lowestPrice = Math.min(...offers.map((offer) => offer.amountMinor));
  const shortestEta = Math.min(...offers.map((offer) => offer.etaMinutes));
  const sortedOffers = [...offers].sort((left, right) => {
    if (sortMode === "price") return left.amountMinor - right.amountMinor;
    if (sortMode === "eta") return left.etaMinutes - right.etaMinutes;

    const leftScore =
      left.amountMinor / lowestPrice + left.etaMinutes / shortestEta;
    const rightScore =
      right.amountMinor / lowestPrice + right.etaMinutes / shortestEta;
    return leftScore - rightScore;
  });

  return (
    <div className="offer-comparison">
      <div className="offer-comparison-toolbar">
        <span>
          <ArrowDownUp aria-hidden="true" /> Trier les offres
        </span>
        <div className="offer-sort-options" role="group" aria-label="Tri">
          <button
            aria-pressed={sortMode === "recommended"}
            onClick={() => setSortMode("recommended")}
            type="button"
          >
            <BadgeCheck aria-hidden="true" /> Recommandee
          </button>
          <button
            aria-pressed={sortMode === "price"}
            onClick={() => setSortMode("price")}
            type="button"
          >
            <Banknote aria-hidden="true" /> Prix
          </button>
          <button
            aria-pressed={sortMode === "eta"}
            onClick={() => setSortMode("eta")}
            type="button"
          >
            <Clock3 aria-hidden="true" /> Arrivee
          </button>
        </div>
      </div>

      <ul className="client-offer-list">
        {sortedOffers.map((offer, index) => {
          const isExpanded = expandedOfferId === offer.id;
          return (
            <li className={index === 0 ? "recommended" : ""} key={offer.id}>
              <div className="client-offer-provider">
                <span>
                  <Truck aria-hidden="true" />
                </span>
                <div>
                  <div className="offer-badges">
                    {index === 0 ? <em>Premier choix</em> : null}
                    {offer.amountMinor === lowestPrice ? (
                      <small>Meilleur prix</small>
                    ) : null}
                    {offer.etaMinutes === shortestEta ? (
                      <small>Plus rapide</small>
                    ) : null}
                  </div>
                  <h2>{offer.providerName}</h2>
                  <p>Professionnel verifie</p>
                </div>
              </div>
              <div className="client-offer-terms">
                <strong>{formatPrice(offer.amountMinor)}</strong>
                <span>
                  <Clock3 aria-hidden="true" /> Environ {offer.etaMinutes} min
                </span>
                <button
                  aria-expanded={isExpanded}
                  className="offer-details-toggle"
                  onClick={() =>
                    setExpandedOfferId(isExpanded ? null : offer.id)
                  }
                  type="button"
                >
                  Voir les details <ChevronDown aria-hidden="true" />
                </button>
              </div>
              <AcceptOfferButton offerId={offer.id} />
              {isExpanded ? (
                <div className="offer-details">
                  <span>
                    <Truck aria-hidden="true" />
                    {offer.providerVehicleType === "tow_truck"
                      ? "Depanneuse equipee"
                      : "Vehicule de service"}
                  </span>
                  <p>
                    {offer.message ||
                      "Le professionnel n'a pas ajoute de message."}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
