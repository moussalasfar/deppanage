import { describe, expect, it, vi } from "vitest";
import {
  listClientOffers,
  type ClientOfferQueryRepository,
} from "@/modules/offers/application/list-client-offers";

const clientId = "550e8400-e29b-41d4-a716-446655440000";
const requestId = "1a5c9d02-b7ec-4a09-a036-3a1ccb701922";

describe("listClientOffers", () => {
  it("queries offers for a validated client request", async () => {
    const repository: ClientOfferQueryRepository = {
      findByClientRequest: vi.fn().mockResolvedValue([]),
    };

    await expect(
      listClientOffers(clientId, requestId, repository),
    ).resolves.toEqual([]);
    expect(repository.findByClientRequest).toHaveBeenCalledWith(requestId);
  });

  it("rejects invalid identifiers", async () => {
    const repository: ClientOfferQueryRepository = {
      findByClientRequest: vi.fn(),
    };

    await expect(
      listClientOffers(clientId, "invalid", repository),
    ).rejects.toThrow();
    expect(repository.findByClientRequest).not.toHaveBeenCalled();
  });
});
