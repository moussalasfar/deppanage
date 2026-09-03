import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { OfferRepository } from "../application/submit-offer";

export const supabaseOfferRepository: OfferRepository = {
  async findByRequest(requestId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("offers")
      .select(
        "id, request_id, amount_minor, eta_minutes, message, status, expires_at",
      )
      .eq("request_id", requestId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data
      ? {
          id: data.id,
          requestId: data.request_id,
          amountMinor: data.amount_minor,
          etaMinutes: data.eta_minutes,
          message: data.message,
          status: data.status,
          expiresAt: data.expires_at,
        }
      : null;
  },

  async submit(_providerId, input) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_provider_offer", {
      p_request_id: input.requestId,
      p_amount_minor: input.amountMinor,
      p_eta_minutes: input.etaMinutes,
      p_message: input.message,
    });

    if (error) {
      throw error;
    }
    return data;
  },
};
