# Audit CPU COC — sources, exigences et limites de preuve

Date de lecture : 22 octobre 2026. Périmètre exclusif : `coc-cible`. Annexe documentaire du cadrage CPU, issue de lectures locales et de documentation officielle ; aucune mesure de charge ni modification applicative.

## Qualification des sources

- **Exigence** : règle issue du cahier des charges ou décision formalisée. Ce n’est pas une preuve de comportement en production.
- **Constat code** : comportement lisible dans les fichiers présents au moment de l’audit. Son déploiement reste à vérifier séparément.
- **Historique documenté** : résultat annoncé dans un rapport antérieur, sans reproduction durant cette intervention.
- **Hypothèse** : explication candidate exigeant une mesure.
- **Manquant** : donnée non établie par ces sources.

## Référentiel lu et garanties à préserver

`docs/contexte-projet.md` fixe la hiérarchie : SNDS, cahier COC, annexes validées, puis code/tests pour constater l’implémentation. Google Sheets/Drive sont des choix V1, pas des règles nationales. `CONTEXT.md` distingue utilisateur et acteur, équipe permanente et campagne, sélection et participation effective, résultat sourcé et classement officiel.

Le cahier `docs/cahier-des-charges-coc.pdf` comporte 29 pages. Ses pages 22–23 exigent la protection des pages et fichiers, le contrôle serveur de chaque action sensible, la traçabilité sans secrets, le chargement des seules données nécessaires, l’évitement des lectures répétées et calculs inutiles, et des reprises après indisponibilité. Ces exigences ne contiennent pas de budget chiffré de CPU ou de latence. L’absence de source ne doit pas devenir un faux zéro. Les pages 24–26 demandent cohérence des opérations métier et validation des périmètres. Le SNDS (`docs/snds.pdf`, 26 pages), notamment pages 17 et 24–25, impose confidentialité documentaire, conservation des versions officielles et définition explicite des sources, périmètres, périodes et formules des indicateurs.

`docs/lot-2-utilisateurs-authentification-autorisations.md` et les ADR `0001`/`0002` remplacent explicitement le modèle d’identité externe du cahier par l’authentification locale Sheets : empreintes scrypt, session de huit heures, activation temporaire de vingt-quatre heures, révocation par version, autorisations datées par blocs et refus sécurisé si leur source est indisponible. Le contrôle frais est un choix de sécurité intentionnel ; une optimisation ne peut pas le supprimer silencieusement. Le super-administrateur possède tous les blocs ; ADMIN et VIEWER restent soumis aux attributions, et VIEWER à la lecture. La gestion des utilisateurs/référentiels est réservée au super-administrateur.

`docs/mappings/google-sheets-workbooks.md` décrit les onglets et colonnes (snapshot daté du 24 septembre), sans constituer un inventaire de volumes ni une preuve du schéma actuellement publié. `docs/sommaire-mode-emploi-processus-metier.md`, préparatoire au 20 octobre, décrit connexion/activation, navigation, accès, fédérations/structures, acteurs, équipes/campagnes, compétitions/participations/résultats, activités et documents. Il précise lui-même que les parcours n’ont pas été exécutés en session connectée : ce n’est pas un procès-verbal de recette. `docs/interfaces/regles-listes-et-details.md` protège lisibilité responsive, identité prioritaire, données absentes neutres et distinction sélection/participation.

## Historique de performance : à ne pas assimiler à une référence CPU

`docs/implementation/performance-routes-audit.md` annonce un inventaire **statique au 5 septembre 2026** : 47 routes API, 63 appels directs `getSheetRows`, 27 lectures fraîches. Il documente déduplication, plafond de six lectures Sheets simultanées, suppression d’une purge automatique du dashboard, agrégat médailles ciblé et retour de ligne après mutation. Il ne fournit ni CPU actif par route, ni volume réel, ni distribution de trafic, ni comparaison de consommation Vercel avant/après. Le « dashboard : 4 au plus » de son tableau ne doit pas être réutilisé comme comptage actuel sans définir le périmètre exact.

`docs/implementation/correction-connexion-navigation-2026-09-01.md` rapporte une ancienne connexion de 18–21 secondes et la parallélisation d’écritures indépendantes. Cette durée historique n’est pas une mesure de CPU. Son addendum affirme ensuite une purge Sheets à chaque accueil ; le rapport performance mentionne sa suppression. **Constat actuel** : `lib/dashboard/fresh-load.ts` fait seulement `Promise.allSettled` ; `app/dashboard/page.tsx` lui passe six chargeurs conditionnés par les droits. La purge systématique de l’addendum ne décrit donc plus ce chemin actuel. Ne pas conclure à une régression sur le seul récit historique.

Dans `lib/google/sheets.ts`, le cache et les lectures en vol résident dans `globalThis`, avec TTL par défaut de 300 000 ms, clé classeur/plage et limite de six lectures. Les lectures `bypassCache` ne lisent ni n’alimentent le cache et ne passent pas par la déduplication des lectures en vol. Cette portée est celle du processus, sans garantie de partage entre instances Vercel. Ce sont des constats de code, pas des taux de succès observés. Les temps `performance.now()` de `lib/competitions/mutation.ts` sont des temps écoulés ; aucun profil CPU n’en découle.

## Mesure CPU et accès Vercel

La documentation officielle [Fluid compute pricing](https://vercel.com/docs/functions/usage-and-pricing) définit Active CPU comme le temps d’exécution réellement consommé ; l’attente d’un service externe ne lui est pas imputée, tandis que la mémoire provisionnée suit un autre compteur. Un appel Sheets long n’établit donc pas une cause de dépassement CPU. La durée HTTP inclut attente, transport et traitements ; la durée réseau Google isole une dépendance ; les temps de compilation Next.js de développement ne décrivent pas la production. La concurrence peut multiplier les invocations et les calculs ou permettre une réutilisation d’instance : son effet net doit être mesuré.

Selon [Observability Plus](https://vercel.com/docs/observability/observability-plus), consulté le 22 octobre 2026 :

| Accès | Standard | Plus |
| --- | --- | --- |
| Rétention Observability | Hobby 12 h ; Pro 1 j ; Enterprise 3 j | 30 j |
| Runtime logs | Hobby 1 h ; Pro 1 j ; Enterprise 3 j | 30 j, sélection de 14 jours consécutifs maximum |
| Query | Indisponible | Disponible |
| Functions | Pas de détail par chemin ni p75 | Détail chemins/routes et latence |
| API externes | Totaux par hôte | Tri/filtrage et détails supplémentaires |

Ces capacités publiques ne prouvent pas les droits effectifs du compte COC. Le plan, l’état Fluid, la rétention accessible, l’inclusion du projet dans Plus et la période de facturation doivent être consignés à partir de l’accès réel. Ne pas répéter une requête métrique bloquée par Plus ; conserver le refus et exploiter métadonnées, consommation agrégée et journaux encore disponibles. Ne pas activer d’option payante. La page [Observability Insights](https://vercel.com/docs/observability/insights) décrit les sections disponibles, mais ne remplace pas la vérification des accès du projet.

## Première collecte recommandée et critères de comparaison

Établir d’abord une référence passive sur une fenêtre datée : projet/déploiement/commit, plan effectif, ressource exacte dépassée et unité, invocations et CPU agrégés disponibles, routes et statuts dans les journaux, répartition de consultations/rafraîchissements/écritures. Capturer rapidement ce qui expire ; noter trous, échantillonnage et restrictions. Ne collecter aucun secret, donnée métier, cookie ni identifiant personnel inutile. Les volumes de lignes, tailles de réponses, taux hit/miss, nombre réel d’utilisateurs simultanés et CPU par parcours restent **manquants** dans les rapports lus.

Lors d’une phase ultérieure autorisée, une comparaison doit conserver parcours et droits, jeu de données, version, état froid/chaud et fenêtre comparables ; rapporter séparément CPU/invocation, CPU total, invocations, durées HTTP et Google, octets, erreurs et fraîcheur. Publier effectifs et limites, pas seulement une moyenne. Si seul un proxy est disponible (latence locale, Server-Timing), le nommer comme tel et ne pas annoncer un gain CPU.

Premières hypothèses à départager : coût de transformations répétées malgré un cache brut chaud ; répétition des contrôles frais de sécurité au fil d’un parcours ; multiplication des appels par navigation/rafraîchissement et invalidation après écritures. Les mécanismes existent dans le code, mais leur contribution au dépassement n’est pas mesurée. Le nombre d’utilisateurs et le faible volume métier signalés par l’utilisateur sont un contexte à vérifier, pas une attribution causale. Les optimisations FEBACO ne constituent ni preuve COC ni solution déjà validée.
