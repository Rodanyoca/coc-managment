# Suite de l’audit CPU — 23 octobre 2026

> Complément de cette journée : [validation des dépendances C2/F1 et lot dashboard A1](audit-dashboard-2026-10-23.md). Neuf classeurs configurés inspectés en lecture seule, aucune formule observée ; Site Web inaccessible, synchroniseurs externes non établis. Les conclusions de cette section historique doivent se lire avec ce complément.

## Référence et périmètre

Intervention exclusive dans coc-cible. Aucun push, déploiement, changement d’offre ou appel métier de production. Les preuves de cette phase sont dans [le dossier associé](audit-cpu-suite-2026-10-23/). Les anciens rapports restent des instantanés historiques.

**OBS** : l’alias `database.coc-rdc.net` pointe toujours sur `dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx`, READY, SHA `e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964` ; date UTC et SHA dans `production.json`, alias revérifié à 2026-10-23T09:04:17.484Z dans `production-alias-final.json` sur le même identifiant de déploiement. La branche locale reste `design/coc-febaco-visual-20261019`, HEAD `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`. Le HEAD seul ne représente donc ni la production ni la composition locale.

**CODE** : la composition locale contient D1/C1/S1 et les évolutions Utilisateurs non publiées. Les listes/fiches utilisent les composants harmonisés ; ni la page détaillée ni son API GET ne chargent `getAuditLog`. Les écritures `appendAuditLog`, les contrôles d’idempotence `alreadyProcessed`, les tentatives et leurs données sont conservés. Voir le [rapport Utilisateurs](../interfaces/harmonisation-utilisateurs-2026-10-23.md).

Référence physique : `.cache/cpu-next/reference`, copie de 657 fichiers existants avant intervention, empreintes dans `.cache/cpu-next/before.json`. Elle inclut les évolutions fonctionnelles locales ; ce n’est pas une reconstruction de la seule production. Variante : `.cache/cpu-next/variant`. Dépendances physiques, sans `.env`, cache de compilation ni simulation de polices. La référence a reçu une copie complète ; la copie lente des dépendances de la variante a été interrompue puis remplacée par déplacement des dépendances physiques de `.cache/users-ui/validation`, arrêtée. Ses sources et preuves antérieures restent conservées. Copie partielle gardée hors des racines compilées. Versions et verrou identiques : `dependencies.json`. Pas de reset, stash, changement de branche ou écrasement des travaux parallèles.

## Écarts et décisions

| Piste | Preuve | Impact possible, risque, effort | Décision |
| --- | --- | --- | --- |
| Purges globales | **CODE + REPRO** : un append dans USERS refroidit des lignes/en-têtes BUSINESS ; la fixture échoue avant correction. | Relectures et reconversions inutiles dans une même instance ; risque de dépendances oubliées ; effort moyen. Aucun classement CPU de production. | **C2 implémenté** : purge du classeur physique écrit, conservatrice entre onglets. |
| Fraîcheur de sécurité | **DOC** ADR 0002 exige source courante ; **CODE + REPRO** : `fresh:true` ignoré renvoie un ancien compte, puis le repli périmé peut masquer une panne. | Révocation retardée ; corriger augmente les lectures Google. Risque de disponibilité sous panne/concurrence ; effort moyen. | **F1 implémenté**, préalable à la réduction des purges : aucune donnée de sécurité périmée en repli. |
| Lecture lignes puis en-têtes | **CODE** repository fait deux lectures séparées ; le bypass seul provoquerait deux appels frais. | Deux attentes et snapshots potentiellement différents. | F1 fournit une table fraîche en un `batchGet` pour un onglet ; adaptateurs mémoire compatibles par repli sur leur interface existante. |
| Dashboard chaud | **CODE** six chargeurs conditionnels, mappings et agrégations refaits ; proxy/layout/décisions relisent le compte. Les constantes de tags ne constituent pas un cache d’agrégats. | Travail répété possible ; contribution réelle **MANQUANTE**. Cache de décision sensible à la révocation. | Prochaine investigation locale ; aucun cache d’agrégats ou de droits ajouté. |
| Partage concurrent | **CODE + TESTS** C1 partage les promesses par classeur/plage, plafond six lectures. | Réutilisation seulement dans le processus ; aucune coordination entre instances. | Conservé pour données ordinaires ; les lectures de sécurité fraîches ne se joignent pas à une ancienne promesse. |

## Dépendances et contrat d’invalidation C2

Le stockage partagé en mémoire ne contient que des plages brutes et des en-têtes : clé `${spreadsheetId}:${range}`, et promesses de lignes sur la même clé. Aucun résultat métier enrichi ni autorisation n’y est mémorisé. Les chargeurs fédérations/structures, acteurs/affiliations, activités, équipes/campagnes, compétitions/résultats et documents joignent leurs sources à chaque chargement. Drive conserve ses propres métadonnées : une écriture Sheets ne purgeait déjà pas ce cache Drive.

| Écriture | Dépendances brutes couvertes | Traitement |
| --- | --- | --- |
| USERS, USER_AUTORISATIONS, AUTH_TENTATIVES, JOURNAL_OPERATIONS | Tout le classeur physique utilisateurs, y compris onglets voisins et leurs plages personnalisées/en-têtes | Invalidation de tout ce classeur ; pas de purge des autres IDs. Les contrôles de compte, blocs, tentatives et idempotence utilisent la source fraîche. |
| Création/modification/suppression métier | Tout le classeur passé à append, append multiple, update simple/multiple ou delete | Même politique ; les jointures métier sont recalculées au prochain appel. Si deux configurations utilisent le même ID, elles sont invalidées ensemble. |
| Rafraîchissement explicite sans ID | Toutes les entrées de ce processus | `clearSheetCache()` reste une purge globale. Aucun appel applicatif externe trouvé dans l’état lu. |

La génération globale et une génération par ID de classeur constituent le jeton d’une lecture. Toute tentative d’écriture passée à Google invalide son classeur en `finally`, même si l’accusé de réception échoue : une erreur réseau ne démontre pas que Google n’a rien écrit. Les erreurs avant tentative de mutation ne purgent pas. Les anciennes lectures ordinaires peuvent terminer pour leurs appelants mais ne repeuplent plus le cache ; leur nettoyage ne retire pas une nouvelle promesse. Les autres classeurs gardent leurs entrées et promesses. Les lectures de sécurité ont un jeton par onglet source : écrire USERS invalide son snapshot frais, mais écrire JOURNAL_OPERATIONS ne rejette pas un snapshot USERS. Une purge explicite globale ou du classeur invalide tous ses jetons frais. Les plages personnalisées restent conservatrices au niveau du classeur. Une lecture explicitement fraîche invalidée localement rejette son résultat ; aucun retry caché ou réaccord de droits depuis ce résultat.

TTL inchangés. La fraîcheur métier entre instances et les modifications externes restent bornées par le TTL existant, sans invalidation distribuée. **MANQUE** : inventaire des formules réelles et de leurs éventuelles références entre classeurs. La cartographie et le code décrivent des jointures applicatives, pas une inspection des cellules de production. Le lot conserve volontairement toutes les dépendances intra-classeur ; avant publication, confirmer l’absence de formule inter-classeurs nécessitant une invalidation supplémentaire, ou conserver la purge globale pour les écritures concernées.

## Contrat de sécurité F1

`UsersRepository` préfère l’option facultative `readTable` de l’adaptateur Google : lignes et en-têtes d’un même onglet proviennent d’une seule réponse fraîche. Aucun cache ni promesse partagée, aucune écriture de cache, aucun repli périmé. Les méthodes `readRows/readHeaders` honorent aussi `fresh:true`. Le snapshot de connexion `getSheetsTables` bénéficie du même contrôle de génération local. Le repository continue ses validations de schéma, doublons et chevauchements. Un `batchGet` demande deux plages disjointes par onglet : `1:1` pour les en-têtes complets, y compris après Z, et `A2:Z` pour les données. Aucun doublon de la première ligne ni extension des colonnes de données. Voir les [conventions A1 Google Sheets](https://developers.google.com/workspace/sheets/api/guides/concepts).

Une panne donne `SOURCE_UNAVAILABLE` au repository ; les contrôles d’autorisation refusent, et la résolution de session n’accepte pas un ancien compte. Il peut en résulter indisponibilité/refus temporaire pendant une écriture concurrente de l’onglet source concerné, plutôt qu’un droit périmé. Aucune augmentation de TTL ni changement de politique S1. Les super-administrateurs, dates et refus d’écriture VIEWER gardent leurs règles.

Ce n’est pas une transaction entre USERS et USER_AUTORISATIONS ni une garantie de linéarisation multi-instance : une requête déjà autorisée n’est pas annulée rétroactivement, et une mutation d’une autre instance n’incrémente pas le jeton mémoire local. Un contrôle suivant relit Google sans cache ; les garanties de lecture concurrente de Google et les workflows multi-écritures restent les limites existantes.

## Reproduction et mesures

Commande de régression : `node --experimental-vm-modules --test tests/cpu/freshness-invalidation.test.mjs`. Les quatre premiers scénarios ont été exécutés rouges sur la référence : purge d’un autre classeur, compte révoqué caché, promesse d’un autre classeur retirée, lecture fraîche invalidée acceptée. Suite finale : 24 nouveaux tests, plus les 19 existants, dont la chaîne adaptateur Google → repository → politique VIEWER après retrait puis panne de source. Deux régressions intermédiaires sont aussi reproduites rouges puis corrigées : jeton frais trop large rejetant USERS après un journal indépendant (`reproduction-overbroad-fresh-fence.log`) et perte des en-têtes au-delà de Z (`reproduction-full-headers.log`). Le test unitaire qui décrivait l’ancien cache de session a été actualisé pour le contrat frais ; aucun échec préexistant désactivé.

Benchmark : `node --experimental-vm-modules scripts/cpu-audit/benchmark-next.mjs .cache/cpu-next/reference . docs/implementation/audit-cpu-suite-2026-10-23/benchmark.json`. Modules serveur réels dans VM ; fixtures synthétiques de 20/200/2 000 lignes ; cinq échauffements, neuf passages alternés AB/BA, au moins 20 opérations et 150 ms par échantillon. Froid, chaud, append d’audit puis consultation simple/huit consultations simultanées, écriture du même classeur, lecture de sécurité. Réponses métier comparées profondément, taille JSON mesurée ; appels dépendances et écritures simulés comptés. Les fixtures d’append enregistrent les demandes sans accroître indéfiniment les données : ce benchmark mesure l’invalidation et les relectures, pas l’intégrité transactionnelle des mutations.

Le scénario de sécurité final appelle le véritable `UsersRepository.getUserById` avec les 13 colonnes USERS et inclut conversions, schéma et unicité. Les autres scénarios utilisent deux colonnes synthétiques, sans agrégation métier. Les anciennes séries `benchmark-first-series.json`, `benchmark-coarse-fence.json` et `benchmark-fine-fence-single-range.json` mesuraient seulement l’adaptateur de sécurité à deux colonnes : leurs CPU ne sont pas directement comparables au scénario repository final. Les empreintes des quatre sources figurent dans `benchmark.json`. Les tailles de résultat désignent le helper local, pas la réponse HTTP navigateur.

CPU utilisateur+système du processus local, durée écoulée par opération et cellules JSON des dépendances sont distincts. L’attente réseau est simulée à zéro ; les octets sont du JSON de cellules, sans enveloppe HTTP. Les invocations locales ne sont pas des invocations Vercel. Les cas de mutation pendant lecture et panne sont vérifiés par ordonnancement déterministe dans les tests, sans leur attribuer un timing représentatif de production. Première série conservée ; le calcul d’octets des réponses par défaut y était sous-estimé et a été corrigé pour la série finale.

Les 18 scénarios ont des réponses métier équivalentes. Extrait de la série finale, 200 lignes, médianes par opération ; les neuf échantillons complets, autres volumes et première série restent dans les JSON.

| Scénario | CPU local référence → variante, ms | Durée locale référence → variante, ms | Appels Google simulés référence → variante |
| --- | --- | --- | --- |
| Froid | 0,13725 → 0,15544 | 0,12827 → 0,13429 | 1 get + 0 batch → 1 get + 0 batch |
| Chaud | 0,00088617 → 0,00092671 | 0,00091857 → 0,00094722 | 0 get + 0 batch → 0 get + 0 batch |
| Audit puis consultation d’un autre classeur | 0,19184 → 0,0067424 | 0,15312 → 0,0058919 | 2 get + 0 batch → 1 get + 0 batch |
| Audit puis huit consultations simultanées | 0,15137 → 0,013242 | 0,14119 → 0,012606 | 2 get + 0 batch → 1 get + 0 batch |
| Écriture puis lecture du même classeur | 0,16922 → 0,13019 | 0,13502 → 0,13426 | 1 get + 0 batch → 1 get + 0 batch |
| Sécurité fraîche : repository, 13 colonnes | 0,55714 → 1,1377 | 0,54688 → 1,1576 | 0 get + 0 batch → 0 get + 1 batch |

L’append d’audit lui-même reste exécuté ; son appel d’en-têtes demeure. La lecture/reconversion de 200 lignes métier est évitée : cellules JSON des dépendances 4612 → 16 octets simulés, réponse métier inchangée à 7181 octets (57457 pour huit lecteurs). Une écriture du classeur consulté continue d’imposer sa relecture. F1 **augmente** volontairement le travail sur un cache de sécurité chaud incorrect ; le snapshot unique évite les deux appels qu’entraînerait une correction naïve des lectures séparées, sans prétendre réduire les appels par rapport au code défectueux. Les huit lecteurs étaient déjà dédupliqués par C1 : deux lectures GET deviennent une, et non huit lectures devenant zéro. Deux plages de sécurité restent un seul appel batch. Le bilan réel C2+F1 dépend du trafic, des volumes et des instances, encore inconnus. Aucun gain CPU Vercel établi.

Les écarts de CPU très courts, la dispersion entre séries et le bruit du processus ne prouvent pas une régression de production. Les résultats froid/chaud défavorables sont conservés ; aucun seuil de gain inventé ni tri des passages.

### Isolation des builds

La première tentative de référence, interrompue à 273 015 ms pendant la compilation, sélectionnait la racine du workspace COC au lieu du checkout isolé : avertissement Next dans `reference-build-unbounded-aborted.log`, état conservé dans `checks-unbounded-aborted.json`. Aucune erreur applicative démontrée et aucune durée de build achevé pour cette tentative. La lente copie de dépendances est une autre phase d’environnement, exclue des temps de build.

Correction : `git init` uniquement dans les deux copies pour établir leur frontière, sans toucher à la configuration Next ou aux contrôles. `findRootDirAndLockFiles` de Next installé confirme les deux racines isolées (`build-isolation.json`). La tentative inachevée est conservée hors racine compilée ; les builds suivants démarrent sans `.next` et utilisent les véritables polices. Le runner vérifie désormais cette frontière avant compilation.

Les anciens 134 s / 749 s restent des observations locales historiques, sans attribution causale au runtime. Ni la correction du périmètre d’isolation ni un futur écart entre ces deux nouveaux builds ne démontrent un gain CPU Vercel.

La deuxième tentative de référence bornée a été interrompue après 908 769 ms sous pression mémoire (0,186 Gio libres), sans erreur applicative démontrée. La référence a ensuite terminé avec une affinité limitée à deux cœurs, configuration normale : build 1 546 109 ms, TypeScript 361 361 ms, 11 véritables fichiers wOF2, suite 319/325 avec les six échecs connus identiques. Les tentatives de variante interrompues pour les deux corrections intermédiaires sont conservées hors racines compilées.

La validation finale démarre à 2026-10-23T09:01:03.572Z avec 1,056 Gio libres après libération de mémoire annoncée, mêmes dépendances et affinité deux cœurs. Validation finale terminée à 2026-10-23T09:03:46.381Z : lint ciblé et lint global réussis ; 43/43 CPU, 3/3 Utilisateurs et 23/23 permissions ; build normal réussi en 115 630 ms avec 11 véritables fichiers wOF2 et `ignoreBuildErrors:false` ; TypeScript explicite réussi en 22 639 ms ; suite générale 319/325, exactement les six mêmes échecs que la référence. `checks.json`, `variant-fonts.json` et les journaux conservent les résultats. Lint global exécuté sur les deux copies avec la commande du script du dépôt : `node node_modules/eslint/bin/eslint.js app components lib proxy.ts --cache --cache-location .cache/eslint/.eslintcache`. Zéro erreur et un avertissement identique préexistant `react-hooks/set-state-in-effect`, `components/dashboard/athlete-sport-history.tsx:27`. Diagnostics comparés après normalisation du chemin de copie ; preuves `lint-full.json` et `*-lint-full.log`. Aucun nouvel échec. `preservation.json` confirme 649 fichiers existants inchangés hors périmètre, dont les interfaces Utilisateurs, D1 et S1 ; les quatre empreintes runtime compilées sont identiques aux sources benchmarkées et livrables. La différence de mémoire disponible interdit une attribution causale des durées de build. Aucun contrôle désactivé.

### Échecs préexistants reproduits

Les six noms sont comparés exactement par le runner, pas seulement leur nombre :

- competitions-final-interfaces : « la liste finale masque les cérémonies et conserve une action accessible » et « les écritures restent contextuelles et masquées sans droit » ;
- competitions-t12 : « T12: l'enveloppe serveur distingue 401/403, bloque les doublons et journalise » ;
- login-navigation : « la connexion recharge la destination après la pose du cookie » ;
- national-team-season : « le formulaire remplace les dates par le référentiel des saisons » ;
- performance-paths : « les chargements concernés utilisent un gris léger ».

**Verdict local : implémenté et vérifié, non publié.** Pas de recette navigateur authentifiée, de mesure Vercel ni d’inventaire des formules inter-classeurs. La comparaison de build référence/variante n’est pas un benchmark de performance : environnement mémoire différent. La livraison future doit confirmer les dépendances de formules ou appliquer le retour C2 conservateur décrit ci-dessous.

## Livraison et retour arrière

**Implémenté localement, non publié.** Runtime nécessaire : `lib/google/sheets.ts`, `lib/users/google-adapter.ts`, `lib/users/repository.ts`, `lib/users/types.ts`. Ajouter tests, scripts et preuves de cette phase à la composition complète conservant l’interface Utilisateurs et D1/C1/S1. Vérifier le diff contre le snapshot de cette phase, pas seulement contre le HEAD ancien.

C2 et F1 partagent le module Sheets ; ne pas retirer F1 pour retrouver le cache de sécurité défectueux. Retour ciblé C2 : rétablir la purge de tous les caches bruts, garder `finally`, la barrière fraîche par source, `readTable`, le bypass et S1. Le patch enregistre chaque classeur lu et incrémente ses générations brutes sans transformer un journal indépendant en révocation du snapshot USERS. Patch `rollback-c2-keep-f1-s1.patch` régénéré sur la source finale, appliqué dans `.cache/cpu-next/rollback-check` : 11/11 tests Sheets et 11/11 contrôles F1 passent (`rollback-check.log`, `rollback-f1-check.log`). Cette option réduit le risque lié à des dépendances inter-classeurs au prix de relectures. Un retour complet à e6fa5b2 ou c1488d3 réintroduirait des défauts de fraîcheur ; c1488d3 pourrait aussi réélargir VIEWER.

Avant toute future publication : confirmer les dépendances externes non décrites, examiner le diff complet, rejouer validations sur la composition finale, conserver SHA/déploiement précédent, publier une seule fois par le workflow Git main et vérifier READY/alias/SHA. Observer sur une fenêtre UTC bornée les erreurs source, les refus inattendus et les métriques disponibles ; aucune requête Observability Plus ni modification d’offre. Pas de gain Vercel déduit de ce benchmark.

Recette authentifiée restante : connexion/activation puis dashboard, compte désactivé ou sessions révoquées, blocs VIEWER attribués/retirés/datés, refus d’écriture et documents privés ; inventaire navigateur de cette phase : aucune application ni aucun navigateur (`apps:[]`, `browsers:[]`). Aucune recette authentifiée revendiquée. Aucune session fabriquée, mutation de droits, écriture ou charge de production.
