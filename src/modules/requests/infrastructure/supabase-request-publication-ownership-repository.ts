import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { RequestPublicationOwnershipRepository } from "../application/authorize-request-publication";

export const supabaseRequestPublicationOwnershipRepository: RequestPublicationOwnershipRepository =
  {
    async isOwnedByUser(requestId, userId) {
      const { data, error } = await createAdminClient()
        .from("request_drafts")
        .select("id")
        .eq("id", requestId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return Boolean(data);
    },
  };
