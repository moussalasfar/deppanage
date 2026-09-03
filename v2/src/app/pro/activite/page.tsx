import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Settings,
  TrendingUp,
} from "lucide-react";
import { WorkspaceHeader } from "@/components/workspace-header";

export const metadata = { title: "Activite professionnelle" };

const days = [
  { day: "Lun", value: 42 },
  { day: "Mar", value: 68 },
  { day: "Mer", value: 54 },
  { day: "Jeu", value: 88 },
  { day: "Ven", value: 74 },
  { day: "Sam", value: 100 },
  { day: "Dim", value: 36 },
];
const history = [
  {
    id: "DV-1048",
    service: "Batterie",
    city: "Casablanca",
    amount: "250 MAD",
    status: "Terminee",
  },
  {
    id: "DV-1042",
    service: "Remorquage",
    city: "Casablanca",
    amount: "480 MAD",
    status: "Terminee",
  },
  {
    id: "DV-1039",
    service: "Pneu",
    city: "Rabat",
    amount: "180 MAD",
    status: "Annulee",
  },
];

export default function ProviderActivityPage() {
  return (
    <main className="requests-page">
      <WorkspaceHeader
        backHref="/pro/interventions"
        eyebrow="Espace professionnel"
        title="Activite"
        action={
          <Link className="provider-section-link" href="/pro/compte">
            <Settings aria-hidden="true" /> Reglages
          </Link>
        }
      />
      <section className="workspace-content" aria-labelledby="activity-title">
        <div className="workspace-heading">
          <p className="eyebrow">Cette semaine</p>
          <h1 id="activity-title">Votre activite</h1>
          <p>Suivez les missions, les delais et les montants encaisses.</p>
        </div>
        <div className="metric-strip">
          <article>
            <Banknote aria-hidden="true" />
            <span>
              <small>Montant brut</small>
              <strong>2 840 MAD</strong>
              <em>
                <ArrowUpRight aria-hidden="true" /> 12 %
              </em>
            </span>
          </article>
          <article>
            <CheckCircle2 aria-hidden="true" />
            <span>
              <small>Interventions</small>
              <strong>11</strong>
              <em>9 terminees</em>
            </span>
          </article>
          <article>
            <Clock3 aria-hidden="true" />
            <span>
              <small>Arrivee moyenne</small>
              <strong>18 min</strong>
              <em>Objectif 20 min</em>
            </span>
          </article>
        </div>
        <section className="activity-chart" aria-labelledby="chart-title">
          <div>
            <h2 id="chart-title">Missions par jour</h2>
            <TrendingUp aria-hidden="true" />
          </div>
          <div className="bar-chart">
            {days.map((item) => (
              <span key={item.day}>
                <i style={{ height: `${item.value}%` }} />
                <small>{item.day}</small>
              </span>
            ))}
          </div>
        </section>
        <section className="activity-history">
          <h2>Dernieres interventions</h2>
          <div className="data-table" role="table">
            <div role="row">
              <strong role="columnheader">Reference</strong>
              <strong role="columnheader">Service</strong>
              <strong role="columnheader">Ville</strong>
              <strong role="columnheader">Montant</strong>
              <strong role="columnheader">Etat</strong>
            </div>
            {history.map((item) => (
              <div key={item.id} role="row">
                <span role="cell">{item.id}</span>
                <span role="cell">{item.service}</span>
                <span role="cell">{item.city}</span>
                <span role="cell">{item.amount}</span>
                <span role="cell">{item.status}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
