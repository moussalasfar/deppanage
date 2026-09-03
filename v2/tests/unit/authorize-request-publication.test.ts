import { describe, expect, it, vi } from "vitest";
import {
  authorizeRequestPublication,
  RequestPublicationForbiddenError,
  type RequestPublicationOwnershipRepository,
} from "@/modules/requests/application/authorize-request-publication";

const requestId = "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd";
const userId = "550e8400-e29b-41d4-a716-446655440000";

describe("authorizeRequestPublication", () => {
  it("allows the authenticated owner", async () => {
    const repository: RequestPublicationOwnershipRepository = {
      isOwnedByUser: vi.fn().mockResolvedValue(true),
    };

    await expect(
      authorizeRequestPublication(requestId, userId, repository),
    ).resolves.toBeUndefined();
    expect(repository.isOwnedByUser).toHaveBeenCalledWith(requestId, userId);
  });

  it("hides a request owned by another user", async () => {
    const repository: RequestPublicationOwnershipRepository = {
      isOwnedByUser: vi.fn().mockResolvedValue(false),
    };

    await expect(
      authorizeRequestPublication(requestId, userId, repository),
    ).rejects.toBeInstanceOf(RequestPublicationForbiddenError);
  });
});
