import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { OfferAcceptanceRepository } from "../application/accept-offer";
import type { ClientOfferQueryRepository } from "../application/list-client-offers";

export const supabaseClientOfferRepository: ClientOfferQueryRepository &
  OfferAcceptanceRepository = {
  async findByClientRequest(requestId) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("list_client_request_offers", {
      p_request_id: requestId,
    });
    if (error) {
      throw error;
    }
    return data.map((offer) => ({
      id: offer.id,
      requestId: offer.request_id,
      providerId: offer.provider_id,
      providerName: offer.provider_name,
      providerVehicleType: offer.provider_vehicle_type,
      amountMinor: offer.amount_minor,
      etaMinutes: offer.eta_minutes,
      message: offer.message,
      status: offer.status,
      expiresAt: offer.expires_at,
      ...(offer.intervention_id
        ? { interventionId: offer.intervention_id }
        : {}),
    }));
  },

  async accept(_clientId, offerId) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("accept_client_offer", {
      p_offer_id: offerId,
    });
    if (error) {
      throw error;
    }
    const intervention = data[0];
    if (!intervention) {
      throw new Error("OFFER_NOT_AVAILABLE");
    }
    return {
      id: intervention.id,
      requestId: intervention.request_id,
      offerId: intervention.offer_id,
    };
  },
};
