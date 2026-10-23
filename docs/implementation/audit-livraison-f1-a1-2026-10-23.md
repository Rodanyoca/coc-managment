# Livraison isolée F1/A1 — 23 octobre 2026

## Décision et composition

Suite du [rapport A1](audit-dashboard-2026-10-23.md) et du [canevas CPU](audit-cpu-suivi-2026-10-22.md). Dépôt exclusif coc-cible, sans push, déploiement, changement d’offre, serveur relancé, métrique Plus ou écriture de production. Aucun benchmark chronométré refait.

**Décision** : préparer F1 + A1 + évolutions fonctionnelles parallèles, avec **purge globale des caches bruts après chaque mutation**. C2, qui réduit ces purges au seul classeur écrit, reste différé. F1 conserve ses barrières fraîches par onglet source, sans repli périmé ni augmentation de TTL ; le journal indépendant ne rejette pas une lecture fraîche USERS. Cette composition peut coûter plus de lectures que C2 : aucun gain C2 n’est revendiqué pour elle.

| Lot | Statut de décision | Motif |
| --- | --- | --- |
| D1/C1/S1 | Déjà publiés ; conservés | Enrichissement documentaire limité, lectures Sheets dédupliquées et protection après invalidation, VIEWER limité aux blocs attribués. |
| F1 | **Prêt techniquement dans le candidat validé** | Lectures de sécurité réellement fraîches et refus du repli périmé ; indépendant de la réduction C2 moyennant le pont conservateur Sheets ci-dessous. |
| A1 | **Prêt techniquement dans le candidat validé** | Suppression des trois référentiels inutiles de la synthèse Activités, sans nouveau cache d’agrégat. |
| Utilisateurs et évolutions parallèles | Retenus | Interfaces harmonisées, historique minimal non chargé, journaux/idempotence conservés ; neuvième KPI Médailles comprise. |
| C2 | **Différé** | Le classeur Site Web faisant autorité demeure inaccessible ; les synchronisations externes ne sont pas inventoriées. L’existence d’un homonyme accessible ne clôt pas ces incertitudes. |

**Important** : le workspace principal garde C2 et ses tests d’origine. Il n’est pas à publier en bloc pour cette décision. La composition retenue est la copie `.cache/cpu-delivery/candidate`, distincte du snapshot `.cache/cpu-delivery/reference`. Le profil modifie Sheets (purge brute globale conservatrice) et deux fichiers de tests adaptés à cette politique. Le build normal a aussi régénéré `next-env.d.ts` vers ses types de production : cette quatrième différence est identifiée dans le patch de sélection, sans modification manuelle de configuration. Aucun test n’est sauté : les attentes de cache correspondent au lot effectivement retenu. Les tests C2 d’origine et le retour C2 sont conservés séparément dans les patches de livraison.

Référence Git principale : `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, branche `design/coc-febaco-visual-20261019`. Snapshot de 741 fichiers existants au début de la préparation ; manifestes et empreintes dans [les preuves](audit-livraison-f1-a1-2026-10-23/). Dernière production connue : e6fa5b2 / `dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx`, alias `database.coc-rdc.net`, vérification précédente du 23 octobre à 09:04 UTC. Pas de nouvelle prétention de vérification de la production durant cette phase.

## Site Web : les deux classeurs réellement utilisés

Le code de la rubrique Sliders lit deux classeurs **métier**, en plus de USERS pour les contrôles d’accès :

| Source | Mapping et usage réel | Écriture par ce parcours |
| --- | --- | --- |
| Contenus Site Web | ID statique de `lib/site-web/config.ts`, confirmé par l’utilisateur ; onglet `SLIDERS_SITE`, dix colonnes décrites par `SLIDER_HEADERS` | Création/PUT écrivent uniquement les lignes du slider dans ce classeur. Confirmation par relecture des lignes sans cache. |
| Référentiel COC | `getReferentialSpreadsheetId()`, onglet `STATUTS_PUBLICATION` | Aucun write du parcours Sliders ; lecture de la liste des statuts pour affichage et validation de l’ID choisi. |
| Drive | Dossier configuré par `GOOGLE_DRIVE_SITE_WEB_SLIDERS_FOLDER_ID` | Création du fichier image, URL enregistrée dans la ligne Site Web ; ce n’est pas un troisième classeur. |

`getSliders` transforme les lignes et trie par ordre ; `getPublicationStatuses` transforme séparément les statuts. La page et `GET /api/site-web/sliders` reconstruisent leurs deux résultats à chaque invocation. Le client résout les libellés depuis les statuts reçus. Aucune copie automatique de lignes entre les deux classeurs, formule, cache de liste enrichie ou agrégat persistant n’a été trouvé dans **ce parcours applicatif**. Les droits restent `AUT-COM` et les contrôles serveur de lecture/écriture sont préservés.

Les deux fichiers nommés « 10_SITE_WEB_CONTENUS » trouvés dans Drive constituent une autre question :

- L’ID dans le code est confirmé par l’utilisateur comme source faisant autorité. Le précédent refus/404 ne prouve ni fichier supprimé ni mauvaise configuration : il peut aussi refléter les accès du compte utilisé. Aucun changement d’ID, de secret ou de partage effectué.
- L’homonyme accessible possède neuf onglets, dont `SLIDERS_SITE`, et aucune formule dans les grilles inspectées. Son ID n’est pas référencé par le code applicatif. Il ne devient pas une source active du seul fait de son titre ; aucune de ses lignes n’a été copiée dans l’autre fichier. Cette observation ne prouve pas les propriétés du fichier faisant autorité.

### Pistes prioritaires pour fermer ce point

1. Faire vérifier par le propriétaire l’existence et l’accès en lecture au **fichier confirmé**, avec l’identité applicative déjà prévue. Ne pas substituer l’homonyme pour contourner le refus ; si un remplacement est réellement souhaité, traiter le mapping et les données comme une décision distincte.
2. Dans ce fichier confirmé, inspecter les formules, les éventuelles sources connectées et le projet Apps Script lié avec ses déclencheurs. L’accès à l’éditeur et aux déclencheurs n’est pas fourni par les lectures de cellules utilisées ici.
3. Identifier les propriétaires des outils externes et leurs flux COC (Make/Zapier, tâches serveur, imports manuels). Documenter sources, destinations, mode direct/copieur/calculé et moment où le résultat devient visible avant toute nouvelle réduction de purge.

## Synchronisations et changements hors application

**Constats du dépôt accessible** : pas de configuration `.github`/`vercel.json`, de `.clasp*`, de source `.gs` ou de `appsscript.json` trouvée dans la composition. Aucun ordonnanceur de synchronisation dans les scripts npm. Les occurrences de `setInterval` des scripts de validation sont des messages de progression, pas une synchronisation métier. Aucun pont de copie entre Site Web et référentiel trouvé dans `app`, `lib`, `scripts` ou la documentation métier/technique consultée.

Les scripts d’administration existent néanmoins : bootstrap/réinitialisation des comptes et journaux, purge des tentatives, migration Compétitions T04, suppression d’onglets inutilisés et restauration de colonne territoriale. Ils modifient directement des sources ou schémas par API dans un processus séparé. T04 touche Compétitions, Équipes et Référentiel après préflight, avec export de sauvegarde et application explicite ; ce n’est pas un flux permanent de copie métier entre classeurs. Aucun de ces scripts n’a été exécuté pendant cette intervention.

**Accès connecté** : une recherche ciblée des fichiers Apps Script accessibles portant COC ne retourne pas de résultat. Elle n’énumère pas tous les scripts liés aux classeurs, leurs déclencheurs, les projets non partagés ou les services externes. L’utilisateur a confirmé le fichier Site Web du code, sans fournir d’inventaire de synchronisations. L’absence de synchronisation dans le dépôt ou dans ce résultat de recherche **n’est pas une preuve d’absence externe**.

| Type de changement | Reconstruction / invalidation | Limite restante |
| --- | --- | --- |
| Write via l’instance applicative courante | Chaque tentative invalide tous les caches bruts locaux, même si la réponse est perdue. Les générations empêchent une ancienne lecture de les repeupler. Les jointures/agrégats sont reconstruits. | Pas de transaction multi-classeurs. Une lecture ordinaire déjà en cours peut répondre avec son snapshot ; elle ne le remet pas en cache. |
| Write direct de lignes par un autre processus/instance | Les jointures se reconstruisent, mais à partir des lignes encore mémorisées localement. | Aucune notification distribuée ; TTL ordinaires inchangés. Sous erreur réseau, leur repli périmé existant peut dépasser le TTL : ce n’est pas une borne absolue de fraîcheur. |
| Formule, calcul ou copie entre classeurs | La purge globale locale conservée évite de garder volontairement une destination connue après un write local, si sa nouvelle valeur est déjà observable à la relecture. | Calcul asynchrone retardé, copies externes et autres instances ne sont pas rendus synchrones par cette purge ; leurs signaux restent inconnus. |
| Compte, session ou droits | F1 contourne le cache et les anciennes promesses, relit la source, refuse les erreurs et les lectures fraîchement invalidées. | Pas d’annulation rétroactive d’une requête autorisée ; pas de transaction de révocation entre plusieurs sources/instances. Aucune réaugmentation de TTL de sécurité. |

La purge globale retenue maintient le périmètre conservateur antérieur ; elle ne constitue pas une solution d’invalidation distribuée ni une garantie sur un synchroniseur inconnu. A1 et F1 ne dépendent pas de l’absence de tels synchroniseurs pour leurs corrections ciblées.

## Composition et séparation reproductibles

`scripts/cpu-audit/prepare-delivery.mjs` copie les sources sans `.env*`, caches, anciens `.next` ou script de polices simulées, applique dans la seule copie le retour C2 gardant F1/S1, puis adapte les attentes de cache de 13 cas de test existants (11 de mutations/fraîcheur et deux dashboard). Aucun contrôle de sécurité retiré. Le workspace conserve la variante C2 pour un examen ultérieur. Une première tentative de préparation a échoué sur les fins de ligne CRLF du patch ; elle est conservée dans `.cache/cpu-delivery-initial-patch-eol`, puis le patch est normalisé en LF sans changer son contenu fonctionnel.

Les dépendances physiques de la validation précédente, arrêtée, sont réutilisées par déplacement dans le candidat, sans nouvelle installation, lien symbolique ou changement de versions. La racine Git locale du candidat borne Turbopack ; aucune opération Git du dépôt principal n’est effectuée. Le runner `validate-delivery.mjs` exclut tout artefact de compilation existant et photographie les entrées de compilation avant le build.

### Fichiers runtime à livrer au-dessus de D1/C1/S1

- F1 : `lib/google/sheets.ts` **du candidat**, `lib/users/google-adapter.ts`, `lib/users/repository.ts`, `lib/users/types.ts`. Le pont conservateur invalide tous les caches bruts après write mais garde les générations fraîches précises, le bypass et l’absence de repli périmé.
- A1 : `lib/activites/data.ts`, `lib/activites/dashboard.ts`.
- Évolution demandée après A1 : `components/dashboard/general-summary-section.tsx`, neuvième KPI Médailles, données déjà chargées, grille 3 × 3 lorsque toutes les sections sont autorisées/disponibles.
- Interfaces Utilisateurs et autres évolutions parallèles : incluses telles que figées dans le manifeste complet, sans réduction au HEAD ancien. Ne pas livrer uniquement les sept fichiers précédents en oubliant les travaux fonctionnels présents.
- Tests/validation : fichiers CPU du candidat, `tests/delivery/conservative-cache.test.mjs`, tests Utilisateurs/autorisations, scripts et preuves de cette phase. Les manifestes et patches identifient les trois différences candidat/workspace ; aucun secret ni classeur à migrer.

Le [manifeste final](audit-livraison-f1-a1-2026-10-23/source-manifest.json) détaille chaque fichier de source proposé et son empreinte, ainsi que les suppressions déjà présentes dans le workspace. Le paquet `selected-source.zip` fige les sources de la copie testée, sans dépendances, secrets, cache, `.next*` ou polices simulées. Ce rapport actualisé et les preuves finales accompagnent le paquet séparément ; la documentation historique copiée avant le build y reste figée. `selection-without-c2.patch` montre les trois adaptations du profil et le type d’entrée Next régénéré ; `reactivate-deferred-c2.patch` réactive seulement les trois fichiers du lot C2 sans revenir au chemin des types de développement. Applications contrôlées sans modification du workspace. La séparation ne doit pas être reproduite par un reset du workspace ou une reprise aveugle du HEAD c1488d3.

## Validation de la composition exacte

`scripts/cpu-audit/validate-delivery.mjs` a terminé sur cette composition à 2026-10-23T10:43:14.790Z :

| Contrôle | Résultat |
| --- | --- |
| Lint global et fichiers de préparation/tests | Réussi, zéro erreur, même avertissement préexistant dans `athlete-sport-history.tsx:27`. |
| CPU / données / sécurité | **53/53**, dont tous les contrôles F1 et trois nouveaux cas conservateurs ; aucune assertion ignorée. |
| Interfaces Utilisateurs / permissions | **3/3** et **23/23**. |
| Synthèse générale | Rendu HTML : neuf KPI, répartition et zéro médaille, masquage sans données Compétitions ; pas de revendication de recette authentifiée en navigateur. |
| Dépendances A1, politique globale identique | Cinq scénarios, réponses égales. GET sans A1 → candidat : froid 5 → 2, chaud 0 → 0, huit appels simultanés froids 5 → 2, après write REF 5 → 2, après write ACTIVITES 5 → 2. Ce sont des compteurs déterministes, pas un benchmark CPU. |
| Build normal | **Réussi en 315 746 ms**, onze véritables fichiers wOF2, `ignoreBuildErrors:false`, sans modification de configuration ni polices simulées. |
| TypeScript explicite | **Réussi en 212 775 ms**. |
| Suite générale | **319/325**, exactement les six noms d’échecs de la référence A1, aucun nouvel écart. |

Les preuves `checks.json`, `fonts.json`, `source-before-build.json` et les journaux sont conservées. Les 348 entrées de compilation sont comparées à leurs empreintes avant/après ; les fichiers applicatifs du workspace restent inchangés. La vérification finale après documentation est dans `final-workspace-check.json` : 738 fichiers existants hors intervention préservés, seuls le script de préparation et les deux documents de suivi existants ont changé dans le workspace. Le paquet source figé comporte 744 fichiers, empreintes intégralement vérifiées après archivage (`package-proof.json`). Le `next-env.d.ts` régénéré pointe vers les deux entrées de types `.next/types`, au lieu des types de développement du workspace ; ce résultat normal de Next est déclaré dans le manifeste et n’est pas une configuration modifiée pour contourner une erreur. La durée du build et la lenteur du poste ne sont pas des mesures de CPU runtime Vercel.

Les nouveaux contrôles couvrent copie inter-classeurs simulée, batch/en-têtes en cours lors d’un write sur un autre classeur et changement externe visible en lecture fraîche mais pas automatiquement dans le cache ordinaire. Les contrôles F1 de révocation/panne et S1 sont conservés. Les compteurs A1 comparent la politique brute conservatrice identique des deux côtés, sans chronométrage : froid, chaud, simultané froid et après writes REF/ACTIVITES. Les anciens timings A1/C2 ne doivent pas être présentés comme les performances de cette nouvelle combinaison.

Référence générale attendue : 319/325 avec les six noms d’échecs déjà reproduits, comparés exactement au rapport A1. Aucun nouvel échec ne sera classé préexistant par son seul nombre. Aucune modification de configuration, contrôle TypeScript ou police pour obtenir un succès.

## Publication future et retour arrière

Pas de publication à cette étape. Une livraison ultérieure doit partir de la composition isolée validée ou appliquer son patch de sélection dans un checkout propre de la composition complète ; jamais pousser le workspace principal contenant C2 par inadvertance. Conserver alors le SHA réel et l’ID du déploiement précédemment servi, vérifier le workflow Git main, publier une fois et confirmer SHA/READY/alias avec heure UTC.

Retour ciblé A1 : `a1-rollback-keep-f1-s1.patch` rétablit ses deux fichiers runtime depuis la référence antérieure A1 et adapte les sept tests dashboard au retour des référentiels complets. Il conserve F1, S1, la purge brute globale et les évolutions Utilisateurs/KPI. Patch appliqué à une copie distincte puis **53/53 tests CPU réussis**, sans ignorer les contrôles de sécurité (`rollback-a1-full-cpu.json`). Le premier essai complet de cette copie avait omis les routes privées Documents : deux erreurs ENOENT, corrigées par copie des routes sources inchangées puis rejeu complet ; preuve défavorable conservée dans `rollback-a1-incomplete-copy.*`. TypeScript et build n’ont pas été réexécutés sur ce retour hypothétique ; ils devront l’être sur le checkout de retour avant publication. Le patch `a1-rollback-runtime-keep-f1-s1.patch` est la vue runtime seule, pas la procédure complète de tests.

Le retour C2 n’est pas nécessaire dans cette livraison puisqu’il n’est pas inclus. Le patch de réactivation C2 est conservé pour une revue future, **pas** pour publication tant que ses dépendances restent incertaines. Ne pas promouvoir une ancienne version e6fa5b2/c1488d3 comme rollback complet si cela retire F1 ou réélargit S1 ; garder la sécurité livrée et corriger vers l’avant si nécessaire.

Recette authentifiée restante : comptes/blocs VIEWER attribués, retirés et datés, refus WRITE, révocations et panne de source, documents privés, commandes Utilisateurs et Sliders. Aucun navigateur/session autorisée disponible dans la dernière observation ; aucun serveur relancé ni compte de test fabriqué. Cette limite doit accompagner la livraison, sans transformer les fixtures en preuve d’un parcours authentifié. Observer après publication sur une fenêtre UTC bornée les erreurs source/refus et métriques accessibles, sans métriques Plus ni promesse CPU Vercel.

L’homonyme accessible n’est cité que comme élément de diagnostic, sans changement du mapping confirmé :

:codex-file-citation{path="https://docs.google.com/spreadsheets/d/1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM/edit" purpose="source"}
