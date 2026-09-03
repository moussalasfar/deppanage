import { describe, expect, it, vi } from "vitest";
import {
  cancelIntervention,
  type InterventionCancellationRepository,
} from "@/modules/interventions/application/cancel-intervention";

const participantId = "550e8400-e29b-41d4-a716-446655440000";
const interventionId = "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd";

describe("cancelIntervention", () => {
  it("delegates a validated cancellation", async () => {
    const repository: InterventionCancellationRepository = {
      cancel: vi.fn().mockResolvedValue("cancelled"),
    };

    await expect(
      cancelIntervention(
        participantId,
        interventionId,
        "problem_resolved",
        repository,
      ),
    ).resolves.toBe("cancelled");
    expect(repository.cancel).toHaveBeenCalledWith(
      participantId,
      interventionId,
      "problem_resolved",
    );
  });

  it("rejects an unknown reason before accessing the repository", async () => {
    const repository: InterventionCancellationRepository = {
      cancel: vi.fn(),
    };

    await expect(
      cancelIntervention(participantId, interventionId, "other", repository),
    ).rejects.toThrow();
    expect(repository.cancel).not.toHaveBeenCalled();
  });
});
