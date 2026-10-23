# Clôture de validation des lots D1 / C1 / S1

## Publication complète — état courant

**Publié et READY** : SHA `e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964`, déploiement `dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx`, alias `database.coc-rdc.net`, vérifié à `2026-10-22T21:59:28.878Z` (UTC). Composition complète avec les évolutions fonctionnelles locales et D1/C1/S1 ; résultats finaux locaux : build normal/vraies polices, TypeScript et lint réussis, 19/19 CPU/documents, 23/23 autorisations et 319/325 avec les six échecs préexistants. Contrôles HTTP anonymes : 11/11 conformes, fenêtre 2026-10-22T21:59:32.332Z — 2026-10-22T21:59:41.151Z. Aucune recette authentifiée faute de session disponible, aucun gain CPU Vercel démontré. Les preuves après publication sont conservées dans le workspace documentaire ; aucun second push documentaire déclenchant un build redondant.

Voir le [rapport de publication](audit-cpu-publication-2026-10-22.md) et ses preuves. Le déploiement précédent reste `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw` au SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`. Un patch de retour D1/C1 conservant S1 est préparé ; un retour complet pourrait réélargir les droits VIEWER. Invalidations globales et fraîcheur de sécurité restent au backlog distinct.

<!-- fin-statut-publication -->

Date : 22 octobre 2026 (preuves horodatées en UTC). Périmètre exclusif : `coc-cible`. Aucun correctif applicatif supplémentaire pendant cette clôture : compléments de tests, outils de validation et documentation uniquement. Ni push, ni déploiement, ni écriture Sheets/Drive, ni changement d'offre. Le [canevas central](audit-cpu-suivi-2026-10-22.md) conserve les décisions et les benchmarks antérieurs.

## Verdict de clôture locale avant publication

**Prêt à publier sur le plan technique pour la composition du workspace figée et validée**, avec les limites explicites ci-dessous. Les lots sont implémentés et vérifiés localement, **non publiés et non observés en production**. Aucun gain CPU Vercel établi. La livraison proposée est le delta D1/C1/S1 de 14 fichiers décrit dans le dossier de livraison, intégré sans retirer les évolutions parallèles de la référence locale.

| Contrôle final | Référence | Variante |
| --- | --- | --- |
| Build normal, vraies polices | Code 0 | Code 0 |
| Suite unité/intégration | 319/325, six échecs | 319/325, six mêmes échecs |
| TypeScript explicite | Code 0 | Code 0 |
| Tests CPU/documents | Non applicables avant les lots | 19/19 |
| Autorisation/redirection/matrice | Inclus dans la suite de référence | 23/23 |
| Lint ciblé, 5 modules et 2 tests TS | Pas de nouvelle modification à valider | Code 0, journal vide |

La suite globale **n'est pas entièrement verte** ; les six échecs ont été rejoués dans la référence puis comparés par noms exacts, et restent documentés. Pas de recette authentifiée faute de navigateur/session exposés. Si la livraison choisit une composition différente (par exemple seulement les patchs sur HEAD), le build et les contrôles de cette composition sont encore à exécuter : ce verdict ne la certifie pas.

## Références et production

**OBSERVÉ via CLI Vercel en lecture seule**, après un refus 403 persistant du connecteur : projet `coc-managment`, équipe `team_f8eup9TubcHKCbP7dlKhD4sz`, déploiement de production `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw`, état READY, alias `database.coc-rdc.net` et `coc-managment.vercel.app`. Source Git : `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, branche `design/coc-febaco-visual-20261019`. [Preuve filtrée sans secret](audit-cpu-livraison-2026-10-22/preuves/production.json).

Ce SHA correspond à HEAD local ; il **ne comprend pas les changements non committés**, dont D1/C1/S1 et les évolutions parallèles. La référence comparative reste le snapshot du workspace initial (HEAD + évolutions parallèles), pas une extraction de production. Aucun code n'a été téléchargé depuis les fonctions déployées. Aucun compteur CPU de requêtes n'est établi par cette identification. Les durées et compteurs de facturation du **build** remontés par l'inspection ne sont pas du CPU actif des consultations.

## Build : blocage levé

**FAITS antérieurs conservés** : Turbopack refusait la jonction `node_modules` hors de sa racine ; les téléchargements Google Fonts échouaient avec EACCES dans le bac à sable. Une référence webpack avec polices simulées réussissait ; des tentatives de variante interrompues ne prouvaient pas une erreur applicative. Les anciens journaux et le [résumé historique](audit-cpu-validation-2026-10-22.json) restent valables pour ces essais seulement.

**VÉRIFICATION nouvelle** : `prepare-validation.mjs` crée deux copies dans `coc-validation-GwKqAs`, chacune avec des dépendances copiées physiquement et déréférencées à l'intérieur de sa racine. Aucun `.env*` ni secret de production. La référence est contrôlée contre les empreintes du snapshot initial ; le seul fichier généré `next-env.d.ts` altéré par les anciens essais a été récupéré avec son empreinte exacte. Variante figée et empreintes des cinq modules applicatifs comparées avant/après.

`run-production-build.mjs reference`, puis `variant` exécutent **`next build` normal**, sans webpack forcé, limite de mémoire, override de workers ou modification de configuration. Même Node 24.16.0, Next 16.3.4, configuration et dépendances. L'accès réseau sortant nécessaire aux vraies polices a été autorisé pour les deux commandes ; la requête Google Fonts refusée dans le bac à sable fonctionne dans cet environnement. `NEXT_FONT_GOOGLE_MOCKED_RESPONSES`, `NEXT_DIST_DIR`, `NODE_OPTIONS` et variables d'authentification/Google sont exclus de l'environnement du build. Seule la télémétrie est désactivée.

| Copie | Résultat | Durée écoulée totale | BUILD_ID |
| --- | --- | ---: | --- |
| Référence | Succès, code 0 | 133 500 ms | `IP0TLU1lKlsR5gseDksjx` |
| Variante | Succès, code 0 | 749 199 ms | `fkS7HiyA6G_jCzmSryBz5` |

Dans les deux cas : contrôle TypeScript terminé, `ignoreBuildErrors: false`, 40 pages statiques générées et **11 vrais fichiers WOFF2** de 5 892 à 29 288 octets. Polices obtenues par le chargement normal `next/font`, sans mock ; signatures `wOF2` et SHA-256 archivés. Preuves : [référence](audit-cpu-livraison-2026-10-22/preuves/build-reference-normal.json), [variante](audit-cpu-livraison-2026-10-22/preuves/build-variant-normal.json), journaux voisins.

**RÉSULTAT DÉFAVORABLE / LIMITE** : la variante compile en 7,6 min puis contrôle les types en 2,5 min ; la référence compile en 59 s puis contrôle les types en 31,8 s. Aucun message d'erreur applicative. Le processus de compilation de la variante était actif (CPU cumulé observé), puis toutes les phases ont abouti. Le poste partagé et d'autres processus Node sont des facteurs possibles, pas une causalité démontrée ; leurs propriétaires non établis n'ont pas été arrêtés. La fin du build lève le blocage de compilation ; la cause précise de l'écart de durée reste **MANQUANTE**. Deux passages séquentiels sans isolation machine ne démontrent ni une régression déterministe de build imputable à un lot, ni un gain de CPU de requêtes. Aucun ancien artefact avec polices simulées ne doit être publié.

## Couverture des contrôles

Les nouveaux tests utilisent les vrais modules applicatifs via un chargeur VM et des dépendances explicitement simulées. Données synthétiques, zéro appel Google et aucune session de production. Les signatures/cookies sont remplacés dans ces scénarios d'accès : ils ne constituent pas une validation authentifiée de bout en bout.

| Lot | Vérifications hors réseau |
| --- | --- |
| D1 | Fiche présente/absente, premier résultat, normalisation/rattachements et ordre, liste complète conservant tailles, fichier absent, erreur de taille Drive, création sans tailles inutiles. Prévisualisation et téléchargement : refus avant lecture documentaire si bloc absent/invalide/source en panne ; avec attribution valide, binaire, type, disposition, `private, no-store`, nom sécurisé ; 404 fiche/fichier absent, 503 panne Drive. |
| C1 | Froid/chaud/partiel, plages uniques manquantes, chevauchement lots/lectures individuelles, promesses partagées, reprise après erreur ; bypass sans cache ni partage et sans repli périmé ; TTL, classeurs distincts, lot vide ; lecture/en-têtes et écriture/invalidation en vol ; ancienne promesse incapable d'écraser un nouveau résultat ou d'effacer son attente. Contextes VM indépendants : aucune propagation du cache ni de la purge entre eux. |
| S1 | Trois blocs attribués, absence/inactivité/expiration/début futur et attribution étrangère ; bornes inclusives et date civile Kinshasa ; source indisponible refusée, navigation/redirection cohérentes ; refus d'écriture VIEWER même avec marqueur super-admin incohérent ; ADMIN super-admin conserve son accès même si la source d'attributions est indisponible. |

La génération C1 ne retire pas à un appelant le résultat d'une lecture commencée avant une écriture ; elle empêche sa réinsertion dans le cache. Le cache conserve sa portée processus et les purges globales. Les tests de panne d'autorisation vérifient la décision **si une erreur remonte à la politique** : ils ne démontrent pas que l'adaptateur utilisateurs échoue toujours fermé lorsqu'il peut retourner un ancien snapshot. Cette dette de fraîcheur reste explicitement séparée.

Résultats complets et commandes exactes : [checks.json](audit-cpu-livraison-2026-10-22/preuves/checks.json) et journaux voisins. Les six échecs historiques restent exposés, jamais ignorés ou désactivés. Aucune modification de configuration TypeScript/Next pour obtenir les succès.

**Limite navigateur** : l'inventaire des surfaces disponibles renvoie aucune application et aucun navigateur. Aucune navigation authentifiée, connexion, consultation de documents privés réels ou vérification des attributions de production effectuée. Les tests privés sont des tests de handlers et politiques avec dépendances synthétiques.

## Livraison et limites de mesure

Les [diffs séparés et le manifeste exact](audit-cpu-livraison-2026-10-22/README.md) proposent 5 modules applicatifs et leur support de tests (14 fichiers), avec deux familles de base et contrôles d'application. Les 526 fichiers préexistants hors modifications prévues restent inchangés ; aucun écart inattendu constaté par `verify-preserved.mjs`. Les évolutions de formulaires, interfaces et retrait de la complétude ne sont pas écrasées. Les [sources figées](audit-cpu-livraison-2026-10-22/preuves/sources.json) identifient la composition effectivement compilée. Une composition différente, limitée aux patchs sur HEAD, nécessite son propre build avant publication.

Les benchmarks précédents restent inchangés : sorties de service égales, fiche de 200 documents passant de 200 à 1 appel au helper de taille ; lot partiel A/B/B avec A chaud passant de 3 à 1 plage transférée, mais toujours une requête batch. Le cache du helper Drive réel limite déjà certains appels externes. Liste complète sans gain établi, lot froid parfois défavorable, cas chaud neutre et variabilité inter-séries sont conservés dans le canevas et les JSON bruts. Aucun benchmark relancé pour effacer ces résultats ; aucun gain Vercel annoncé.

La [procédure de publication et retour arrière](audit-cpu-livraison-2026-10-22/README.md) exclut les anciens `.next` et exige une reconstruction normale de la source finalement retenue. Un retour complet sur S1 pourrait réintroduire des droits trop larges ; privilégier un retour limité à D1/C1 conservant la restriction VIEWER.

**Backlog hors clôture** : invalidations globales ; `fresh:true` ignoré dans l'adaptateur utilisateurs ; repli périmé de sécurité et garanties de révocation entre instances. Aucun de ces changements n'est inclus. Prochaine investigation CPU : obtenir un relevé standard par parcours/fenêtre comparable et identifier les répétitions réellement sollicitées ; l'accès au SHA ne remplace pas une attribution CPU. Ne pas répéter les requêtes métriques soumises à Observability Plus.
