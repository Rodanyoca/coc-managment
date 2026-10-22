# Livraison proposée — D1, C1 et S1

## Publication complète — état courant

**Validation finale terminée ; publication autorisée, pas encore effectuée.** Build normal avec vraies polices : 489 764 ms ; 19/19 tests CPU/documents, 23/23 autorisations, suite complète 319/325 avec les six mêmes échecs préexistants ; TypeScript et lint des fichiers applicatifs modifiés passent. Les sources complètes, évolutions parallèles comprises, sont préparées dans le checkout propre. Aucun gain CPU Vercel établi.

Voir le [rapport de publication](../audit-cpu-publication-2026-10-22.md) et ses preuves. Le déploiement précédent reste `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw` au SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`. Un patch de retour D1/C1 conservant S1 est préparé ; un retour complet pourrait réélargir les droits VIEWER. Invalidations globales et fraîcheur de sécurité restent au backlog distinct.

<!-- fin-statut-publication -->

Date : 22 octobre 2026. État historique de préparation avant publication ; état courant ci-dessus. Voir la [clôture de validation](../audit-cpu-cloture-2026-10-22.md), qui porte le verdict et les limites.

## Bases et périmètre exact

La production identifiée en lecture seule est `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw`, SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, branche `design/coc-febaco-visual-20261019`. Ce SHA est aussi HEAD local ; il ne contient pas les modifications locales. La référence de comparaison des lots est **ce HEAD plus les évolutions fonctionnelles locales préexistantes**. Les deux bases ne sont pas interchangeables.

Les patchs sont des éléments de revue, pas des commandes de publication exécutées. Le [manifeste](manifest.json) indique les empreintes avant/après normalisées LF, les différences préexistantes et les contrôles d'application réussis. Deux familles :

- `baseline-workspace/` : changements des seuls lots depuis le snapshot local initial. À retenir pour intégrer les lots sans perdre les évolutions fonctionnelles parallèles.
- `head/` : changements des mêmes fichiers depuis le SHA actuellement publié. Dans S1, cette famille comprend aussi la délégation préexistante de `canAccess` vers `authorizeWithSource`. Elle ne comprend pas les autres évolutions locales de l'interface.

**La compilation complète validée porte sur le workspace figé avec les évolutions parallèles, et non sur une reconstruction HEAD limitée aux patchs.** Chaque famille a été appliquée dans une copie jetable et ses 14 fichiers comparés aux empreintes attendues. Après toute sélection différente des évolutions parallèles, rejouer les contrôles et le build de la source effectivement retenue ; le succès du workspace ne certifie pas une autre composition.

| Lot / patch | Fichiers exacts | Dépendances et portée |
| --- | --- | --- |
| `00-support-tests.patch` | `package.json`, `scripts/cpu-audit/module-harness.mjs`, `scripts/cpu-audit/fixtures.mjs` | Support commun des tests hors réseau ; seul ajout de script npm, aucun changement de dépendance |
| `D1-documents.patch` | `lib/documents/data.ts`, `tests/cpu/documents.test.mjs`, `tests/cpu/private-documents.test.mjs` | Runtime indépendant de C1 ; les tests privés intègrent aussi les droits S1 ; support commun requis pour les tests |
| `C1-sheets.patch` | `lib/google/sheets.ts`, `tests/cpu/sheets.test.mjs` | Runtime indépendant de D1/S1 ; support commun requis pour les tests |
| `S1-viewer.patch` | `lib/auth.ts`, `lib/auth/authorization.ts`, `lib/auth/post-login-route.ts`, `tests/unit/authorization.test.ts`, `tests/unit/post-login-route.test.ts`, `tests/cpu/navigation-access.test.mjs` | Les trois modules d'accès se livrent ensemble ; support commun pour la navigation simulée ; politique confirmée par l'utilisateur |

Total minimal : **5 fichiers applicatifs, 6 fichiers de tests, 2 helpers et `package.json` = 14 fichiers**. Les routes documentaires sont exercées, pas modifiées. Aucun schéma, secret, migration, verrou de dépendances ou réglage Next/Vercel ajouté. Les autres modifications locales restent dans le workspace et ne font pas partie de ces patchs.

Le dossier de preuves, les rapports CPU et `scripts/cpu-audit/` (préparation, validation et benchmarks) accompagnent la revue documentaire. `mock-fonts.cjs` appartient uniquement à l'historique des essais : **ne pas l'utiliser pour la livraison et ne publier aucun ancien `.next`**. Livrer les sources revues et reconstruire normalement avec les vraies polices ; les artefacts temporaires ne sont pas un paquet à publier.

## Publication ultérieure autorisée

1. Recontrôler le SHA réellement servi et l'absence de déplacement de la base. Choisir explicitement les évolutions parallèles à livrer ; aucune application automatique sur l'arbre sale.
2. Dans un checkout propre réservé à la livraison, examiner les patchs puis `git apply --check` sur la famille correspondant à cette base. Ne pas mélanger les familles. Si la base diffère, résoudre les écarts en revue et régénérer les empreintes.
3. Rejouer les tests ciblés, la comparaison des six échecs existants, TypeScript, lint et le build normal sur la composition finale. Ne pas masquer les contrôles. Les commandes sont dans la clôture ; les six échecs ne constituent pas une suite entièrement verte.
4. Vérifier les attributions attendues sur les comptes VIEWER avec une session autorisée, sans élargir leurs droits pour contourner S1. Tester les documents privés et le refus d'écriture. Aucun de ces contrôles réels n'a été exécuté ici.
5. Après autorisation distincte de push/déploiement, noter commit, ID, heure et ancien déploiement ; publier la source retenue. Ne pas promouvoir les artefacts locaux de diagnostic.
6. Observer passivement statuts, accès, tailles documentaires, cohérence après mutation, invocations et CPU actif sur une fenêtre comparable. Les métriques détaillées bloquées par Plus ne sont pas à réessayer. Les durées de build et benchmarks locaux ne sont pas des gains Vercel.

## Retour arrière

Pas de migration ni de suppression de données. Préparer un commit qui inverse seulement D1 et/ou C1 tout en conservant S1, puis le tester et le construire normalement. Un retour complet au déploiement identifié peut réintroduire des lectures VIEWER trop larges : ne pas le considérer comme un rollback de sécurité neutre. Si S1 doit être corrigé, conserver un refus des blocs non attribués ; préparer une version de remplacement qui garde cette garantie. Ne pas écraser le workspace, ni réinitialiser ses changements parallèles.

## Backlog séparé

Invalidations globales, `fresh:true` ignoré dans l'adaptateur utilisateurs et repli périmé de sécurité restent ouverts. C1 protège la génération locale des lectures en vol ; il n'apporte ni invalidation distribuée ni garantie nouvelle de révocation entre instances. Ces changements ne font pas partie de la livraison actuelle.
