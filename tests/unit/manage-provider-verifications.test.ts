import { describe, expect, it, vi } from "vitest";
import {
  AdminAccessDeniedError,
  decideProviderVerification,
  listPendingProviders,
  type AdminProviderVerificationRepository,
} from "@/modules/admin/application/manage-provider-verifications";

const adminId = "550e8400-e29b-41d4-a716-446655440000";
const providerId = "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd";

function createRepository(
  isAdmin: boolean,
): AdminProviderVerificationRepository {
  return {
    isAdmin: vi.fn().mockResolvedValue(isAdmin),
    listPending: vi.fn().mockResolvedValue([]),
    decide: vi.fn().mockResolvedValue(undefined),
  };
}

describe("provider verification administration", () => {
  it("blocks a non-admin before reading applications", async () => {
    const repository = createRepository(false);

    await expect(listPendingProviders(adminId, repository)).rejects.toThrow(
      AdminAccessDeniedError,
    );
    expect(repository.listPending).not.toHaveBeenCalled();
  });

  it("validates a provider through an authorized repository", async () => {
    const repository = createRepository(true);

    await expect(
      decideProviderVerification(
        adminId,
        providerId,
        { status: "verified" },
        repository,
      ),
    ).resolves.toBe("verified");
    expect(repository.decide).toHaveBeenCalledWith(providerId, {
      status: "verified",
    });
  });

  it("rejects an incomplete rejection before changing the provider", async () => {
    const repository = createRepository(true);

    await expect(
      decideProviderVerification(
        adminId,
        providerId,
        { status: "rejected" },
        repository,
      ),
    ).rejects.toThrow();
    expect(repository.decide).not.toHaveBeenCalled();
  });
});
