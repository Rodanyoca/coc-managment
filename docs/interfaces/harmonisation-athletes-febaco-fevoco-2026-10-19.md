# Athlètes COC — rapport d'écart et adaptation visuelle

## Périmètre et sources examinées avant modification

Branche COC : `design/coc-febaco-visual-20261019`. Les modifications existantes du workspace sont conservées. Cible unique : `C:/Projets/SNDS-HARMONISATION/coc-cible`. Aucun push ni déploiement.

Références en lecture seule :

- FEBACO : `app/dashboard/athletes/page.tsx`, `app/dashboard/athletes/[id]/page.tsx`, composants de détail et tableaux.
- FEVOCO : `components/athletes/athlete-detail.tsx`, `components/athletes/athletes-table.tsx`, `components/actors/actor-table.tsx`, `components/dashboard/detail-card.tsx`, `CONTEXT.md` et `AGENTS.md`. Les instructions FEVOCO concernent son propre dépôt ; il est seulement consulté comme référence dans cette intervention COC.
- COC : liste, projection serveur de la fiche, client de détail, `ActorDetailLayout`, `MediaUploadDialog`, historique sportif et tests correspondants. Les fichiers de mapping documentent `observations` dans `ATHLETES`.

Le rapport est enregistré avant l'implémentation. La session ne fournit pas de navigateur accessible lors des vérifications précédentes ; les comparaisons sont fondées sur le code réellement utilisé. Aucun rendu, survol, cadrage ou police effectivement visible n'est présenté comme validé par capture.

## Tableau d'écart

| Élément | Référence FEBACO / FEVOCO | COC avant | Adaptation prévue | Fichiers COC |
|---|---|---|---|---|
| Sexe / âge en liste | Une colonne centrée : sexe 14 px / 600, âge 12 px / couleur atténuée, nombres tabulaires ; `flex-col`, `leading-tight` | Sexe et date de naissance dans deux colonnes | Réunir dans « Sexe / âge », lettre au-dessus et âge en dessous ; date conservée dans les données et dans la fiche | `app/dashboard/acteurs/athletes/athletes-client.tsx` |
| Sexe inconnu | FEVOCO affiche un tiret, sans transformer l'inconnu en masculin | COC distingue les sexes pour ses filtres | Conserver les valeurs et filtres COC ; traduire seulement H en M pour le rendu de la cellule | Liste |
| Âge | Calcul d'anniversaire à partir de la naissance | Calcul local existant dans la fiche, absent de la liste | Fonction de présentation commune, sans dépendance de données ; accepter ISO et JJ/MM/AAAA, afficher un tiret si vide, impossible ou futur | `lib/athletes/presentation.ts`, liste et fiche |
| Fédération dans la liste | Même texte courant que les autres rattachements | Sigle placé dans un Badge outline | Texte simple 14 px / 500, sans fond, bordure ni pastille ; garder la résolution par identifiant COC et le sigle prioritaire | Liste |
| Bandeau de fiche | Carte pleine largeur ; avatar 80 px ; nom 24 px / 700 ; statut et actions à droite | Avatar et identité dans une colonne latérale de 1/3, onglets dans 2/3 | Reprendre le bandeau horizontal responsive, puis les onglets sur toute la largeur ; nom, avatar et statut COC | `app/dashboard/acteurs/athletes/[id]/athlete-detail-client.tsx` |
| Onglet principal | « Général », grille de quatre cartes en deux colonnes à partir de md | « Informations », grille de champs individuels dans une carte latérale | « Général » avec Identité, Contact, Identifiants, Observations en quatrième position ; mêmes cartes, titres, icônes, champs et espacements que la référence | Client de détail |
| Observations | Quatrième carte ; donnée FEVOCO réelle, texte de secours FEBACO | Champ non projeté dans `AthleteDetail` | Projeter en lecture seule `row.observations`, déjà documenté dans la feuille ATHLETES ; aucun ajout de schéma ni mutation. Secours explicite si vide | `app/dashboard/acteurs/athletes/[id]/page.tsx`, client |
| Fédération dans la fiche | Rattachements en texte | Badge dans mainInfo et sous-titre de profil | Texte simple, même sigle résolu par le référentiel COC ; ne pas importer de club ou de libellé FEBACO/FEVOCO | Client |
| Autres onglets | Affiliations et Licence dans les fédérations | Documents, Équipes nationales, Sélections dans COC | Garder ces onglets et leurs contenus COC, avec le style des onglets de référence ; ne pas créer d'affiliation/licence COC | Client, composants métier existants inchangés |
| Médias et modification | Actions dans bandeau / onglets | Édition Sheet, uploads avatar/passeport, ouverture du PDF | Conserver le Sheet, les validations, les endpoints et MediaUploadDialog ; replacer les actions sans changer leurs règles | Client |
| Autres acteurs | Hors demande | ActorDetailLayout partagé par plusieurs familles | Ne pas modifier le layout partagé ; la nouvelle composition concerne seulement les athlètes | Client |
| Responsive | Bandeau repliable, cartes sur une colonne puis deux, textes pouvant revenir à la ligne | Colonne latérale fixe sur grand écran | Bandeau avec flex-wrap, grilles responsive et noms longs autorisés ; onglets sur deux colonnes puis quatre | Client |

## Invariants conservés

Nom, sigle et identité COC ; identifiants national, fédéral et international ; filtres de recherche/fédération/sexe/statut ; tri ; routes et autorisations ; éditions et envois de médias ; historique sportif lu une seule fois via `useAthleteSportHistory(athlete.id)`.

L'adaptation ne copie ni les règles basketball, ni les identifiants FIBA/FIVB, ni les affiliations/licences de ces fédérations. Les contacts et le passeport COC restent disponibles. Aucun autre dépôt n'est modifié, notamment FEBACO CPU/P3.

## Vérification prévue

- Tests ciblés sur l'âge, le sigle de fédération, la fraîcheur des listes et l'historique sportif.
- TypeScript, lint des fichiers touchés et build COC.
- Inspection de la composition dans le code et de la CSS compilée ; distinguer ces contrôles d'une validation visuelle en navigateur.
- Mettre à jour ce rapport après réalisation et relancer la prévisualisation locale.

## Implémentation réalisée

Les adaptations prévues sont réalisées. La liste comporte huit colonnes : les anciennes colonnes Sexe et Date de naissance sont réunies dans Sexe / âge. La date reste dans les données, dans la fiche et en infobulle de l'âge. Les filtres continuent d'utiliser leurs valeurs COC d'origine ; l'affichage masculin est M, sans transformer les valeurs inconnues en masculin. Le sigle de fédération est du texte simple, avec le même poids que les autres valeurs de rattachement.

La fiche est composée dans son client spécifique : bandeau pleine largeur avec avatar de 80 px, nom de 24 px en graisse 700, sigle en texte et statut ; onglets Général, Documents, Équipes nationales, Sélections. Général contient exactement quatre cartes, en deux colonnes à partir de md : Identité, Contact, Identifiants, Observations. Le composant local `AthleteInfoCard` reprend les conventions `DetailCard` de la référence (titre 18 px, icône 20 px, champs 14 px, espacement des rangées 12 px). Les champs des deux premiers blocs et les identifiants restent ceux du COC ; aucune nationalité, affiliation ou licence n'est inventée.

L'onglet Documents conserve les références du passeport, son ouverture, son ajout et son remplacement. L'avatar et le passeport utilisent toujours `MediaUploadDialog`, le même endpoint et la même vérification d'identité. Le volet d'édition, ses validations et ses envois sont conservés. L'historique sportif utilise toujours une seule instance du hook existant et les mêmes composants.

### Fichiers de ce lot

- `app/dashboard/acteurs/athletes/athletes-client.tsx` : cellule sexe/âge et présentation du sigle, 12 lignes ajoutées / 9 retirées au diff du lot.
- `app/dashboard/acteurs/athletes/[id]/athlete-detail-client.tsx` : composition spécifique et cartes, 68 lignes ajoutées / 71 retirées.
- `app/dashboard/acteurs/athletes/[id]/page.tsx` : projection en lecture seule du champ existant `observations`, une ligne ajoutée.
- `lib/athletes/presentation.ts` : calcul d'âge partagé et vérification des dates.
- `tests/unit/athlete-age-presentation.test.ts` : tests métier du calcul de l'âge.
- Ce rapport : analyse préalable, adaptations, preuves et limites.

`ActorDetailLayout` n'a pas été modifié dans ce lot : les autres familles d'acteurs conservent leur présentation. Les changements précédents du dépôt COC sont préservés. Le nouveau helper, son test et ce rapport restent non suivis jusqu'à un éventuel commit autorisé ; aucun commit ni push effectué.

## Vérification finale

| Contrôle | Résultat | Limite |
|---|---|---|
| Tests ciblés | 13 réussis, zéro échec | Âge, résolution de la fédération, fraîcheur des listes, identité des lignes et historique sportif ; pas de test visuel |
| Âge | Anniversaire atteint/non atteint, ISO et format français, année bissextile, date impossible, future et absente testés avec une date figée | Date civile locale du navigateur pour la présentation |
| TypeScript | `npx.cmd tsc --noEmit --incremental false` réussi | Contrôle de types |
| Lint ciblé | Aucune erreur ni avertissement sur les quatre fichiers de production du lot | Sans modification du lint des fichiers hors lot |
| `git diff --check` | Réussi | Pas de validation du rendu |
| Build final | Réussi : compilation 10,3 s, TypeScript 13,6 s, 40/40 pages générées | Routes authentifiées non parcourues avec une session |
| Contrôles structurels | Quatre cartes dans Général, Observations en dernière position ; un seul hook d'historique ; huit colonnes de liste ; aucun Badge autour du sigle | Lecture du code, pas du DOM rendu |
| Navigateur | Nouvelle tentative : `cua.getState()` retourne `apps: []`, `browsers: []` | Aucune capture avant/après, aucune vérification visuelle réelle |

La prévisualisation locale COC sur le port 3107 est relancée avec le build final. Les fichiers suivis générés par Next/TypeScript sont remis dans leur état initial. Aucun push ni déploiement.

### Vérifications encore ouvertes

Contrôler à l'écran les noms et sigles longs, l'avatar absent, les valeurs manquantes, les quatre onglets, le focus clavier, le bandeau sur mobile et les quatre cartes de Général. Les envois de médias et l'édition n'ont pas été exécutés sur des données réelles pour cette vérification. Aucun alignement pixel à pixel ni absence de régression visuelle complète n'est revendiqué sans navigateur.

## Ajustement demandé : photo gérée dans les formulaires

Le bouton d'ajout/remplacement de photo et son `MediaUploadDialog` sont retirés du bandeau de la fiche. La photo reste affichée. Sa gestion passe par les champs déjà existants dans les formulaires : « Photo de l'athlète » à la création, « Ajouter une photo » ou « Remplacer la photo » dans Modifier → Fichiers selon l'état courant. Le libellé de modification est associé explicitement à son champ fichier. Les formats, limite de 4 Mo, validations et envois à l'enregistrement ne changent pas. Le dialogue du passeport dans Documents est conservé.
