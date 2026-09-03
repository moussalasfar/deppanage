import { z } from "zod";

export type ClientOffer = {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerVehicleType: "tow_truck" | "service_vehicle";
  amountMinor: number;
  etaMinutes: number;
  message: string;
  status: "submitted" | "accepted" | "rejected" | "withdrawn" | "expired";
  expiresAt: string;
  interventionId?: string;
};

export interface ClientOfferQueryRepository {
  findByClientRequest(requestId: string): Promise<ClientOffer[]>;
}

export async function listClientOffers(
  clientId: string,
  requestId: string,
  repository: ClientOfferQueryRepository,
) {
  z.uuid().parse(clientId);
  const validatedRequestId = z.uuid().parse(requestId);
  return repository.findByClientRequest(validatedRequestId);
}
