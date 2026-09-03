# Systeme de marque DepanUp

**Version :** 0.1
**Statut :** direction recommandee, soumise a validation juridique du nom

## Idee centrale

DepanUp doit sembler rapide sans paraitre precipite, professionnel sans etre froid, et local sans utiliser de cliches decoratifs. Le systeme visuel s'appuie sur la signaletique routiere : contraste, direction et information immediate.

## Logo retenu

Le concept A, `Boucle routiere`, est la direction recommandee. Le symbole combine :

- un `D` massif, lisible comme initiale ;
- une boucle interieure qui evoque un trajet ;
- une fleche contenue qui indique le mouvement ;
- une coupure centrale qui rappelle un marquage routier.

La fleche reste dans le contour du D. Cela evite un logo trop sportif et conserve une silhouette compacte pour l'icone de PWA.

### Fichiers

| Fichier | Usage |
|---|---|
| `logo-mark.svg` | Symbole rouge sur fond clair ou photographie tres claire |
| `logo-mark-inverse.svg` | Symbole blanc sur fond carbone, rouge ou photographie sombre |
| `logo-concepts.svg` | Planche de decision ; ne pas livrer dans l'application |

Le mot-symbole est compose en Alexandria Bold dans les maquettes. Avant depot de marque et livraison finale, il devra etre converti en contours vectoriels pour ne plus dependre d'une police installee.

## Zone de protection

L'unite `x` est la largeur du montant gauche du D.

- symbole seul : laisser au moins `1x` sur les quatre cotes ;
- logo horizontal : laisser `1.5x` autour de l'ensemble ;
- aucun texte, bord, photographie chargee ou autre logo dans cette zone.

## Tailles minimales

| Support | Minimum |
|---|---:|
| Favicon simplifie | 20 px |
| Interface standard | 24 px |
| Icone PWA | 48 px utile dans une zone de 64 px |
| Impression | 8 mm |
| Logo horizontal ecran | 132 px de large |

Sous 20 px, retirer la coupure de voie et utiliser uniquement la silhouette du D. Le favicon final sera exporte apres validation du symbole.

## Couleurs

```css
:root {
  --brand-signal: #d9382b;
  --brand-carbon: #17201e;
  --brand-chalk: #f6f7f3;
  --brand-surface: #ffffff;
  --brand-success: #087f5b;
  --brand-warning: #f2b134;
  --brand-route: #176b87;
  --brand-border: #d8deda;
  --brand-muted: #5d6965;
}
```

### Repartition

- Craie et blanc : environ 70 % de l'interface.
- Carbone et gris : environ 20 %.
- Rouge signal : moins de 10 %, reserve a la marque et a l'action principale.
- Vert, ambre et bleu : uniquement pour leur fonction semantique.

Le rouge signal ne sert pas a afficher une erreur de formulaire ordinaire. Une teinte de danger distincte sera definie dans le design system produit pour eviter de confondre marque et erreur.

## Typographie

### Alexandria

Reservee au logo compose, aux titres de page et aux chiffres de statut importants. Graisses 600 et 700 uniquement.

### IBM Plex Sans

Utilisee pour la navigation, les formulaires, les prix, les tableaux et le texte courant. Graisses 400, 500 et 600.

Les deux familles couvrent la future interface arabe. La mise en page ne doit jamais supposer qu'un libelle francais et sa traduction ont la meme largeur.

## Iconographie

- Bibliotheque Lucide uniquement pour l'interface.
- Trait de 2 px a la taille standard de 24 px.
- Icone accompagnee d'un texte pour les commandes non universelles.
- Pas d'icone de depanneuse dessinee a la main dans l'interface.
- Le symbole de marque n'est jamais utilise comme une icone d'action.

## Photographie

Les images montrent une intervention reelle, le vehicule concerne et un professionnel identifiable. Elles sont lumineuses, prises au niveau humain et suffisamment larges pour comprendre la situation.

Eviter :

- images de nuit tres sombres ;
- gros plans abstraits sur des outils ;
- voitures de luxe sans rapport avec le marche ;
- depanneuses et uniformes manifestement non marocains ;
- filtres rouges ou degradation volontaire de la lisibilite.

## Mouvement

L'animation de marque peut tracer la fleche en 250 ms lors d'un chargement initial. Elle ne se repete pas et disparait avec `prefers-reduced-motion`. Les confirmations d'etat utilisent un mouvement fonctionnel, jamais une animation celebratoire longue.

## Interdictions

- ne pas etirer, incliner ou faire pivoter le symbole ;
- ne pas appliquer de degrade, ombre ou contour au logo ;
- ne pas changer le rouge en fonction des pages ;
- ne pas placer la version rouge sur un fond de contraste insuffisant ;
- ne pas separer la fleche de la boucle ;
- ne pas utiliser le logo comme bouton flottant ;
- ne pas ajouter une cle, un eclair ou une croix au symbole.

## Validation avant gel

1. Test de reconnaissance non assiste a 24 px.
2. Test d'impression noir et blanc a 8 mm.
3. Test sur icone PWA Android et iOS.
4. Test avec cinq clients et cinq depanneurs par ville.
5. Recherche d'anteriorite OMPIC et disponibilite des domaines.
6. Conversion du mot-symbole final en contours.