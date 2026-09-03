import { describe, expect, it } from "vitest";
import {
  assertInterventionTransition,
  getNextInterventionStatus,
} from "@/modules/interventions/domain/intervention-status";

describe("intervention status", () => {
  it.each([
    ["assigned", "en_route"],
    ["en_route", "arrived"],
    ["arrived", "completed"],
  ] as const)("allows %s to become %s", (currentStatus, nextStatus) => {
    expect(getNextInterventionStatus(currentStatus)).toBe(nextStatus);
    expect(() =>
      assertInterventionTransition(currentStatus, nextStatus),
    ).not.toThrow();
  });

  it.each(["completed", "cancelled"] as const)(
    "treats %s as terminal",
    (status) => {
      expect(getNextInterventionStatus(status)).toBeNull();
    },
  );

  it("rejects skipped and reversed transitions", () => {
    expect(() => assertInterventionTransition("assigned", "arrived")).toThrow(
      "INVALID_INTERVENTION_TRANSITION",
    );
    expect(() => assertInterventionTransition("arrived", "en_route")).toThrow(
      "INVALID_INTERVENTION_TRANSITION",
    );
  });
});
