# Roadmap DepanVite

**Feuille de route produit · Août 2026**

De la démo en ligne au produit qui encaisse. Ce qu'il faut construire, dans quel ordre, et pourquoi la marketplace de pièces ne peut pas venir en premier.

---

## Ce qui existe

| Élément | État |
|---|---|
| Parcours complet | ✅ Fait |
| Persistance | `localStorage` |
| Comptes & rôles | Aucun |
| Paiement | Aucun |
| Dépanneurs réels | Simulés |

---

## Le constat

### Vous avez la maquette, pas encore le produit

Le parcours est juste : poster une panne, recevoir des offres, comparer, accepter. C'est la partie que beaucoup ratent, et elle est faite. Mais rien de ce qui existe aujourd'hui ne survit à un deuxième utilisateur — chaque visiteur a ses propres données dans son navigateur, et deux personnes ne peuvent pas se rencontrer sur la plateforme.

« Professionnel » ne veut donc pas dire « plus de features ». Ça veut dire trois choses très concrètes :

1. **Des données partagées** (une base)
2. **Des identités vérifiées** (des comptes, et des dépanneurs contrôlés)
3. **De l'argent qui circule** (un paiement, une commission, une facture)

Tant que ces trois piliers ne tiennent pas, chaque feature ajoutée est une feature à réécrire.

### La bonne nouvelle

La marketplace de pièces n'est pas une deuxième application à côté de la première. C'est la monétisation naturelle du même moment : une batterie HS, c'est une vente de batterie. Un pneu crevé, c'est une vente de pneu. Et le dépanneur est déjà en route — il devient le livreur et le poseur.

Personne ne peut copier ça sans avoir les deux côtés du marché. C'est là qu'est votre avantage, à condition de le construire dans le bon ordre.

---

## À trancher avant d'écrire du code

### « Vendre les matériels » : deux produits très différents

Votre demande peut vouloir dire deux choses opposées. Le choix change la base de données, les vendeurs à recruter, et le modèle de revenus. Il faut le fixer maintenant.

#### ✅ A · Pièces & consommables aux automobilistes — *recommandé*

Batteries, pneus, plaquettes, filtres, essuie-glaces, huile. Vendus au client, souvent au moment même de la panne, livrés et posés par le dépanneur qui intervient.

- Se greffe sur le trafic que vous avez déjà
- Panier fréquent, réachat régulier
- Le dépanneur devient logistique — pas de flotte à financer
- Commission sur pièce **et** sur pose

#### B · Équipement aux dépanneurs — *alternative*

Treuils, sangles, chandelles, matériel de levage, consommables d'atelier. Vendus aux professionnels inscrits sur la plateforme.

- Peu d'acheteurs, cycles longs, paniers élevés
- Demande un vrai stock ou des accords fournisseurs
- Aucun lien avec le moment de la panne
- Fidélise les dépanneurs, mais ne fait pas grandir le marché

> **Mon avis** — Partez sur **A**. C'est le seul des deux qui utilise ce que vous avez déjà : un client en détresse, une panne qualifiée, et un professionnel qui se déplace vers lui. B est un métier de grossiste, avec du stock à financer et une clientèle de quelques centaines de personnes au Maroc.

---

## Séquence — quatre phases, dans cet ordre

Les numéros ne sont pas décoratifs : ce sont des **dépendances**. La phase 3 est techniquement impossible sans la 1, et commercialement absurde sans la 2.

### Phase 01 · Les fondations
**4 à 6 semaines**

Rien de visible pour l'utilisateur, et pourtant c'est là que se joue tout le reste. Objectif : deux personnes différentes, sur deux téléphones différents, voient la même demande.

| Chantier | Détail | Statut | Effort |
|---|---|---|---|
| **Base de données réelle** | Supabase : Postgres, authentification, temps réel et stockage de fichiers dans une seule offre gratuite au démarrage. La logique de `lib/store.js` se transpose presque ligne pour ligne. | 🔴 Bloquant | M |
| **Comptes par SMS** | Connexion par numéro de téléphone et code à usage unique. Au Maroc, l'e-mail est secondaire — imposer un mot de passe fait perdre des inscriptions à chaque étape. | 🔴 Bloquant | M |
| **Trois rôles séparés** | Client, dépanneur, administrateur. Aujourd'hui « Mes demandes » affiche les demandes de tout le monde et n'importe qui peut accepter n'importe quelle offre. | 🔴 Bloquant | S |
| **Temps réel à la place du polling** | Les offres arrivent par websocket. On supprime les quatre boucles de rafraîchissement actuelles, qui consomment de la batterie et du forfait data pour rien. | — | S |
| **Vérification des dépanneurs** | CIN, permis, carte grise du véhicule d'intervention, attestation d'assurance. Contrôle manuel au début — c'est lent et c'est exactement ce qu'il faut. | ⭐ Différenciant | M |
| **Cycle de vie complet** | Publiée → acceptée → en route → arrivé → terminée. Aujourd'hui accepter une offre marque la demande « terminée » alors que le dépanneur n'a pas bougé. | — | S |

### Phase 02 · Le service qu'on recommande
**6 à 10 semaines**

Passer d'un annuaire à un service. Ici on gagne la confiance : la personne est en panne, souvent seule, parfois la nuit. Tout ce qui réduit l'incertitude a une valeur démesurée.

| Chantier | Détail | Statut | Effort |
|---|---|---|---|
| **Suivi du dépanneur sur carte** | Le point qui se rapproche, avec un temps d'arrivée qui se met à jour. C'est la première chose que les gens attendent, parce qu'ils l'ont apprise ailleurs. | Attendu | L |
| **Photos de la panne** | Deux photos valent mieux qu'un paragraphe : le dépanneur chiffre juste du premier coup, et les litiges sur « ce n'était pas ce qui était annoncé » disparaissent. | — | S |
| **Messagerie intégrée** | Pour préciser un repère, signaler un retard. Garde aussi la conversation sur la plateforme — voir le risque de désintermédiation plus bas. | — | M |
| **Paiement, espèces d'abord** | Le paiement à la livraison reste dominant au Maroc : il doit être un mode de première classe, pas un repli. La carte via CMI vient ensuite, pour ceux qui la veulent. | 💰 Revenus | L |
| **Avis authentiques** | Les notes actuelles sont générées aléatoirement. Un avis ne compte que s'il suit une intervention réellement payée — sinon c'est un champ de bataille à faux comptes. | ⭐ Différenciant | M |
| **Annulations et no-show** | Qui paie quand le client part avant l'arrivée ? Quand le dépanneur ne vient jamais ? Sans règle écrite, chaque cas devient un arbitrage manuel. | — | S |
| **Arabe et darija, interface RTL** | Le français seul plafonne votre marché. L'inversion de sens de lecture se prépare tôt : la rattraper après six mois de CSS coûte dix fois plus cher. | 🌍 Marché | M |
| **Partage de trajet** | Envoyer à un proche un lien de suivi en direct, avec l'identité du dépanneur. Compte énormément pour les femmes et pour les interventions de nuit. | ⭐ Différenciant | S |

### Phase 03 · La vente de pièces
**8 à 12 semaines**

Votre demande initiale — et elle arrive ici, pas plus tôt, parce qu'elle a besoin de comptes vendeurs, de paiement et de logistique, qui sont tous construits en phase 1 et 2.

| Chantier | Détail | Statut | Effort |
|---|---|---|---|
| **Catalogue volontairement étroit** | Batteries, pneus, essuie-glaces, filtres, ampoules, huile. Rien d'autre au départ. Ce sont les pièces dont la compatibilité tient en deux ou trois attributs. | Départ | M |
| **Compatibilité véhicule** | Le vrai coût caché d'une marketplace de pièces. Une batterie se choisit par dimensions, polarité et ampérage ; un pneu par la dimension inscrite sur le flanc. Restez là où c'est simple. | ⚠️ Sous-estimé | L |
| **Suggestion au moment de la panne** | « Batterie » dans la description déclenche une offre de batterie compatible, livrée par le dépanneur en route. C'est la feature qui justifie tout le reste. | 🎯 Cœur du modèle | M |
| **Espace vendeur** | Garages, magasins de pièces, casses. Stock, prix, délais. Les mêmes contrôles d'identité que les dépanneurs, pour les mêmes raisons. | — | L |
| **Neuf, adaptable, occasion** | L'occasion issue des casses représente une part énorme du marché marocain. L'afficher franchement, avec son état et sa garantie, plutôt que de faire semblant qu'elle n'existe pas. | 🇲🇦 Spécifique Maroc | M |
| **Garantie et retours** | Une pièce qui lâche trois semaines plus tard, c'est le test de votre crédibilité. Durée, preuve d'achat, qui reprend la pièce : à écrire avant la première vente. | Confiance | M |

### Phase 04 · Ce qui fait grandir
**Après la traction**

À n'ouvrir qu'une fois qu'il y a du volume réel. Chacune de ces pistes est un produit à part entière et peut absorber une équipe.

| Chantier | Détail | Statut | Effort |
|---|---|---|---|
| **Abonnement assistance** | Un forfait annuel : dépannages inclus, priorité, tarif plafonné. Transforme un revenu par incident en revenu récurrent, et lisse la saisonnalité. | 💰 Revenus | M |
| **Comptes flotte** | Les PME de transport ont des dizaines de véhicules et gèrent les pannes par téléphone. Facturation mensuelle, tableau de bord, plusieurs conducteurs. Panier très supérieur au particulier. | 🚀 Fort potentiel | L |
| **Partenariats assureurs** | Les assurances auto vendent déjà de l'assistance et la sous-traitent. Devenir leur réseau d'exécution apporte du volume sans coût d'acquisition. | — | L |
| **Entretien programmé** | Vidange, plaquettes, révision : le prolongement évident du catalogue de pièces, et la sortie de la dépendance à l'urgence. | — | L |

---

## En parallèle — les chantiers qui ne se voient pas

À mener en continu, pas en phase dédiée. Ils ne produisent aucune capture d'écran et déterminent pourtant si vous tiendrez la distance.

### 💻 Code · TypeScript, validation, tests

Le projet est en JavaScript nu, sans validation d'entrée ni test. Dès qu'il y a de l'argent et des données personnelles, une faute de frappe sur un nom de champ devient un incident. TypeScript, Zod partagé client/serveur, Vitest sur la logique métier, Playwright sur les deux parcours critiques.

### 📊 Exploitation · Voir ce qui casse chez les autres

Sentry pour les erreurs, un outil d'analytics pour les parcours, un environnement de préproduction distinct. Aujourd'hui, si l'app plante chez un utilisateur, vous ne le saurez jamais.

### ⚖️ Juridique · Loi 09-08 et CNDP

Vous allez traiter des positions GPS, des numéros de téléphone et des pièces d'identité. Au Maroc, ce traitement doit être déclaré à la CNDP. À cadrer avec un juriste avant la première inscription réelle, en même temps que les CGU et le statut d'intermédiaire.

### 🤝 Terrain · Recruter les dépanneurs à la main

Le problème n'est pas technique. Une marketplace vide ne démarre jamais toute seule : il faut **trente à cinquante dépanneurs réels sur une seule ville** avant d'ouvrir. Casablanca d'abord, rien d'autre.

---

## Modèle — d'où vient l'argent

Quatre sources, qui n'arrivent pas en même temps. Les deux premières suffisent à valider le modèle.

| Source | Ordre de grandeur | À partir de | Remarque |
|---|---|---|---|
| Commission dépannage | 10 – 15 % | Phase 2 | Prélevée sur le prix accepté |
| Commission pièces | 5 – 10 % | Phase 3 | Marge plus fine, volume plus régulier |
| Abonnement dépanneur | Forfait mensuel | Phase 4 | Mise en avant, zone élargie |
| Abonnement client | Forfait annuel | Phase 4 | Le seul revenu vraiment récurrent |

### Le risque structurel

Le dépanneur et le client échangent leurs numéros à la première intervention, et la deuxième fois ils s'appellent directement. Toutes les marketplaces de service vivent avec ça, et beaucoup en meurent.

On ne l'empêche pas par des interdictions, **on le rend inintéressant** : paiement garanti, facture, historique, note qui a de la valeur pour le professionnel, et couverture en cas de casse pendant l'intervention. Chaque dirham de commission doit acheter quelque chose que le téléphone direct ne donne pas.

---

## Discipline — ce qu'il ne faut pas construire maintenant

Ces idées sont bonnes. Elles sont surtout des moyens très efficaces de passer six mois sans jamais atteindre le premier vrai client.

- **✕ Une application mobile native** — Le site actuel fonctionne déjà sur téléphone. Une installable web bien faite couvre 90 % du besoin pour une fraction du coût. Le natif quand vous aurez besoin des notifications et du GPS en arrière-plan.
- **✕ Une intelligence artificielle de diagnostic** — Séduisant en démonstration, faux en pratique, et engageant votre responsabilité au premier mauvais conseil. Deux photos et un dépanneur au téléphone font mieux.
- **✕ Toutes les villes du Maroc** — Cinquante dépanneurs sur Casablanca valent mieux que cinq cents éparpillés sur douze villes. La densité est ce qui fait tenir la promesse des quinze minutes.
- **✕ Un catalogue de cent mille références** — Vingt références qui vont vraiment sur la voiture du client battent un catalogue immense dont la compatibilité est fausse une fois sur trois.
- **✕ Un back-office d'administration complet** — Au début, l'administration se fait très bien directement dans la base. Construisez l'interface quand le geste sera devenu quotidien.

---

> **Note sur les durées** — Elles supposent une personne à temps plein sur le développement. Elles couvrent la construction, pas le recrutement des dépanneurs ni les démarches juridiques, qui avancent en parallèle et conditionnent souvent la date d'ouverture réelle.
