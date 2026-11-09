# Paramètres système et saisons — 23 octobre 2026

## Fonctionnement retenu

Nouvelle entrée **Administration → Paramètres**, `/dashboard/parametres`, réservée aux super-administrateurs. Première rubrique : les saisons, avec création, modification, dates inclusives, statut actif/inactif et observation. Pas de suppression de saison ou de ligne historique.

Source unique : l’onglet existant `SAISONS` du classeur Référentiel, avec les six colonnes déjà documentées : `id_saison`, `nom_saison`, `date_debut`, `date_fin`, `statut`, `observation`. Aucun nouveau classeur, mapping ou colonne ; aucun changement de données de production effectué pendant le développement.

L’année civile provient de la date du serveur en **Africa/Kinshasa**, sans valeur 2026 codée en dur. La saison courante est l’unique saison `ACTIF` couvrant cette date. Exemple de configuration annuelle : nom `2026`, début `2026-01-01`, fin `2026-12-31`, statut `ACTIF`. Une saison à cheval sur deux années est possible. Absence ou chevauchement : indication explicite, aucune sélection arbitraire. Les écritures refusent les dates invalides, noms dupliqués et chevauchements actifs ; désactiver une saison permet de conserver son historique.

Le chargement des références des équipes nationales calcule `currentSeasonId` depuis les lignes SAISONS **déjà chargées**. Le formulaire de création présélectionne cette saison ; le choix reste modifiable et les saisons historiques restent disponibles. Ni filtrage global automatique des tableaux de bord, ni réaffectation des équipes existantes. Modifier les dates d’une saison affecte les dates de référence des équipes liées : avertissement affiché dans le formulaire.

## Sécurité, fraîcheur et limites

Politiques explicites des pages et API en `SUPER_ADMIN`, contrôle de session également dans la page et les handlers, refus d’un compte en activation et de tout VIEWER, y compris marqué super-admin. Aucun droit métier élargi. Lectures des paramètres et prévalidation de mutation via le chemin frais `getSheetsTables`, sans nouveau cache d’agrégat. Réponses GET `no-store`. Les couches Sheets et F1 existantes restent inchangées ; invalidation habituelle à l’écriture et revalidation des pages paramètres/équipes nationales.

Journalisation d’une demande avant mutation et d’un achèvement après mutation dans le journal existant, avec identifiant de corrélation ; aucun secret journalisé. Comme les autres écritures Sheets, absence de transaction distribuée entre lecture de validation, écriture et journal. Deux instances simultanées peuvent contourner un précontrôle d’unicité/chevauchement ; la résolution courante refuse alors de choisir arbitrairement. Une erreur après écriture, ou un timeout, peut laisser la saison enregistrée : recharger la liste avant nouvelle tentative. Pas de promesse d’atomicité ou d’idempotence nouvelle. Les journaux et protections existants des autres modules ne sont pas modifiés.

## Composition et validation

Fichiers nouveaux : `lib/settings/{seasons,data}.ts`, `app/api/parametres/saisons/route.ts`, page/client/chargement/erreur sous `app/dashboard/parametres`, `tests/settings/seasons.test.mjs`.

Adaptations ciblées : politiques de routes, navigation et sidebar, `lib/equipes-nationales/{data,types}.ts`, formulaire de création dans `app/dashboard/equipes-nationales/teams-client.tsx`.

Travaux parallèles préservés : Utilisateurs, neuf KPI, D1/C1/S1/F1/A1 et brouillon C2 déjà présent dans le workspace. La composition de production précédente reste distincte de ce workspace ; pas de push ni de déploiement pour cette demande. Validation dans `.cache/settings-20261023/checkout`, dépendances physiques et build Next normal avec les vraies polices, sans relancer ou arrêter de serveur.

Résultats et limites : voir le dossier de preuves `parametres-saisons-2026-10-23/` et son `checks.json`, actualisé à la fin des contrôles. Aucun navigateur ni session authentifiée accessible lors de la dernière inspection : recette à réaliser en super-admin (créer/modifier/désactiver, constater la saison courante), refus ADMIN/VIEWER et affichage mobile. Aucune recette authentifiée ou écriture réelle de saison n’est revendiquée.

Retour arrière local : retirer les nouveaux fichiers et uniquement les adaptations listées, sans restaurer en bloc les fichiers déjà modifiés par les lots parallèles. Conserver les lignes SAISONS, identifiants utilisés par les équipes et journaux ; ne pas revenir à un déploiement supprimant F1/S1.

## Résultat final vérifié localement

- Build normal avec accès réseau aux vraies polices : réussi, 81 036 ms ; 11 fichiers WOFF2 valides. Première tentative refusée par le réseau restreint : log conservé, aucune substitution de police ou désactivation de contrôle.
- TypeScript séparé : réussi, 60 109 ms.
- Lint global : réussi, 88 754 ms ; seul avertissement préexistant dans athlete-sport-history.tsx:27.
- Tests ciblés finaux : **92/92**, dont six cas Paramètres (calendrier Kinshasa, périodes, absence/ambiguïté, permissions, handlers/audit, persistance/schéma/erreur de source), plus CPU, Utilisateurs, navigation et références.
- Suite complète : **319/325**, exactement les six mêmes échecs préexistants comparés automatiquement au candidat validé F1/A1. Aucun nouvel échec.
- Empreintes de 358 entrées applicatives et configuration inchangées pendant les contrôles ; copie isolée conforme au workspace final. Contrôle de préservation sur 741 fichiers existants : seules les adaptations annoncées et la documentation antérieure ont changé. Détails dans preservation.json.
- Pas de recette visuelle/authentifiée, navigateur/session indisponible. Aucune connexion de test ni écriture réelle de saison. Aucun push ni déploiement.

Reproduction dans une copie isolée contenant les mêmes sources et des dépendances physiques : exécuter next build normalement (réseau autorisé pour les polices Google), tsc --noEmit --incremental false, eslint app lib components proxy.ts et les nouveaux tests, puis les commandes exactes listées dans les scripts de validation locaux .cache/settings-20261023/{validate,finish}.mjs. Les logs et checks.json restent les preuves indépendantes du cache local. Ne pas publier le workspace en bloc : il contient toujours C2 différé.
