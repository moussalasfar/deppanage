import { z } from "zod";
import {
  cancellationReasonSchema,
  type CancellationReason,
} from "../domain/intervention-cancellation";

export interface InterventionCancellationRepository {
  cancel(
    participantId: string,
    interventionId: string,
    reason: CancellationReason,
  ): Promise<"cancelled">;
}

export async function cancelIntervention(
  participantId: string,
  interventionId: string,
  reason: unknown,
  repository: InterventionCancellationRepository,
) {
  return repository.cancel(
    z.uuid().parse(participantId),
    z.uuid().parse(interventionId),
    cancellationReasonSchema.parse(reason),
  );
}
