import { Check, CircleDot, X } from "lucide-react";
import type { InterventionStatus } from "@/modules/interventions/domain/intervention-status";

const steps = [
  { status: "assigned", label: "Depanneur attribue" },
  { status: "en_route", label: "En route" },
  { status: "arrived", label: "Sur place" },
  { status: "completed", label: "Terminee" },
] as const;

export function InterventionTimeline({
  status,
}: {
  status: InterventionStatus;
}) {
  const currentIndex = steps.findIndex((step) => step.status === status);

  if (status === "cancelled") {
    return (
      <section className="intervention-timeline cancelled" aria-label="Suivi">
        <X aria-hidden="true" />
        <span>
          <strong>Intervention annulee</strong>
          <small>Le suivi est maintenant termine.</small>
        </span>
      </section>
    );
  }

  return (
    <ol className="intervention-timeline" aria-label="Progression">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li
            className={isComplete ? "complete" : isCurrent ? "current" : ""}
            key={step.status}
          >
            <span className="timeline-marker">
              {isComplete ? (
                <Check aria-hidden="true" />
              ) : (
                <CircleDot aria-hidden="true" />
              )}
            </span>
            <strong>{step.label}</strong>
            <small>
              {isComplete ? "Valide" : isCurrent ? "En cours" : "A venir"}
            </small>
          </li>
        );
      })}
    </ol>
  );
}
