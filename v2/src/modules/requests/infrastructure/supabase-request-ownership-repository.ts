import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RequestOwnershipRepository } from "../application/claim-session-requests";

function hashSession(ownerSessionId: string) {
  return createHash("sha256").update(ownerSessionId).digest("hex");
}

export const supabaseRequestOwnershipRepository: RequestOwnershipRepository = {
  async claimUnownedBySession(ownerSessionId, userId) {
    const { data, error } = await createAdminClient()
      .from("request_drafts")
      .update({ user_id: userId })
      .eq("owner_session_hash", hashSession(ownerSessionId))
      .is("user_id", null)
      .select("id");

    if (error) {
      throw error;
    }

    return data.length;
  },
};
