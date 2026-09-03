import { describe, expect, it, vi } from "vitest";
import {
  submitOffer,
  type OfferRepository,
} from "@/modules/offers/application/submit-offer";

const providerId = "2ed9fc21-3f73-4410-b029-46dd17a1a886";
const requestId = "2ed9fc21-3f73-4410-b029-46dd17a1a887";

describe("submitOffer", () => {
  it("stores a validated offer in minor currency units", async () => {
    const submit = vi
      .fn()
      .mockResolvedValue("2ed9fc21-3f73-4410-b029-46dd17a1a888");
    const repository: OfferRepository = {
      findByRequest: vi.fn(),
      submit,
    };

    const result = await submitOffer(
      providerId,
      {
        requestId,
        amountMinor: 35_000,
        etaMinutes: 25,
        message: "Je peux arriver avec une roue de secours.",
      },
      repository,
    );

    expect(result.amountMinor).toBe(35_000);
    expect(submit).toHaveBeenCalledWith(providerId, {
      requestId,
      amountMinor: 35_000,
      etaMinutes: 25,
      message: "Je peux arriver avec une roue de secours.",
    });
  });

  it.each([
    { amountMinor: 4_999, etaMinutes: 25 },
    { amountMinor: 35_000, etaMinutes: 4 },
    { amountMinor: 500_001, etaMinutes: 25 },
    { amountMinor: 35_000, etaMinutes: 241 },
  ])("rejects an offer outside operational limits", async (values) => {
    const submit = vi.fn();
    const repository: OfferRepository = {
      findByRequest: vi.fn(),
      submit,
    };

    await expect(
      submitOffer(
        providerId,
        { requestId, message: "", ...values },
        repository,
      ),
    ).rejects.toThrow();
    expect(submit).not.toHaveBeenCalled();
  });
});
