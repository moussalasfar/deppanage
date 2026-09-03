import { describe, expect, it, vi } from "vitest";
import {
  listMessages,
  type MessageQueryRepository,
} from "@/modules/messaging/application/list-messages";

const participantId = "550e8400-e29b-41d4-a716-446655440000";
const interventionId = "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd";

describe("listMessages", () => {
  it("queries messages for a validated intervention", async () => {
    const repository: MessageQueryRepository = {
      findByIntervention: vi.fn().mockResolvedValue([]),
    };

    await expect(
      listMessages(participantId, interventionId, repository),
    ).resolves.toEqual([]);
    expect(repository.findByIntervention).toHaveBeenCalledWith(interventionId);
  });

  it("rejects invalid identifiers before accessing the repository", async () => {
    const repository: MessageQueryRepository = {
      findByIntervention: vi.fn(),
    };

    await expect(
      listMessages(participantId, "invalid", repository),
    ).rejects.toThrow();
    expect(repository.findByIntervention).not.toHaveBeenCalled();
  });
});
