# Audit CPU COC — canevas central d’intervention

## Site Web unifié — chantier local du 23 octobre 2026

Huit rubriques administratives implémentées et vérifiées localement, sans publication. Le nouveau mapping unique est explicitement confirmé par la demande utilisateur et lisible par l’identité applicative. Les statuts ne proviennent plus du Référentiel. La validation Site Web reprend le profil de purges globales conservateur : **C2 reste différé**, son brouillon dans le workspace est préservé. F1/S1, Utilisateurs, saisons et neuf KPI conservés. Aucun gain CPU Vercel mesuré. Voir [rapport Site Web](site-web-unifie-2026-10-23.md), preuves, configuration PDF restante et contrat du lecteur public. Les constats antérieurs sur l’ancien classeur restent historiques ; ils ne décrivent pas le nouveau branchement non publié.


## Première vague publiée — clôture

**Publié et READY** : SHA `cd9f29fbdfba9d35a60af358041dd8ad852c1173`, déploiement `dpl_EGA6j7Qwf4euUNywAXRj8KehA4z3`, alias `database.coc-rdc.net` confirmé à 2026-10-23T11:18:24.5590906Z. READY à **2026-10-23T11:17:12.4740000Z**. F1, A1, Utilisateurs et neuf KPI livrés ; D1/C1/S1 conservés. **C2 reste différé ; purges globales conservées.**

Un seul push main, aucun déploiement redondant. Sources applicatives inchangées depuis les validations : build normal/vraies polices, TypeScript et lint réussis ; 53/53 CPU rejoués depuis le checkout ; 3/3 UI, 23/23 permissions ; suite 319/325 avec les six mêmes échecs préexistants. Retour ciblé A1 préservant F1/S1 vérifié, référence locale `release/f1-a1-users-20261023` dans le checkout de publication.

Après publication : **11/11 contrôles anonymes conformes**, fenêtre 2026-10-23T11:17:59.148Z — 2026-10-23T11:18:06.640Z. Journaux runtime consultés de 2026-10-23T11:17:12Z à 2026-10-23T11:18:30Z : 0 enregistrement, aucune page suivante. Cela ne prouve pas l’absence d’erreurs sur des parcours non exercés. Aucune session navigateur autorisée : recette authentifiée VIEWER/blocs, refus d’écriture, révocations et documents privés restante. Aucun gain CPU Vercel mesuré ou revendiqué.

Les preuves après publication et cette clôture restent documentées dans le workspace, sans second push documentaire déclenchant un build. Le workspace principal conserve les travaux parallèles C2 ; il ne doit pas être poussé en bloc. Voir le [rapport de publication](audit-publication-f1-a1-2026-10-23.md).


## Composition de livraison — décision du 23 octobre

**Retenus : F1 + A1 + évolutions Utilisateurs et KPI Médailles, avec purge brute globale conservatrice. C2 différé.** La copie `.cache/cpu-delivery/candidate` est la composition à valider/livrer ; le workspace principal conserve C2 et ne doit pas être publié en bloc pour cette décision.

| Sujet | Décision / preuve |
| --- | --- |
| Deux classeurs métier du Site Web | Contenus `SLIDERS_SITE` et référentiel `STATUTS_PUBLICATION`, rôles distincts confirmés dans le code. L’utilisateur confirme l’ID de contenus actuellement codé ; aucun mapping changé. |
| Homonyme accessible | Autre ID, neuf onglets inspectés sans formule ; pas référencé par le code. Ne prouve rien sur le fichier faisant autorité, toujours inaccessible. |
| Synchronisations | Pas de synchroniseur planifié trouvé dans les sources accessibles ; scripts d’administration directs distincts d’un calcul/copie. Absence de preuve externe : Apps Script liés, déclencheurs et outils tiers non inventoriés. |
| C2 | Différé sans suppression de son travail. Patches de sélection et de réactivation conservés ; aucune revendication d’invalidation distribuée. |
| F1 | Maintenu avec bypass frais, refus du périmé, barrières par source, et purge globale des données brutes après les cinq helpers de mutation, y compris erreur incertaine. |
| A1 / interfaces | Conservés, ainsi que D1/C1/S1, la journalisation et les neuf KPI ; contrôles A1 déterministes sur la politique conservatrice, sans refaire les benchmarks. |
| Validation exacte | **Terminée** : 53 CPU, 3 Utilisateurs, 23 permissions, rendu KPI, compteurs de dépendances et lint réussis ; build normal avec onze vraies polices réussi en 315 746 ms, TypeScript explicite en 212 775 ms. Suite 319/325 avec exactement les six mêmes échecs. Manifeste du candidat et paquet source préparés ; applications du workspace inchangées. |
| Publication | Aucune. Recette authentifiée et observation post-publication distinctes ; aucune session fabriquée, métrique Plus ou promesse CPU Vercel. |

Voir le [rapport de livraison F1/A1, mapping Site Web, limites et retours arrière](audit-livraison-f1-a1-2026-10-23.md). Les sections suivantes restent les états historiques des lots.

## Complément du 23 octobre — dépendances C2/F1 et dashboard A1

| Tâche | État et preuve |
| --- | --- |
| Référence | Snapshot de 714 fichiers, `.cache/cpu-dashboard/reference` ; mêmes 348 sources de compilation que le build C2/F1 normal réussi, preuve de réutilisation séparée. |
| Dépendances C2 | Cartographie des écritures, lignes brutes, jointures enrichies et agrégats. Neuf classeurs configurés : 73 lectures de formules bornées, zéro formule observée. Aucune correction de dépendance démontrée nécessaire. Site Web statique inaccessible (404), scripts/synchroniseurs externes et concordance des variables de production restent non vérifiés. |
| Concurrence et F1 | Tests complémentaires de mutations sur deux classeurs, lecture en cours et échec partiel ; troisième cache indépendant conservé. Garanties F1 et S1 inchangées, pas d’invalidation distribuée revendiquée. |
| A1 — Activités | Deux fichiers runtime modifiés : lire seulement TYPES_ACTIVITE au lieu des quatre référentiels de formulaire. Aucun cache d’agrégats ni mutualisation des droits. Formulaires et indicateurs préservés. |
| Benchmark | Deux séries de 15 scénarios équivalents, 20/200/2 000 lignes, chacune avec 9 passages alternés. Section seule à froid : 5 → 2 GET ; chaud : 0 → 0 ; CPU concurrent légèrement défavorable dans la première série et durée après mutation légèrement défavorable dans la seconde conservés. Forte dispersion des temps absolus ; aucun gain Vercel mesuré. |
| Validation finale | Vérifié localement : lint global (0 erreur, même avertissement préexistant), CPU 50/50, Utilisateurs 3/3, permissions 23/23, TypeScript et build normal avec 11 vraies polices ; suite 319/325 et six mêmes échecs de référence. 710 fichiers existants hors périmètre inchangés. Build 365 606 ms contre résultat de référence réutilisé 115 630 ms, sans attribution causale ni déduction sur le CPU runtime. |
| Publication | Non publié, aucun push/déploiement. Limite Site Web et recette authentifiée à résoudre avant livraison. Retour A1 sur deux fichiers, indépendant du rollback C2 conservant F1/S1. |

Voir le [rapport dépendances/dashboard et les preuves](audit-dashboard-2026-10-23.md). Les sections suivantes restent les états historiques de C2/F1 et D1/C1/S1.

## Reprise du 23 octobre — lots locaux C2/F1

La production reste `e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964`, READY, alias `database.coc-rdc.net` revérifié par CLI en lecture seule. Les évolutions Utilisateurs sont présentes localement et non publiées : harmonisation et retrait du chargement de l’historique, journalisation conservée. HEAD du workspace toujours `c1488d3` : la référence de comparaison est la composition locale complète figée, pas ce HEAD.

| Tâche | Priorité et état |
| --- | --- |
| Référence complète et préservation des travaux parallèles | P0 : snapshot de 657 fichiers avant modification, deux copies isolées, empreintes contrôlées : 649 fichiers existants hors périmètre inchangés, y compris Utilisateurs, D1 et S1. |
| F1 — sécurité fraîche | P0 : implémenté localement ; bypass effectif, table cohérente lignes/en-têtes en une réponse, absence de repli périmé, refus si invalidation locale de l’onglet source pendant lecture, sans rejet causé par un journal indépendant. En-têtes complets et données en deux plages disjointes dans un batch. TTL et règles S1 inchangés. |
| C2 — purges | P1 : implémenté localement ; classeur physique entier, pas d’invalidation par onglet ; protection C1 conservée, erreurs d’écriture incertaines couvertes. |
| Tests, benchmark, TypeScript, lint et builds normaux | Vérifié localement : lint ciblé et global (un avertissement préexistant identique), TypeScript et build normal/vraies polices ; CPU 43/43, Utilisateurs 3/3, permissions 23/23, suite 319/325 avec exactement les six échecs de référence. Benchmark alterné 18 scénarios, réponses équivalentes ; résultats défavorables conservés. Aucun gain Vercel mesuré. |
| Dashboard et calculs répétés | Backlog séparé : aucun cache d’agrégats ou de décision ajouté ; première investigation suivante sur fixtures. |
| Limites de publication | Non publié ; absence de recette authentifiée, inventaire des formules inter-classeurs non établi. Ne pas promettre de cohérence distribuée du cache mémoire. |

Voir le [rapport d’écart, décisions, contrats, mesures et livraison C2/F1](audit-cpu-suite-2026-10-23.md). Les statuts ci-dessous décrivent la publication D1/C1/S1 et ses étapes historiques. Aucun gain CPU Vercel démontré ; aucune métrique Plus retentée.

## Publication complète — état courant

**Publié et READY** : SHA `e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964`, déploiement `dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx`, alias `database.coc-rdc.net`, vérifié à `2026-10-22T21:59:28.878Z` (UTC). Composition complète avec les évolutions fonctionnelles locales et D1/C1/S1 ; résultats finaux locaux : build normal/vraies polices, TypeScript et lint réussis, 19/19 CPU/documents, 23/23 autorisations et 319/325 avec les six échecs préexistants. Contrôles HTTP anonymes : 11/11 conformes, fenêtre 2026-10-22T21:59:32.332Z — 2026-10-22T21:59:41.151Z. Aucune recette authentifiée faute de session disponible, aucun gain CPU Vercel démontré. Les preuves après publication sont conservées dans le workspace documentaire ; aucun second push documentaire déclenchant un build redondant.

Voir le [rapport de publication](audit-cpu-publication-2026-10-22.md) et ses preuves. Le déploiement précédent reste `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw` au SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`. Un patch de retour D1/C1 conservant S1 est préparé ; un retour complet pourrait réélargir les droits VIEWER. Invalidations globales et fraîcheur de sécurité restent au backlog distinct.

<!-- fin-statut-publication -->

Date : 22 octobre 2026. Dépôt exclusif : `coc-cible`. Phase initiale sans publication ; autorisation de publication complète reçue ensuite (voir état courant).

Ce document poursuit le [cadrage](audit-cpu-cadrage-2026-10-22.md), son [annexe](audit-cpu-sources-2026-10-22.md) et le [rapport d’écart](audit-cpu-ecarts-2026-10-22.md). Les constats du cadrage décrivent l’état lu avant le retrait de la complétude : cette fonctionnalité a été retirée à la demande de l’utilisateur et fait partie de la nouvelle référence locale.

## Clôture locale antérieure à la publication

La [clôture détaillée](audit-cpu-cloture-2026-10-22.md) et le [dossier de livraison](audit-cpu-livraison-2026-10-22/README.md) remplacent les anciens blocages ci-dessous : **les deux builds normaux avec vraies polices réussissent**, dans des copies à dépendances physiques et sans changement de configuration. Référence 133 500 ms, variante 749 199 ms ; cet écart défavorable de durée reste inexpliqué et n'est pas une mesure CPU de requêtes. Les anciens essais sont conservés comme historique.

Tests de clôture : **19/19** ciblés CPU/documents ; **23/23** autorisations ; **319/325** sur chacune des suites complètes, exactement les six mêmes échecs ; TypeScript et lint ciblé passent. Aucune erreur applicative nouvelle démontrée. Aucune session navigateur disponible, aucune recette authentifiée prétendue.

Production identifiée par CLI en lecture seule : `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw`, SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, alias `database.coc-rdc.net`. Ce SHA est HEAD, pas le workspace modifié. Aucun lot local publié. Aucune requête Plus réessayée, aucun compteur CPU actif attribué. Preuves durables dans `audit-cpu-livraison-2026-10-22/preuves`.

Les invalidations globales, `fresh:true` ignoré et le repli périmé de sécurité restent au backlog distinct. La livraison conserve S1 en cas de retour arrière limité aux optimisations ; un rollback complet pourrait réintroduire des droits VIEWER trop larges.

## États et tâches

« Proposé » ne signifie pas implémenté ; « vérifié localement » ne signifie ni publié ni observé en production.

| Lot | Priorité et statut courant | Risque / effort | Critère de vérification |
| --- | --- | --- | --- |
| R0 — référence et accès | Références physiques isolées ; SHA de production identifié par CLI malgré connecteur 403 | Faible / faible | SHA local, état sale, hashes, absence de secrets et journaux de référence |
| R1 — référence tests/types/build | Suites comparées : 319/325 des deux côtés, mêmes six échecs ; TypeScript passe des deux côtés ; builds normaux avec vraies polices réussis ; voir clôture | Faible / moyen | Même procédure dans les deux copies, erreurs comparées précisément |
| D1 — documents | Publié au SHA e6fa5b2 ; vérifié localement ; recette authentifiée restante | Moyen / faible | Même résultat, enrichissement limité aux documents sélectionnés, liste/stockage maintenus |
| C1 — lectures Sheets | Publié au SHA e6fa5b2 ; vérifié localement ; recette authentifiée restante | Moyen / moyen | Plages uniques/manquantes, partage en vol, erreurs et génération d’invalidation |
| S1 — politique VIEWER | Règle clarifiée par l’utilisateur : uniquement blocs attribués ; publié ; 23 tests ciblés verts ; recette authentifiée restante | Élevé / moyen | Aucune lecture sans attribution valide, refus source indisponible, aucune écriture VIEWER |
| C2 — invalidation ciblée et cache d’agrégats | Proposé, différé | Élevé / élevé | Dépendances croisées, sécurité, réchauffement et multi-instance à prouver avant modification |
| P0 — observation production | Publié ; READY, alias et refus anonymes vérifiés ; CPU des parcours manquant | Métriques de parcours manquantes | Déploiement exact, compteur dépassé, fenêtre, usage et journaux autorisés |

## Référence locale et production

HEAD : `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, branche `design/coc-febaco-visual-20261019`. Aucun commit/fetch/stash/reset. La référence est **HEAD + modifications locales au début de cette intervention**, pas HEAD seul et pas la production. Elle inclut les changements d’accès/UI et le retrait précédent de la complétude. Les six fichiers non suivis déjà présents (deux documents d’audit compris) sont conservés.

Commande reproductible depuis le dépôt : `node scripts/cpu-audit/snapshot.mjs baseline`. Snapshot créé : `C:\Users\HP\AppData\Local\Temp\coc-cpu-4YEiJp`, 535 fichiers copiés. Le script écrit un manifeste SHA-256 par fichier, HEAD/branche/état Git et date dans `cpu-reference.json` de la copie et `.cache/cpu-audit/baseline.json` du dépôt. Il exclut `.env*`, Git, sorties de build et caches ; `node_modules` est une jonction vers les dépendances installées, utilisées en lecture. Ne pas réinstaller les dépendances pendant la comparaison. Les modifications applicatives se font dans le dépôt ; validation et build se font dans des copies temporaires indépendantes, sans serveur de développement partagé.

Projet Vercel identifié au cadrage : `coc-managment`, `prj_GfEgDmQ9y6SvELDNuHZyPYNcTYbA`, équipe `team_f8eup9TubcHKCbP7dlKhD4sz`. Une lecture `get_project` dans cette intervention retourne encore 403. Aucune requête métrique exigeant Plus n’est envoyée ou répétée. À ce stade initial, SHA publié, offre, Fluid, compteur/période étaient inconnus ; le SHA est depuis identifié dans la clôture, les métriques de requêtes restent manquantes. Aucun appel de connexion ni lecture Sheets/Drive réels n’est effectué. Le nombre d’utilisateurs ne démontre aucune cause dominante.

## Preuves et décisions

### Documents

Constat reproduit hors réseau sur le vrai module : `node --experimental-vm-modules --test tests/cpu/documents.test.mjs` avant correctif : 1 succès, 3 échecs ; une fiche parmi 200 demande 200 tailles Drive, une fiche absente aussi ; une sélection de deux documents sur 40 en enrichit 40.

Décision D1 : filtrer les lignes brutes avec la même normalisation avant mapping/enrichissement. La fiche conserve sa lecture Sheets fraîche et son premier résultat en cas de doublon historique ; le rattachement conserve ordre, alias et valeurs ; les tailles des seuls résultats utiles restent chargées. La liste complète et les agrégats de stockage gardent toutes les tailles. La création d’un identifiant utilise les métadonnées fraîches sans tailles inutiles. Aucun nouveau cache, délai ou droit. Les erreurs d’en-tête/source restent des erreurs ; l’indisponibilité d’une taille reste une chaîne vide.

### Sheets

Reproduction avant correctif : `node --experimental-vm-modules --test tests/cpu/sheets.test.mjs` : 1 succès, 6 échecs. Un lot A/B/B avec A chaud relit trois plages ; des lots simultanés et une lecture individuelle ne partagent pas le travail ; une lecture déjà partie peut repeupler le cache après purge ; le bypass batch peut retourner du périmé en cas d’erreur.

Décision C1 : clés existantes classeur/plage conservées ; dédupliquer les noms et ne demander que les plages manquantes. Partager les promesses des plages manquantes avec les autres lots/lectures individuelles. Les plages déjà en cache conservent leur timestamp, sans prolongation artificielle de fraîcheur. Le lot ne devient pas une transaction : cohérence par plage et TTL, comme les caches existants. Les lectures explicitement fraîches ne lisent/écrivent/partagent pas le cache et ne retombent plus sur du périmé. Repli périmé conservé pour les lectures ordinaires si toutes les plages manquantes disposent d’un ancien résultat et si aucune invalidation n’est intervenue.

Une génération globale au processus est incrémentée à chaque purge ; les lignes/en-têtes/lots d’une génération antérieure ne peuvent plus remplir le cache ni utiliser leur repli périmé. Les appelants déjà en attente peuvent recevoir le résultat commencé avant l’écriture : il n’est pas annulé, mais les appels suivants ne le réutilisent pas. Les nettoyages de promesses vérifient leur identité pour ne pas supprimer un nouveau travail après invalidation.

**Portée** : toujours le processus, jamais un cache distribué. L’invalidation reste globale, y compris lors des audits/tentatives ; elle n’est pas ciblée par classeur dans ce lot. Ce choix conserve les dépendances implicites et ne retarde pas une révocation. Les protections inter-instance restent celles des lectures fraîches et TTL existants ; la génération ne résout pas la cohérence distante. Le repository utilisateurs demande `fresh:true`, mais l’adaptateur ignore toujours cette option et applique 60 s : dette existante signalée, aucun allongement ajouté.

### Sécurité VIEWER

L’utilisateur a choisi explicitement « Uniquement les blocs attribués ». Deux assertions échouent avant ajustement sur le code courant : refus source indisponible et redirection sans attribution. Correction distincte des optimisations CPU : `authorize`, `authorizeWithSource`, navigation et redirection respectent les attributions actives/datées du VIEWER. Écriture VIEWER toujours refusée, y compris avec un marqueur super-admin incohérent ; accès réservé super-admin inchangé pour ADMIN. Le contexte d’accès introduit précédemment est préservé. Les tests vérifient absence, inactivité, expiration, début futur, attribution étrangère et panne de source.

Cette décision peut rendre invisibles des sections qui étaient ouvertes par le changement local précédent : c’est l’application de la règle confirmée, pas une suppression fonctionnelle pour réduire le CPU. Avant publication, vérifier les attributions attendues sur des comptes autorisés **sans les modifier ici**. Aucun objectif de gain CPU pour ce lot.

## Benchmarks reproductibles

Outils : Node 24.16.0 ; `vm.SourceTextModule` et `stripTypeScriptTypes` chargent les vrais modules serveur. Les seules dépendances Google/métier nécessaires sont remplacées explicitement par des fixtures ; un import externe non déclaré échoue. Aucune connexion réseau ni mutation réelle possible dans ces fixtures. Les sources ne sont pas réécrites en copies algorithmiques dans le benchmark.

Commande : `node --experimental-vm-modules scripts/cpu-audit/benchmark.mjs BASELINE_ROOT CANDIDATE_ROOT RESULTATS.json`. Les résultats complets contiennent chaque passage. Volumes synthétiques : 20, 200 et 2 000 documents avec un fichier chacun, répartis sur 20 compétitions ; fiches présente/absente, documents d’une compétition et liste complète. Sheets : deux onglets de 20/200/2 000 lignes, A chaud, demande A/B/B. Ces volumes sont une petite charge et une montée en taille contrôlée, pas une estimation des données COC.

Par variante/scénario : cinq échauffements, neuf passages alternés AB/BA, au moins vingt opérations et 200 ms écoulées par passage ; normalisation par opération. Le nombre d’opérations peut différer entre variantes pour dépasser la granularité du compteur CPU Windows. Mesures séparées : CPU processus user+system, durée écoulée, appels de dépendances simulés, plages transférées et octets de sortie JSON. Égalité exacte des sorties sérialisées exigée avant chronométrage. Zéro invocation Vercel et zéro appel Google réel. L’attente réseau n’est pas modélisée : la réduction d’appels ne se traduit pas automatiquement en millisecondes réseau ou CPU Vercel. La CPU du processus inclut allocations/GC du scénario ; ce n’est pas une attribution par requête dans un serveur concurrent.

Un essai de contrôle référence/référence a été exécuté ; son temps écoulé n’est pas une référence fiable, car une vérification TypeScript a chevauché sa fenêtre. Il est exclu des chiffres ci-dessous. Une première passe de quinze opérations produisait des zéros CPU sous Windows : elle est exploratoire et n’est pas utilisée pour chiffrer les gains. Sa tendance défavorable sur la liste complète a conduit à conserver le mapping d’origine pour la liste et à restreindre le filtrage anticipé aux consultations ciblées.

### Résultats locaux et limites

Sources des chiffres : [série complète, 21 scénarios et tous les passages](audit-cpu-benchmarks-2026-10-22.json), [première série à passages de 200 ms, 15 scénarios](audit-cpu-benchmarks-premiere-serie-2026-10-22.json). Même source applicative retenue pour ces deux séries. Les cas Sheets supplémentaires couvrent le lot A/B entièrement froid et entièrement chaud, en plus de A/B/B avec A chaud. Dans les cas froids/partiels, la remise en état du cache et le réchauffement de A sont inclus dans le coût des deux variantes ; les chiffres ne sont pas le seul temps interne de `batchGet`. Pour le cas chaud, le préchargement est hors chronométrage.

Tableau : médianes de la série complète, ms **locales par opération** ; les octets sont la sérialisation du résultat de service, pas une mesure HTTP/RSC compressée. La valeur absente utilise le témoin `undefined` dans l’outil, pas un corps HTTP de neuf octets. Toutes les sorties de service comparées sont égales ; les octets et nombres de réponses utiles ne diminuent pas artificiellement.

| Scénario | Lignes synthétiques | CPU avant → après (ms) | Écoulé avant → après (ms) | Travail de dépendance avant → après |
| --- | ---: | ---: | ---: | --- |
| Fiche document | 20 | 0,4620 → 0,0896 | 0,5625 → 0,1089 | 20 → 1 appel au helper de taille |
| Fiche document | 200 | 1,5379 → 0,1415 | 1,5225 → 0,1362 | 200 → 1 ; résultat 314 octets identique |
| Documents d’une compétition | 200 | 1,5859 → 0,2875 | 1,6083 → 0,2834 | 200 → 10 ; résultat 3 127 octets identique |
| Fiche absente | 200 | 1,5379 → 0,1291 | 1,5743 → 0,1278 | 200 → 0 |
| Liste complète | 2 000 | 16,4000 → 16,4000 | 16,2789 → 16,7610 | 2 000 → 2 000 ; pas de gain établi |
| Lot A/B/B, A chaud | 20 | 0,2036 → 0,1061 | 0,1917 → 0,1089 | 3 → 1 plage dans le batch ; une requête batch de chaque côté |
| Lot A/B/B, A chaud | 200 | 1,6261 → 0,9486 | 1,7463 → 0,9351 | 3 → 1 ; résultat 14 373 octets identique |
| Lot A/B/B, A chaud | 2 000 | 26,5500 → 14,8500 | 24,8915 → 15,0653 | 3 → 1 |
| Lot A/B entièrement froid | 20 | 0,1149 → 0,1262 | 0,0995 → 0,1117 | 2 → 2 plages ; résultat défavorable |
| Lot A/B entièrement chaud | 200 | 0,0033 → 0,0034 | 0,0035 → 0,0036 | 0 → 0 ; variation microscopique non concluante |

Les appels au helper de taille ne sont pas tous des requêtes Google dans l’application : le helper réel dispose d’un cache de taille Drive. Le benchmark remplace ce helper par un retour asynchrone immédiat ; il mesure surtout les transformations/allocations et compte le travail évité, sans simuler le réseau. Les références et tailles d’une liste restent fonctionnelles. Les tests de simultanéité constatent aussi trois lectures simulées concurrentes réduites à un batch, mais ne modélisent pas le routage multi-instance Vercel.

**Variabilité observée** : la première série donne 0,8031 → 0,0748 ms CPU pour la fiche de 200 documents et 0,7349 → 0,4007 ms pour le lot partiel de 200 lignes, contre les valeurs plus élevées de la série complète. Le poste est partagé ; la cause précise de cette variation inter-exécution n’est pas établie. Les passages alternés et les comptes de travail réduisent certains biais, sans démontrer un gain absolu reproductible sur Vercel. Les résultats froids/chauds défavorables ou neutres sont conservés : le lot C1 n’est pas une accélération universelle de chaque lecture.

Pour reconstruire ultérieurement les sources benchmarkées de référence : `node scripts/cpu-audit/benchmark-reference.mjs` matérialise dans un répertoire temporaire cinq modules à partir du SHA ci-dessus. Ces modules étaient inchangés par rapport à HEAD dans la référence sale ; la normalisation LF/CRLF peut différer sans changement de code. Utiliser le chemin affiché comme `BASELINE_ROOT`. Cet outil ne reconstruit pas l’application locale complète ni sa politique VIEWER initiale. Les snapshots complets et leurs manifestes restent dans les chemins temporaires indiqués pour cette revue.

## Validation historique — essais initiaux

Les paragraphes suivants décrivent les anciens snapshots avec jonction et polices simulées. Ils sont conservés pour traçabilité ; la clôture ci-dessus les remplace pour le verdict courant. Ne publier aucun de ces anciens artefacts.

Référence isolée, `node --test --test-concurrency=1 tests/unit/*.test.ts tests/integration/*.test.ts` : 325 tests, 319 succès, 6 échecs. Échecs reproduits : deux dans `competitions-final-interfaces.test.ts`, un dans `competitions-t12.test.ts`, un dans `login-navigation.test.ts`, un dans `national-team-season.test.ts`, un dans `performance-paths.test.ts`. Il s’agit d’assertions sur le code/interface existant ; ils ne sont pas neutralisés pour rendre la suite verte. Détails conservés dans `baseline-tests.log` de la référence.

Référence, `node node_modules/typescript/bin/tsc --noEmit --incremental false` : code de sortie 0. `next build` par défaut est exécuté : Turbopack refuse la jonction `node_modules` pointant hors de sa racine de fichiers. C’est une limite de l’environnement isolé, pas une régression applicative démontrée. Les résultats webpack et ceux de la variante sont consignés ci-dessous.

Variante de référence retenue : `C:\Users\HP\AppData\Local\Temp\coc-cpu-vYjMAQ`. Suite complète après modification : **319/325**, les six mêmes noms d’échec que la référence, comparés automatiquement sans les désactiver. TypeScript : **code 0**. Tests d’autorisation/redirection/matrice : **23/23** ; `npm.cmd run test:cpu` : **15/15**, avec documents, création simulée sans lecture de tailles, reprise après erreur, chevauchement de lots, lecture/écriture et navigation serveur VIEWER. Les trois tests de documents puis six de Sheets et deux de politique ont d’abord été observés en échec avant correction. Les tests supplémentaires de concurrence ont été ajoutés ensuite.

Lint ciblé des cinq fichiers applicatifs et deux tests TypeScript modifiés : **code 0, aucune sortie**, avec la configuration ESLint du dépôt, dans la copie isolée. `git diff --check` passe. Vérification SHA-256 : **526 fichiers de la référence inchangés**, aucun écart inattendu ; seules les modifications prévues des cinq fichiers applicatifs, de `package.json`, des deux tests existants et d’un outil d’audit créé dans cette intervention diffèrent. Les évolutions fonctionnelles parallèles sont préservées.

Inventaire navigateur via l’outil disponible : aucune application ni aucun navigateur exposé. **Parcours connectés, permissions en navigateur et téléchargements privés réels non exécutés.** Les tests de services et navigation simulée ne valent pas une recette navigateur. Aucun login de production créé.

Les résultats synthétiques sont conservés dans [le résumé de validation](audit-cpu-validation-2026-10-22.json). La référence webpack complète passe avec `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` pointant sur `scripts/cpu-audit/mock-fonts.cjs`, mécanisme de test trouvé dans le code installé de Next.js. Les artefacts avec ces fausses polices sont réservés à la compilation et **ne doivent jamais être publiés**. Le build par défaut de la variante reproduit le refus Turbopack de la jonction. Les premières tentatives webpack de la variante n’ont pas achevé la compilation et ont été interrompues, dont une avec workers/mémoire limités dans la seule copie temporaire ; leur cause n’est pas établie. Une dernière tentative bornée avec cache de compilation de la référence est consignée après son résultat. Aucun de ces temps de build n’est une mesure de CPU des requêtes applicatives.

### Contrôles à rejouer pour la revue

**Clôture du build** : la dernière tentative webpack de la variante, avec configuration du dépôt restaurée dans la copie, cache de compilation de la référence, polices de test et mémoire Node bornée à 3 Gio, dépasse **180 secondes** sans compilation achevée (code 124). Le processus de build créé pour cet essai est arrêté explicitement. Aucune erreur de compilation applicative n’a été établie ; cela ne constitue pas une validation du build. **Build de la variante à refaire dans un environnement adapté avant publication.** Le succès du build de référence ne prouve pas celui de la variante.

L’écart de fraîcheur utilisateur reste ouvert : le repli sur données périmées en erreur peut dépasser le TTL de 60 s de l’adaptateur ; ce TTL ne garantit donc pas à lui seul une borne de révocation. Ce comportement préexiste et n’a pas été étendu. Une correction de cette dette doit être traitée séparément, avec tests de révocation entre instances et observation des lectures supplémentaires.

Les fichiers [validation](audit-cpu-validation-2026-10-22.json) et résultats bruts sont les preuves durables. La reconstruction des cinq modules de benchmark depuis Git a été exécutée et leur égalité avec le snapshot initial vérifiée après normalisation LF ; leurs fonctions hors réseau ont été rejouées avec succès. Les copies temporaires complètes n’ont pas vocation à être des artefacts de livraison.

```powershell
npm.cmd run test:cpu
node --test --test-concurrency=1 tests/unit/*.test.ts tests/integration/*.test.ts
node node_modules/typescript/bin/tsc --noEmit --incremental false
node scripts/cpu-audit/verify-preserved.mjs
git diff --check
```

Exécuter le build dans une copie isolée (sans `.env.local`) ; en environnement complet, `npm.cmd run build`. Ici, la validation de compilation utilise webpack et les polices de test pour isoler les restrictions de jonction/réseau. La commande de vérification de préservation nécessite le manifeste `.cache/cpu-audit/baseline.json` créé au début de l’intervention.

## Publication, retour arrière et observation

État de livraison visé : implémenté et vérifié localement ; **non publié, non observé en production**. Revue préalable des lots D1/C1/S1 et des différences locales préexistantes ; ne pas publier l’arbre sale entier sans sélectionner les évolutions voulues. Confirmer déploiement de base et attributions VIEWER avant livraison. Une autorisation ultérieure sera nécessaire pour push/déploiement.

Publier un lot à la fois si possible, noter commit/déploiement/heure et conserver l’identifiant du déploiement précédent. Un rollback rétablit le déploiement antérieur via la procédure Vercel autorisée ; aucune migration ni suppression de données n’est nécessaire pour ces lots. Attention : revenir sur S1 peut réintroduire l’accès VIEWER trop large de la référence locale ; évaluer le retour arrière de sécurité séparément et privilégier le retour du seul lot performance si disponible. Ne pas utiliser `git reset --hard` ni écraser les modifications parallèles.

Après publication autorisée : observation passive sur fenêtre comparable (mêmes catégories de trafic, droits et données) de CPU actif, invocations, statuts, durée, Google/Drive et tailles des réponses lorsque disponibles ; vérifier immédiatement accès, tailles documentaires, listes et fraîcheur après écriture. Noter logs manquants et limitations du plan. Aucun gain Vercel ne sera déduit des seuls benchmarks locaux. Prochaine priorité : rétablir l’accès lecture Vercel ou obtenir un relevé standard projet/période, puis classer les parcours par usage réel avant cache d’agrégats ou chargements à la demande plus larges.

### Publication Site Web et saisons - controle final du 25 octobre 2026
Publie : 21822f51acf51667d27acee3107716e3c5b06210, deployment dpl_3SfWTtJqZJfDtcM7AkQQV7fXcxWk READY, alias database.coc-rdc.net confirme. C2 reste differe ; les purges globales, S1 et F1 sont conserves. 100 tests cibles rejoues avant push ; huit controles HTTP anonymes passes apres publication. Recette authentifiee et configuration du dossier PDF restent a verifier. Voir publication-site-web-saisons-2026-10-24.md pour horodatages Vercel, limites, journaux et retour arriere. Aucun gain CPU Vercel etabli.

### Correctif Site Web — insertion dans les gabarits (25 octobre 2026)
Implémenté et vérifié localement : première ligne admissible par ID, protection des lignes incomplètes, traitement des FALSE déclarés, insertion/remplissage atomiques et recherche fraîche du rang lors des modifications. Neuf ressources, 114 tests ciblés ; lint, TypeScript et build normal réussis. Profil conservateur isolé, C2 différé ; brouillon principal préservé. Lectures supplémentaires pour la cohérence, aucun gain CPU Vercel revendiqué. Données distantes consultées en lecture seule ; déplacement proposé mais non exécuté. Voir [rapport et limites](site-web-insertion-2026-10-25.md). Sans push ni déploiement.
