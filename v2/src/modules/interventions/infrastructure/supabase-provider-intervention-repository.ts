import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ProviderInterventionQueryRepository } from "../application/list-provider-interventions";

export const supabaseProviderInterventionRepository: ProviderInterventionQueryRepository =
  {
    async findForProvider() {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("list_provider_interventions");
      if (error) {
        throw error;
      }
      return data.map((intervention) => ({
        id: intervention.id,
        service: intervention.service,
        vehicle: intervention.vehicle,
        city: intervention.city,
        amountMinor: intervention.amount_minor,
        etaMinutes: intervention.eta_minutes,
        status: intervention.status,
        updatedAt: intervention.updated_at,
      }));
    },
  };
