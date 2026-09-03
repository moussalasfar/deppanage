import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { InterventionCommandRepository } from "../application/advance-intervention";
import type { InterventionCancellationRepository } from "../application/cancel-intervention";
import type { InterventionQueryRepository } from "../application/get-intervention";

export const supabaseInterventionRepository: InterventionQueryRepository &
  InterventionCommandRepository &
  InterventionCancellationRepository = {
  async findParticipantIntervention(id) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_participant_intervention", {
      p_intervention_id: id,
    });
    if (error) {
      throw error;
    }
    const intervention = data[0];
    return intervention
      ? {
          id: intervention.id,
          requestId: intervention.request_id,
          service: intervention.service,
          vehicle: intervention.vehicle,
          location: intervention.location,
          providerName: intervention.provider_name,
          providerVehicleRegistration:
            intervention.provider_vehicle_registration,
          amountMinor: intervention.amount_minor,
          etaMinutes: intervention.eta_minutes,
          status: intervention.status,
          participantRole:
            intervention.participant_role === "provider"
              ? "provider"
              : "client",
          ...(intervention.cancellation_reason
            ? { cancellationReason: intervention.cancellation_reason }
            : {}),
          ...(intervention.cancelled_by_role === "provider" ||
          intervention.cancelled_by_role === "client"
            ? { cancelledByRole: intervention.cancelled_by_role }
            : {}),
          ...(intervention.cancelled_at
            ? { cancelledAt: intervention.cancelled_at }
            : {}),
          createdAt: intervention.created_at,
        }
      : null;
  },

  async advance(_providerId, interventionId, nextStatus) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "advance_provider_intervention",
      {
        p_intervention_id: interventionId,
        p_next_status: nextStatus,
      },
    );
    if (error) {
      throw error;
    }
    return data;
  },

  async cancel(_participantId, interventionId, reason) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "cancel_participant_intervention",
      {
        p_intervention_id: interventionId,
        p_reason: reason,
      },
    );
    if (error) {
      throw error;
    }
    if (data !== "cancelled") {
      throw new Error("INVALID_CANCELLATION_RESULT");
    }
    return data;
  },
};
