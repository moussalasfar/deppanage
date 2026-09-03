import { describe, expect, it, vi } from "vitest";
import {
  AnonymousSessionRequiredError,
  claimSessionRequests,
  type RequestOwnershipRepository,
} from "@/modules/requests/application/claim-session-requests";

const userId = "2ed9fc21-3f73-4410-b029-46dd17a1a886";

describe("claimSessionRequests", () => {
  it("claims requests for the authenticated user", async () => {
    const claimUnownedBySession = vi.fn().mockResolvedValue(2);
    const repository: RequestOwnershipRepository = {
      claimUnownedBySession,
    };

    await expect(
      claimSessionRequests("session-1", userId, repository),
    ).resolves.toBe(2);
    expect(claimUnownedBySession).toHaveBeenCalledWith("session-1", userId);
  });

  it("requires an anonymous session", async () => {
    const repository: RequestOwnershipRepository = {
      claimUnownedBySession: vi.fn(),
    };

    await expect(
      claimSessionRequests(undefined, userId, repository),
    ).rejects.toBeInstanceOf(AnonymousSessionRequiredError);
  });

  it("rejects an invalid authenticated user id", async () => {
    const repository: RequestOwnershipRepository = {
      claimUnownedBySession: vi.fn(),
    };

    await expect(
      claimSessionRequests("session-1", "not-a-uuid", repository),
    ).rejects.toThrow();
  });
});
