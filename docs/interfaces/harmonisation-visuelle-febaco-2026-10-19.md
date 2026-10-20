# Harmonisation visuelle COC depuis FEBACO — 19 octobre 2026

## Périmètre et méthode

- Référence lue : `C:/Projets/SNDS-HARMONISATION/febaco-reference`, dépôt `Rodanyoca/saas_febaco`. Aucun fichier de cette référence n'est modifié, notamment CPU/P3.
- Cible modifiée : `C:/Projets/SNDS-HARMONISATION/coc-cible`, dépôt `Rodanyoca/coc-managment`, point de départ `4dd9731`.
- Branche de travail : `design/coc-febaco-visual-20261019`, créée depuis `design/harmonisation-febaco`. La suppression préexistante de `.env.example` est conservée et exclue de l'intervention.
- Aucun `AGENTS.md` trouvé dans les dépôts ni dans leurs parents consultés. Lecture des `CONTEXT.md`, ADR COC, layouts, CSS réellement importés et composants partagés.
- Compétences utilisées : Product Design/audit (recherche de surface et limites de preuve), vérification frontend, revue React.
- Le 19 octobre, `cua.getState()` renvoie `apps: []`, `browsers: []`. Aucune capture avant/après ni mesure de styles calculés dans un navigateur n'est disponible. Les observations ci-dessous sont une analyse du code et de sa cascade, pas un audit visuel accompli.

## Tableau des écarts et adaptations

| Élément | Référence FEBACO | État COC avant | Écart | Adaptation prévue / réalisée | Fichiers concernés COC |
|---|---|---|---|---|---|
| Chargement des polices | `next/font/google`, Geist et Geist Mono, sous-ensemble latin ; CSS nommé Geist | Aucun chargement ; Inter déclaré sans fichier ni import ; Cascadia/Consolas en mono | Familles différentes et chargement absent | Charger Geist et Geist Mono avec Next ; relier explicitement les variables générées au thème et conserver les secours générés par Next | `app/layout.tsx`, `app/globals.css` |
| Précision sur la référence | Instances `_geist` et `_geistMono` sans classe/variable attachée au body ; CSS compilée existante : `@font-face` nommé Geist et `.font-sans{font-family:Geist,Geist Fallback}` | Police Inter non chargée | Le code seul pouvait laisser une ambiguïté ; la CSS compilée montre bien le raccordement par nom dans FEBACO | Même famille et même mécanisme Next ; liaison explicite par variables dans COC. Ne pas conclure à un défaut de police FEBACO sans mesure navigateur | Rapport, layout et CSS |
| Palette et fond | Fond `#071c32`, carte `#0c2742`, texte `#f7fafc`, atténué `#9db2c6`, or `#f6c515`, focus `#58c5ff` ; fond en dégradés | Valeurs déjà identiques ; bloc `.dark` les répète | Redondance et risque de divergence ; alias sidebar-muted absent | Garder les valeurs, supprimer la duplication `.dark`, exposer sidebar-muted ; conserver les couleurs institutionnelles COC | `app/globals.css` |
| Texte courant et secours | Taille de base Tailwind 16 px / 24 px ; `text-sm` 14 / 20 ; `text-xs` 12 / 16 ; graisse normale 400 | Même échelle Tailwind mais famille différente | Métriques différentes malgré les mêmes classes | Même police et même échelle ; aucune règle globale écrasant les tailles locales | Layout, CSS |
| Bandeau et titre principal | Minimum 64 px, padding horizontal 24 px, vertical 12 px ; titre 20 / 28 px, 700, approche -0,02em ; trait gauche or ; fond background/90 | Minimum 80 px ; titre 20 puis 24 px, 600 ; fond card/80 ; ombre claire | Hiérarchie et densité différentes | Reprendre valeurs, couleurs et décoration ; conserver actions et déconnexion COC ; titre autorisé à revenir à la ligne sur petit écran | `components/dashboard/header.tsx` |
| Navigation | Largeur 256 px, fond sidebar, ombre sombre, identité dans un bandeau de 64 px avec filet bleu/or/rouge ; liens 14 / 20 px, 500 ; actif or sur texte sombre ; groupes 12 / 16 px, 600 | Bandeau 96 px, gros cartouche ; actif bleu avec texte or ; textes inactifs à opacité 70/80 % | Décor, contraste et rythme divergents | Même décor et styles des liens/groupes ; garder logo, dénomination, rubriques, filtrage des permissions et mécanisme de dépliage COC | `components/dashboard/sidebar.tsx` |
| Titres de sections du dashboard | 18 / 28 px, 600, couleur foreground ; séparation supérieure et padding 24 px | Plusieurs titres 11 px, 700, capitales, or, trait décoratif ; synthèse en 12 px | Hiérarchie très différente | Harmoniser uniquement les composants de synthèse identifiés ; garder textes, sections et indicateurs COC | `components/dashboard/*summary-section.tsx`, `territorial-structure-section.tsx` |
| Titres autonomes des pages Utilisateurs | Rôle de titre principal : 20 / 28 px, 700, approche -0,02em | Trois titres autonomes en 24 / 32 px, 600 | Le bandeau partagé ne couvre pas ces pages | Appliquer le même rôle typographique aux titres de liste, détail et création ; conserver la structure de ces pages | `app/dashboard/utilisateurs/users-client.tsx`, `[id]/user-detail-client.tsx`, `nouveau/new-user-client.tsx` |
| Valeurs de synthèse | 30 / 36 px, 700, approche -0,04em ; descriptions 12 / 16 px ; accent gauche or | 36 / 40 px, 600 ; descriptions 14 / 20 px ; grille jusqu'à 7 colonnes | Densité et poids différents | Même rôle typographique et accent ; conserver tous les indicateurs ; grille responsive au maximum trois colonnes | `general-summary-section.tsx` |
| Tableaux | En-tête 12 / 16 px, 700, capitales, approche 0,06em, hauteur 44 px, padding horizontal 12 px ; cellules padding 12 px ; défilement horizontal | Composant 14 px/500 surchargé globalement à 0,72rem/700 ; cellule forcée à 52 px, padding 8 px | Surcharges contradictoires et densité différente | Aligner les classes du composant et retirer les surcharges globales ; conserver les largeurs/visibilités métier locales | `components/ui/table.tsx`, `app/globals.css` |
| Boutons et liens | 14 / 20 px, 500 ; hauteur standard 36 px ; arrondi md (8 px) ; primaire or ; outline/ghost accent bleu ; focus 3 px ring/50 | 600, ombres dorées, déplacement au survol ; variantes différentes | Effets et poids différents | Reprendre les chaînes de styles des variantes communes ; événements, propriétés, liens et états désactivés inchangés | `components/ui/button.tsx` |
| Formulaires | Input 36 px ; texte 16 px puis 14 px à md ; fond transparent ; focus ring/50 de 3 px ; select 36/32 px, popup md | Input 40 px ; fond background/60, ombres internes ; popup lg avec ombre différente | Contrôles visuellement divergents | Aligner uniquement les classes communes input, textarea, select ; labels déjà identiques ; aucune validation modifiée | `components/ui/input.tsx`, `textarea.tsx`, `select.tsx` |
| Badges et états | 12 / 16 px, 500, casse du contenu, rayon md, padding 8 px / 2 px | 11 px, 600, capitales, pilule, padding 10 px / 4 px | Densité et hiérarchie différentes | Même composant visuel ; conserver les valeurs et couleurs sémantiques des états COC | `components/ui/badge.tsx` |
| Cartes | Fond card/95, border/80, rayon xl 14 px, ombre `0 12px 30px rgba(1,10,20,.12)` ; titre 600/leading-none | card/90, border/75, ombre claire doublée par CSS globale ; surcharges locales des fiches | Superpositions empêchant l'alignement | Aligner le composant, retirer la surcharge globale et les surcharges de cartes de la fiche acteur partagée | `components/ui/card.tsx`, `app/globals.css`, `actor-detail-layout.tsx` |
| Onglets et dialogues | Couleurs sémantiques, arrondi lg ; dialogues partagés | Dialog identique ; TabsList a `!flex !w-full` | Largeur COC volontaire, styles impératifs gênants | Conserver la largeur pleine et le modèle COC, remplacer les `!` par des valeurs ordinaires surchargeables ; ne pas importer de nouveau comportement | `components/ui/tabs.tsx` |
| Petits écrans | Tables scrollables ; référence sidebar fixe 256 px et main pl-64 | Sidebar 256 px dans flex ; main sans min-width ; aucun volet mobile fonctionnel | Risque de rétrécissement/débordement existant | Ajouter min-w-0 au contenu, permettre le retour à la ligne du bandeau ; ne pas créer de navigation mobile ni de routes | `app/dashboard/layout.tsx`, `header.tsx` |
| CSS non importée | `styles/globals.css` présent mais layout importe `app/globals.css` | Même situation | Risque de corriger un fichier inactif | Modifier seulement la feuille effectivement importée ; fichier inactif laissé intact | `app/globals.css` |

## Identité COC conservée

Nom « Comité Olympique Congolais », logo `/images/logo-coc.png`, métadonnées COC, contenus, sports, fédérations, couleurs `--coc-*` et libellés restent propres au COC. Aucun logo, libellé ou contenu institutionnel FEBACO n'est importé dans le produit. Les composants UI communs ne contiennent que des styles génériques.

## Différences fonctionnelles légitimes conservées

- COC est multisport et fédératif : fédérations, cercles selon la hiérarchie de chaque fédération, médailles, programmes de compétitions, campagnes et site web restent présents.
- Les indicateurs et colonnes COC sont conservés, y compris les indicateurs de complétude : cette intervention ne reprend pas les suppressions fonctionnelles effectuées dans FEBACO.
- Autorisations explicites par blocs, super-administrateurs, accès conditionnels à la navigation, validation des formulaires, actions et endpoints sont inchangés.
- Aucun changement des API, proxy, schémas, routes ou données. Dans `lib/`, l'étiquette de navigation « Entités » devient « Fédérations » lors de la seconde passe demandée ; la troisième passe demandée ajoute le comptage des résultats au chargement de la synthèse. Les autorisations et destinations restent identiques. Aucune modification CPU/P3 de FEBACO, aucun push, aucun déploiement.

## Vérification : état initial

| Écran / contrôle | Inspection du code | Validation navigateur |
|---|---|---|
| Tableau de bord `/dashboard` | Synthèses, titres et tableaux examinés | Non réalisée : navigateur indisponible |
| Liste `/dashboard/federations`, liste d'athlètes | Composants de tables, filtres, avatars, boutons et titres examinés | Non réalisée |
| Fiche `/dashboard/acteurs/athletes/[id]` | Fiche et `ActorDetailLayout`, cartes, onglets, champs et documents examinés | Non réalisée |
| Formulaire de compétition `/dashboard/competitions/nouveau` | `CompetitionForm`, inputs/selects/textarea, états et validations examinés | Non réalisée |
| Paramètres `/dashboard/federations/[id]/parametres` | En-tête, cartes, onglets, dialogues, formulaires et tables examinés | Non réalisée |

Les routes à identifiant nécessitent un compte et des données existants. Aucun compte créé, aucune donnée soumise pour la vérification.

## Résultats finaux

Toutes les adaptations du tableau sont implémentées dans COC. Les valeurs métier, expressions de calcul, contenus, endpoints et règles de filtrage sont conservés. Les sept composants UI alignés (button, input, textarea, select, badge, card, table) avaient des différences limitées à leurs chaînes de styles : leurs interfaces et leurs interactions n'ont pas été remplacées par des pages FEBACO.

### Contrôles exécutés

| Contrôle | Résultat | Portée réelle |
|---|---|---|
| `npx.cmd tsc --noEmit` | Réussi, code de sortie 0 | Types du projet ; aucun contrôle visuel |
| `npm.cmd run build`, relancé après les dernières retouches | Réussi, compilation 6,7 s, TypeScript 21,3 s, génération 40/40 pages | Compilation finale et pré-rendu ; routes protégées dynamiques non parcourues avec une session |
| `npm.cmd run lint` | Code 0, aucune erreur, un avertissement | `react-hooks/set-state-in-effect` dans `components/dashboard/athlete-sport-history.tsx:27`, fichier non modifié, hors intervention |
| Tests existants ciblés (commande ci-dessous) | 17 tests réussis, aucun échec | Navigation et permissions visibles, formulaires, indicateurs et contrats de structure responsive du code |
| `git diff --check` | Réussi | Espaces et conflits, pas le rendu |
| Comparaison AST des 24 TSX modifiés hors layout des polices, première passe | Structure/expressions identiques après neutralisation des chaînes et attributs visuels ; ajout des noms accessibles contrôlé séparément | Vérification statique complémentaire de la première passe, pas une preuve de fonctionnement navigateur ; la seconde passe de navigation ci-dessous restructure ensuite uniquement la présentation de la sidebar |
| Lecture CSS compilée COC | Variables `--font-geist-sans: "Geist", "Geist Fallback"` et mono présentes ; `font-display:swap`, faces variables 100–900 et fichiers WOFF2 générés ; `.font-sans` raccordée à la variable ; tokens de taille et graisse vérifiés | CSS réellement produite par le build, sans mesure de style calculé ou de police rendue dans un navigateur |
| Serveur local `npm.cmd run start -- --hostname 127.0.0.1 --port 3107` | Démarré, prêt | Prévisualisation locale uniquement, aucun déploiement |
| Lecture HTTP `/login` | 200 ; identité COC, classe `font-sans` et variables de polices présentes dans le HTML | Réponse HTTP du produit réel, sans capture d'écran |
| Lecture HTTP des deux polices préchargées et des trois CSS liés au login | 200 pour les cinq ressources | Distribution des ressources compilées ; pas de preuve de leur apparence à l'écran |
| Lecture HTTP des cinq types de pages protégées | 307 vers `/login` sans session | Authentification conservée ; aucune tentative de contournement, aucune validation de leur rendu authentifié |

Commande des tests :

```powershell
node --test tests/unit/dashboard-navigation.test.ts tests/unit/federations-responsive-ui.test.ts tests/unit/federations-dashboard-ui.test.ts tests/unit/competition-create-form.test.ts tests/unit/actors-dashboard-completeness.test.ts tests/unit/dashboard-medals.test.ts
```

Les requêtes HTTP de détail utilisaient le segment fictif `verification-visuelle`, sans lecture d'une fiche métier ni création de données. Les écrans représentatifs inspectés restent ceux du tableau de vérification : dashboard, liste, fiche, formulaire, paramètres.

### Lisibilité et contraste : calculs, pas audit navigateur

Ratios calculés par luminance relative sRGB sur les couleurs opaques des tokens :

| Couple texte / fond | Ratio | Lecture |
|---|---:|---|
| Texte principal `#f7fafc` / fond `#071c32` | 16,41:1 | Supérieur à 4,5:1 |
| Texte atténué `#9db2c6` / carte `#0c2742` | 6,95:1 | Supérieur à 4,5:1 |
| Texte primaire `#071827` / or `#f6c515` | 11,05:1 | Supérieur à 4,5:1 |
| Couleur de focus opaque `#58c5ff` / fond `#071c32` | 8,88:1 | Couleur distincte ; anneaux avec opacité à vérifier dans leur contexte |
| Blanc `#ffffff` / accent `#1188c7` | 3,91:1 | Inférieur à 4,5:1 pour petit texte normal |
| Blanc `#ffffff` / destructif `#e7495f` | 3,81:1 | Inférieur à 4,5:1 pour petit texte normal |

Les deux derniers couples sont hérités de la palette de référence. Ils n'ont pas été recolorés silencieusement : une divergence de palette nécessiterait une décision de design. Les couleurs d'état propres au COC restent conservées. Ces calculs ne certifient pas les contrastes des fonds avec transparence, survols, sélections et focus réellement composites.

### Écarts et vérifications encore ouverts

1. **Navigateur indisponible** : aucune capture avant/après, aucune validation visuelle du dashboard, de la liste, de la fiche, du formulaire ou des paramètres. Rien dans ce rapport ne doit être présenté comme une validation à l'écran.
2. **Mobile et navigation existante** : la sidebar COC mesure 256 px déployée ; la seconde passe lui ajoute le mode réduit de 64 px de FEBACO. Le bouton Menu existant du bandeau n'a pas de gestionnaire ; aucun volet mobile n'a été créé. `min-w-0`, le retour à la ligne des titres, la réduction manuelle et la grille de synthèse réduisent les contraintes CSS, mais l'absence de débordement/coupure ne peut pas être garantie sans navigateur.
3. **Focus réel** : anneaux communs et indication de focus sur les éléments de navigation présents dans le code ; parcours clavier, pièges de focus Radix, visibilité et rognage des anneaux à contrôler à l'écran.
4. **États et cas longs** : vérifier après authentification les textes longs, données absentes, erreurs, tableaux larges, onglets des paramètres et dialogues sur ordinateur et mobile. Les marqueurs sémantiques métier restent volontairement distincts de ceux de FEBACO.
5. **Contrastes hérités** : les deux couples blanc/accent et blanc/destructif ci-dessus restent ouverts. Aucune conformité WCAG globale n'est revendiquée.

La suppression préexistante de `.env.example` demeure intacte. Les fichiers suivis générés par les contrôles (`next-env.d.ts`, `tsconfig.tsbuildinfo`) sont remis dans leur état initial pour ne pas polluer la livraison. Aucun commit, push ou déploiement n'a été effectué pendant cette intervention.

## Seconde passe demandée : reprendre exactement la navigation FEBACO

La demande de suivi autorise la reprise des interactions de présentation de la navigation FEBACO, au-delà des seules classes de la première passe.

- Titres de section : mêmes classes de FEBACO, 12 px, graisse 600, capitales, approche `tracking-wide`, padding 12/8 px, survol bleu et texte clair. Le survol concerne le titre uniquement, sans teinter tous ses descendants.
- Liens : tous utilisent un composant commun avec les classes exactes de FEBACO : 14 px, graisse 500, padding 12/10 px, icône 20 px, espacement 12 px, arrondi 8 px. Aucun sous-menu plus fin ou sans icône.
- Actif : fond or et texte sombre ; inactif : `sidebar-muted` ; survol : `sidebar-accent` et `sidebar-foreground`. La sélection reste visible sur les routes de détail descendantes.
- Groupes adaptés à COC : Structure territoriale → Fédérations ; Acteurs → familles existantes ; Compétitions ; Équipes nationales ; Administration → activités, documents, site web et utilisateurs selon leurs accès. Aucun lien territorial FEBACO, licence ou paramètre inexistant dans COC n'est ajouté.
- « Entités » est renommé « Fédérations » dans la configuration de navigation. Le lien reste `/dashboard/federations` et le bloc reste `AUT-SPT`.
- Les titres replient/déplient leur groupe avec les mêmes chevrons que FEBACO. Le titre Acteurs conserve en plus sa destination COC `/dashboard/acteurs`, et son chevron reste une commande distincte : aucune destination précédente n'est perdue.
- Réduction globale : même commande ronde, même position, mêmes survols et focus ; largeur 256/64 px, liens en icônes avec noms accessibles et infobulles en mode réduit. Le layout flex COC reste en place et le contenu récupère automatiquement la largeur libérée.
- Identité : logo COC conservé, sigle COC avec le même style 18 px / graisse 900 / approche 0,12em que la référence ; nom institutionnel complet accessible. L'étiquette « Navigation » et le pied de barre décoratif absents de FEBACO sont retirés.
- Les icônes communes (acteurs, activités, compétition, équipe nationale) reprennent celles de la référence ; fédérations, site web et utilisateurs gardent les icônes adaptées au COC.
- Le filtrage `visibleDashboardNavigation` est appliqué avant tout regroupement : un groupe sans destination autorisée n'est pas affiché. Les accès, destinations et données métier ne changent pas.

Contrôles finaux : sept chaînes de styles communes comparées littéralement au fichier FEBACO et identiques ; quatre tests existants de navigation réussis ; TypeScript réussi ; lint ciblé de `sidebar.tsx` et `dashboard-navigation.ts` sans erreur ni avertissement ; `git diff --check` réussi. Le build final, après la correction de la sélection unique en mode réduit, réussit : compilation 6,9 s, TypeScript 19,1 s, 40/40 pages générées. Le navigateur reste indisponible (`apps: []`, `browsers: []`) : les interactions, graisses effectivement rendues, survols et rendu réduit ne sont pas déclarés validés à l'écran. La prévisualisation locale du port 3107 est redémarrée sur ce build.

## Troisième passe demandée : synthèse 3 × 3 et en-têtes sans fond

- Deux blocs ajoutés à la synthèse, avec les mêmes styles et une description : **Résultats** et **Complétude**. La grille contient neuf blocs sur trois colonnes lorsque toutes les sections sont autorisées et disponibles ; le filtrage existant par autorisations et disponibilité reste appliqué.
- Résultats : nombre de résultats courants, via `getCompetitionResults(undefined, false)` déjà utilisé par le métier, sans compter les versions historiques corrigées. Le chargement existant des statistiques de compétitions fournit maintenant `totalResults` ; aucune écriture de données ni nouvelle route.
- Complétude : moyenne des taux par famille pondérée par leurs effectifs, arrondie comme dans le total du tableau Acteurs. Zéro lorsqu'aucun acteur n'est enregistré. Il s'agit du taux des champs renseignés, et non du pourcentage de fiches entièrement complètes.
- Fonds retirés des lignes d'en-tête des huit tableaux d'indicateurs : fédérations, structures territoriales, acteurs, activités, compétitions, médailles, équipes nationales et documents. Les lignes `<TableHeader><TableRow>` utilisent désormais le même rendu par défaut que FEBACO. Les colonnes, données et lignes de total sont conservées ; aucune surcharge globale ajoutée aux autres tables.
- Fichiers concernés : `components/dashboard/general-summary-section.tsx`, les huit composants de tableaux de synthèse, `lib/competitions/dashboard.ts`.
- Contrôles finaux : TypeScript réussi ; 13 tests existants réussis (complétude, politique de résultats, médailles, tableau des fédérations, navigation) ; lint ciblé sans erreur ; `git diff --check` réussi ; build réussi (compilation 7,7 s, TypeScript 18,9 s, 40/40 pages générées). Contrôle statique : neuf cartes et aucune surcharge de fond dans les huit en-têtes. La validation visuelle en navigateur reste non réalisée. Prévisualisation locale du port 3107 relancée avec ce build.

## Quatrième passe demandée : liste et fiche des fédérations

La demande de suivi remplace explicitement la grille de liste et les onglets de fiche précédents. La référence examinée est la liste réelle des ligues (`TerritorialManager`, sa configuration `ligues`, `DataTable`) et la fiche de ligue avec ses cartes d'informations et ses tableaux successifs.

| Élément | Adaptation COC |
|---|---|
| Liste des fédérations | Vrai tableau HTML au format FEBACO : bordure, rayon xl, fond card/90, ombre sombre, en-tête muted/70, survol des lignes muted/30, cellules du composant Table partagé. Logo en premier, nom, sigle, catégorie, reconnaissance et affiliation COC conservés ; action œil accessible. |
| Identifiants | Colonne Identifiant supprimée de la liste ; identifiant de fédération retiré des informations visibles de la fiche ; colonnes ID COC et ID fédéral retirées des tableaux territoriaux. Identifiants techniques conservés dans les données, clés React, recherches et destinations. |
| Recherche, filtre et pagination | Recherche et filtre par catégorie conservés ; retour à la première page lors de leur modification. Liste paginée en 10/25/50/100 comme FEBACO, boutons à chevrons avec noms accessibles ; table défilable horizontalement via le composant partagé sur petit écran. |
| Fiche sans onglets | Quatre cartes successives dans une grille à deux colonnes sur ordinateur, une sur petit écran : Informations générales ; Coordonnées et contacts ; Rattachement continental ; Rattachement international. Les champs, logos, statuts, liens et contacts COC sont conservés sans répéter le logo dans un second onglet. |
| Champs des cartes | Présentation libellé à gauche / valeur à droite en 14 px, graisse 500 pour les valeurs, comme `DetailCard` FEBACO. Retour à la ligne autorisé ; largeur des libellés limitée sur petit écran. |
| Structure territoriale après les cartes | Résumé de la hiérarchie puis un tableau par niveau configuré, dans son ordre réel. Les niveaux non configurés ne génèrent plus de cartes inutiles. Les niveaux configurés vides conservent un message explicite ; une erreur de chargement reste signalée. Recherche et pagination 10/20/50 propres à ces tableaux conservées. |
| Accès et données | Création toujours conditionnée à `canWrite`, modification toujours conditionnée à `AUT-SPT:WRITE`, contacts en lecture seule dans la fiche. Aucune nouvelle route, aucun changement d'API, de schéma ou d'enregistrement. |

Fichiers : `app/dashboard/federations/federations-client.tsx`, `app/dashboard/federations/[id]/page.tsx`, `components/dashboard/federation-structure-section.tsx`. Les contrats de tests existants qui exigeaient une grille et deux onglets sont actualisés pour la nouvelle demande ; les tests métier de mapping, de contacts, de hiérarchie, de création et de logo sont conservés.

Contrôles finaux : TypeScript réussi ; 19 tests ciblés réussis (responsive/liste, nouvelle disposition, logo, structure, données des entités et création) ; lint des trois fichiers de production sans erreur ni avertissement ; `git diff --check` réussi ; build réussi (compilation 7,4 s, TypeScript 17,1 s, 40/40 pages générées). Aucun navigateur disponible pour des captures ou une validation visuelle réelle. Prévisualisation locale sur le port 3107 relancée avec ce build. Aucun push ni déploiement.

## Ajustement demandé : largeur des deux premiers blocs de la fiche

Les blocs « Informations générales » et « Coordonnées et contacts » occupent maintenant chacun toute la largeur de la grille, l'un après l'autre. Les rattachements continental et international restent côte à côte sur ordinateur ; les tableaux territoriaux gardent leur disposition. Le composant local `FederationInfoBlock` reçoit seulement une option de largeur `wide`, appliquée à ces deux blocs. Aucune modification des champs, données ou interactions.

Build et TypeScript réussis : compilation 5,6 s, vérification des types 17,8 s et 40/40 pages générées. La prévisualisation locale est relancée. Validation visuelle en navigateur non réalisée.

### Correction suivante : informations générales compactes

À la demande de réduire l'espace vide, le bloc « Informations générales » reste sur sa propre ligne mais sa largeur est plafonnée à 42 rem (672 px avec la taille de base standard) sur ordinateur, aligné à gauche. Il garde la largeur disponible sur petit écran. « Coordonnées et contacts » reste en pleine largeur ; les deux rattachements et les tableaux territoriaux ne changent pas.

### Correction précisée : pleine largeur et hauteur réduite

La précision suivante remplace le plafond de largeur ci-dessus : « Informations générales » utilise de nouveau toute la largeur. Ses champs sont répartis sur deux colonnes à partir de `sm`, avec le logo et l'identité à côté des champs à partir de `xl`. Les observations utilisent la largeur des deux colonnes de champs. La hauteur est ainsi réduite sans laisser une zone vide à droite du bloc ; sur petit écran, les informations se superposent pour rester lisibles.

Les tableaux de fin de fiche sont limités aux niveaux **Ligues, Ententes et Clubs**, lorsqu'ils sont configurés, dans leur ordre territorial existant. Les tableaux Équipes et Cercles ne sont plus affichés dans cette section. Le composant de hiérarchie, ses niveaux et ses compteurs restent inchangés ; aucune équipe ni relation n'est supprimée des données ou des paramètres.

Les sept tests ciblés existants sur les interfaces de fédérations et le modèle territorial réussissent. Lint ciblé et `git diff --check` réussis. Build final réussi : compilation 7,1 s, TypeScript 17,5 s et 40/40 pages générées. La prévisualisation locale est relancée sur ce build. La vérification visuelle en navigateur reste non réalisée.

### Recomposition des alignements après retour utilisateur

Le modèle libellé à gauche / valeur à droite est remplacé, dans cette fiche seulement, par des champs de type définition : libellé au-dessus, valeur alignée à gauche. Le bandeau d'identité regroupe le logo (64 px), le nom, le sigle et le statut. La grille d'informations occupe toute la largeur, avec deux colonnes puis trois sur grand écran ; les sous-grilles CSS partagent les lignes des libellés et valeurs, y compris quand un libellé revient à la ligne. Les observations sont dans une zone distincte, en bas du bloc. Les coordonnées utilisent le même principe, jusqu'à quatre colonnes sur grand écran ; les rattachements bénéficient aussi de champs alignés à gauche. Aucun champ ni accès n'est supprimé.

Contrôles : neuf tests d'interface/logo réussis ; lint ciblé et contrôle de diff réussis ; build réussi (compilation 5,2 s, TypeScript 19,5 s, 40/40 pages). Nouvelle tentative d'accès navigateur : `apps: []`, `browsers: []`. Les alignements décrivent l'implémentation CSS, pas un rendu inspecté à l'écran. Prévisualisation locale relancée sur le port 3107.
