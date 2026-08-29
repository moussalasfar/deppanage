# DepanVite

Plateforme de dépannage véhicule au Maroc, sur le modèle inDrive : le client
poste sa panne, les dépanneurs proposent un prix, le client choisit la
meilleure offre.

## Démarrer en local

```bash
npm install
npm run dev
```

L'app tourne sur http://localhost:3000.

## Comment les données sont stockées

Il n'y a **ni serveur ni base de données**. Tout l'état — demandes,
propositions, compteurs de vues — vit dans le `localStorage` du navigateur,
géré par [`lib/store.js`](lib/store.js). Le site se compile donc en HTML/CSS/JS
statique et s'héberge n'importe où.

Concrètement :

- Chaque visiteur démarre avec un jeu de données de démonstration (5 demandes,
  6 propositions) et ne voit que ses propres modifications.
- Poster une demande déclenche 2 à 4 offres simulées, révélées progressivement
  sur ~90 secondes. Les délais sont enregistrés à la création, donc les offres
  continuent d'arriver même si vous rechargez ou changez de page.
- `resetStore()` (exporté par `lib/store.js`) efface tout et resème la démo.

C'est adapté à une démo ou un prototype. Pour du multi-utilisateur réel il
faudra une vraie base de données, une authentification, et remonter la logique
de `lib/store.js` côté serveur.

## Déployer sur GitHub Pages

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) fait
tout automatiquement.

1. Pousser le projet sur GitHub, branche `main`.
2. Dans **Settings → Pages**, choisir **Source: GitHub Actions**.
3. Chaque push sur `main` publie le site sur
   `https://<utilisateur>.github.io/<nom-du-repo>/`.

Le workflow passe `NEXT_PUBLIC_BASE_PATH=/<nom-du-repo>` au build, ce dont
[`next.config.mjs`](next.config.mjs) a besoin pour préfixer correctement les
liens et les assets. En local la variable est vide et le site tourne à la
racine.

### Autres hébergeurs

`npm run build` produit un dossier `out/` entièrement statique. Sur Vercel ou
Netlify, déposez-le tel quel sans définir `NEXT_PUBLIC_BASE_PATH` (le site est
servi à la racine du domaine).

## Structure

```
app/
  page.js           landing
  demander/         formulaire en 3 étapes (type → détails → localisation)
  dashboard/        demandes du client + compteur de vues live
  demande/          détail d'une demande et ses offres  (?id=req_xxx)
  depanneur/        liste des demandes triées par distance GPS
components/         Icons, Navbar, Toast, ViewCounter
lib/
  store.js          état localStorage + simulation des offres
  geo.js            distance haversine
  format.js         helpers d'affichage
```

Le routage de `demande/` passe par un paramètre d'URL (`?id=`) plutôt qu'un
segment dynamique : un export statique n'a pas de serveur pour résoudre
`/demande/[id]` à la volée.

## Stack

Next.js 16 (App Router, `output: 'export'`) · React 19 · CSS vanilla · aucune
dépendance UI.
