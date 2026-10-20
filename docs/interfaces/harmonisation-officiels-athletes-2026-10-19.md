# Officiels COC — adaptation au modèle des athlètes

## Analyse préalable

Cible : COC, branche `design/coc-febaco-visual-20261019`. Référence : liste et fiche Athlètes COC déjà harmonisées sur FEBACO. Autres dépôts et modifications existantes préservés ; aucun push ni déploiement.

| Élément | Modèle Athlètes | Officiels avant | Adaptation prévue |
|---|---|---|---|
| Liste sexe/âge | Cellule centrée, sexe 14 px / 600 au-dessus de l'âge 12 px atténué | Colonnes Sexe et Date de naissance séparées | Même cellule superposée, mêmes dates acceptées et même calcul d'âge |
| Organisation | Rattachement en texte 14 px / 500 | Badge outline autour du sigle | Retirer uniquement le Badge d'organisation ; conserver son libellé, sa résolution et son filtre |
| Bandeau | Avatar 80 px, nom 24 px / 700, sous-titre texte et statut, pleine largeur | Profil latéral 1/3 avec fiche dans 2/3 | Même bandeau que l'athlète, avec organisation COC |
| Général | Quatre cartes en deux colonnes : Identité, Contact, Identifiants, Observations | Grille de champs dans ActorDetailLayout | Reprendre exactement les composants et espacements ; conserver la nationalité propre à l'officiel |
| Observations | Quatrième carte, lecture du champ existant | Champ non projeté dans la fiche | Projeter `row.observations` en lecture seule ; ce champ figure déjà dans le mapping OFFICIELS |
| Onglets métier | Général, Documents, Équipes nationales, Sélections | Documents, Parcours, Équipes nationales, Activités | Général, Documents puis Parcours, Équipes nationales et Activités ; aucune fonctionnalité métier supprimée |
| Photos / passeport | Photo dans les formulaires, passeport dans Documents | Photo dans fiche et formulaires via layout partagé | Aucun bouton photo dans le bandeau ; champs photo des formulaires conservés ; ouverture/ajout/remplacement du passeport conservés |
| Modification et affiliations | Volet d'édition spécifique | Volet d'édition et OfficialAffiliations compact modifiable | Préserver les formulaires, validations, endpoints et la gestion des affiliations |

Pour maintenir une correspondance exacte entre les deux familles, les parties visuelles communes (cellule sexe/âge, bandeau, carte d'informations, carte passeport) sont extraites du rendu Athlètes dans un composant partagé. Les états, formulaires et données de chaque famille restent dans leur client spécifique. `ActorDetailLayout` n'est pas modifié.

La comparaison est fondée sur le code. La session ne fournit pas de navigateur accessible lors des vérifications précédentes ; aucune capture ni validation visuelle n'est revendiquée. Contrôles prévus : tests métier et interfaces ciblés, TypeScript, lint, build et relance locale.

## Réalisation et contrôles

Les adaptations du tableau ci-dessus sont réalisées. `components/dashboard/actor-record-layout.tsx` partage désormais la cellule sexe/âge, le bandeau, les cartes et le passeport entre Athlètes et Officiels. Les deux clients de liste et de détail utilisent ces composants ; la page serveur Officiels projette aussi les observations existantes. Les formulaires, filtres, affiliations, routes et permissions restent conservés.

- 23 tests ciblés Officiels/Athlètes et identité/fraîcheur des acteurs réussis.
- TypeScript sans émission, ESLint sur les six fichiers concernés et build de production réussis.
- `git diff --check` réussi ; aucun push ni déploiement.
- Prévisualisation locale relancée sur le port 3107 après compilation.

Reste ouvert : vérification visuelle réelle sur ordinateur et mobile, notamment des longues valeurs et des cinq onglets des officiels. Aucun navigateur accessible : aucune capture avant/après ni contrôle visuel du contraste ou du focus n'a été réalisé.
