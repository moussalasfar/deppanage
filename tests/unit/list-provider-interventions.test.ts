import { describe, expect, it, vi } from "vitest";
import {
  listProviderInterventions,
  type ProviderInterventionQueryRepository,
} from "@/modules/interventions/application/list-provider-interventions";

const providerId = "550e8400-e29b-41d4-a716-446655440000";

describe("listProviderInterventions", () => {
  it("queries interventions for a validated provider", async () => {
    const repository: ProviderInterventionQueryRepository = {
      findForProvider: vi.fn().mockResolvedValue([]),
    };

    await expect(
      listProviderInterventions(providerId, repository),
    ).resolves.toEqual([]);
    expect(repository.findForProvider).toHaveBeenCalledOnce();
  });

  it("rejects an invalid provider before accessing the repository", async () => {
    const repository: ProviderInterventionQueryRepository = {
      findForProvider: vi.fn(),
    };

    await expect(
      listProviderInterventions("invalid", repository),
    ).rejects.toThrow();
    expect(repository.findForProvider).not.toHaveBeenCalled();
  });
});
