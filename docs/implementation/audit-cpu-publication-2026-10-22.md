# Publication de la composition complète COC — 22 octobre 2026

## Publication complète — état courant

**Publié et READY** : SHA `e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964`, déploiement `dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx`, alias `database.coc-rdc.net`, vérifié à `2026-10-22T21:59:28.878Z` (UTC). Composition complète avec les évolutions fonctionnelles locales et D1/C1/S1 ; résultats finaux locaux : build normal/vraies polices, TypeScript et lint réussis, 19/19 CPU/documents, 23/23 autorisations et 319/325 avec les six échecs préexistants. Contrôles HTTP anonymes : 11/11 conformes, fenêtre 2026-10-22T21:59:32.332Z — 2026-10-22T21:59:41.151Z. Aucune recette authentifiée faute de session disponible, aucun gain CPU Vercel démontré. Les preuves après publication sont conservées dans le workspace documentaire ; aucun second push documentaire déclenchant un build redondant.

Voir le [rapport de publication](audit-cpu-publication-2026-10-22.md) et ses preuves. Le déploiement précédent reste `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw` au SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`. Un patch de retour D1/C1 conservant S1 est préparé ; un retour complet pourrait réélargir les droits VIEWER. Invalidations globales et fraîcheur de sécurité restent au backlog distinct.

<!-- fin-statut-publication -->

## État et autorisation

L'utilisateur autorise maintenant commit, push et déploiement après validation finale. Cette autorisation remplace la restriction de publication de la clôture initiale. État initial de cette phase : publication en préparation ; l’état courant et les preuves ci-dessus prévalent.

## Source et workflow vérifiés

Workspace original conservé avec ses modifications. Checkout de livraison distinct : `.cache/cpu-publication/checkout`, clone Git sans hardlinks, basé sur `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`. Les fichiers applicatifs reprennent la composition complète validée, pas uniquement les patchs D1/C1/S1. Les écarts depuis le gel initial concernent la documentation, les tests CPU et leur chargeur ; aucun nouveau changement applicatif détecté. Le build produit normalement les références `.next/types/…` de `next-env.d.ts`, à la place des références de développement du workspace ; ce fichier généré est contrôlé avec la source finale.

Évolutions parallèles conservées : masquage des commandes d'écriture selon les droits fournis par le serveur, contexte d'accès du dashboard, absence de complétude dans la section acteurs, retour de création utilisateur confirmé et message d'échec explicite, contrôle du rafraîchissement et ajustement des tests correspondants. Ces interfaces ne remplacent pas les contrôles serveur. D1 sélectionne avant enrichissement documentaire ; C1 déduplique les plages manquantes et protège la génération de cache ; S1 exige les blocs attribués pour VIEWER et interdit son écriture.

Projet Vercel `coc-managment`, `prj_GfEgDmQ9y6SvELDNuHZyPYNcTYbA`, équipe `team_f8eup9TubcHKCbP7dlKhD4sz`. API projet lue : intégration GitHub `Rodanyoca/coc-managment`, **productionBranch = main**, racine par défaut, framework Next.js, commande build par défaut. Pas de workflow GitHub Actions trouvé. Le README concorde avec la publication automatique sur `main`. `main` distant est `748f6fe1f20720987c72904e0ad903a519783e1a`, ancêtre du SHA de départ ; un push de la composition complète peut être une avance rapide. Le workspace original conserve son pushurl `DISABLED` ; le clone réservé à la livraison utilise l'URL du même dépôt, sans changer la configuration originale.

**Déploiement précédent à conserver** : `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw`, SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, alias `database.coc-rdc.net` / `coc-managment.vercel.app`. Recontrôlé via la cible de production du projet. La branche du déploiement précédent était une branche design ; cela ne change pas la branche de production configurée aujourd'hui.

Publication prévue : un seul push de la source finale vers `main`, puis observation du déploiement Git correspondant. Aucun `vercel deploy` supplémentaire, aucun changement de branche de production, d'offre, de configuration ou de données métier.

## Contrôles et comparaison des builds

Validation finale en cours dans le checkout avec dépendances copiées physiquement et vraies polices ; résultats dans [les preuves de publication](audit-cpu-publication-2026-10-22/preuves/checks.json). Aucun `.env`, secret ou ancien cache de compilation copié. Les secrets d'authentification et Google ainsi que les overrides mémoire/dist et polices simulées sont absents du processus local. `mock-fonts.cjs` n'est pas inclus dans la livraison. Les anciens `.next` ne sont jamais publiés : Vercel reconstruira depuis Git.

Écart antérieur 133 500 / 749 199 ms : deux réussites, mêmes versions/configuration, mais pas de répétitions sur une machine dédiée ni attribution causale par lot. Processus actifs observés sur poste partagé. Les hypothèses restent contention, état des caches/téléchargements, ou différence propre à la variante. Nouveau build local froid de la composition finale pour vérifier l'aboutissement ; une seule répétition ne suffit pas à isoler une cause.

Journaux du précédent déploiement : build Vercel en `iad1`, 2 cœurs/8 Go, cache restauré, pnpm 10.28.0 et lockfile à jour, Next 16.3.4/Turbopack ; compilation 24,4 s, TypeScript 25,5 s, un worker de pages, sortie de build en 59 s. Ce contexte diffère du poste local (11 workers automatiques) ; comparaison de temps non contrôlée. Ce sont des **temps de build**, jamais du CPU actif des consultations. Aucun réglage de workers ou contrôle n'est modifié pour améliorer le résultat.

Les six échecs préexistants restent la référence à comparer par noms exacts ; la suite globale n'est pas présentée comme entièrement verte. Les résultats froids/chauds défavorables ou neutres des benchmarks restent dans le canevas et les JSON antérieurs. Aucun gain CPU Vercel annoncé.

Préparation des preuves pour Git : les journaux lisibles ont uniquement leurs fins de ligne/espaces finaux normalisés ; leurs octets bruts exacts sont conservés dans les archives `.log.gz`, avec empreintes dans `preuves/raw-log-archives.json`. Les lignes de contexte vides des patchs sont représentées sans espace final ; application et comparaison des deux familles rejouées avec succès. Aucun résultat défavorable supprimé et aucun contrôle désactivé pour faire passer `git diff --check`.

Relevé pendant le nouveau build à `2026-10-22T21:43:05Z` : poste de 8 023 652 Kio de mémoire physique, 1 205 056 Kio libres ; processus principal du build à 240,73 s de CPU cumulé. Cela établit un poste contraint en mémoire disponible et du travail CPU réel de compilation ; cela n'isole ni la pagination, ni la concurrence externe, ni leur contribution à l'écart. Ne pas extrapoler ces valeurs au runtime Vercel. [Relevé brut](audit-cpu-publication-2026-10-22/preuves/host-during-build.json).

**Nouveau build local final réussi** : du `2026-10-22T21:39:04.823Z` au `2026-10-22T21:47:14.587Z`, code 0, **489 764 ms**, compilation 71 s, TypeScript 2,7 min, 40 pages générées, 11 polices WOFF2 réelles. Aucun réglage de compilation changé. Next signale avoir ignoré le lockfile du dépôt parent extérieur au Git du clone ; le clone contient son propre lockfile et ses dépendances physiques. Pas de configuration ajoutée pour supprimer cet avertissement.

Cette répétition de la même composition applicative est plus rapide que 749 s, mais reste plus lente que la référence de 134 s. La compilation 71 s se rapproche des 59 s de référence, alors que le contrôle des types et les phases de chargement restent variables. Ces observations ne suffisent pas à attribuer une régression déterministe aux lots ; elles ne prouvent pas non plus que la contention mémoire explique toute la différence. Le build final aboutit et les limites de comparaison restent documentées.

Incident d'outillage avant le lint : le processus avec accès réseau utilise un compte Windows différent du propriétaire du clone créé dans le bac à sable ; Git refuse alors l'inventaire des fichiers avec « dubious ownership ». Le build, les tests et TypeScript avaient déjà terminé. Reprise du seul lint sous le propriétaire du clone, sans modifier `safe.directory` globalement, la configuration applicative ou les contrôles. Pour les opérations Git réseau ultérieures, la confiance est limitée à ce checkout créé et vérifié par cette intervention, via l'option de commande dédiée.

## Retour arrière ciblé préparé

[Patch D1/C1 conservant S1](audit-cpu-publication-2026-10-22/rollback-D1-C1-conserve-S1.patch) : rétablit uniquement `lib/documents/data.ts` et `lib/google/sheets.ts` dans leur état d'avant les optimisations. `git apply --check` réussi sur le checkout de livraison, sans appliquer le patch. [Preuve et empreintes S1](audit-cpu-publication-2026-10-22/preuves/rollback.json). Aucun module d'autorisation n'est dans le patch. Aucun schéma ou migration à annuler.

Si nécessaire après publication : nouveau checkout du SHA publié ; vérifier le patch sur cette base, l'appliquer et vérifier les empreintes S1 inchangées ; tester autorisations, fonctionnalités et types, construire normalement, puis publier un commit de retour ciblé via `main`. Les tests de comptage optimisé D1/C1 décrivent volontairement la variante et demandent les attentes de référence sur une version revenue en arrière ; ne pas les désactiver silencieusement pour annoncer une suite verte. Aucun commit de rollback ni déploiement de rollback exécuté ici. Un rollback intégral du déploiement précédent pourrait réélargir les droits VIEWER et n'est pas l'option par défaut.

Revenir sur C1 rétablit aussi ses anciennes sémantiques de cache, dont la course de remplissage après purge et le repli périmé de certains lots avec bypass ; conserver S1 ne corrige pas ces limites de fraîcheur. Si seul D1 doit revenir en arrière, appliquer uniquement sa partie du patch et conserver C1. La correction générale de fraîcheur utilisateurs reste un travail distinct.

## Vérifications après publication

Publication réalisée par un unique push en avance rapide vers `main` : **`e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964`**, 113 fichiers modifiés, dont les évolutions parallèles et les preuves documentaires. Les patchs CPU minimaux de 14 fichiers sont des sous-ensembles de revue ; la publication contient bien la composition complète. Déploiement **`dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx`**, READY depuis **`2026-10-22T21:58:24.619Z`**. Les deux lectures d'alias confirment `database.coc-rdc.net` et `coc-managment.vercel.app` sur ce déploiement et ce projet. [Preuve de publication et ancienne version](audit-cpu-publication-2026-10-22/preuves/deployment.json).

**11/11 contrôles anonymes conformes**, entre `21:59:32.332Z` et `21:59:41.151Z` : login et indisponibilité en 200 ; dashboard, documents et activation redirigés en 307 vers `/login` ; session, documents, preview, téléchargement et utilisateurs refusés en 401. Requêtes GET séquentielles, sans cookie ni Authorization, aucun formulaire envoyé. [Résultats HTTP](audit-cpu-publication-2026-10-22/preuves/anonymous-http.json). Le contenu du login contient bien le titre COC et son formulaire, pas une simple page de statut intermédiaire.

Les deux préchargements de polices effectivement servis sont en 200, signatures WOFF2, 23 108 / 29 288 octets et SHA-256 identiques aux véritables polices locales. Le vérificateur initial supposait le chemin local `/static/media` ; Vercel produit `/static/immutable/media`. Cette hypothèse d'outil a été corrigée, sans modification applicative ou redéploiement. [Polices servies](audit-cpu-publication-2026-10-22/preuves/served-fonts.json).

Journaux runtime standard consultés **une fois**, fenêtre `2026-10-22T21:58:24.619Z` — `2026-10-22T22:00:06.149Z`, limite 100 : commande réussie, **0 enregistrement renvoyé**, aucune pagination ni intervalle exclu annoncé. Cela ne démontre ni absence de trafic ni absence d'erreurs sur tous les parcours. Les refus anonymes ne produisent pas nécessairement de console applicative. [Résumé sans messages privés](audit-cpu-publication-2026-10-22/preuves/runtime-logs.json). Aucune requête métrique/Plus, aucun test de charge, aucune écriture métier de test.

Build de production : Next 16.3.4/Turbopack, pnpm 10.28.0, cache du déploiement précédent restauré, 2 cœurs/8 Go, compilation **45 s**, TypeScript **18,8 s**, 40 pages et un worker. L'avertissement de script `unrs-resolver` ignoré était déjà présent ; aucun réglage ajouté. [Résumé du build cloud](audit-cpu-publication-2026-10-22/preuves/cloud-build-summary.json). Ces durées diffèrent des builds locaux, sans isoler l'effet du code, des caches et de la machine ; aucun gain runtime CPU n'en est déduit.

Les validations et la préparation sont committées dans le SHA publié. Les preuves READY/alias/HTTP/journaux et la mise à jour d'état documentaire postérieures au déploiement sont conservées **localement dans le workspace**, à intégrer dans une prochaine livraison : aucun second push documentaire ne vient déclencher un déploiement redondant. Le checkout de livraison reste propre au SHA publié ; le workspace original, sa branche et ses modifications sont préservés.

Inventaire navigateur renouvelé : aucune application et aucun navigateur exposés. Pas de session autorisée utilisable ; les attributions réelles, les refus d'écriture en session VIEWER et les documents privés réels restent à recetter. Les tests hors réseau ne simulent pas une validation authentifiée de production.

## Travaux distincts

Invalidations globales, `fresh:true` ignoré dans l'adaptateur utilisateurs et repli périmé de sécurité ne font pas partie de cette publication. Prochaine priorité CPU : observation des parcours sur une fenêtre comparable pour établir la cause dominante ; vérification authentifiée restante des accès et documents. Aucune attribution du dépassement au nombre d'utilisateurs sans mesure.
