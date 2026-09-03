import { z } from "zod";
import type { Json } from "@/lib/supabase/database.types";
import type { ServiceCategoryId } from "@/modules/requests/domain/service-catalog";
import type { InterventionStatus } from "../domain/intervention-status";
import type {
  CancellationReason,
  InterventionParticipantRole,
} from "../domain/intervention-cancellation";

export type InterventionDetail = {
  id: string;
  requestId: string;
  service: ServiceCategoryId;
  vehicle: Json;
  location: Json;
  providerName: string;
  providerVehicleRegistration: string;
  amountMinor: number;
  etaMinutes: number;
  status: InterventionStatus;
  participantRole: InterventionParticipantRole;
  cancellationReason?: CancellationReason;
  cancelledByRole?: InterventionParticipantRole;
  cancelledAt?: string;
  createdAt: string;
};

export interface InterventionQueryRepository {
  findParticipantIntervention(id: string): Promise<InterventionDetail | null>;
}

export async function getIntervention(
  userId: string,
  interventionId: string,
  repository: InterventionQueryRepository,
) {
  z.uuid().parse(userId);
  return repository.findParticipantIntervention(z.uuid().parse(interventionId));
}
