import { notFound } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace-header";

const documents = {
  cgu: {
    title: "Conditions d'utilisation",
    updated: "3 septembre 2026",
    sections: [
      [
        "Role de la plateforme",
        "DepanUp met en relation des automobilistes et des professionnels independants. Le prix propose doit etre confirme avant l'intervention.",
      ],
      [
        "Utilisation du service",
        "Chaque utilisateur fournit des informations exactes et utilise le service uniquement pour une demande d'assistance routiere reelle.",
      ],
      [
        "Responsabilites",
        "Le professionnel reste responsable de son vehicule, de ses documents et de la realisation de l'intervention.",
      ],
    ],
  },
  confidentialite: {
    title: "Confidentialite",
    updated: "3 septembre 2026",
    sections: [
      [
        "Donnees traitees",
        "Le service traite le telephone, les informations du vehicule, les photos et la position necessaires a la demande.",
      ],
      [
        "Position",
        "La position exacte reste privee jusqu'a l'attribution d'un professionnel. Une zone approximative suffit pour recevoir des offres.",
      ],
      [
        "Vos droits",
        "Vous pouvez demander l'acces, la rectification ou la suppression de vos donnees depuis votre compte.",
      ],
    ],
  },
  cookies: {
    title: "Cookies",
    updated: "3 septembre 2026",
    sections: [
      [
        "Cookies indispensables",
        "Les cookies de session maintiennent la connexion et protegent les demandes en cours.",
      ],
      [
        "Mesure d'audience",
        "Aucun outil facultatif ne doit etre active avant votre choix.",
      ],
      [
        "Votre choix",
        "Vous pourrez modifier les cookies facultatifs depuis les reglages de confidentialite.",
      ],
    ],
  },
  annulation: {
    title: "Politique d'annulation",
    updated: "3 septembre 2026",
    sections: [
      [
        "Avant le depart",
        "Le client ou le professionnel peut annuler en indiquant un motif.",
      ],
      [
        "Professionnel en route",
        "Une annulation tardive est enregistree afin de permettre le traitement d'un eventuel litige.",
      ],
      [
        "Absence",
        "Un professionnel peut signaler un client absent uniquement apres avoir marque son arrivee.",
      ],
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(documents).map((document) => ({ document }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ document: string }>;
}) {
  const { document } = await params;
  const content = documents[document as keyof typeof documents];
  if (!content) notFound();
  return (
    <main className="requests-page">
      <WorkspaceHeader
        backHref="/compte"
        eyebrow="Informations"
        title={content.title}
      />
      <article className="legal-content">
        <p className="legal-updated">Mis a jour le {content.updated}</p>
        <h1>{content.title}</h1>
        {content.sections.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
