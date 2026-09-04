// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EligibleRequestBrowser } from "@/modules/providers/components/eligible-request-browser";

const requests = [
  {
    id: "request-tire",
    service: "tire" as const,
    vehicle: { make: "Dacia", model: "Logan" },
    city: "Rabat" as const,
    description: "Pneu avant degonfle",
    urgency: "now" as const,
    safetyStatus: "roadside" as const,
    photoCount: 1,
    publishedAt: "2026-09-04T10:00:00.000Z",
  },
  {
    id: "request-battery",
    service: "battery" as const,
    vehicle: { make: "Renault", model: "Clio" },
    city: "Rabat" as const,
    description: "La voiture ne demarre plus",
    urgency: "today" as const,
    safetyStatus: "safe" as const,
    photoCount: 0,
    publishedAt: "2026-09-04T09:00:00.000Z",
  },
];

describe("EligibleRequestBrowser", () => {
  it("filters authorized requests by service and urgency", () => {
    render(<EligibleRequestBrowser requests={requests} />);

    expect(screen.getByText("Dacia Logan")).toBeVisible();
    expect(screen.getByText("Renault Clio")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Service"), {
      target: { value: "tire" },
    });
    expect(screen.getByText("Dacia Logan")).toBeVisible();
    expect(screen.queryByText("Renault Clio")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Urgence"), {
      target: { value: "today" },
    });
    expect(screen.getByText("Aucune demande correspondante")).toBeVisible();
  });
});
