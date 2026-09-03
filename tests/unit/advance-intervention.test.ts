import { describe, expect, it, vi } from "vitest";
import {
  advanceIntervention,
  type InterventionCommandRepository,
} from "@/modules/interventions/application/advance-intervention";

const providerId = "550e8400-e29b-41d4-a716-446655440000";
const interventionId = "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd";

describe("advanceIntervention", () => {
  it("delegates a validated transition", async () => {
    const repository: InterventionCommandRepository = {
      advance: vi.fn().mockResolvedValue("en_route"),
    };

    await expect(
      advanceIntervention(providerId, interventionId, "en_route", repository),
    ).resolves.toBe("en_route");
    expect(repository.advance).toHaveBeenCalledWith(
      providerId,
      interventionId,
      "en_route",
    );
  });

  it("rejects an unknown status before accessing the repository", async () => {
    const repository: InterventionCommandRepository = {
      advance: vi.fn(),
    };

    await expect(
      advanceIntervention(providerId, interventionId, "paid", repository),
    ).rejects.toThrow();
    expect(repository.advance).not.toHaveBeenCalled();
  });
});
