import "server-only";

import { isSupabasePersistenceConfigured } from "@/lib/supabase/admin";
import { memoryRequestDraftRepository } from "./memory-request-draft-repository";
import { supabaseRequestDraftRepository } from "./supabase-request-draft-repository";

export function getRequestDraftRepository() {
  return isSupabasePersistenceConfigured()
    ? supabaseRequestDraftRepository
    : memoryRequestDraftRepository;
}
