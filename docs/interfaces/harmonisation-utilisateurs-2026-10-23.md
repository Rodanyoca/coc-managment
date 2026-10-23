# Harmonisation des comptes utilisateurs — 23 octobre 2026

## Périmètre et références

Intervention exclusive dans `coc-cible`, sans push, déploiement, mutation de classeurs ou changement de politique. Il s'agit des comptes utilisateurs, distincts des acteurs sportifs. Le workspace original reste sur `c1488d3` avec les modifications parallèles déjà présentes ; la dernière publication documentée est `e6fa5b2`. Les fichiers liste/fiche avant intervention étaient inchangés depuis `c1488d3`. Leur reconstruction pour les captures « avant » ne vaut pas une session de production.

Références : `CONTEXT.md`, contexte projet, LOT 2 utilisateurs/autorisations, règles listes/détails et rapport d'harmonisation FEBACO du 19 octobre conservé **dans COC**. Aucun autre dépôt consulté. Réutilisation des `Header`, `Table`, `Card`, `DetailCard`, `Badge`, `Button`, `Select`, `Checkbox`, `Sheet`, `Dialog`, `Tooltip` et `Skeleton` existants ; police Geist et thème inchangés. Revue React : hooks stables, filtrage local mémorisé, aucun effet/chargement client supplémentaire, mises à jour fonctionnelles des états, labels et focus des composants communs. La documentation du Next 16.3.4 installé confirme `loading.tsx` et le callback `retry` de `error.tsx`.

## Écarts et corrections

| Élément | Avant | Après |
| --- | --- | --- |
| Titre/police | Titre autonome correct mais pas de bandeau partagé | Même Geist ; `Header` commun, titre 20 px/700, sous-titre atténué, accent or et espacements communs |
| Liste | Table HTML brute, type/statut textuels, booléen super-admin séparé ; pas de colonne actions | Table système à cinq colonnes nom/e-mail/profil/statut/actions ; badges, action œil avec infobulle/libellé accessible, alignement à droite et lignes conformes au système |
| Recherche/filtres | Recherche locale, selects natifs, case super-admin | Tous conservés localement ; composants `Select`/`Checkbox`, libellés lisibles et nombre de résultats. Aucune pagination n'existait, aucune pagination serveur ajoutée |
| Fiche | Formulaire ouvert en permanence et boutons de sécurité juxtaposés | Identité/profil/statut, grille d'informations et carte des blocs ; édition dans un volet, commandes par icônes avec confirmations conservées |
| Dates/blocs | Identifiants bruts et dates ISO en ligne | Libellés Administration/Gestion sportive/Communication ; dates françaises à Kinshasa ; état Active/À venir/Expirée/Retirée, sans supprimer les anciennes attributions |
| États | Pas de vide explicite ni chargement/erreur propre au module | Vides distincts source/filtres, skeletons liste/fiche, erreur récupérable et retour d'erreur de commande visible dans le volet |
| Mobile | Contrôles et listes peu structurés | Filtres/formulaires empilés ; cartes à largeur disponible, tables à défilement interne, aucun débordement de page sur les captures 390 px |

Les informations de liste utilisent uniquement les six propriétés déjà fournies par la page (identifiant interne pour les liens, nom, e-mail, profil, statut et indicateur super-admin). Aucun appel serveur par colonne. Création/dernière connexion de la fiche proviennent de la ligne utilisateur déjà lue. Aucun identifiant technique, version de session ou empreinte d'accès n'est affiché. L'accès temporaire reste uniquement la réponse d'une commande autorisée, dans le dialogue d'affichage unique ; sa fermeture retire le secret du DOM, sans stockage local.

## Chargement supprimé

- Page `[id]/page.tsx` : suppression de `repository.getAuditLog()`, du `Promise.all` associé et du filtre `idObjet/idUser` suivi de `slice(-30)` ; retrait de la prop `audit` et de la version de session inutilisée.
- Client détail : suppression du type `AuditLogEntry`, de la prop et du rendu de « Historique minimal ». Aucun état, effet ou requête de remplacement.
- GET `api/users/[id]` : suppression de la même lecture, du filtre/`slice(-50)` et de la propriété JSON `audit`. Aucun consommateur de cette propriété trouvé dans le dépôt ; les éventuels clients externes ne sont pas inspectés.

Les deux chargements ne demandent plus que l'utilisateur et ses autorisations. Le mapping/validation de toutes les entrées du journal pour cette consultation disparaît ; le nombre de requêtes Google réellement évitées dépend des caches et n'est pas mesuré. Aucun gain CPU Vercel annoncé.

**Conservés** : repository `getAuditLog`, parsing du journal, `appendAuditLog`, confirmation d'écriture et recherche de `requestId` dans `appendIdempotent`/`alreadyProcessed`, historiques des attributions et de sécurité, contrôles anti-abus. Aucun helper partagé ni aucune route de mutation supprimé. Aucune ligne de classeur effacée.

## Actions et sécurité

Le module reste réservé au super-administrateur par `routePolicy` et le proxy ; les handlers conservent leurs vérifications de session super-admin. Les six combinaisons méthode/route (modification, reset, révocation, POST/PATCH/DELETE des autorisations) sont exercées en refus avant toute lecture/écriture pour les identités non habilitées. Le proxy S1 refuse aussi un VIEWER portant un marqueur super-admin incohérent. Les actions de cette interface ne dépendent pas d'un bloc sportif ou AUT-ADM : ce sont des commandes d'administration des comptes.

Les commandes conservent méthode, endpoint, `requestId`, validations et confirmations. L'interface interdit les envois simultanés, traite les erreurs réseau/HTTP et les reprises idempotentes sans inventer un résultat local. Les données éditées restent en brouillon jusqu'au succès ; une erreur garde les valeurs saisies. Réinitialisation, révocation et remise d'accès restent des actions explicites, jamais des chargements automatiques. D1/C1/S1, les invalidations globales et la dette de fraîcheur de sécurité ne sont pas modifiés.

## Recette visuelle et interactions

[Résultats Chromium](preuves-utilisateurs-2026-10-23/browser.json) : **16 captures** à 1440×1000 et 390×844, avant/après liste et détail, vide, chargements et erreur ; zéro débordement horizontal des nouvelles vues et zéro exception navigateur dans la passe finale. Police calculée Geist et titres 20 px. Captures inspectées : [liste ordinateur](preuves-utilisateurs-2026-10-23/list-desktop.png), [fiche ordinateur](preuves-utilisateurs-2026-10-23/detail-desktop.png), [fiche mobile](preuves-utilisateurs-2026-10-23/detail-mobile.png).

Scénarios exécutés : recherche, profil, filtre super-admin donnant un résultat vide ; validités des blocs ; édition avec erreur simulée puis succès, valeurs conservées et identité non modifiée prématurément ; ajout/retrait de bloc ; révocation ; réinitialisation et fermeture du secret ; bouton de reprise du composant d'erreur. Six requêtes de commande ont été interceptées, dont l'échec volontaire de modification.

**Limites** : navigateur interactif de l'outil non exposé ; Chromium headless disponible. Prévisualisation locale des vrais composants sur données synthétiques, hors layout d'authentification, sans cookie/session et avec toutes les commandes interceptées. Aucune recette authentifiée ni écriture réelle. Les premiers scripts de contrôle ont été corrigés pour rechercher le titre masqué par la modale dans le DOM et pour conserver l'UTF-8 ; cela ne constitue pas un défaut applicatif. La prévisualisation et son cache de développement ont été retirés de la copie avant le build final ; rien n'est ajouté aux routes de l'application originale.

## Contrôles et fichiers

Tests dédiés : `node --experimental-vm-modules --test tests/users-ui/*.test.mjs` (**3/3**), chargement GET sans journal/empreinte, disparition de l'historique dans le contrat page/client, conservation de l'idempotence et refus des commandes. Résultats définitifs et commandes dans [checks.json](preuves-utilisateurs-2026-10-23/checks.json).

| Contrôle final | Résultat |
| --- | --- |
| Build normal en copie isolée, dépendances physiques, sans `.env` ni polices simulées | Code 0 ; 91 016 ms ; 11 vrais WOFF2, TypeScript non ignoré ; aucune route de prévisualisation |
| TypeScript explicite | Code 0, 21 013 ms |
| Lint module, GET, composant, tests et outils | Code 0, aucune sortie |
| Unité/intégration existantes | 319/325 ; six mêmes échecs comparés automatiquement à la validation publiée antérieure |
| D1/C1 | 19/19 |
| Contrats GET, journal conservé et refus des commandes | 3/3 |
| Autorisations/redirection/matrice S1 | 23/23 |
| Chromium sur fixtures | 16 captures, 6 commandes interceptées, zéro exception finale ; pas une session authentifiée |
| Préservation du workspace | 610 fichiers préexistants identiques, cinq changements intentionnels (quatre sources et LOT 2), aucun écart inattendu ; D1/C1/S1 identiques par empreinte |

Les six échecs conservés concernent `competitions-final-interfaces` (deux), `competitions-t12`, `login-navigation`, `national-team-season` et `performance-paths`. Ils restent exposés, pas désactivés. [Preuve de préservation et empreintes des huit fichiers compilés](preuves-utilisateurs-2026-10-23/preservation.json). La compilation a généré ses références de types de production dans la copie ; le `next-env.d.ts` original n'a pas été modifié. Aucun commit, push ou déploiement dans cette intervention.

Les journaux lisibles ont seulement leurs fins de ligne/espaces finaux normalisés ; les octets d'origine des journaux concernés sont préservés dans les `.log.gz`, avec leurs empreintes dans `raw-logs.json`. Aucun résultat défavorable retiré. Le lint des outils a également été rejoué après l'ajout des scripts de préparation/préservation (`tooling-checks.json`).

Reproduction locale, depuis COC : préparer la copie via `node scripts/users-ui/prepare-validation.mjs`, puis, pour les contrôles hors navigateur, `node scripts/users-ui/validate.mjs`. Pour la recette synthétique : `prepare-preview.mjs`, `run-preview.mjs` (serveur local 3147), puis `verify-browser.mjs` dans le même dossier d'outils ; arrêter le serveur de test avant `validate.mjs`, qui retire la route et le cache de prévisualisation de la seule copie isolée. Ne pas utiliser ces fixtures pour une recette de droits de production.

Fichiers applicatifs : `users-client.tsx`, `[id]/page.tsx`, `[id]/user-detail-client.tsx`, les deux `loading.tsx`, `error.tsx`, `components/dashboard/user-account-ui.tsx` et le GET de `app/api/users/[id]/route.ts`. Les autres handlers et bibliothèques de données ne sont pas modifiés. Tests dans `tests/users-ui`, outils locaux dans `scripts/users-ui` et preuves dans ce dossier. Les modifications fonctionnelles parallèles sont contrôlées par empreinte avant/après.
