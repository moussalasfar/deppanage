import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function WorkspaceHeader({
  backHref,
  eyebrow,
  title,
  action,
}: {
  backHref: string;
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="requests-header">
      <Link className="back-link" href={backHref} aria-label="Retour">
        <ArrowLeft aria-hidden="true" />
      </Link>
      <div>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
      </div>
      {action ?? <span />}
    </header>
  );
}
