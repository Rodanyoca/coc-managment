# Compétitions — audit CPU et livraison locale du 30 octobre 2026

> Ce rapport décrit la validation locale antérieure à la demande de push. La composition Git préparée ensuite est décrite dans [la note de livraison](publication-cpu-competitions-2026-10-30.md).

## Référence et portée des preuves

Périmètre exclusif : `data/multisport/coc-managment`. Chemin résolu : `C:\Projets\SNDS-RDC\data\multisport\coc-managment`. Aucun AGENTS.md applicable trouvé dans ce checkout et ses parents vérifiés. README, CONTEXT, ADR 0003, audits CPU/écarts/sources/clôture, publications F1/A1 et rapports Compétitions consultés. Aucun autre dépôt inspecté ou modifié.

HEAD initial : `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, branche `design/coc-febaco-visual-20261019`, commit du 20 octobre. Le workspace comporte des travaux parallèles non committés, notamment l'harmonisation des acteurs, les contenus, les saisons et C2 ; il n'est pas assimilé à la production. Le dernier push confirmé dans la session précédente est `e6dbe7109fba06ab48b4a4131bc809cabcf1a1d2` sur main, pas une preuve READY. Inspection Vercel de `database.coc-rdc.net` : connecteur refusé 403 ; repli CLI interrompu par son délai de worker. SHA réellement servi **non confirmé** dans cette intervention. Aucune requête métrique payante, modification d'offre ou tentative de contourner l'accès.

Référence expérimentale : snapshot du workspace **avant** ces corrections, pas HEAD ancien, dans `.cache/competitions-cpu-20261030/reference`. 977 fichiers figés, sans `.env*`, dépendances ou build ; empreintes et état Git dans le dossier de preuves. Les benchmarks n'utilisent aucune donnée personnelle, identité Google, session authentifiée de production ou requête distante. Les identités des fixtures sont entièrement générées.

## Corrections antérieures à préserver

- D1 : enrichissement Drive limité aux documents sélectionnés, cache de tailles.
- C1 : lectures Sheets mutualisées, batch partiel et générations contre le repeuplement périmé.
- S1 : VIEWER limité aux attributions explicites, jamais autorisé en écriture.
- F1 : sécurité relue fraîche, sans repli périmé ; cohérence lignes/en-têtes utilisateurs.
- A1 : agrégats Activités reconstruits, suppression d'un cache intermédiaire.
- C2 : brouillon local d'invalidation plus fine, **différé pour la livraison** dans les rapports récents. Ne pas reprendre un ancien patch ni pousser ce workspace en bloc. Le profil publié documenté conserve les purges globales.

Cette intervention ne change ni `lib/google/*`, ni `lib/auth*`, ni les contrôles du proxy, ni l'audit, ni les endpoints de mutation. Elle n'ajoute **aucun cache** : tous les nouveaux index vivent pendant un appel, sans partage entre utilisateurs. Les flags `bypassCache` et les contrôles d'en-têtes existants restent identiques.

## Cartographie réelle des parcours

Une ligne COMPETITIONS est une édition concrète ; pas de table d'éditions récurrentes. Les programmes portent les épreuves et contextes multisports. Une campagne s'engage dans un programme ; sélection, participation effective et résultat restent distincts.

| Parcours / déclencheur | Client et serveur | Sources, transformations et sérialisation |
| --- | --- | --- |
| Liste / création | `app/dashboard/competitions/page.tsx` → `CompetitionsClient`. Contrôle d'écriture AUT-SPT pour les actions, contrôle de lecture par le proxy. | COMPETITIONS normalisées, options type/niveau/statut. Liens d'engagements, campagnes, participations et staff pour les comptes de délégation. Retour des compétitions et options consommées ; aucun Drive. |
| Recherche, statut, période, pagination de liste | États locaux et `useMemo` de `competitions-client.tsx`. | Filtrage et pagination des données déjà chargées ; pas de requête Google par frappe ou page. Aucun nouveau mécanisme introduit. |
| Ouverture de fiche | `[id]/page.tsx` relit compétition/programmes/participations/résultats avec les flags frais déjà présents ; chargements parallèles via `Promise.allSettled`. | Référentiels complets, programmes, engagements, campagnes, équipes, sélections/acteurs, résultats historiques, unités/membres, médailles. Contrôle AUT-ADM supplémentaire avant documents rattachés et tailles Drive. Qualité et compteurs calculés, gros ensemble de props sérialisé même si l'onglet Général est visible. |
| Programmes | `CompetitionPrograms`, formulaire et Gantt ; API `[id]/programmes`. | Épreuves, catégories, sexes, dates. Recherche de libellés et présentation calendrier côté client. Mutations contextuelles, ligne renvoyée et invalidations existantes. |
| Équipes / unités | `CampaignEngagements`, `ParticipatingUnits` ; API engagements/équipes-nationales et GET/POST/PUT `[id]/unites`. | ENGAGEMENTS_CAMPAGNES_PROGRAMMES, programmes, campagnes, équipes ; batch de cinq feuilles pour unités, membres et participants, puis libellés de sélections. Les membres étaient filtrés à nouveau pour chaque unité. |
| Participants / intervenants COC | `CompetitionParticipants` et `AthleteParticipations` ; API `[id]/participants`. | Jointures engagements, campagnes, équipes, sports, affectations/rôles ; lecture des six catégories d'acteurs. Le formulaire d'intervenant demande les options au choix du type. Il n'existe pas d'onglet indépendant « intervenants ». |
| Résultats / historique | `CompetitionResults`, API `[id]/resultats`. | RESULTATS versionnés, rattachement engagement/programme/unité, normalisation, tri conservé. Les versions sont déjà dans les props ; le bouton Historique ne déclenche pas d'API. Aucun moteur de classement ajouté. |
| Distinctions / médailles | `CompetitionMedals`, API `[id]/medailles`. | MEDAILLES filtrées par résultats logiques, unités, programmes et épreuves ; DISTINCTIONS_SPORTIVES restreint aux distinctions reconnues par le code. Pas de nouveau modèle de récompenses. |

### Onglets, effets et requêtes

Radix ne monte initialement que Général : les effets clients des autres onglets ne font donc pas de GET unités à l'ouverture. Cela **n'empêche pas** les chargements serveur anticipés décrits ci-dessus. Résultats et Médailles appellent tous deux `loadCompetitionUnits` ; le helper existant mutualise la promesse par ID. ParticipatingUnits l'utilise aussi ; après mutation il demande un rafraîchissement explicite. Les callbacks de mutation remplacent/ajoutent les lignes locales ; pas de rafraîchissement global ajouté. Le bouton Réessayer d'une section recharge encore toute la fiche par `router.refresh()`.

Les handlers GET et `runSportMutation` gardent leurs politiques existantes. Le GET unités distingue 401, 403 et 503 avant lecture métier. Les refus VIEWER, les dates d'autorisation et la fraîcheur de sécurité n'ont pas été déplacés derrière un cache.

## Écarts, classement et décisions

| Coût confirmé / emplacement | Population et travail évitable | Bénéfice étayé / risque / décision |
| --- | --- | --- |
| `data.ts:getCompetition` appelle la liste puis `find` | Toutes les éditions sont normalisées pour une fiche. | Risque faible : conserver validation, normalisation de l'ID, premier doublon et flag frais ; **lot CP1 livré localement**. |
| `getCompetitionPrograms` et `getCampaignEngagements` filtrent après projection | Tous les programmes et tous les engagements sont transformés, puis éliminés. | Filtrer sur les mêmes valeurs nettoyées avant projection ; préserver l'ordre, les jointures et leurs règles de doublons. **CP1 livré**. Pas de réduction des plages Sheets prétendue. |
| `getCompetitionResults` enrichit avant filtrage | Toutes les lignes RESULTATS, même étrangères ou historiques exclues. | Projeter uniquement les lignes admises, avec exactement le même tri et les mêmes libellés/fallbacks. **CP1 livré**. |
| `getParticipatingUnits` refiltre MEMBRES pour chaque unité | U unités × M membres, même pour une fiche. | Index local en un passage, ordre et doublons conservés. **CP2 livré**. Risque faible, mémoire proportionnelle aux membres du périmètre. |
| `delegation-counts.ts` reparcourt participants/staff par compétition | C × (liens + participants + staff). | Index relationnel et unions par édition, y compris campagnes partagées et identités doublonnées. **CP2 livré** ; coût mémoire supérieur possible pour de très petits jeux. |
| La liste appelle `getCompetitionReferences` complet | Épreuves, sexes, sports, disciplines, catégories, fédérations et équipes chargés mais jetés par la page. | `getCompetitionFormReferences` ne lit que types/niveaux/statuts. **CP3 livré**. Panne d'une source non consommée ne doit plus bloquer la liste ; les erreurs des trois sources consommées restent propagées. Mutations et fiche gardent leurs référentiels complets. |
| `getCompetitionParticipants` et fiche relancent plusieurs graphes | Engagements frais répétés, six catégories d'acteurs, référentiels et sélections globales. | P1 restant : partage **par chargement** avec erreurs/fraîcheur explicites, ou projections plus ciblées. Pas de cache de sécurité ajouté pour masquer le coût. |
| Résultats, options, sélections et médailles expédiés avant consultation | Props complètes même en Général. | P1 restant : chargement différé nécessitant de préserver qualité globale, compteurs, isolation des pannes, modifications et réponses tardives. Pas de nouvelle requête paresseuse introduite dans ce lot. |
| Documents chargés alors qu'aucun panneau ne les affiche | Le client ne consomme pas les props documentaires. | P1 restant : leurs **erreurs sont utilisées par le résumé qualité**. Retirer ce chargement sans décision fonctionnelle changerait le comportement ; conservé. |
| Promesses unités résolues conservées sans TTL / identité | `client-units.ts`, clé ID uniquement. État client persistant, pas simplement requêtes en vol. | P1 de cohérence restant : invalidations et cycle de session à définir avant refonte. Ce lot ne l'élargit pas. Les appels d'options d'intervenants possèdent aussi un risque préexistant de réponse tardive lors de changements rapides ; non aggravé. |
| Invalidation brute et dépendances externes | Profil C2 local différent du profil de livraison conservateur, caches par processus. | P2 séparé : inventaire formules/synchronisations et coordination multi-instance. Aucune réactivation C2. |

Les recherches répétées `.find` dans les tableaux clients et les jointures des médailles restent des pistes secondaires. Leur présence ne prouve ni une contribution dominante à la CPU globale, ni la nécessité de nouveaux index globaux.

## Mesures reproductibles

Commande depuis le dépôt :

```powershell
node --experimental-vm-modules scripts/cpu-audit/competitions-benchmark.mjs .cache/competitions-cpu-20261030/reference .cache/competitions-cpu-20261030/benchmark.json
```

Deux tailles de jeu (4 et 80 éditions), mêmes données et même processus Node 24.16.0, modules source réels exécutés par le harnais VM existant. Frontières Google et services externes remplacées explicitement ; aucun réseau. Trois échauffements de chaque variante ; dix paires alternées AB/BA ; chaque échantillon regroupe 128 appels. Génération et compilation des VM hors chronométrage. `process.cpuUsage` mesure séparément CPU utilisateur+système ; `performance.now` donne le temps écoulé. Sérialisation JSON mesurée en octets **hors** chronométrage. Les sondes de projection sont dans un passage distinct, pas dans les passages chronométrés.

Le poste n'est pas une machine dédiée. Les tests ciblés ont pu partager le poste ; aucun autre processus utilisateur arrêté. Le benchmark précède les builds. Une première série à un appel par échantillon est conservée, mais sa CPU était souvent sous la granularité Windows : elle n'est pas utilisée pour annoncer un gain CPU.

### Jeu de 80 éditions — médianes par appel

| Parcours | CPU locale avant → après (ms) | Temps écoulé avant → après (ms) | Travail confirmé avant → après |
| --- | ---: | ---: | --- |
| Fiche | 0,250 → sous résolution | 0,290 → 0,006 | 80 → 1 compétition projetée |
| Programmes d'une fiche | 0,734 → 0,125 | 0,787 → 0,106 | 400 → 5 programmes projetés |
| Engagements d'une fiche | 2,438 → 1,102 | 2,417 → 1,131 | 800 → 10 engagements projetés |
| Résultats courants | 20,758 → 2,320 | 21,346 → 2,384 | 4 000 → 30 résultats projetés |
| Unités d'une fiche | 6,586 → 2,930 | 6,582 → 3,084 | 512 000 → 12 800 comparaisons unité–membre |
| Options consommées par la liste | sous résolution → sous résolution | 0,033 → 0,004 | 9 → 3 lectures logiques observées aux frontières simulées |
| Délégations de la liste | 15,742 → 2,805 | 15,940 → 2,910 | Participants et staff parcourus une fois plutôt que pour chaque édition |

Les zéros CPU bruts du JSON signifient « non résolu par ce compteur », pas une exécution gratuite. Ni les durées réseau ni les coûts réels Google ne sont simulés comme de la CPU. Les résultats sur le petit jeu et toutes les valeurs brutes, y compris défavorables, restent dans `benchmark.json`.

Sur quatre éditions, les délégations sont presque neutres : 0,121 → 0,120 ms écoulées et 0,125 → 0,125 ms CPU par appel. Aucune amélioration CPU n'est démontrée sur ce petit cas. La variante de la suite générale dure 19,155 s contre 13,200 s pour la référence ; ces passages ne sont pas un benchmark isolé de la suite et n'établissent pas une causalité applicative. Ils sont conservés, pas remplacés par les passages favorables.

| Service synthétique, jeu de 80 | Lignes logiques lues avant → après | Lignes retournées avant = après | Octets JSON avant = après |
| --- | ---: | ---: | ---: |
| Fiche | 80 → 80 | 1 | 320 |
| Programmes | 400 → 400 | 5 | 966 |
| Engagements | 1 360 → 1 360 | 10 | 3 011 |
| Résultats courants | 5 360 → 5 360 | 30 | 17 701 |
| Unités | 25 200 → 25 200 | 40 | 14 241 |
| Options effectivement consommées | 563 → 3 | même objet de trois collections | 177 |

Ces tailles sont celles des retours de services synthétiques, pas des réponses RSC réelles ni des octets transférés depuis Google. Les en-têtes et sous-services simulés ne sont pas inclus dans ces nombres de lignes. Le calcul des délégations renvoie le même objet de 80 compteurs, 1 121 octets.

Les lectures logiques n'équivalent pas aux requêtes HTTP Google : par exemple les cinq feuilles d'unités passent par **un batch**, et les en-têtes peuvent être cachés. Les mocks des services équipes/fédérations coupent certains sous-appels ; 9 → 3 n'est donc pas un inventaire exhaustif des requêtes réelles. Les autres parcours gardent leurs sources et plages complètes : économies de transformation, pas projection distante Sheets. Les tailles retournées et octets sont consignés pour chaque échantillon ; les sorties comparables sont identiques, sans réduction artificielle de colonnes métier. Pas de nouveau DTO de liste.

**Aucun gain Vercel établi.** On ne sait pas quelle part de la CPU globale provient de ce bloc ni comment le froid, la concurrence, les sources et le trafic réels pondèrent ces parcours.

## Validation et résultats défavorables

- 81 comparaisons différentielles de services sur données normales, vides, incomplètes, identifiants nettoyés, inconnus et orphelins ; 100 jeux déterministes de délégations. Validation sur la même référence, sorties JSON et ordres inchangés.
- Sept nouveaux tests exécutent les vrais services et la route unités : réduction des projections, en-têtes manquants, source en panne, composition et ordre, doublons, libellés indisponibles, hors périmètre, droits absent/non attribué/expiré/source indisponible/VIEWER autorisé, mises à jour compétition/programme et relecture fraîche. Écritures uniquement dans les mocks en mémoire.
- Suite CPU complète : **57/57**. Suite unité/intégration : **316/325 avant et après**, mêmes neuf noms d'échec, conservés dans `suite-comparison.json`. Aucun test ignoré ou retiré.
- TypeScript : `tsc --noEmit --incremental false`, réussi. Lint global sans cache : zéro erreur, un avertissement préexistant `react-hooks/set-state-in-effect` dans `athlete-sport-history.tsx:27`, hors périmètre.
- Premier navigateur : onglets de fiche parcourus, puis délai de navigation vers la liste dépassé pendant la compilation concurrente. Premier build interrompu après avertissement de racine trop large. Aucun diagnostic d'erreur applicative déduit ; journaux conservés.
- Deux essais supplémentaires du harnais ont saisi/cliqué avant la fin d'hydratation de la liste ; une interaction Radix avec attente et reprise bornée a été ajoutée au seul script de vérification. Aucun changement de composant pour faire passer ce contrôle.
- Navigateur final et build normal : voir l'addendum de clôture et les preuves finales. Aucun build avec polices simulées, aucun contrôle TypeScript désactivé n'est accepté comme build normal.

Les neuf échecs de référence concernent : deux contrôles d'interfaces Compétitions, T12 mutation, tableau Fédérations, connexion, ancien contrat de cache Sheets, saison d'équipe nationale, gris des chargements et anciennes entrées Site Web. Le constat de six échecs dans les rapports plus anciens ne décrit plus ce workspace. Ils ne sont pas corrigés dans ce lot CPU.

## Livraison, vérification après publication et retour ciblé

Livraison **locale uniquement** : `lib/competitions/data.ts`, `lib/competitions/delegation-counts.ts`, `app/dashboard/competitions/page.tsx`, deux scripts synthétiques et `tests/cpu/competitions.test.mjs`, avec documentation et preuves. Ne pas livrer les `.cache`, `.next`, `.env*` ou le brouillon C2 par inadvertance. Les validations sont faites sur une copie isolée sans secrets et dépendances physiques locales ; la racine Git jetable sert uniquement à borner la compilation, sans commit.

Avant une publication autorisée : repartir du vrai main, appliquer seulement ces deltas aux fichiers correspondants, vérifier les travaux intervenus et revalider la composition. Conserver le SHA précédent et l'état de déploiement. Après publication : confirmer SHA/READY/alias ; avec sessions autorisées vérifier liste/recherche, fiche multisport, programmes, participants COC et athlètes, unités, historique, médailles et refus d'écriture VIEWER. Toute écriture de recette appartient à un environnement séparé. Observer une fenêtre comparable via les métriques standards accessibles, sans offre payante ; distinguer invocations, durée HTTP, CPU actif et appels Google.

Retour ciblé : rétablir uniquement les trois fichiers applicatifs depuis le snapshot antérieur de ce lot, ou inverser le delta de livraison, après contrôle des changements postérieurs. La nouvelle fonction de références et son appel doivent être retirés ensemble. Conserver S1/F1, les interfaces, les paramètres et le profil d'invalidation choisi. Ne jamais revenir globalement au HEAD ancien. Rejouer tests ciblés, droits, TypeScript, lint et build normal ; aucune migration de classeur/Drive n'est nécessaire.

## Clôture

**Implémenté et validé localement, non publié.** Build normal Next 16.3.4/Turbopack terminé, code 0 en **867 665 ms**, configuration originale et dépendances physiques dans la copie isolée. Compilation réussie en 8,5 min, contrôle TypeScript intégré terminé en 3,2 min, génération des 42 pages statiques terminée. Onze vrais fichiers WOFF2, signatures `wOF2`, empreintes et tailles archivées ; aucun mock de police, secret de production, override de workers ou contrôle désactivé. Cette durée défavorable sur un poste partagé n'est ni une mesure de CPU des consultations ni une comparaison causale de builds.

Navigateur final : **14 contrôles**, ordinateur 1440 px et mobile 390 px, zéro erreur de page. Général et Programmes ne font aucun GET métier client ; Équipes/unités puis Résultats, même après plusieurs allers-retours, partagent **un GET unités par visite**. Historique et recherche de liste sans requête supplémentaire ; 30 résultats courants puis 50 versions au bouton Historique, plus la ligne vide de médailles. Aucun POST/PUT/DELETE. Les composants réels et des réponses synthétiques sont utilisés, **pas une session authentifiée de production**. L'aperçu détenu par cette intervention a été fermé ; aucun autre serveur arrêté.

Préservation : **973 fichiers préexistants hors périmètre inchangés sur 977**. Les quatre différences attendues sont les trois fichiers applicatifs et l'ajout d'un lien au rapport dans `performance-routes-audit.md`. Le canevas historique `audit-cpu-suivi-2026-10-22.md` n'a pas pu être complété par append (accès en écriture refusé) et reste intact ; le rapport et son lien dans le dossier existant sont livrés. Branche, index et travaux parallèles préservés, aucune nouvelle configuration Git du checkout principal. La racine Git jetable n'est que dans la copie de build, sans commit.

Les patches `forward.patch` et `rollback.patch` ne touchent que les trois fichiers applicatifs ; `git apply --check .../rollback.patch` réussit sur la source finale. Les tests et scripts restent séparés. `checks.json`, `preservation.json`, les manifestes, journaux normalisés et mesures brutes identifient la composition validée. Les sources Compétitions de référence sont conservées sans secrets dans `reference-competition-sources.zip` : les extraire dans une nouvelle racine `.cache` puis la passer au benchmark permet de rejouer la comparaison sans écraser le workspace.

Limites restantes : recette authentifiée avec les vraies sources et mutations dans un environnement de test séparé, SHA Vercel réellement servi, pondération du bloc dans le trafic/CPU réel, graphes chargés par anticipation et répétitions de lectures fraîches décrits plus haut. **Aucune publication de ce lot, aucun gain Vercel revendiqué.**
