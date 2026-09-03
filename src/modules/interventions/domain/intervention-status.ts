import { z } from "zod";

export const interventionStatusSchema = z.enum([
  "assigned",
  "en_route",
  "arrived",
  "completed",
  "cancelled",
]);

export type InterventionStatus = z.infer<typeof interventionStatusSchema>;
export type AdvanceableInterventionStatus =
  "en_route" | "arrived" | "completed";

const nextStatusByCurrent: Partial<
  Record<InterventionStatus, AdvanceableInterventionStatus>
> = {
  assigned: "en_route",
  en_route: "arrived",
  arrived: "completed",
};

export function getNextInterventionStatus(status: InterventionStatus) {
  return nextStatusByCurrent[status] ?? null;
}

export function assertInterventionTransition(
  currentStatus: InterventionStatus,
  nextStatus: InterventionStatus,
) {
  if (getNextInterventionStatus(currentStatus) !== nextStatus) {
    throw new Error("INVALID_INTERVENTION_TRANSITION");
  }
}
