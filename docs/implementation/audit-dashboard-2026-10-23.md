# C2/F1 : dépendances ; dashboard : lot A1 — 23 octobre 2026

> Décision de livraison ultérieure : [F1/A1 et évolutions parallèles dans une composition conservatrice, C2 différé](audit-livraison-f1-a1-2026-10-23.md). Le workspace garde C2 ; les timings et attentes de cache ci-dessous décrivent leur composition historique et ne doivent pas être attribués à la copie de livraison sans C2.

> Évolution fonctionnelle ultérieure, distincte d’A1 : ajout de la neuvième KPI « Médailles » dans `components/dashboard/general-summary-section.tsx`, avec total et répartition or/argent/bronze déjà chargés dans `competitions.medals`. La grille existante `lg:grid-cols-3` produit ainsi 3 × 3 cartes lorsque toutes les sections sont autorisées et disponibles ; mobile une colonne, tablette deux. Aucun appel serveur ajouté ni modification des permissions. Lint ciblé et rendu HTML statique vérifiés ; aucun serveur relancé. Le build A1 ci-dessous précède cet ajout visuel et ne vaut pas build de cette nouvelle composition.

## Référence et statut

Suite du [rapport C2/F1](audit-cpu-suite-2026-10-23.md), sans reprise de l’audit initial. Dépôt exclusif : coc-cible. Aucun serveur de développement relancé, push, déploiement, changement d’offre, test de charge ou écriture de production. Les lectures de formules sont les seuls nouveaux accès aux classeurs ; aucune connexion utilisateur de test.

**CODE/OBS local** : HEAD `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, branche `design/coc-febaco-visual-20261019`, composition sale conservant D1/C1/S1, C2/F1 et le module Utilisateurs. Référence de cette phase : `.cache/cpu-dashboard/reference`, snapshot de 714 fichiers existants, empreintes `.cache/cpu-dashboard/before.json`. Ce snapshot contient les améliorations locales non publiées ; ce n’est pas le code publié. Dernière production identifiée : e6fa5b2 / `dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx`, alias vérifié le 23 octobre à 09:04 UTC, preuve précédente conservée ; aucune nouvelle affirmation d’observation runtime en production.

**Statuts** : C2/F1 implémentés et validés localement auparavant, vérifications complémentaires ci-dessous. A1 Activités implémenté et vérifié localement. Rien de cette phase n’est publié. Les [preuves](audit-dashboard-2026-10-23/) séparent inventaire réel, tests synthétiques et benchmark local.

## C2 : dépendances vérifiées

### Trois couches distinctes

| Couche | Clés et portée | Dépendances, fraîcheur et invalidation |
| --- | --- | --- |
| Lignes/en-têtes Sheets | ID physique + plage, mémoire du processus ; promesses des lignes partagées par même clé | TTL existants conservés (notamment 5 s pour les lectures fédérations, défaut 300 s configurable). Toute mutation tentée invalide tout son classeur en `finally`, succès ou erreur incertaine. Générations empêchant le remplissage par une ancienne lecture. |
| Données enrichies | Objets/Maps recréés dans les chargeurs, pas de cache persistant identifié | Les jointures relisent leurs sources brutes et reconstruisent les libellés à chaque invocation. Modifier une source ne nécessite pas de purger un objet enrichi mémorisé : il n’existe pas ici. |
| Agrégats dashboard | Variables locales au chargement, aucun cache d’agrégats ajouté | Recalcul à chaque ouverture/rafraîchissement, y compris sur cache Sheets chaud. Les constantes `*_DASHBOARD_CACHE_TAG` et les `revalidatePath/revalidateTag` ne constituent pas à elles seules un stockage d’agrégats. |
| Tailles Drive | ID du fichier, mémoire locale, TTL 5 min | Hors cache Sheets. Les remplacements documentaires créent un nouvel ID ; les données de rattachement et l’ID courant sont lus dans DOCUMENTS. Une modification externe du même fichier reste soumise au TTL Drive existant. |

Les Maps des files d’écriture/idempotence Utilisateurs et création de fédération ne sont pas des caches de lecture métier ; aucun retrait de leurs protections. Les caches HTTP/route et le Router Cache du navigateur ne sont pas invalidés de manière distribuée par la mémoire Sheets ; les contrôles serveur et revalidations des routes restent inchangés.

### Écritures et jointures applicatives

Toutes les mutations Sheets du runtime trouvées passent par les cinq helpers de `lib/google/sheets.ts`. Recherche : `rg -l 'appendSheetRow|updateSheetCells|deleteSheetRow|updateSheetCell|appendSheetRows' app/api lib --glob '*.ts'`. Les scripts d’administration hors runtime ne sont pas assimilés aux parcours utilisateurs.

| Source écrite | Principaux consommateurs et sources jointes | Conséquence C2 |
| --- | --- | --- |
| USERS, USER_AUTORISATIONS, AUTH_TENTATIVES, JOURNAL_OPERATIONS | Session, droits, utilisateurs, anti-abus et idempotence | Tout le classeur USERS brut invalidé ; sécurité fraîche F1. Un journal indépendant ne rejette pas une lecture USERS en cours. |
| Référentiel : ENTITES/FEDERATIONS, logo fédération, types et références | Fédération/structures + territorial ; options d’acteurs, activités, équipes, compétitions et documents | REF invalidé ; TERRITORIAL/ACTEURS/etc. indépendants conservés. Les jointures refaites voient les nouvelles sources REF. Création fédération : deux appends du même classeur, compensation ENTITES en cas d’échec, chaque écriture invalidée. |
| Structure territoriale, contacts d’entités | Fédération/structures ; jointures avec REF, ACTEURS et AFFILIATIONS | TERRITORIAL invalidé ; autres lignes conservées, jointures refaites. |
| Acteurs et médias privés | Fiches/listes, options, membres et contacts | ACTEURS invalidé ; AFFILIATIONS/REF conservés tant qu’aucune écriture ne les vise. Les libellés sont rejoints au prochain appel. |
| Affiliations d’officiels | Officiels, contacts d’entités, relations avec REF | AFFILIATIONS invalidé ; lectures ACTEURS/REF de validation distinctes, pas d’agrégat enrichi mémorisé. |
| Activités/relations/participants | Dashboard et fiches, REF pour les types et acteurs pour les participants | ACTIVITES invalidé ; REF indépendant conservé. Deux écritures activité/organisateur restent deux étapes, pas une transaction nouvelle. |
| Équipes/campagnes/sélections/staff | Équipes et graphe compétitions, saisons et acteurs en jointure | EQUIPES invalidé ; COMPETITIONS brut conservé, ses engagements/résultats enrichis reconstruits. |
| Compétitions/programmes/engagements/participations/unités/résultats/médailles | Graphe réparti COMPETITIONS + EQUIPES, REF et acteurs | Classeur de chaque mutation invalidé via `spreadsheetFor` dans v1-data ; les lectures/validations multi-classeurs ne sont pas un cache global du graphe. |
| Documents | Documents + tailles Drive ; références REF/activités/compétitions/équipes/officiels | DOCUMENTS invalidé ; jointures et tailles depuis ID courant, D1 conservé. |
| Site Web : SLIDERS | Statuts de publication dans REF | ID statique séparé ; accessible au code mais inspection live indisponible ici, voir limite ci-dessous. |

**Résultat du code** : aucune dépendance manquante démontrée entre caches bruts des modules inspectés ; aucune nouvelle modification C2 requise. Une mutation métier puis sa journalisation touche successivement le classeur métier et USERS : chaque helper invalide sa propre source. Un échec de la seconde étape ne rétablit pas les entrées de la première. Ni atomicité multi-classeurs ni compensation générale garanties par C2.

### Formules réelles : preuve et limites

**OBS** : métadonnées puis 73 lectures bornées, maximum 37 284 cellules par rectangle, sur les neuf IDs configurés localement. Sélection exclusivement `userEnteredValue(formulaValue)`, toutes les grilles couvertes à leur taille observée ; zéro formule trouvée. Aucune valeur métier ni formule brute conservée. Détails des onglets, dimensions, identifiants de feuilles et horodatage dans `formula-inventory.json`.

Cela écarte une dépendance par formule dans ces grilles **à cet instant**, sans démontrer l’absence de scripts Apps Script, déclencheurs ou intégrations externes. L’identité entre les IDs locaux et toutes les variables de production n’a pas été revérifiée. L’ajout ultérieur d’IMPORTRANGE ou d’un synchroniseur doit entraîner une nouvelle cartographie et une invalidation des sources affectées.

**MANQUANT** : classeur Site Web codé en dur, accès connecteur refusé puis lecture applicative seule en 404 (`site-formula-inventory.json`). Pas de requête répétée après cet échec. Le périmètre Site Web ne peut pas être certifié sans cet accès. Avant publication C2, confirmer ses dépendances et les synchroniseurs éventuels ou conserver une purge brute globale ciblée pour les écritures non vérifiées. Le rollback C2 conservant F1/S1 reste préparé dans le rapport précédent. Aucun élargissement des droits pour obtenir cette preuve.

### Concurrence et sécurité F1

Nouveaux tests locaux sur les véritables helpers Sheets : mutations de deux classeurs pendant des lectures, absence de repeuplement périmé, conservation d’un troisième cache indépendant, seconde écriture en erreur après première réussie. Une lecture ordinaire déjà en cours peut terminer avec son snapshot pour l’appelant ; elle n’alimente pas le cache après invalidation. Une lecture de sécurité invalidée rejette. Les tests F1 précédents sont rejoués : bypass frais, snapshot unique en deux plages, en-têtes après Z, source indisponible sans repli périmé, retrait d’un bloc VIEWER jamais réaccordé depuis le cache. TTL et politique S1 inchangés.

L’invalidation ne concerne que le processus qui écrit. Une autre instance ou un outil externe n’incrémente pas ses générations ; données ordinaires soumises aux TTL existants. F1 relit Google à chaque contrôle sans cache, mais ne crée pas de transaction entre plusieurs sources ni de révocation rétroactive d’une requête déjà autorisée. Ce lot ne prétend pas fournir une invalidation distribuée.

## Dashboard : rapport d’écart et décision A1

L’ouverture et le bouton de rafraîchissement exécutent les mêmes chargeurs serveur. La page vérifie `AUT-ADM/READ` et `AUT-SPT/READ` avant de lancer les sections autorisées. `Promise.allSettled` garde les sections disponibles si une source échoue. Les décisions proxy/layout/page relisent les comptes/autorisations ; leur mutualisation n’est pas modifiée, afin de préserver F1 et les révocations.

| Section | Travail à chaque invocation, même avec des lignes en cache | Écart et priorité |
| --- | --- | --- |
| Fédérations/territorial | Huit tables REF, six tables territoriales ; conversions, Maps d’entités/sports, enrichissements et tri ; agrégation fédérations puis niveaux territoriaux | Plusieurs données détaillées/options non affichées par ces indicateurs ; candidat suivant, contrat à mesurer. Bundle déjà commun aux deux sections. |
| Acteurs | Cinq tables ; filtre ID puis quatre filtres par type et normalisations sexe/statut répétées | Calculs répétitifs, pas de complétude ; optimisation possible sans cache, non traitée dans A1. |
| Activités | ACTIVITES + quatre tables de références ; normalisation des activités, conversion de toutes les références, filtres par type/statut et tri | **PREUVE + REPRO** : seules les options TYPES_ACTIVITE sont affichées. A1 supprime les trois sources et conversions inutilisées, sans changer l’agrégation. |
| Compétitions/médailles | Compétitions, participations, gros référentiels, médailles, résultats courants ; programmes/campagnes/équipes relus dans plusieurs branches et Maps reconstruites | C1 peut mutualiser les lectures brutes en cours, pas les conversions/jointures après lecture. Référentiels de formulaire plus larges que les libellés affichés ; investigation suivante. Les médailles ont leur propre source, pas une seconde agrégation des résultats. |
| Équipes nationales | Équipes+saisons, campagnes/sélections/staff, références/fédérations ; jointures et dédoublonnage des membres par sport | Référentiels larges et conversions partagées avec les branches compétitions ; pas de cache dérivé actuel. |
| Documents | Tous les documents utiles à la synthèse et leurs tailles Drive ; regroupement par rattachement et totaux | La synthèse affiche stockage/tailles : ne pas supprimer ce travail comme s’il était inutilisé. D1 limite toujours les autres parcours aux documents sélectionnés. |

**Choix A1** : réduction du chargement de référence Activités, preuve simple et risque faible, sans classement CPU de production. `getActivityTypes` reprend exactement le filtrage et les libellés des options existantes. Le dashboard l’utilise au lieu de `getActivityReferences`. Les formulaires conservent leur fonction complète et les validations de mutation. Aucun nouvel indicateur, nouvelle colonne ou retour de complétude.

**Contrat** : aucune donnée enrichie, promesse de dashboard ou décision d’autorisation mise en cache. Seuls les caches C1/C2 existants, clés physiques/plages et TTL inchangés. La source TYPES_ACTIVITE est invalidée avec REF ; ACTIVITES avec son classeur. Les résultats sont recalculés à chaque appel après les contrôles de page. Une panne d’une source nécessaire sans entrée brute de repli remonte ; pas de repli d’agrégat ajouté. Le repli périmé des lignes ordinaires, déjà existant sous erreur réseau et protégé par la génération, reste inchangé : il est distinct de la sécurité F1, qui le refuse. Une panne d’ENTITES seule ne casse plus la section Activités. Pas de coordination supplémentaire entre requêtes ou instances.

## Reproduction et benchmark

Deux tests rouges avant modification : les appels incluent trois références inutiles ; une panne ENTITES empêche l’affichage des activités pourtant disponibles. Commande : `node --experimental-vm-modules --test --test-reporter=tap --test-name-pattern='displayed reference|unused reference' tests/cpu/dashboard.test.mjs`. Preuve `reproduction.log` conservée. Après correction : sept tests dashboard, dont équivalence des options avec les formulaires, tous statuts, types inconnus/sans type, source obligatoire en panne, concurrence et mutations multi-classeurs.

Commande : `node --experimental-vm-modules scripts/cpu-audit/benchmark-dashboard.mjs .cache/cpu-dashboard/reference . docs/implementation/audit-dashboard-2026-10-23/benchmark.json`. Véritables modules dashboard/data/Sheets exécutés en VM, seules les API Google simulées. Données identiques de 20/200/2 000 activités (13 colonnes), huit types, et autant d’entités/rôles/types d’acteurs que d’activités. Cinq échauffements puis neuf passages alternés AB/BA, au moins 20 opérations et 100 ms par échantillon. Quinze scénarios : froid, chaud, huit appels simultanés chauds, après mutation de REF, après mutation ACTIVITES. Les mutations enregistrent les requêtes sans faire croître indéfiniment les fixtures ; les tests déterministes couvrent séparément changements réels, erreurs et lectures en cours. Les réponses sont comparées profondément avant les mesures.

CPU utilisateur+système du processus et durée écoulée sont distincts ; attente réseau simulée à zéro. Appels Google comptés dans les fixtures, pas invocations Vercel. Périmètre : section Activités seule, sans React, authentification ou autres sections ; sur le dashboard complet certaines références sont déjà nécessaires aux autres sections, donc les trois appels évités ne sont pas un gain garanti pour la page entière. Les conversions inutiles de cette branche restent supprimées sur cache chaud. Aucun benchmark Vercel et aucun gain CPU de production affirmé.

Extrait à 200 lignes, médianes par opération (une rafale de huit lecteurs compte comme une opération dans sa ligne). Les autres volumes et tous les passages restent dans `benchmark.json`.

| Scénario | CPU local réf. → A1, ms | Durée écoulée réf. → A1, ms | GET simulés réf. → A1 | Lectures logiques de lignes réf. → A1 |
| --- | --- | --- | --- | --- |
| Froid | 6,25 → 4,583 | 5,905 → 4,578 | 5 → 2 | 5 → 2 |
| Chaud | 2,37 → 2,294 | 2,243 → 2,223 | 0 → 0 | 5 → 2 |
| Huit lecteurs chauds simultanés | 17,95 → 17,15 | 17,79 → 17,2 | 0 → 0 | 40 → 16 |
| Après mutation REF | 4,36 → 2,35 | 4,024 → 2,481 | 4 → 1 | 5 → 2 |
| Après mutation ACTIVITES | 3,76 → 3,615 | 3,715 → 3,794 | 1 → 1 | 5 → 2 |

Les trois référentiels inutilisés auraient produit 600 objets d’options à 200 lignes dans cette fixture ; A1 supprime ces conversions y compris sur cache chaud. Les activités, leurs types, les filtres/statuts et l’agrégation restent exécutés, donc pas d’affirmation de suppression de tout le travail répété. Aucun appel batch dans cette section. Les scénarios de mutation conservent chacun une écriture simulée. Le résultat CPU concurrent légèrement défavorable de la première série (7,000 → 7,050 ms pour huit lecteurs à 200 lignes) est conservé : bruit, ordonnancement et autres traitements subsistent, sans seuil de gain inventé. Deux séries conservées, chacune avec neuf paires alternées par scénario : `benchmark-first-series.json` et `benchmark.json` (tableau final ci-dessus). La première exécution avait un code terminal PowerShell ambigu malgré un JSON complet ; la seconde capture directement le statut natif Node, zéro (`benchmark-execution.json`), après fin de tous les builds/tests et sans compilation concurrente. La dispersion reste visible, sans comparaison temporelle avec les benchmarks C2/F1 dont le périmètre diffère.

### Validation finale

La dispersion entre séries est importante : à 200 lignes chaudes, CPU référence 0,783 ms dans la première contre 2,370 ms dans la seconde. Le poste partagé et ces observations ne permettent pas d’isoler une cause. La seconde série conserve aussi une durée après mutation ACTIVITES légèrement défavorable (3,715 → 3,794 ms), malgré le travail logique supprimé. Les temps absolus ne constituent donc ni une garantie de gain ni une mesure Vercel. Les comptes de dépendances et l’équivalence restent les preuves stables. `final-verification.json` confirme le statut natif du benchmark, les deux séries, les empreintes benchmark/build/workspace et les 710 fichiers préservés.

Le runner `scripts/cpu-audit/validate-dashboard.mjs` vérifie les 348 entrées de compilation de la référence contre la copie ayant déjà produit le build C2/F1 réussi : preuve `reference-build-reuse.json`. Ce résultat de référence est réutilisé, pas présenté comme un nouveau build. L’ancien artefact est conservé hors racine de compilation dans `.cache/cpu-dashboard/pre-dashboard-build`. La variante démarre sans `.next`, avec les dépendances physiques existantes, configuration normale et affinité deux cœurs. Les temps de build ne sont pas une mesure de CPU runtime. Environnement de départ : 0,910 Gio libres sur 7,652 Gio ; aucun serveur utilisateur relancé.

Build normal réussi en 365 606 ms, sans simulation de polices ni contrôle désactivé, 11 véritables fichiers wOF2 (`fonts.json`), `ignoreBuildErrors:false`. Lint global : zéro erreur, même avertissement préexistant `react-hooks/set-state-in-effect` dans `athlete-sport-history.tsx:27`. Tests CPU 50/50 (43 précédents et 7 nouveaux), Utilisateurs 3/3 et permissions 23/23. TypeScript explicite réussi en 188 780 ms. Suite générale : 319/325, exactement les six mêmes noms d’échecs que la référence, comparés par le runner (`checks.json` et `suite.log`) ; liste détaillée conservée dans le rapport C2/F1, aucun nouvel échec. Le passage du build de référence réutilisé de 115 630 ms à 365 606 ms est conservé comme résultat défavorable ; il n’isole pas un effet du changement applicatif, le poste étant partagé et les conditions mémoire fluctuantes. Ce n’est pas un benchmark runtime.

La préservation des 710 fichiers existants hors périmètre et l’identité des sources compilées sont vérifiées dans `preservation.json`. Les modules Utilisateurs, les écritures de journalisation, D1/C1/S1 et les quatre fichiers C2/F1 ne sont pas modifiés par A1. Aucune recette authentifiée réalisée : serveur volontairement laissé arrêté, aucune session ni droit fabriqué. Les fixtures ne constituent pas une validation navigateur d’une session réelle.

## Livraison et retour arrière

Runtime A1 : **deux fichiers seulement**, `lib/activites/data.ts` et `lib/activites/dashboard.ts`. Nouveaux tests `tests/cpu/dashboard.test.mjs`, scripts `dashboard-fixture.mjs`, `benchmark-dashboard.mjs`, `validate-dashboard.mjs`, documents et preuves. C2/F1 restent un lot distinct et ne sont pas modifiés par A1. Conserver la composition complète incluant les évolutions Utilisateurs/D1/C1/S1 et les journaux. Exclure `.cache`, `.next*`, `.env*`, mocks de polices et fichiers générés.

Retour A1 : `a1-rollback.patch`, patch des deux fichiers contre le snapshot de cette phase, vérifié par `git apply --check` sans application au workspace. Le patch de livraison `a1-forward.patch` est lui aussi vérifié sur la référence isolée. Aucun changement Sheets, F1, S1 ou Utilisateurs dans ces patches. Cela rétablit les lectures/conversions superflues et la dépendance à ENTITES ; ne nécessite aucune migration de données. Retour C2 : procédure et patch précédents gardant F1/S1 ; ne pas effectuer de rollback complet réintroduisant leurs défauts.

Avant toute publication future : résoudre la limite Site Web/synchroniseurs, examiner le diff complet, recette authentifiée autorisée, conserver SHA/déploiement précédent et procéder via le workflow Git réel. Après livraison, observation bornée UTC des erreurs source/refus inattendus et métriques disponibles, sans Observability Plus ni test de charge. Aucun push/déploiement autorisé pour cette phase.

## Sources de l’inspection des formules

Les URL vérifiées et les propriétés des neuf classeurs inspectés figurent dans [l’inventaire](audit-dashboard-2026-10-23/formula-inventory.json). Cet inventaire n’enregistre aucune donnée de compte ni cellule métier. L’inspection ne modifie aucun classeur.

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/1q1ZeT3ueQtoAyCnsLXJcBbe3Zakmkqu_3Vy-6IlUpQw/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/14nI4fsj3cmZpece2ckW0ULT9EFOSdOkWFQACQk5aHsg/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/13mCDJcLDKoXJOSG72QrXCJ6npP3yQ0g5T5B5VW41cAA/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/1S5H_D9Zo4qdg20aCEYJfcf5yiYwg-DKvSKkubecGVtQ/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/1Hu9_X-3D0Rt30TrgeohXsUM4I9ooxM-A6yAfmlXVRrw/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/1vxdYFz8B6-IZSGIuFZm4x7PQ9awd41m6i46s_jqL2fo/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/17hm4n4QSWq_IrSANyF4pJIZ_9Jg9pD85ycMV7SCb7XQ/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/1ZJMAVMb3QbuSxwMg2iW1exkkFl-38dBf_PXEjy4PPWs/edit" purpose="source"}

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/1Tip01SUzauQmVX__Z1xYCzSmankAxi1LbUpDgqF5jO8/edit" purpose="source"}
