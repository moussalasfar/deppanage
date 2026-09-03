import { z } from "zod";

export const providerVerificationDecisionSchema = z
  .object({
    status: z.enum(["verified", "rejected"]),
    reason: z.string().trim().max(300).optional(),
  })
  .superRefine((decision, context) => {
    if (decision.status === "rejected" && !decision.reason) {
      context.addIssue({
        code: "custom",
        message: "A rejection reason is required",
        path: ["reason"],
      });
    }
  });

export type ProviderVerificationDecision = z.infer<
  typeof providerVerificationDecisionSchema
>;

export type PendingProvider = {
  id: string;
  businessName: string;
  city: "Casablanca" | "Rabat";
  vehicleType: "tow_truck" | "service_vehicle";
  vehicleRegistration: string;
  serviceIds: string[];
  submittedAt: string;
};
