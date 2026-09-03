import { z } from "zod";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";

const serviceIds = serviceCategories.map((service) => service.id) as [
  (typeof serviceCategories)[number]["id"],
  ...(typeof serviceCategories)[number]["id"][],
];

export const providerApplicationSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  city: z.enum(["Casablanca", "Rabat"]),
  vehicleType: z.enum(["tow_truck", "service_vehicle"]),
  vehicleRegistration: z.string().trim().min(3).max(20),
  serviceIds: z.array(z.enum(serviceIds)).min(1).max(serviceIds.length),
});

export type ProviderApplication = z.infer<typeof providerApplicationSchema>;
export type ProviderVerificationStatus = "pending" | "verified" | "rejected";
