"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Gauge,
  MapPin,
  Menu,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import {
  serviceCategories,
  type ServiceCategoryId,
} from "@/modules/requests/domain/service-catalog";

type Role = "client" | "provider";
type Universe = "assistance" | "marketplace";
type RequestId = "req-1" | "req-2" | "req-3";
type RequestFilter = "all" | "nearby" | "battery" | "tire";
type OfferDraft = { price: string; eta: string; message: string };

const serviceIcons = {
  battery: BatteryCharging,
  tire: CircleDot,
  towing: Truck,
  other: Wrench,
} as const;

const offers = [
  {
    id: "offer-1",
    name: "Atlas Depannage",
    rating: 4.9,
    jobs: 128,
    eta: 18,
    price: 260,
    note: "Diagnostic et remplacement sur place si necessaire.",
  },
  {
    id: "offer-2",
    name: "Yassine Assistance",
    rating: 4.8,
    jobs: 94,
    eta: 12,
    price: 320,
    note: "Disponible maintenant, vehicule atelier equipe.",
  },
  {
    id: "offer-3",
    name: "Casa Auto Secours",
    rating: 4.7,
    jobs: 76,
    eta: 27,
    price: 210,
    note: "Prix fixe confirme avant le depart.",
  },
];

const liveRequests = [
  {
    id: "req-1" as const,
    service: "battery" as const,
    title: "Batterie a plat",
    vehicle: "Dacia Logan 2021",
    area: "Maarif, Casablanca",
    distance: "2,4 km",
    age: "Il y a 3 min",
    budget: "200 - 350 MAD",
    description: "Le demarreur ne reagit plus apres deux jours sans rouler.",
  },
  {
    id: "req-2" as const,
    service: "tire" as const,
    title: "Pneu avant creve",
    vehicle: "Renault Clio 2020",
    area: "Agdal, Rabat",
    distance: "4,1 km",
    age: "Il y a 7 min",
    budget: "150 - 280 MAD",
    description: "Vehicule stationne en securite, pas de roue de secours.",
  },
  {
    id: "req-3" as const,
    service: "towing" as const,
    title: "Remorquage vers garage",
    vehicle: "Peugeot 208 2019",
    area: "Ain Diab, Casablanca",
    distance: "6,8 km",
    age: "Il y a 11 min",
    budget: "350 - 550 MAD",
    description: "Voyant moteur allume, vehicule immobilise sur parking.",
  },
];

const products = [
  {
    id: "battery",
    name: "Batterie Start+ 60 Ah",
    price: 890,
    tag: "Pose possible",
    image: "/products/battery-60ah.svg",
  },
  {
    id: "tire",
    name: "Pneu route 185/65 R15",
    price: 620,
    tag: "En stock",
    image: "/products/tire-185.svg",
  },
  {
    id: "care",
    name: "Kit revision essentiel",
    price: 275,
    tag: "Compatible",
    image: "/products/filter-kit.svg",
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-MA").format(value) + " MAD";
}

export function PlatformDemo() {
  const [role, setRole] = useState<Role>("client");
  const [universe, setUniverse] = useState<Universe>("assistance");
  const [service, setService] = useState<ServiceCategoryId>("battery");
  const [budget, setBudget] = useState(350);
  const [acceptedOffer, setAcceptedOffer] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestId>("req-1");
  const [appliedRequests, setAppliedRequests] = useState<RequestId[]>([]);
  const [offerSaved, setOfferSaved] = useState(false);
  const [offerDrafts, setOfferDrafts] = useState<Record<RequestId, OfferDraft>>(
    {
      "req-1": {
        price: "260",
        eta: "18",
        message:
          "Je peux intervenir rapidement avec tout le materiel necessaire.",
      },
      "req-2": {
        price: "240",
        eta: "22",
        message: "Je peux reparer ou remplacer le pneu sur place.",
      },
      "req-3": {
        price: "420",
        eta: "30",
        message: "Depanneuse disponible pour un transport vers votre garage.",
      },
    },
  );
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const affordableOffers = offers.filter((offer) => offer.price <= budget);
  const activeRequest =
    liveRequests.find((request) => request.id === selectedRequest) ??
    liveRequests[0]!;

  function switchRole(nextRole: Role) {
    setRole(nextRole);
    setMobileMenuOpen(false);
  }

  function switchUniverse(nextUniverse: Universe) {
    setUniverse(nextUniverse);
    setMobileMenuOpen(false);
  }

  function updateOfferDraft(requestId: RequestId, draft: OfferDraft) {
    setOfferDrafts((current) => ({ ...current, [requestId]: draft }));
    setAppliedRequests((current) => current.filter((id) => id !== requestId));
    setOfferSaved(false);
  }

  function submitMockOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOfferSaved(true);
    setAppliedRequests((current) =>
      current.includes(selectedRequest)
        ? current
        : [...current, selectedRequest],
    );
  }

  return (
    <div className="demo-shell">
      <header className="demo-header">
        <Link className="demo-brand" href="/" aria-label="DepanUp, accueil">
          <Image
            src="/brand/logo-mark.svg"
            alt=""
            width={44}
            height={44}
            priority
          />
          <span>
            <strong>DepanUp</strong>
            <small>Route & pieces auto</small>
          </span>
        </Link>

        <nav className="universe-switch" aria-label="Choisir un service">
          <button
            aria-pressed={universe === "assistance"}
            onClick={() => switchUniverse("assistance")}
            type="button"
          >
            <Truck aria-hidden="true" /> <span>Depannage</span>
          </button>
          <button
            aria-pressed={universe === "marketplace"}
            onClick={() => switchUniverse("marketplace")}
            type="button"
          >
            <ShoppingBag aria-hidden="true" /> <span>Marketplace</span>
          </button>
        </nav>

        <div
          className="role-switch"
          aria-label="Changer de profil"
          role="group"
        >
          <button
            aria-label="Voir la plateforme comme client"
            aria-pressed={role === "client"}
            onClick={() => switchRole("client")}
            type="button"
          >
            <UserRound aria-hidden="true" /> Client
          </button>
          <button
            aria-label="Voir la plateforme comme depanneur"
            aria-pressed={role === "provider"}
            onClick={() => switchRole("provider")}
            type="button"
          >
            <Wrench aria-hidden="true" /> Depanneur
          </button>
        </div>

        <button
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="demo-menu-button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          type="button"
        >
          {mobileMenuOpen ? (
            <X aria-hidden="true" />
          ) : (
            <Menu aria-hidden="true" />
          )}
        </button>
      </header>

      {mobileMenuOpen ? (
        <div className="demo-mobile-menu">
          <span>Voir la plateforme comme</span>
          <button
            aria-label="Voir le menu mobile comme client"
            aria-pressed={role === "client"}
            onClick={() => switchRole("client")}
            type="button"
          >
            <UserRound aria-hidden="true" /> Client
          </button>
          <button
            aria-label="Voir le menu mobile comme depanneur"
            aria-pressed={role === "provider"}
            onClick={() => switchRole("provider")}
            type="button"
          >
            <Wrench aria-hidden="true" /> Depanneur
          </button>
        </div>
      ) : null}

      <main className="demo-main">
        <div className="demo-context-bar">
          <div>
            <span className="live-dot" />
            Mode demonstration
          </div>
          <p>
            Vous consultez l&apos;espace{" "}
            <strong>{role === "client" ? "Client" : "Depanneur"}</strong>
          </p>
          <Link aria-label="Ouvrir le compte" href="/connexion">
            Se connecter <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        {universe === "assistance" && role === "client" ? (
          <ClientAssistance
            acceptedOffer={acceptedOffer}
            affordableOffers={affordableOffers}
            budget={budget}
            onAccept={setAcceptedOffer}
            onBudgetChange={setBudget}
            onServiceChange={setService}
            service={service}
          />
        ) : null}

        {universe === "assistance" && role === "provider" ? (
          <ProviderAssistance
            activeRequest={activeRequest}
            appliedRequests={appliedRequests}
            draft={offerDrafts[selectedRequest]}
            offerSaved={offerSaved}
            onDraftChange={(draft) => updateOfferDraft(selectedRequest, draft)}
            onRequestChange={(requestId) => {
              setSelectedRequest(requestId);
              setOfferSaved(appliedRequests.includes(requestId));
            }}
            onSubmit={submitMockOffer}
            selectedRequest={selectedRequest}
          />
        ) : null}

        {universe === "marketplace" ? (
          <MarketplaceView
            cartCount={cartCount}
            onAdd={() => setCartCount((current) => current + 1)}
            role={role}
          />
        ) : null}
      </main>
    </div>
  );
}

function ClientAssistance({
  acceptedOffer,
  affordableOffers,
  budget,
  onAccept,
  onBudgetChange,
  onServiceChange,
  service,
}: {
  acceptedOffer: string | null;
  affordableOffers: typeof offers;
  budget: number;
  onAccept: (offerId: string) => void;
  onBudgetChange: (budget: number) => void;
  onServiceChange: (service: ServiceCategoryId) => void;
  service: ServiceCategoryId;
}) {
  return (
    <div className="client-demo-view">
      <section className="client-request-pane" aria-labelledby="home-title">
        <p className="demo-kicker">Besoin d&apos;aide maintenant ?</p>
        <h1 id="home-title">De quel depannage avez-vous besoin&nbsp;?</h1>
        <p className="demo-lead">
          Publiez votre besoin, recevez plusieurs prix et choisissez librement
          votre depanneur.
        </p>

        <form action="/demander" className="demo-request-form">
          <fieldset>
            <legend>Type de probleme</legend>
            <div className="demo-service-grid">
              {serviceCategories.map((item) => {
                const Icon = serviceIcons[item.icon];
                return (
                  <label data-selected={service === item.id} key={item.id}>
                    <input
                      checked={service === item.id}
                      name="service"
                      onChange={() => onServiceChange(item.id)}
                      type="radio"
                      value={item.id}
                    />
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="demo-location-row">
            <MapPin aria-hidden="true" />
            <span>
              <strong>Position actuelle</strong>
              <small>Maarif, Casablanca</small>
            </span>
            <button type="button">Modifier</button>
          </div>
          <button className="demo-primary-button" type="submit">
            Demander un depanneur <ArrowRight aria-hidden="true" />
          </button>
        </form>

        <div className="demo-proof-row">
          <span>
            <ShieldCheck aria-hidden="true" /> Pros verifies
          </span>
          <span>
            <Gauge aria-hidden="true" /> Prix compares
          </span>
          <span>
            <Clock3 aria-hidden="true" /> Suivi en direct
          </span>
          <Link href="/pro/inscription">
            Vous etes depanneur ? <strong>Rejoindre le reseau</strong>
          </Link>
        </div>
      </section>

      <section
        className="client-offers-pane"
        aria-labelledby="offers-demo-title"
      >
        <div className="offers-pane-heading">
          <div>
            <p className="demo-kicker">3 exemples d&apos;offres</p>
            <h2 id="offers-demo-title">Comparez avant de choisir</h2>
          </div>
          <span className="offers-live">
            <span /> En direct
          </span>
        </div>

        <label className="budget-control">
          <span>
            <strong>Votre budget maximum</strong>
            <output>{formatPrice(budget)}</output>
          </span>
          <input
            aria-label="Budget maximum"
            max="400"
            min="200"
            onChange={(event) => onBudgetChange(Number(event.target.value))}
            step="10"
            type="range"
            value={budget}
          />
          <small>{affordableOffers.length} offre(s) dans votre budget</small>
        </label>

        <ul className="demo-offer-list">
          {offers.map((offer, index) => {
            const isAffordable = offer.price <= budget;
            const isAccepted = acceptedOffer === offer.id;
            return (
              <li data-muted={!isAffordable} key={offer.id}>
                <div className="offer-avatar">
                  {offer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="offer-identity">
                  <span>
                    {index === 0
                      ? "Recommande"
                      : isAffordable
                        ? "Dans votre budget"
                        : "Hors budget"}
                  </span>
                  <h3>{offer.name}</h3>
                  <p>
                    <Star aria-hidden="true" /> {offer.rating} · {offer.jobs}{" "}
                    interventions
                  </p>
                </div>
                <div className="offer-price">
                  <strong>{formatPrice(offer.price)}</strong>
                  <span>
                    <Clock3 aria-hidden="true" /> {offer.eta} min
                  </span>
                </div>
                <button
                  aria-label={`Choisir l'offre de ${offer.name}`}
                  className={isAccepted ? "accepted" : ""}
                  disabled={!isAffordable}
                  onClick={() => onAccept(offer.id)}
                  type="button"
                >
                  {isAccepted ? (
                    <>
                      <Check aria-hidden="true" /> Accepte
                    </>
                  ) : (
                    "Choisir"
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {acceptedOffer ? (
          <div className="demo-success" role="status">
            <Check aria-hidden="true" /> Depanneur confirme. Le suivi de son
            arrivee est maintenant disponible.
            <Link href="/demandes">Suivre l&apos;intervention</Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ProviderAssistance({
  activeRequest,
  appliedRequests,
  draft,
  offerSaved,
  onDraftChange,
  onRequestChange,
  onSubmit,
  selectedRequest,
}: {
  activeRequest: (typeof liveRequests)[number];
  appliedRequests: RequestId[];
  draft: OfferDraft;
  offerSaved: boolean;
  onDraftChange: (draft: OfferDraft) => void;
  onRequestChange: (requestId: RequestId) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  selectedRequest: RequestId;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RequestFilter>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRequests = liveRequests.filter((request) => {
    const matchesQuery = `${request.title} ${request.vehicle} ${request.area}`
      .toLowerCase()
      .includes(normalizedQuery);
    const matchesFilter =
      filter === "all" ||
      (filter === "nearby" &&
        Number(request.distance.replace(",", ".").split(" ")[0]) < 5) ||
      request.service === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="provider-demo-view">
      <aside className="provider-demo-sidebar">
        <div className="provider-profile-summary">
          <div>AA</div>
          <span>
            <strong>Atlas Assistance</strong>
            <small>
              <BadgeCheck aria-hidden="true" /> Profil verifie
            </small>
          </span>
        </div>
        <nav aria-label="Navigation depanneur">
          <button className="active" type="button">
            <Search aria-hidden="true" /> Demandes proches <span>3</span>
          </button>
          <button type="button">
            <Clock3 aria-hidden="true" /> Mes candidatures{" "}
            <span>{appliedRequests.length}</span>
          </button>
          <Link href="/pro/interventions">
            <Truck aria-hidden="true" /> Interventions
          </Link>
          <Link href="/pro/activite">
            <Gauge aria-hidden="true" /> Activite
          </Link>
        </nav>
        <div className="availability-card">
          <span>
            <span className="live-dot" /> Disponible
          </span>
          <small>Vous recevez les nouvelles demandes</small>
        </div>
      </aside>

      <section className="provider-feed" aria-labelledby="provider-feed-title">
        <div className="provider-feed-heading">
          <div>
            <p className="demo-kicker">Demandes fictives autour de vous</p>
            <h1 id="provider-feed-title">Demandes en direct</h1>
          </div>
          <label>
            <Search aria-hidden="true" />
            <span className="sr-only">Rechercher</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Vehicule ou quartier"
              value={query}
            />
          </label>
        </div>
        <div
          className="feed-filter-row"
          role="group"
          aria-label="Filtrer les demandes"
        >
          <button
            aria-pressed={filter === "all"}
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
            type="button"
          >
            Toutes
          </button>
          <button
            aria-pressed={filter === "nearby"}
            className={filter === "nearby" ? "active" : ""}
            onClick={() => setFilter("nearby")}
            type="button"
          >
            Moins de 5 km
          </button>
          <button
            aria-pressed={filter === "battery"}
            className={filter === "battery" ? "active" : ""}
            onClick={() => setFilter("battery")}
            type="button"
          >
            Batterie
          </button>
          <button
            aria-pressed={filter === "tire"}
            className={filter === "tire" ? "active" : ""}
            onClick={() => setFilter("tire")}
            type="button"
          >
            Pneu
          </button>
        </div>
        <p className="demo-result-count" aria-live="polite">
          {visibleRequests.length} demande(s) affichee(s)
        </p>
        <ul className="demo-request-list">
          {visibleRequests.map((request) => {
            const Icon = serviceIcons[request.service];
            const applied = appliedRequests.includes(request.id);
            return (
              <li
                data-selected={selectedRequest === request.id}
                key={request.id}
              >
                <button
                  aria-label={`Consulter ${request.title} a ${request.area}`}
                  onClick={() => onRequestChange(request.id)}
                  type="button"
                >
                  <span className="request-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="request-main">
                    <small>{request.age}</small>
                    <strong>{request.title}</strong>
                    <em>{request.vehicle}</em>
                    <span>
                      <MapPin aria-hidden="true" /> {request.area} ·{" "}
                      {request.distance}
                    </span>
                  </span>
                  <span className="request-budget">
                    <small>Budget client</small>
                    <strong>{request.budget}</strong>
                    {applied ? (
                      <em>
                        <Check aria-hidden="true" /> Offre envoyee
                      </em>
                    ) : (
                      <ChevronRight aria-hidden="true" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {visibleRequests.length === 0 ? (
          <div className="demo-empty-state">
            <Search aria-hidden="true" />
            <strong>Aucune demande correspondante</strong>
            <span>Essayez un autre vehicule, quartier ou filtre.</span>
          </div>
        ) : null}
      </section>

      <aside className="application-pane" aria-labelledby="application-title">
        <div className="application-heading">
          <span className="request-icon">
            <Wrench aria-hidden="true" />
          </span>
          <div>
            <p className="demo-kicker">Demande selectionnee</p>
            <h2 id="application-title">{activeRequest.title}</h2>
          </div>
        </div>
        <dl>
          <div>
            <dt>Vehicule</dt>
            <dd>{activeRequest.vehicle}</dd>
          </div>
          <div>
            <dt>Distance</dt>
            <dd>{activeRequest.distance}</dd>
          </div>
          <div>
            <dt>Budget client</dt>
            <dd>{activeRequest.budget}</dd>
          </div>
        </dl>
        <p className="request-description">{activeRequest.description}</p>
        <form className="demo-application-form" onSubmit={onSubmit}>
          <div>
            <label>
              Votre prix (MAD)
              <input
                max="5000"
                min="50"
                onChange={(event) =>
                  onDraftChange({ ...draft, price: event.target.value })
                }
                required
                type="number"
                value={draft.price}
              />
            </label>
            <label>
              Arrivee dans
              <input
                max="240"
                min="5"
                onChange={(event) =>
                  onDraftChange({ ...draft, eta: event.target.value })
                }
                required
                type="number"
                value={draft.eta}
              />
              <span>min</span>
            </label>
          </div>
          <label>
            Message au client
            <textarea
              onChange={(event) =>
                onDraftChange({ ...draft, message: event.target.value })
              }
              rows={3}
              value={draft.message}
            />
          </label>
          <button className="demo-primary-button" type="submit">
            {offerSaved ? (
              <>
                <Check aria-hidden="true" /> Offre enregistree
              </>
            ) : (
              <>
                Envoyer mon offre <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        </form>
        <p className="application-hint">
          <ShieldCheck aria-hidden="true" /> Le client voit votre prix, votre
          delai et vos evaluations.
        </p>
      </aside>
    </div>
  );
}

function MarketplaceView({
  cartCount,
  onAdd,
  role,
}: {
  cartCount: number;
  onAdd: () => void;
  role: Role;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="marketplace-demo-view">
      <section
        className="marketplace-intro"
        aria-labelledby="marketplace-title"
      >
        <div>
          <p className="demo-kicker">Marketplace DepanUp</p>
          <h1 id="marketplace-title">
            Les bonnes pieces, avec ou sans la pose.
          </h1>
          <p>
            Choisissez votre vehicule, trouvez les pieces compatibles et
            faites-les installer par un partenaire verifie.
          </p>
        </div>
        <div className="marketplace-photo">
          <Image
            src="/brand/roadside-team.jpg"
            alt="Professionnels autour d'un vehicule"
            fill
            priority
            sizes="(max-width: 860px) 100vw, 40vw"
          />
          <span>
            <BadgeCheck aria-hidden="true" /> Compatibilite verifiee
          </span>
        </div>
      </section>
      <div className="marketplace-toolbar">
        <label>
          <Search aria-hidden="true" />
          <span className="sr-only">Rechercher une piece</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une piece"
            value={query}
          />
        </label>
        <button type="button">
          <Store aria-hidden="true" /> Dacia Logan 2021
        </button>
        <Link href="/boutique">
          <ShoppingBag aria-hidden="true" /> Panier <span>{cartCount}</span>
        </Link>
      </div>
      <section
        className="marketplace-products"
        aria-label="Pieces recommandees"
      >
        <div className="marketplace-section-heading">
          <div>
            <p className="demo-kicker">Pour votre vehicule</p>
            <h2>Pieces recommandees</h2>
          </div>
          <Link href="/boutique">
            Voir tout <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ul>
          {visibleProducts.map((product) => {
            return (
              <li key={product.id}>
                <div className={`product-visual ${product.id}`}>
                  <Image
                    alt={product.name}
                    height={240}
                    src={product.image}
                    width={320}
                  />
                </div>
                <span>{product.tag}</span>
                <h3>{product.name}</h3>
                <p>
                  <strong>{formatPrice(product.price)}</strong>
                  <small>Livraison des demain</small>
                </p>
                <button
                  aria-label={`Ajouter ${product.name} au panier`}
                  onClick={onAdd}
                  type="button"
                >
                  <PackageSearch aria-hidden="true" /> Ajouter
                </button>
              </li>
            );
          })}
        </ul>
        {visibleProducts.length === 0 ? (
          <div className="demo-empty-state marketplace-empty">
            <PackageSearch aria-hidden="true" />
            <strong>Aucune piece correspondante</strong>
            <span>Essayez un autre nom de piece.</span>
          </div>
        ) : null}
      </section>
      {role === "provider" ? (
        <section className="provider-market-banner">
          <UsersRound aria-hidden="true" />
          <div>
            <strong>Vous etes en mode Depanneur</strong>
            <span>
              Proposez la pose des pieces et recevez de nouvelles interventions.
            </span>
          </div>
          <Link href="/pro/demandes">
            Voir les demandes <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
