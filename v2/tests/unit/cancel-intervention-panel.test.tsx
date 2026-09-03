// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CancelInterventionPanel } from "@/modules/interventions/components/cancel-intervention-panel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("CancelInterventionPanel", () => {
  it("requires a reason and explicit confirmation before cancellation", () => {
    render(
      <CancelInterventionPanel
        interventionId="intervention-id"
        participantRole="client"
        status="en_route"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Annuler l'intervention" }),
    );
    const submit = screen.getByRole("button", {
      name: "Confirmer l'annulation",
    });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Motif"), {
      target: { value: "provider_late" },
    });
    expect(submit).toBeDisabled();

    fireEvent.click(
      screen.getByLabelText("Je confirme vouloir annuler cette intervention."),
    );
    expect(submit).toBeEnabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Conserver l'intervention" }),
    );
    expect(
      screen.getByRole("button", { name: "Annuler l'intervention" }),
    ).toBeVisible();
  });
});
