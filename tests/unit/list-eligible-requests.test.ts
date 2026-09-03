import { describe, expect, it, vi } from "vitest";
import {
  listEligibleRequests,
  type EligibleRequestRepository,
} from "@/modules/providers/application/list-eligible-requests";

const userId = "2ed9fc21-3f73-4410-b029-46dd17a1a886";

describe("listEligibleRequests", () => {
  it("returns the newest published request first", async () => {
    const repository: EligibleRequestRepository = {
      findForVerifiedProvider: vi.fn().mockResolvedValue([
        {
          id: "2ed9fc21-3f73-4410-b029-46dd17a1a887",
          service: "tire",
          vehicle: { make: "Dacia", model: "Logan" },
          city: "Rabat",
          description: "Le pneu avant droit est completement degonfle.",
          urgency: "now",
          safetyStatus: "roadside",
          photoCount: 1,
          publishedAt: "2026-09-01T10:00:00.000Z",
        },
        {
          id: "2ed9fc21-3f73-4410-b029-46dd17a1a888",
          service: "battery",
          vehicle: { make: "Renault", model: "Clio" },
          city: "Rabat",
          description: "Le moteur ne demarre plus depuis ce matin.",
          urgency: "today",
          safetyStatus: "safe",
          photoCount: 0,
          publishedAt: "2026-09-02T10:00:00.000Z",
        },
      ]),
    };

    const result = await listEligibleRequests(userId, repository);
    expect(result.map((request) => request.service)).toEqual([
      "battery",
      "tire",
    ]);
  });

  it("rejects an invalid provider id before querying", async () => {
    const findForVerifiedProvider = vi.fn();
    const repository: EligibleRequestRepository = {
      findForVerifiedProvider,
    };

    await expect(listEligibleRequests("invalid", repository)).rejects.toThrow();
    expect(findForVerifiedProvider).not.toHaveBeenCalled();
  });
});
