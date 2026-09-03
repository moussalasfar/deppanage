import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AdminProviderVerificationRepository } from "../application/manage-provider-verifications";

export const supabaseProviderVerificationRepository: AdminProviderVerificationRepository =
  {
    async isAdmin(userId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;
      return data?.role === "admin";
    },

    async listPending() {
      const { data, error } = await createAdminClient()
        .from("provider_profiles")
        .select(
          "id, business_name, city, vehicle_type, vehicle_registration, service_ids, created_at",
        )
        .eq("verification_status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data.map((provider) => ({
        id: provider.id,
        businessName: provider.business_name,
        city: provider.city as "Casablanca" | "Rabat",
        vehicleType: provider.vehicle_type,
        vehicleRegistration: provider.vehicle_registration,
        serviceIds: provider.service_ids,
        submittedAt: provider.created_at,
      }));
    },

    async decide(providerId, decision) {
      const { data, error } = await createAdminClient()
        .from("provider_profiles")
        .update({
          verification_status: decision.status,
          rejection_reason:
            decision.status === "rejected" ? (decision.reason ?? null) : null,
          verified_at:
            decision.status === "verified" ? new Date().toISOString() : null,
        })
        .eq("id", providerId)
        .eq("verification_status", "pending")
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("PROVIDER_NOT_PENDING");
    },
  };
