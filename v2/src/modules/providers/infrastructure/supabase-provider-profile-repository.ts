import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ProviderProfileRepository } from "../application/submit-provider-application";
import { providerApplicationSchema } from "../domain/provider-profile";

export const supabaseProviderProfileRepository: ProviderProfileRepository = {
  async findByUserId(userId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("provider_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      return null;
    }

    const application = providerApplicationSchema.parse({
      businessName: data.business_name,
      city: data.city,
      vehicleType: data.vehicle_type,
      vehicleRegistration: data.vehicle_registration,
      serviceIds: data.service_ids,
    });

    return {
      ...application,
      userId: data.id,
      verificationStatus: data.verification_status,
      ...(data.rejection_reason
        ? { rejectionReason: data.rejection_reason }
        : {}),
    };
  },

  async savePending(userId, application) {
    const { error } = await createAdminClient()
      .from("provider_profiles")
      .upsert({
        id: userId,
        business_name: application.businessName,
        city: application.city,
        vehicle_type: application.vehicleType,
        vehicle_registration: application.vehicleRegistration,
        service_ids: application.serviceIds,
        verification_status: "pending",
        rejection_reason: null,
        verified_at: null,
      });

    if (error) {
      throw error;
    }
  },
};
