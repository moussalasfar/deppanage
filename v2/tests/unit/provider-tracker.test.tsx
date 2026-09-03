// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProviderTracker } from "@/modules/interventions/components/provider-tracker";

describe("ProviderTracker", () => {
  it("presents the active route and supports map controls", () => {
    render(
      <ProviderTracker
        city="Rabat"
        etaMinutes={18}
        providerName="Atlas Assistance"
        status="en_route"
      />,
    );

    expect(screen.getByText("Atlas Assistance se rapproche")).toBeVisible();
    expect(screen.getByText("Arrivee estimee dans 18 minutes.")).toBeVisible();
    expect(screen.getByRole("img")).toHaveClass("zoom-1");

    fireEvent.click(screen.getByRole("button", { name: "Zoom avant" }));
    expect(screen.getByRole("img")).toHaveClass("zoom-2");
    expect(screen.getByRole("button", { name: "Zoom avant" })).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Recentrer le trajet" }),
    );
    expect(screen.getByRole("img")).toHaveClass("zoom-1");
  });

  it("keeps the last known position visible when connectivity is lost", () => {
    render(
      <ProviderTracker
        city="Casablanca"
        etaMinutes={12}
        providerName="Casa Secours"
        status="assigned"
      />,
    );

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });
    fireEvent(window, new Event("offline"));

    expect(
      screen.getByText("Hors connexion - derniere position conservee"),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Apercu du trajet vers Casablanca" }),
    ).toBeVisible();
  });
});
