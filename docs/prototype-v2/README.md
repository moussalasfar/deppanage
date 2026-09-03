# Prototype client DepanUp V2

Ce prototype valide la direction visuelle et la hierarchie des quatre moments critiques du parcours client. Il est volontairement separe de l'ancienne application et ne constitue pas le socle technique de production.

## Ouvrir

Ouvrir `index.html` dans un navigateur. Aucun serveur ni installation n'est necessaire.

Le selecteur `Apercu` permet de passer entre :

- `Accueil` : choix du besoin et position ;
- `Demande` : informations du vehicule et protection GPS ;
- `Offres` : comparaison de professionnels verifies ;
- `Suivi` : progression de l'intervention, communication et prix convenu.

## Ce qui est valide

- direction claire, operationnelle et non inspiree de l'ancien prototype ;
- palette rouge signal, carbone, craie, vert, ambre et bleu trajet ;
- symbole D-route et mot-symbole ;
- hierarchie mobile d'abord avec navigation client a trois entrees ;
- zones tactiles d'au moins 44 px ;
- absence de debordement horizontal a 390 px et 1440 px ;
- formulaire, comparaison d'offres et suivi lisibles ;
- photographie montrant un professionnel et le vehicule ;
- respect de `prefers-reduced-motion`.

## Limites volontaires

- les donnees, la carte et les transitions sont simulees ;
- le formulaire ne persiste rien ;
- les boutons de compte, securite et communication sont demonstratifs ;
- Lucide et les polices sont charges depuis un CDN ;
- la photographie distante devra etre achetee, licenciee ou remplacee par une production locale avant lancement ;
- le prototype n'est pas un audit WCAG complet.

## Etape suivante

Apres validation de la direction, construire le socle V2 dans une application TypeScript separee : design tokens, composants accessibles, i18n/RTL, Supabase local, migrations et CI. Ne pas convertir directement ce fichier HTML en application de production ; il sert de specification visuelle et comportementale.