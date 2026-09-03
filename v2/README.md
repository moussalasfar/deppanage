# DepanUp

Application professionnelle d'assistance routiere, construite comme un monolithe modulaire avec Next.js, TypeScript et Supabase.

## Prerequis

- Node.js 24 ou version LTS compatible avec Next.js 16
- npm 11+
- Docker Desktop pour la pile Supabase locale

## Demarrage

```bash
npm install
copy .env.example .env.local
npm run dev
```

L'application est ensuite disponible sur `http://localhost:3000`.

Les valeurs Supabase locales sont affichees par `npm run supabase:start`. Remplacez les valeurs indicatives de `.env.local` sans jamais exposer la cle serveur dans une variable `NEXT_PUBLIC_*`.

Lorsque `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SECRET_KEY` sont configurees, les brouillons utilisent Supabase et les photos sont placees dans le bucket prive `request-photos`. L'identifiant de session anonyme est hache avant stockage et les tables ne sont accessibles qu'au depot serveur.

Sans ces variables, l'application utilise un depot serveur en memoire pour permettre le developpement sans Docker. Les donnees sont alors temporaires et disparaissent au redemarrage. Les valeurs indicatives `replace-with-*` de `.env.example` activent egalement ce mode memoire.

## Connexion par telephone

La route `/connexion` utilise Supabase Auth pour envoyer et verifier un OTP SMS. Apres verification, les demandes encore anonymes de la session courante sont rattachees au profil authentifie sans permettre de reprendre une demande deja liee a un autre compte.

Le flux reel exige un fournisseur SMS active dans Supabase et les trois variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` et `SUPABASE_SECRET_KEY`. La configuration locale actuelle ne declare aucun fournisseur SMS : Supabase CLI desactive donc la connexion par telephone tant qu'un fournisseur de test ou de production n'est pas ajoute.

## Verification

```bash
npm run check
npm run test:e2e
```

`npm run check` execute format, lint, typecheck, tests unitaires et build. Le test E2E utilise le port isole `3100` afin de ne pas reutiliser une autre application locale.

## Base de donnees locale

```bash
npm run supabase:start
npm run supabase:reset
npx supabase db lint
```

Les migrations sont dans `supabase/migrations`. Toutes les tables exposees doivent activer RLS et definir des privileges explicites avant d'etre utilisees par l'application.

## Structure

- `src/app` : routes et orchestration Next.js
- `src/modules` : domaines metier et composants propres a chaque domaine
- `src/lib` : adaptateurs partages, environnement et Supabase
- `supabase` : configuration locale, migrations et tests SQL
- `tests/unit` : tests rapides des regles metier
- `tests/e2e` : parcours navigateur et accessibilite axe
