import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const placeholderPrefix = "replace-with-";

export function isSupabasePersistenceConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  return Boolean(
    url &&
    secretKey &&
    !url.startsWith(placeholderPrefix) &&
    !secretKey.startsWith(placeholderPrefix),
  );
}

export function isSupabaseAuthConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    isSupabasePersistenceConfigured() &&
    publishableKey &&
    !publishableKey.startsWith(placeholderPrefix),
  );
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("Supabase persistence is not configured");
  }

  return createClient<Database>(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
