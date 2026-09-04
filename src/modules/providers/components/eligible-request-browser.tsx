"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Camera, Clock3, MapPin, Search } from "lucide-react";
import type { EligibleRequest } from "../application/list-eligible-requests";
import {
  serviceCategories,
  type ServiceCategoryId,
} from "@/modules/requests/domain/service-catalog";

type UrgencyFilter = "all" | EligibleRequest["urgency"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(value));
}

export function EligibleRequestBrowser({
  requests,
}: {
  requests: EligibleRequest[];
}) {
  const [query, setQuery] = useState("");
  const [service, setService] = useState<"all" | ServiceCategoryId>("all");
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const visibleRequests = requests.filter((request) => {
    const matchesQuery =
      request.vehicle.make.toLowerCase().includes(deferredQuery) ||
      request.vehicle.model.toLowerCase().includes(deferredQuery) ||
      request.description.toLowerCase().includes(deferredQuery);
    return (
      matchesQuery &&
      (service === "all" || request.service === service) &&
      (urgency === "all" || request.urgency === urgency)
    );
  });

  return (
    <>
      <div className="provider-request-filters">
        <label className="provider-request-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Rechercher une demande</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Vehicule ou panne"
            value={query}
          />
        </label>
        <label>
          <span>Service</span>
          <select
            onChange={(event) =>
              setService(event.target.value as "all" | ServiceCategoryId)
            }
            value={service}
          >
            <option value="all">Tous</option>
            {serviceCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Urgence</span>
          <select
            onChange={(event) =>
              setUrgency(event.target.value as UrgencyFilter)
            }
            value={urgency}
          >
            <option value="all">Toutes</option>
            <option value="now">Maintenant</option>
            <option value="today">Aujourd&apos;hui</option>
          </select>
        </label>
      </div>

      <p className="provider-filter-count" aria-live="polite">
        {visibleRequests.length} demande(s) affichee(s)
      </p>

      {visibleRequests.length ? (
        <ul className="provider-request-list">
          {visibleRequests.map((request) => {
            const requestService = serviceCategories.find(
              (item) => item.id === request.service,
            );
            return (
              <li key={request.id}>
                <Link href={`/pro/demandes/${request.id}`}>
                  <div className="provider-request-title">
                    <span>{requestService?.label}</span>
                    <time dateTime={request.publishedAt}>
                      {formatDate(request.publishedAt)}
                    </time>
                  </div>
                  <h2>
                    {request.vehicle.make} {request.vehicle.model}
                  </h2>
                  <p>{request.description}</p>
                  <div className="provider-request-meta">
                    <span>
                      <MapPin aria-hidden="true" /> {request.city}
                    </span>
                    <span>
                      <Clock3 aria-hidden="true" />
                      {request.urgency === "now" ? "Maintenant" : "Aujourd'hui"}
                    </span>
                    <span>
                      <Camera aria-hidden="true" /> {request.photoCount}{" "}
                      photo(s)
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="requests-empty compact">
          <Search aria-hidden="true" />
          <h2>Aucune demande correspondante</h2>
          <p>Modifiez les filtres pour afficher d&apos;autres demandes.</p>
        </div>
      )}
    </>
  );
}
