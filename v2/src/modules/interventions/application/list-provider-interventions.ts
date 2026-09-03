import { z } from "zod";
import type { Json } from "@/lib/supabase/database.types";
import type { ServiceCategoryId } from "@/modules/requests/domain/service-catalog";
import type { InterventionStatus } from "../domain/intervention-status";

export type ProviderInterventionListItem = {
  id: string;
  service: ServiceCategoryId;
  vehicle: Json;
  city: string;
  amountMinor: number;
  etaMinutes: number;
  status: InterventionStatus;
  updatedAt: string;
};

export interface ProviderInterventionQueryRepository {
  findForProvider(): Promise<ProviderInterventionListItem[]>;
}

export async function listProviderInterventions(
  providerId: string,
  repository: ProviderInterventionQueryRepository,
) {
  z.uuid().parse(providerId);
  return repository.findForProvider();
}
