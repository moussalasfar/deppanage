import { z } from "zod";
import { submitOfferSchema, type SubmitOfferInput } from "../domain/offer";

export type ProviderOffer = SubmitOfferInput & {
  id: string;
  status: "submitted" | "accepted" | "rejected" | "withdrawn" | "expired";
  expiresAt: string;
};

export interface OfferRepository {
  findByRequest(requestId: string): Promise<ProviderOffer | null>;
  submit(providerId: string, input: SubmitOfferInput): Promise<string>;
}

export async function submitOffer(
  providerId: string,
  input: unknown,
  repository: OfferRepository,
) {
  const authenticatedProviderId = z.uuid().parse(providerId);
  const offer = submitOfferSchema.parse(input);
  const offerId = await repository.submit(authenticatedProviderId, offer);
  return { id: offerId, ...offer };
}
