import { z } from "zod";

export const submitOfferSchema = z.object({
  requestId: z.uuid(),
  amountMinor: z.number().int().min(5_000).max(500_000),
  etaMinutes: z.number().int().min(5).max(240),
  message: z.string().trim().max(240).optional().default(""),
});

export type SubmitOfferInput = z.infer<typeof submitOfferSchema>;
