# Activités et Documents — appels Google et CPU, 30 octobre 2026

## Référence et périmètre

Dépôt réel : `C:/Projets/SNDS-RDC/data/multisport/coc-managment`. Aucun autre dépôt examiné. Aucun `AGENTS.md` trouvé dans les ancêtres applicables. README, mappings des classeurs et rapports de performance/sécurité existants consultés, notamment `performance-routes-audit.md`, les audits F1/A1 et Compétitions. Branche locale `design/coc-febaco-visual-20261019`, HEAD `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, avec de nombreux travaux antérieurs non commités. Origine GitHub `Rodanyoca/coc-managment`, push configuré `DISABLED`. Le dernier SHA publié connu de l'intervention précédente est `3c21ca93889eb3d6340cdf65edf0a0d3835076c0` ; il n'a pas été revérifié en ligne pour cet audit.

La référence mesurée est **le workspace sale au début de cette intervention**, pas HEAD ni une copie supposée de la production. Copie isolée de 1 013 fichiers et manifeste SHA-256 dans `.cache/activities-documents-cpu-20261030/reference` et `source-before.json`, sans `.env*`, dépendances, sorties de build ou données métier. Les modifications préexistantes, notamment Compétitions, sont conservées. Aucun quota, offre, paramètre Google ou droit modifié. Aucun push, déploiement, test de charge ou écriture en production.

## Cartographie vérifiée dans le code

| Parcours | Client / serveur | Travail et sources |
| --- | --- | --- |
| Liste Activités, recherche | `app/dashboard/activites/page.tsx`, `activites-client.tsx` | RSC : activités + référentiels ; recherche et tri locaux. `lib/activites/data.ts` lit `ACTIVITES` et les référentiels ; création/modification renvoient la ligne puis rafraîchissent la page. |
| Fiche Activité | `app/dashboard/activites/[id]/page.tsx`, `activite-detail-client.tsx` | Activité, relations `ACTIVITES_ENTITES`, `ACTIVITES_PARTICIPANTS`, références et six groupes d'acteurs en parallèle ; labels, tris et compteurs client. Documents liés seulement après `canAccess(AUT-ADM, READ)`. Les sections sont affichées ensemble, sans onglets. |
| Participants / intervenants | `app/api/activites/[id]/participants/route.ts` | GET sans type : participations de l'activité ; avec type : options d'acteurs à la demande. Écritures : validation activité/type/acteur/relation, unicité, écriture puis `revalidatePath`. Entités : route sœur `entites`, protection de l'organisateur et des relations utilisées. Pas de modèle séparé « intervenant » trouvé dans ce bloc. |
| Liste Documents | `app/dashboard/documents/page.tsx`, `documents-client.tsx`, `/api/documents` | Documents, tailles Drive et références de rattachement ; enrichissement des labels serveur, recherche/pagination/compteurs client. **Les tailles et le total de stockage sont utilisés** : pas de suppression de ces données. |
| Fiche Document | `app/dashboard/documents/[id]/page.tsx`, `document-detail-client.tsx` | Lecture fraîche ciblée du document, taille et références complètes pour labels/formulaire. Métadonnées affichées immédiatement ; PDF désormais demandé sur clic. |
| Aperçu / téléchargement | `app/api/documents/[id]/{preview,download}/route.ts` | `canReadDocuments` frais avant lecture ; document relu avec `bypassCache:true`, puis Drive métadonnées nom/MIME + binaire. Réponse `private, no-store`. Aucun lien public de substitution ni cache du binaire ajouté. |
| Mutations Documents | `lib/documents/data.ts`, routes document et fichier, `document-form.tsx` | Validation, contrôle des références, génération d'ID sur lecture fraîche, upload privé, confirmation Sheets, compensation si échec ; remplacement supprime l'ancien fichier après confirmation. Contrats conservés. |

Classeurs : variables `GOOGLE_SHEETS_ACTIVITES_SPREADSHEET_ID`, `GOOGLE_SHEETS_DOCUMENTS_SPREADSHEET_ID`, référentiel, acteurs et sources de rattachement configurés par leurs modules `config.ts`. Dossier privé Documents via `lib/documents/config.ts`. Aucun identifiant réel, secret ou contenu personnel reproduit ici. Les documents internes ne sont pas les documents publics du CMS Site Web ; aucun consommateur public modifié.

### Caches, fraîcheur et reprises déjà présents

`lib/google/sheets.ts` : cache de lignes et en-têtes, TTL ordinaire par défaut de cinq minutes, partage des lectures en cours, `getSheetsRows` regroupe les plages manquantes et rejoint les lectures déjà engagées ; limite de concurrence six, timeout vingt secondes. Les générations protègent les réponses tardives après mutation. Les lectures de sécurité fraîches ne se rabattent pas sur des droits anciens. L'ancien brouillon C2 d'invalidation n'est ni réintroduit ni modifié.

`lib/google/drive.ts` : cache de taille cinq minutes, clé ID de fichier ; ajouté ici : partage des seules promesses de taille en cours, retrait après succès **et** erreur. Pas de cache négatif, TTL inchangé, pas de droits ni de binaire dans ce mécanisme. Une nouvelle version uploadée reçoit un nouvel ID ; les suppressions et compensations restent existantes.

`lib/google/request.ts` / `lib/http/resilience.ts` : trois tentatives par défaut pour les opérations idempotentes, backoff exponentiel avec jitter, base 250 ms, plafond 2 500 ms, timeout vingt secondes ; une tentative pour les écritures non idempotentes. `lib/api/client.ts` partage les GET en cours, borne les reprises et n'en relance pas les écritures. Aucun nouvel étage de retry ajouté. Le cumul client/serveur lors d'une panne reste un coût possible, non mesuré sur Google.

## Rapport d'écart et lots

| Priorité / statut | Coût confirmé et déclencheur | Correction / limite |
| --- | --- | --- |
| P1 livré, faible risque | Fiche Activité : `getActivity`, `getActivityEntities`, `getParticipants` projetaient toutes les lignes avant recherche/filtrage. | Filtre sur les champs normalisés avant projection ; premier doublon, ordre, filtres facultatifs et formats conservés. Lecture physique complète toujours nécessaire avec les plages Sheets actuelles. |
| P1 livré, faible risque | Relations/participants : lecture d'en-têtes avant lignes, ajoutant une requête froide par table. | Lignes avant contrôle du schéma : les en-têtes de la même lecture sont réutilisés, contrôle non supprimé. |
| P1 livré, faible risque | Référentiels Activités : quatre GET compatibles dans le même classeur. | `getSheetsRows` existant : un batch à froid, partage en cours et cache existants. Une panne partielle fait échouer le chargement complet comme auparavant ; pas de repli agrégé ajouté. |
| P1 livré, faible risque | Liste Activités : rôles et types d'acteurs chargés et sérialisés sans usage par la liste ni son formulaire. | `getActivityReferences({includeRelations:false})` sur la seule page liste. Valeur par défaut complète ; API GET et fiches conservent leur contrat. |
| P1 livré, faible risque | Aperçu/téléchargement : `getDocument` enrichissait la taille avant les deux appels Drive du fichier. | Option interne `includeSize:false` sur ces deux routes uniquement. Taille toujours disponible par défaut pour les autres consommateurs ; lecture documentaire fraîche et droits inchangés. |
| P1 livré, faible risque | Chaque ouverture de fiche Document montait un iframe et téléchargeait le PDF sans consultation explicite. | Bouton « Ouvrir l’aperçu PDF » ; iframe seulement après clic. Activation liée à l'ID document **et** fichier : changer de fiche ou remplacer le fichier ne réactive pas l'ancien aperçu. Téléchargement direct conservé. |
| P2 livré, faible risque | Création/modification Document : validation appelait les six familles d'objets liés même sans rattachement. | Validation charge seulement la famille déclarée ; contrôles document type / existence identiques. `getDocumentReferences()` sans option reste complet. |
| P2 livré, faible risque | Plusieurs tailles identiques demandées simultanément ne partageaient pas leur appel avant remplissage du cache. | Promesses en cours indexées par ID, nettoyées en `finally`, erreurs réessayables lors d'une demande ultérieure. |

### Coûts conservés / incertitudes

- Les six collections d'acteurs de la fiche Activité servent aux labels existants. Leur réduction demande une stratégie explicite pour les types anciens et collisions d'identifiants ; pas de changement silencieux dans ce lot.
- Les références Documents complètes servent à la fois aux labels et aux formulaires. Les différer impose un endpoint et une gestion d'erreur/concurrence supplémentaires. Ce lot réduit la validation des mutations, sans refonte de ces interfaces.
- Les tailles de la liste et des documents associés sont affichées : des appels Drive par ID distinct restent nécessaires à froid. Les retirer changerait l'interface ; aucune affirmation d'appels inutiles pour ces colonnes.
- Les recherches répétées de labels dans les tableaux, les grands props RSC et certains `router.refresh()` après mutation restent des pistes. Aucun découpage d'invalidation supposé équivalent n'est appliqué.
- L'API Sheets retourne encore toutes les lignes de la plage. Le gain de projection CPU n'est pas une réduction des lignes lues chez Google.
- L'aperçu utilise toujours deux appels Drive (métadonnées + média) après clic. Pas de type/nom inventé pour supprimer un contrôle utile. Les mises à jour documentaires conservent leur réponse complète, taille comprise.
- Aucune métrique de production Vercel ou Google collectée ; aucune attribution du CPU global à ces blocs, aucune extrapolation d'un gain Vercel. Les métriques payantes précédemment bloquées n'ont pas été sollicitées.

## Preuves et validation

Les résultats finaux, mesures et limites sont consignés dans le dossier de preuves frère `audit-cpu-activites-documents-2026-10-30/` et dans l'addendum ci-dessous. Les tests exécutent les vrais modules avec des frontières Google explicitement simulées et fermées au réseau ; ils ne sont pas des essais sur des classeurs réels. Les volumes et octets sont synthétiques.

Scripts reproductibles :

```text
node --experimental-vm-modules scripts/cpu-audit/activities-documents-benchmark.mjs
node --experimental-vm-modules --test tests/cpu/*.test.mjs
node --test --test-concurrency=1 tests/unit/*.test.ts tests/integration/*.test.ts
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/eslint/bin/eslint.js app components lib proxy.ts --no-cache
npm run build
```

Le benchmark requiert la copie figée indiquée plus haut. Échauffement de cinq appels, quinze mesures alternant l'ordre avant/après ; CPU processus (`process.cpuUsage`) séparé du temps écoulé. Les scénarios courts sont mesurés par lots pour réduire la quantification de l'horloge CPU Windows. Les compteurs Google sont ceux des adaptateurs simulés : pas des traces réseau de production.

Le build normal est exécuté dans une copie isolée avec dépendances physiques, racine Git locale, configuration inchangée, vraies polices et secrets de production retirés. Un premier essai a détecté deux octets non UTF-8 dans le nouveau libellé : corrigés localement après comparaison octet par octet. Ce résultat défavorable est conservé dans les preuves ; aucune option d'ignorance TypeScript ni police simulée utilisée.

### Résultats finaux

Mesures locales sous Windows, Node 24.16 ; quinze échantillons alternés, lots de dix appels pour la fiche et de cent pour les scénarios courts. Le build et le navigateur étaient arrêtés lors des mesures finales. CPU médian et durée médiane par appel, après échauffement ; nombres d'appels Google simulés **à froid**, relevés séparément.

| Scénario synthétique | Appels avant → après | CPU local médian (ms) | Durée médiane (ms) | Octets JSON avant → après |
| --- | --- | ---: | ---: | ---: |
| Fiche : 10 000 activités + 10 000 relations + 10 000 participants, sélection A123 | Sheets 5 → 3, Drive 0 → 0 | 78,10 → 3,10 | 78,808 → 3,727 | 14 597 → 14 597 |
| Références complètes : 30 008 lignes, quatre tables | Sheets 4 → 1, quatre plages conservées | 0,94 → 1,10 | 1,037 → 1,122 | 1 272 512 → 1 272 512 |
| Références de liste : seules entités/types utiles | Sheets 4 → 1, plages 4 → 2 | 0,94 → 0,31 | 0,985 → 0,299 | 1 272 512 → 566 954 |
| Résolution documentaire pour route binaire, 200 documents | Sheets frais 1 → 1, taille Drive 1 → 0 | 0,00 → 0,15 | 0,082 → 0,081 | 314 → 310 |
| Création sans lien, adaptateurs de références simulés | Lectures Sheets directes 3 → 2, chargeurs de familles 5 → 0 | 1,10 → 1,10 | 1,133 → 1,082 | 206 → 206 |

La fiche scanne toujours 30 000 lignes brutes, mais les projections passent de **30 000 à 101** (une activité, cinquante relations, cinquante participants), à résultat strictement identique. Les lignes des références de liste passent de 30 008 à 10 008. Le test compare l'égalité des options entités/types, tandis que les deux collections inutilisées sont désormais vides. Les autres consommateurs conservent les quatre collections.

Les octets ci-dessus concernent les retours JSON des fonctions mesurées, sans compression ni enveloppe RSC ; ce ne sont pas des tailles HTTP complètes. Le lookup binaire n'inclut pas le binaire : il supprime seulement la propriété de taille enrichie inutilisée par la route (champ conservé vide). La création est entièrement simulée, y compris sa confirmation ; le benchmark ne contacte pas Google et ne mesure pas les lectures internes des cinq chargeurs simulés. Les compteurs froids ne sont pas mélangés avec les temps de transformations à chaud.

Résultats défavorables : le batch complet réduit les appels mais augmente légèrement CPU/durée locaux ; la validation sans lien ne montre aucun gain CPU dans cette série. Le CPU des très courts lookups reste proche de la résolution de l'horloge Windows. Aucun pourcentage de gain CPU n'est annoncé pour ces cas. Les valeurs détaillées et tous les échantillons sont dans [benchmark.json](audit-cpu-activites-documents-2026-10-30/benchmark.json).

- Tests généraux : **319/328 avant et après**, mêmes neuf échecs, sans adaptation destinée à les masquer. Noms et comparaison dans [comparison.json](audit-cpu-activites-documents-2026-10-30/comparison.json).
- Tests CPU : **58/58 avant, 67/67 après**. Ajouts : filtres/ordre/normalisation, vide/inconnu, schéma incomplet, panne source, batch concurrent, absence de tailles dans les routes binaires, lien valide/inconnu et confirmation de création, relecture après mutation confirmée, taille Drive partagée puis reprise après erreur. Les tests des deux routes privées conservent refus, droit expiré/futur/inactif, panne de sécurité, absence de fichier et panne Drive ; ils transmettent désormais l'option réelle de lookup.
- TypeScript : `--noEmit --incremental false`, succès. Lint complet : zéro erreur, un avertissement préexistant `react-hooks/set-state-in-effect` dans `athlete-sport-history.tsx:27`.
- Build normal final : **succès, 187 800 ms**, onze vraies polices WOFF2 ; empreintes sources identiques avant/après build et identiques aux fichiers applicatifs finaux du workspace. [build.json](audit-cpu-activites-documents-2026-10-30/build.json).
- Navigateur Chromium local : **1440×1000 et 390×844**, vrais composants Documents et CSS, documents synthétiques, toutes les API interceptées. Zéro appel API initial, un `/preview` par activation, retrait de l'iframe au changement de fiche, nouveau PDF uniquement sur nouveau clic, lien téléchargement conservé, formulaire accessible, aucun débordement horizontal ni erreur JavaScript. [browser.json](audit-cpu-activites-documents-2026-10-30/browser.json). Ce test vérifie le déclenchement et l'interface, pas la fidélité d'un véritable PDF ni une session Google/production. Les captures restent dans `.cache/activities-documents-cpu-20261030/preview-{desktop,mobile}.png`.
- Checklist React du skill `vercel:react-best-practices` appliquée : absence de chargement binaire au rendu, état d'activation lié à l'identité du document et du fichier, bouton sémantique, titre iframe, conservation des contrôles d'écriture, pas d'effet/retry ajouté.
- Empreintes des 1 013 fichiers de référence vérifiées : uniquement les fichiers annoncés du lot ont changé, **aucun fichier Compétitions**. [preservation.json](audit-cpu-activites-documents-2026-10-30/preservation.json). Patch inverse contrôlé avec `git apply --reverse --check`, sans l'appliquer.

### Fichiers de ce lot

Application : `lib/activites/data.ts`, `lib/documents/data.ts`, `lib/google/drive.ts`, `app/dashboard/activites/page.tsx`, `app/dashboard/documents/[id]/document-detail-client.tsx`, `app/api/documents/[id]/preview/route.ts`, `app/api/documents/[id]/download/route.ts`.

Validation : `scripts/cpu-audit/activities-documents-fixture.mjs`, `activities-documents-benchmark.mjs`, adaptations limitées de `fixtures.mjs` et `module-harness.mjs` ; `tests/cpu/activities-documents.test.mjs`, `document-drive-size.test.mjs`, adaptation de `private-documents.test.mjs`. Documentation : ce rapport, ses preuves et lien dans `performance-routes-audit.md`. Les preuves locales ignorées par Git restent dans `.cache/activities-documents-cpu-20261030/`.

## Vérification après une publication autorisée et retour arrière

1. Vérifier listes Activités/Documents, recherche, filtres, fiches connues/inconnues, absence de résultat et labels ; contrôler les compteurs et tailles.
2. Dans le navigateur, compter les requêtes : pas de `/preview` avant clic, un iframe après activation ; vérifier mobile, téléchargement et changement rapide de fiche/fichier. Vérifier les traces Google séparément à froid et à chaud, sans vider globalement les caches de production.
3. Avec comptes de test déjà existants et sans écriture métier : refus d'un compte sans AUT-ADM, VIEWER en lecture seulement, droits révoqués et panne de la source de sécurité. Aucune donnée documentaire ne doit être renvoyée sur refus.
4. Contrôler les prochaines mutations métier légitimes : confirmation affichée, cohérence de la fiche, documents associés, aperçu de la nouvelle version ; aucune mutation de test en production.
5. Comparer les métriques de la même population de requêtes avant/après sur une fenêtre comparable ; séparer CPU actif, attente réseau et volume. Aucun bénéfice Vercel n'est établi par cet audit local.

Retour arrière ciblé : utiliser uniquement le patch incrémental de ce lot fourni dans les preuves, après `git apply --reverse --check`, puis revue des conflits éventuels avec les travaux ultérieurs. Ne pas restaurer depuis HEAD, ne pas inclure les anciens changements Compétitions, ne pas toucher C2, aux droits ou aux quotas. Repasser les validations et publier seulement sur instruction explicite. Aucun commit ni publication réalisés ici.
