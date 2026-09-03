import { describe, expect, it, vi } from "vitest";
import {
  ProviderAlreadyVerifiedError,
  submitProviderApplication,
  type ProviderProfileRepository,
} from "@/modules/providers/application/submit-provider-application";

const userId = "2ed9fc21-3f73-4410-b029-46dd17a1a886";

describe("submitProviderApplication", () => {
  it("validates and stores a pending application", async () => {
    const savePending = vi.fn().mockResolvedValue(undefined);
    const repository: ProviderProfileRepository = {
      findByUserId: vi.fn().mockResolvedValue(null),
      savePending,
    };
    const input = {
      businessName: "Assistance Atlas",
      city: "Rabat",
      vehicleType: "tow_truck",
      vehicleRegistration: "12345-A-6",
      serviceIds: ["towing", "tire"],
    };

    await expect(
      submitProviderApplication(userId, input, repository),
    ).resolves.toEqual(input);
    expect(savePending).toHaveBeenCalledWith(userId, input);
  });

  it("rejects invalid input before storage", async () => {
    const savePending = vi.fn();
    const repository: ProviderProfileRepository = {
      findByUserId: vi.fn(),
      savePending,
    };

    await expect(
      submitProviderApplication(userId, { businessName: "A" }, repository),
    ).rejects.toThrow();
    expect(savePending).not.toHaveBeenCalled();
  });

  it("does not reset an already verified profile", async () => {
    const savePending = vi.fn();
    const repository: ProviderProfileRepository = {
      findByUserId: vi.fn().mockResolvedValue({
        userId,
        businessName: "Assistance Atlas",
        city: "Rabat",
        vehicleType: "tow_truck",
        vehicleRegistration: "12345-A-6",
        serviceIds: ["towing"],
        verificationStatus: "verified",
      }),
      savePending,
    };

    await expect(
      submitProviderApplication(
        userId,
        {
          businessName: "Assistance Atlas",
          city: "Rabat",
          vehicleType: "tow_truck",
          vehicleRegistration: "12345-A-6",
          serviceIds: ["towing"],
        },
        repository,
      ),
    ).rejects.toBeInstanceOf(ProviderAlreadyVerifiedError);
    expect(savePending).not.toHaveBeenCalled();
  });
});
