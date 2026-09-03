import { describe, expect, it, vi } from "vitest";
import {
  acceptOffer,
  type OfferAcceptanceRepository,
} from "@/modules/offers/application/accept-offer";

const clientId = "550e8400-e29b-41d4-a716-446655440000";
const offerId = "b99f30e7-7569-45c0-ae06-67cfacc37d1a";

describe("acceptOffer", () => {
  it("accepts an offer for the authenticated client", async () => {
    const repository: OfferAcceptanceRepository = {
      accept: vi.fn().mockResolvedValue({
        id: "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd",
        requestId: "1a5c9d02-b7ec-4a09-a036-3a1ccb701922",
        offerId,
      }),
    };

    await expect(acceptOffer(clientId, offerId, repository)).resolves.toEqual({
      id: "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd",
      requestId: "1a5c9d02-b7ec-4a09-a036-3a1ccb701922",
      offerId,
    });
    expect(repository.accept).toHaveBeenCalledWith(clientId, offerId);
  });

  it("rejects invalid identifiers before accessing the repository", async () => {
    const repository: OfferAcceptanceRepository = {
      accept: vi.fn(),
    };

    await expect(acceptOffer("invalid", offerId, repository)).rejects.toThrow();
    expect(repository.accept).not.toHaveBeenCalled();
  });
});
