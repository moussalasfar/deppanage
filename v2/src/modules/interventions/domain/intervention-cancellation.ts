import { z } from "zod";
import type { InterventionStatus } from "./intervention-status";

export const cancellationReasonSchema = z.enum([
  "client_changed_mind",
  "problem_resolved",
  "provider_late",
  "provider_vehicle_issue",
  "unsafe_location",
  "client_no_show",
]);

export type CancellationReason = z.infer<typeof cancellationReasonSchema>;
export type InterventionParticipantRole = "client" | "provider";

const reasonsByRole: Record<
  InterventionParticipantRole,
  readonly CancellationReason[]
> = {
  client: ["client_changed_mind", "problem_resolved", "provider_late"],
  provider: ["provider_vehicle_issue", "unsafe_location", "client_no_show"],
};

export function assertInterventionCancellation(
  role: InterventionParticipantRole,
  status: InterventionStatus,
  reason: CancellationReason,
) {
  if (status === "completed" || status === "cancelled") {
    throw new Error("INTERVENTION_ALREADY_CLOSED");
  }
  if (!reasonsByRole[role].includes(reason)) {
    throw new Error("INVALID_CANCELLATION_REASON");
  }
  if (reason === "client_no_show" && status !== "arrived") {
    throw new Error("NO_SHOW_REQUIRES_ARRIVAL");
  }
}
