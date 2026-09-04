"use client";

import { useDeferredValue, useState } from "react";
import Image from "next/image";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  Wrench,
  X,
} from "lucide-react";

type Category = "all" | "battery" | "tire" | "care" | "visibility";

const products = [
  {
    id: "battery-60ah",
    name: "Batterie 60 Ah Start+",
    category: "battery",
    categoryLabel: "Batterie",
    detail: "12 V · 540 A · garantie 18 mois",
    compatibility: ["Dacia Logan", "Renault Clio"],
    price: 890,
    stock: "En stock aujourd'hui",
    image: "/products/battery-60ah.svg",
    tone: "signal",
  },
  {
    id: "tire-185",
    name: "Pneu route 185/65 R15",
    category: "tire",
    categoryLabel: "Pneu",
    detail: "Indice 88 H · toutes saisons",
    compatibility: ["Dacia Logan"],
    price: 620,
    stock: "4 disponibles",
    image: "/products/tire-185.svg",
    tone: "carbon",
  },
  {
    id: "wipers-600",
    name: "Balais essuie-glace 600/400",
    category: "visibility",
    categoryLabel: "Visibilite",
    detail: "Silencieux · montage rapide",
    compatibility: ["Dacia Logan", "Renault Clio"],
    price: 145,
    stock: "En stock aujourd'hui",
    image: "/products/wipers-600.svg",
    tone: "route",
  },
  {
    id: "bulbs-h7",
    name: "Ampoules H7 performance",
    category: "visibility",
    categoryLabel: "Visibilite",
    detail: "Pack de 2 · 12 V · 55 W",
    compatibility: ["Renault Clio"],
    price: 110,
    stock: "En stock aujourd'hui",
    image: "/products/bulbs-h7.svg",
    tone: "amber",
  },
  {
    id: "oil-5w40",
    name: "Huile moteur 5W-40",
    category: "care",
    categoryLabel: "Entretien",
    detail: "Bidon 5 L · essence et diesel",
    compatibility: ["Dacia Logan", "Renault Clio"],
    price: 390,
    stock: "Livraison demain",
    image: "/products/oil-5w40.svg",
    tone: "arrival",
  },
  {
    id: "filter-kit",
    name: "Kit filtres revision",
    category: "care",
    categoryLabel: "Entretien",
    detail: "Air · huile · habitacle",
    compatibility: ["Dacia Logan"],
    price: 275,
    stock: "2 disponibles",
    image: "/products/filter-kit.svg",
    tone: "concrete",
  },
] as const;

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "battery", label: "Batteries" },
  { id: "tire", label: "Pneus" },
  { id: "visibility", label: "Visibilite" },
  { id: "care", label: "Entretien" },
];

const formatPrice = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

export function PartsStore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [vehicle, setVehicle] = useState("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [fulfillment, setFulfillment] = useState<"delivery" | "installation">(
    "delivery",
  );
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const visibleProducts = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.detail}`
      .toLowerCase()
      .includes(deferredQuery);
    const matchesCategory = category === "all" || product.category === category;
    const matchesVehicle =
      vehicle === "all" ||
      product.compatibility.some((compatible) => compatible === vehicle);
    return matchesQuery && matchesCategory && matchesVehicle;
  });
  const cartItems = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const cartTotal = cartItems.reduce(
    (total, product) => total + product.price * (cart[product.id] ?? 0),
    0,
  );

  function changeQuantity(productId: string, difference: number) {
    setCart((current) => {
      const quantity = Math.max(0, (current[productId] ?? 0) + difference);
      if (!quantity) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: quantity };
    });
  }

  return (
    <div className="store-layout">
      <section className="store-catalog" aria-labelledby="store-title">
        <div className="store-intro">
          <div>
            <p className="eyebrow">Pieces et consommables</p>
            <h1 id="store-title">Equipez votre voiture sans vous tromper.</h1>
          </div>
          <div className="store-promise">
            <Truck aria-hidden="true" />
            <span>
              <strong>Livraison ou pose</strong>
              <small>Par un partenaire DepanUp</small>
            </span>
          </div>
        </div>

        <div className="store-tools">
          <label className="store-search">
            <span className="sr-only">Rechercher une piece</span>
            <Search aria-hidden="true" />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une piece"
              value={query}
            />
          </label>
          <label className="vehicle-fit">
            <span>Compatibilite</span>
            <select
              onChange={(event) => setVehicle(event.target.value)}
              value={vehicle}
            >
              <option value="all">Tous les vehicules</option>
              <option value="Dacia Logan">Dacia Logan</option>
              <option value="Renault Clio">Renault Clio</option>
            </select>
          </label>
        </div>

        <div className="store-categories" aria-label="Categories de pieces">
          {categories.map((item) => (
            <button
              aria-pressed={category === item.id}
              key={item.id}
              onClick={() => setCategory(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="store-result-count" aria-live="polite">
          {visibleProducts.length} produit(s) compatible(s)
        </p>

        {visibleProducts.length ? (
          <ul className="product-grid">
            {visibleProducts.map((product) => {
              return (
                <li className="product-card" key={product.id}>
                  <div className={`product-visual ${product.tone}`}>
                    <Image
                      alt={product.name}
                      height={210}
                      src={product.image}
                      width={280}
                    />
                    <span>{product.categoryLabel}</span>
                  </div>
                  <div className="product-copy">
                    <p className="product-stock">
                      <Check aria-hidden="true" /> {product.stock}
                    </p>
                    <h2>{product.name}</h2>
                    <p>{product.detail}</p>
                    <div className="product-footer">
                      <strong>{formatPrice.format(product.price)}</strong>
                      <button
                        aria-label={`Ajouter ${product.name} au panier`}
                        onClick={() => changeQuantity(product.id, 1)}
                        title="Ajouter au panier"
                        type="button"
                      >
                        <Plus aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="store-empty">
            <Search aria-hidden="true" />
            <h2>Aucune piece correspondante</h2>
            <p>Essayez un autre vehicule ou une autre categorie.</p>
          </div>
        )}
      </section>

      <aside className="cart-panel" aria-labelledby="cart-title">
        <div className="cart-heading">
          <div>
            <p className="eyebrow">Votre selection</p>
            <h2 id="cart-title">Panier</h2>
          </div>
          <span aria-label={`${cartCount} article(s)`}>{cartCount}</span>
        </div>

        {cartItems.length ? (
          <>
            <ul className="cart-items">
              {cartItems.map((product) => (
                <li key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <small>{formatPrice.format(product.price)}</small>
                  </div>
                  <div className="quantity-control">
                    <button
                      aria-label={`Retirer un ${product.name}`}
                      onClick={() => changeQuantity(product.id, -1)}
                      title="Diminuer la quantite"
                      type="button"
                    >
                      {(cart[product.id] ?? 0) === 1 ? (
                        <Trash2 aria-hidden="true" />
                      ) : (
                        <Minus aria-hidden="true" />
                      )}
                    </button>
                    <span>{cart[product.id]}</span>
                    <button
                      aria-label={`Ajouter un ${product.name}`}
                      onClick={() => changeQuantity(product.id, 1)}
                      title="Augmenter la quantite"
                      type="button"
                    >
                      <Plus aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <span>Total pieces</span>
              <strong>{formatPrice.format(cartTotal)}</strong>
            </div>
            <button
              className="primary-action"
              onClick={() => setCheckoutOpen(true)}
              type="button"
            >
              Choisir livraison ou pose
            </button>
          </>
        ) : (
          <div className="cart-empty">
            <ShoppingBag aria-hidden="true" />
            <p>Ajoutez une piece pour preparer votre commande.</p>
          </div>
        )}
      </aside>

      {checkoutOpen ? (
        <div className="checkout-overlay">
          <section
            aria-labelledby="checkout-title"
            aria-modal="true"
            className="checkout-dialog"
            role="dialog"
          >
            <button
              aria-label="Fermer"
              className="checkout-close"
              onClick={() => {
                setCheckoutOpen(false);
                setOrderPlaced(false);
              }}
              title="Fermer"
              type="button"
            >
              <X aria-hidden="true" />
            </button>

            {orderPlaced ? (
              <div className="checkout-success" aria-live="polite">
                <CheckCircle2 aria-hidden="true" />
                <p className="eyebrow">Demande enregistree</p>
                <h2>Votre commande est preparee.</h2>
                <p>
                  Un partenaire confirmera le stock et le creneau avant toute
                  facturation.
                </p>
                <button
                  className="primary-action"
                  onClick={() => setCheckoutOpen(false)}
                  type="button"
                >
                  Terminer
                </button>
              </div>
            ) : (
              <form
                className="checkout-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setOrderPlaced(true);
                }}
              >
                <p className="eyebrow">Finaliser la selection</p>
                <h2 id="checkout-title">Comment recevoir vos pieces ?</h2>

                <fieldset className="fulfillment-options">
                  <legend>Mode de reception</legend>
                  <label data-selected={fulfillment === "delivery"}>
                    <input
                      checked={fulfillment === "delivery"}
                      name="fulfillment"
                      onChange={() => setFulfillment("delivery")}
                      type="radio"
                      value="delivery"
                    />
                    <Truck aria-hidden="true" />
                    <span>
                      <strong>Livraison</strong>
                      <small>A domicile ou au travail</small>
                    </span>
                  </label>
                  <label data-selected={fulfillment === "installation"}>
                    <input
                      checked={fulfillment === "installation"}
                      name="fulfillment"
                      onChange={() => setFulfillment("installation")}
                      type="radio"
                      value="installation"
                    />
                    <Wrench aria-hidden="true" />
                    <span>
                      <strong>Pose par un pro</strong>
                      <small>Piece livree et installee</small>
                    </span>
                  </label>
                </fieldset>

                <div className="checkout-fields">
                  <label>
                    Ville
                    <select name="city" required>
                      <option value="Casablanca">Casablanca</option>
                      <option value="Rabat">Rabat</option>
                    </select>
                  </label>
                  <label>
                    Adresse ou point de repere
                    <input
                      name="address"
                      placeholder="Quartier, rue ou repere"
                      required
                    />
                  </label>
                  <label>
                    <CalendarClock aria-hidden="true" /> Creneau souhaite
                    <select name="slot" required>
                      <option value="today">Aujourd&apos;hui · 14h–18h</option>
                      <option value="tomorrow-morning">Demain · 9h–13h</option>
                      <option value="tomorrow-afternoon">
                        Demain · 14h–18h
                      </option>
                    </select>
                  </label>
                </div>

                <div className="checkout-summary">
                  <span>{cartCount} article(s)</span>
                  <strong>{formatPrice.format(cartTotal)}</strong>
                </div>
                <button className="primary-action" type="submit">
                  Confirmer la demande
                </button>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
