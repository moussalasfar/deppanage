import { describe, expect, it } from "vitest";
import { assertInterventionCancellation } from "@/modules/interventions/domain/intervention-cancellation";

describe("intervention cancellation", () => {
  it("allows each participant to use an authorized reason", () => {
    expect(() =>
      assertInterventionCancellation(
        "client",
        "en_route",
        "client_changed_mind",
      ),
    ).not.toThrow();
    expect(() =>
      assertInterventionCancellation(
        "provider",
        "assigned",
        "provider_vehicle_issue",
      ),
    ).not.toThrow();
  });

  it("allows a provider to report a no-show only after arrival", () => {
    expect(() =>
      assertInterventionCancellation("provider", "arrived", "client_no_show"),
    ).not.toThrow();
    expect(() =>
      assertInterventionCancellation("provider", "en_route", "client_no_show"),
    ).toThrow("NO_SHOW_REQUIRES_ARRIVAL");
  });

  it("rejects a reason belonging to the other participant", () => {
    expect(() =>
      assertInterventionCancellation("client", "assigned", "unsafe_location"),
    ).toThrow("INVALID_CANCELLATION_REASON");
  });

  it.each(["completed", "cancelled"] as const)(
    "rejects cancellation of a %s intervention",
    (status) => {
      expect(() =>
        assertInterventionCancellation("client", status, "problem_resolved"),
      ).toThrow("INTERVENTION_ALREADY_CLOSED");
    },
  );
});
