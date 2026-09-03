"use client";

import { useState } from "react";
import {
  ArrowRight,
  BatteryCharging,
  CircleDot,
  LocateFixed,
  Truck,
  Wrench,
} from "lucide-react";
import type {
  ServiceCategory,
  ServiceCategoryId,
} from "@/modules/requests/domain/service-catalog";

const serviceIcons = {
  battery: BatteryCharging,
  tire: CircleDot,
  towing: Truck,
  other: Wrench,
} as const;

type ServiceSelectorProps = {
  services: readonly [ServiceCategory, ...ServiceCategory[]];
};

export function ServiceSelector({ services }: ServiceSelectorProps) {
  const [selectedService, setSelectedService] = useState<ServiceCategoryId>(
    services[0].id,
  );

  return (
    <form action="/demander" className="request-form">
      <fieldset>
        <legend>Type de probleme</legend>
        <div className="service-grid">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon];
            const isSelected = selectedService === service.id;

            return (
              <label
                className="service-option"
                data-selected={isSelected}
                key={service.id}
              >
                <input
                  checked={isSelected}
                  name="service"
                  onChange={() => setSelectedService(service.id)}
                  type="radio"
                  value={service.id}
                />
                <Icon aria-hidden="true" />
                <span>{service.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button className="location-button" type="button">
        <span className="location-icon">
          <LocateFixed aria-hidden="true" />
        </span>
        <span>
          <strong>Utiliser ma position</strong>
          <small>Pour trouver les depanneurs les plus proches</small>
        </span>
        <ArrowRight aria-hidden="true" />
      </button>

      <button className="primary-action" type="submit">
        Demander un depanneur
        <ArrowRight aria-hidden="true" />
      </button>
      <a className="provider-link" href="/pro/inscription">
        Vous etes depanneur&nbsp;? <strong>Rejoindre le reseau</strong>
      </a>
    </form>
  );
}
