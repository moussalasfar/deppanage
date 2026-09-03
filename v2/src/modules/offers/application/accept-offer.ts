import { z } from "zod";

export type AcceptedIntervention = {
  id: string;
  requestId: string;
  offerId: string;
};

export interface OfferAcceptanceRepository {
  accept(clientId: string, offerId: string): Promise<AcceptedIntervention>;
}

export async function acceptOffer(
  clientId: string,
  offerId: string,
  repository: OfferAcceptanceRepository,
) {
  return repository.accept(z.uuid().parse(clientId), z.uuid().parse(offerId));
}
