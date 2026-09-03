import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { EligibleRequestRepository } from "../application/list-eligible-requests";
import { serviceCategories } from "@/modules/requests/domain/service-catalog";

const serviceIds = serviceCategories.map((service) => service.id) as [
  (typeof serviceCategories)[number]["id"],
  ...(typeof serviceCategories)[number]["id"][],
];

const eligibleRequestRowSchema = z.object({
  id: z.uuid(),
  service: z.enum(serviceIds),
  vehicle: z.object({ make: z.string(), model: z.string() }),
  city: z.enum(["Casablanca", "Rabat"]),
  description: z.string(),
  urgency: z.enum(["now", "today"]),
  safety_status: z.enum(["safe", "roadside", "danger"]),
  photo_count: z.number().int().nonnegative(),
  published_at: z.string(),
});

export const supabaseEligibleRequestRepository: EligibleRequestRepository = {
  async findForVerifiedProvider() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("list_eligible_requests");
    if (error) {
      throw error;
    }

    return data.map((value) => {
      const row = eligibleRequestRowSchema.parse(value);
      return {
        id: row.id,
        service: row.service,
        vehicle: row.vehicle,
        city: row.city,
        description: row.description,
        urgency: row.urgency,
        safetyStatus: row.safety_status,
        photoCount: row.photo_count,
        publishedAt: row.published_at,
      };
    });
  },
};
