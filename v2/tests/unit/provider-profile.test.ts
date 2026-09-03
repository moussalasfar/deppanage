import { describe, expect, it } from "vitest";
import { providerApplicationSchema } from "@/modules/providers/domain/provider-profile";

describe("providerApplicationSchema", () => {
  it("normalizes a valid provider application", () => {
    expect(
      providerApplicationSchema.parse({
        businessName: "  Assistance Atlas ",
        city: "Casablanca",
        vehicleType: "tow_truck",
        vehicleRegistration: " 12345-A-6 ",
        serviceIds: ["towing", "tire"],
      }),
    ).toEqual({
      businessName: "Assistance Atlas",
      city: "Casablanca",
      vehicleType: "tow_truck",
      vehicleRegistration: "12345-A-6",
      serviceIds: ["towing", "tire"],
    });
  });

  it("requires at least one supported service", () => {
    expect(() =>
      providerApplicationSchema.parse({
        businessName: "Assistance Atlas",
        city: "Casablanca",
        vehicleType: "tow_truck",
        vehicleRegistration: "12345-A-6",
        serviceIds: [],
      }),
    ).toThrow();
  });
});
