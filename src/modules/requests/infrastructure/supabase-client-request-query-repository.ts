import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ClientRequestQueryRepository } from "../application/list-client-requests";
import {
  createRequestDraftSchema,
  requestDetailsSchema,
  requestLocationSchema,
} from "../domain/request-draft";

export const supabaseClientRequestQueryRepository: ClientRequestQueryRepository =
  {
    async findByUserId(userId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("request_drafts")
        .select("*, request_photos(id)")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((row) => {
        const base = createRequestDraftSchema.parse({
          service: row.service,
          vehicle: row.vehicle,
        });

        return {
          id: row.id,
          service: base.service,
          status: row.status,
          vehicle: base.vehicle,
          ...(row.location
            ? { location: requestLocationSchema.parse(row.location) }
            : {}),
          ...(row.details
            ? { details: requestDetailsSchema.parse(row.details) }
            : {}),
          photoCount: row.request_photos.length,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          ...(row.published_at ? { publishedAt: row.published_at } : {}),
        };
      });
    },
  };
