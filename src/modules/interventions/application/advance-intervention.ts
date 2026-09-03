import { z } from "zod";
import {
  interventionStatusSchema,
  type InterventionStatus,
} from "../domain/intervention-status";

export interface InterventionCommandRepository {
  advance(
    providerId: string,
    interventionId: string,
    nextStatus: InterventionStatus,
  ): Promise<InterventionStatus>;
}

export async function advanceIntervention(
  providerId: string,
  interventionId: string,
  nextStatus: unknown,
  repository: InterventionCommandRepository,
) {
  return repository.advance(
    z.uuid().parse(providerId),
    z.uuid().parse(interventionId),
    interventionStatusSchema.parse(nextStatus),
  );
}
