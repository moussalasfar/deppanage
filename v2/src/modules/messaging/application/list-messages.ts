import { z } from "zod";
import type { InterventionMessage } from "../domain/message";

export interface MessageQueryRepository {
  findByIntervention(interventionId: string): Promise<InterventionMessage[]>;
}

export async function listMessages(
  participantId: string,
  interventionId: string,
  repository: MessageQueryRepository,
) {
  z.uuid().parse(participantId);
  return repository.findByIntervention(z.uuid().parse(interventionId));
}
