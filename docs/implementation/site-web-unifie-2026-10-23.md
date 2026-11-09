# Administration du Site Web unifié — 23 octobre 2026

## Écart et plan

Source faisant désormais autorité, explicitement confirmée par la nouvelle demande : `1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM`. Métadonnées et dix lectures bornées des en-têtes/statuts effectuées en lecture seule ; vingt onglets présents, en-têtes des neuf tables de contenu et des statuts conformes au schéma demandé. Aucune modification des cellules, formules, partages ou secrets.

Existant : seule la rubrique Sliders dispose de services, routes et écran ; ID ancien codé dans config.ts, statuts encore lus dans Référentiel, IDs séquentiels, upload rendant les images publiques immédiatement. Les autres rubriques sont des destinations de navigation conservées. Nouveau chantier distinct des saisons, conservées.

Ordre de travail : (1) schémas et branchement unique, (2) validation et persistance avec relations/publication, (3) mutations Communication auditées et médias privés contrôlés, (4) tableaux et panneaux réutilisés pour les huit rubriques, (5) photos à la demande et envois multiples avec résultats individuels, (6) tests synthétiques et contrôles TypeScript/lint/build, (7) contrat du site public et limites de recette.

Les Jeux/éditions/résultats/médailles ne sont pas développés. Les anciennes rubriques restent dans la navigation. Aucune suppression de lignes ou fichiers partagés. C2 reste différé : ne pas publier le workspace en bloc ; la validation de livraison emploie le profil Sheets conservateur global déjà publié, sans effacer le brouillon local C2.

## Décisions initiales

- Source unique des contenus, catégories et statuts. Pas de copie automatique vers des activités/acteurs métier ; pas de lecture des dossiers privés pour enrichir les profils publics.
- Contenu textuel simple, rendu échappé par React ; aucun HTML exécuté.
- Médias nouvellement envoyés privés dans Drive ; URLs de lecture contrôlées côté serveur selon PUB002, les périodes et la publication du parent de galerie. Prévisualisation authentifiée AUT-COM READ. Les liens externes historiques déjà publics ne peuvent pas être rendus privés rétroactivement.
- Réemploi des credentials OAuth Drive et du dossier d’images Site Web existant. Dossier dédié aux PDF du Site Web indispensable, distinct des documents privés du SaaS. Aucun transfert automatique de permission ou suppression de fichier.
- Pas de DELETE : archivage des contenus, modification des catégories et photos. Cela conserve les dépendances et données historiques.
- Pas de nouveau cache d’agrégats ou service. Photos uniquement à l’ouverture d’une galerie ; sélecteurs liés chargés à l’ouverture d’un panneau.

État courant : **huit rubriques implémentées et vérifiées localement**, non publiées. Le nouveau classeur est lisible par l’identité Sheets réellement configurée. Le dossier d’images existant est privé et accessible en écriture. **La variable du dossier PDF Site Web n’est pas encore configurée** : aucun dossier métier privé substitué, aucune création de dossier ou modification de secret effectuée.

## Livraison implémentée

Les neuf entités (huit rubriques et photos de galerie) utilisent le même schéma explicite, sans inventer de colonnes. `schema-observe.json` conserve les métadonnées et les lectures bornées confirmées ; `application-source-read.json` confirme la lecture PUB001/PUB002/PUB003 avec l’identité applicative. Le branchement actif est `lib/site-web/config.ts`. L’ancien ID n’est plus dans le code exécutable Site Web ; les rapports historiques ne sont pas réécrits comme s’ils avaient décrit le nouveau mapping.

| Rubrique | Feuille | Routes |
| --- | --- | --- |
| Sliders | SLIDERS_SITE | `/dashboard/site-web/sliders`, `/api/site-web/sliders`, `/api/site-web/sliders/[id]` conservées |
| Événements | ACTIVITES_PUBLIQUES | ressource `evenements` |
| Communiqués | COMMUNIQUES_SITE | ressource `communiques` |
| Actualités | ACTUALITES_SITE | ressource `actualites` |
| Athlètes publics | ATHLETES_PUBLICS | ressource `athletes` |
| Galeries | GALERIES_SITE | ressource `galeries` |
| Photos | MEDIAS_GALERIE_SITE | `/api/site-web/photos?galerie=…`, POST et PUT ; consultation intégrée à la galerie |
| Documents publics | DOCUMENTS_PUBLICS | ressource `documents` |
| Catégories | CATEGORIES_ACTUALITES | ressource `categories` |

Les ressources génériques utilisent `/dashboard/site-web/[resource]`, GET/POST `/api/site-web/[resource]`, PUT `/api/site-web/[resource]/[id]`. GET `?options=1` charge les sélecteurs à l’ouverture du panneau. POST/PUT `/api/site-web/uploads` assurent l’envoi privé fragmenté. GET/HEAD `/api/site-web/media/[resource]/[id]/[field]?file=…` servent uniquement le média lié, après contrôles frais de publication/autorisation et vérification du dossier/type/taille/permissions avant lecture des octets. Aucun endpoint de liste d’administration n’est rendu anonyme.

Interface partagée sous `components/site-web` : tableaux et formulaires lisibles, recherche/filtres/pagination, consultation détaillée, panneau droit plein écran mobile avec pied fixe, confirmation avant abandon, maintien des données après erreur, actualisation locale de la ligne. Un communiqué choisit un document existant par titre ; une actualité choisit sa catégorie et sa galerie par libellé ; les photos ont chacune leur légende/crédit/ordre. Les anciens fichiers potentiellement partagés ne sont pas supprimés.

Les écritures et les débuts/achèvements d’envoi sont audités. Les requêtes sont dédupliquées selon l’audit de succès et un ID serveur déterministe ; une attente dans la file locale ne conserve pas un droit révoqué : nouvelle autorisation fraîche avant exécution. Cette file et les invalidations mémoire ne sont pas distribuées ; aucune transaction Sheets/Drive/audit ou garantie d’unicité inter-instance n’est inventée.

## Validation finale et résultats défavorables conservés

Preuves dans [le dossier de validation](site-web-unifie-2026-10-23/).

| Contrôle | Résultat |
| --- | --- |
| En-têtes/statuts réels | Dix lectures bornées, schémas conformes ; aucune écriture de cellule. |
| Identité applicative Sheets | Lecture réussie du nouveau classeur, uniquement des statuts. |
| Configuration Drive existante | Dossier d’images privé, de type dossier, accessible en écriture ; dossier PDF non configuré, voir `drive-config-read.json`. |
| Lint du chantier | Réussi, zéro erreur/avertissement sur les fichiers du chantier. |
| Tests ciblés | **100/100** : Site Web (15 cas), saisons, droits, Utilisateurs et lots CPU, avec le profil global conservateur. |
| Build normal final | Réussi en **85 086 ms**, configuration normale et **11 vraies polices WOFF2** ; aucun contrôle TypeScript désactivé. |
| TypeScript séparé | Réussi en **45 203 ms**. |
| Suite complète | **319/325**, exactement les six mêmes échecs préexistants, comparaison automatique avec la validation des saisons. |
| Navigateur | **35 captures** sur fixtures avec Chromium : huit rubriques + panneaux, ordinateur 1440 px et mobile 390 px, états vide/erreur, fermeture sale, saisie après 503, interface VIEWER, texte HTML échappé, photos à la demande, succès partiel puis reprise sans réenvoi des réussites. Zéro exception de page capturée. |
| Sources et préservation | **375 entrées** applicatives/configuration figées et inchangées ; aucune fixture dans le build final ; travaux Utilisateurs, saisons, neuf KPI et sécurité préservés. |

Le premier lint a relevé un `prefer-const` et deux avertissements du nouveau code, corrigés. Le premier build a relevé une inférence trop étroite du type UUID sur l’argument de gestion d’erreur, corrigée explicitement en `string`. La première recette a mis en évidence un chargement de photos annulé lors du remontage React : requête avec signal propre et sans partage de promesse annulée. Les captures de panneaux ont ensuite été prises après leur transition, avec contrôle des bornes du panneau dans le viewport. Les échecs intermédiaires et logs de build sont conservés, sans être présentés comme des défauts préexistants.

La suite complète finale a duré **3 573 567 ms** de temps écoulé, contre 16 676 ms sur le passage précédent, avec les mêmes 325 cas et les mêmes six échecs. Ce ralentissement de la validation locale n’est pas une mesure du CPU runtime ni un gain/perte Vercel ; sa cause dominante n’est pas établie. Aucun benchmark de production, test de charge, connexion artificielle ou requête métrique Plus effectué.

## Composition exacte et limites restantes

Le checkout vérifié est `.cache/site-web-20261023/checkout`, sans `.env`, secrets ou artefacts de polices simulées. Il inclut les saisons et évolutions fonctionnelles parallèles du workspace. **Pour exclure C2**, il reprend `lib/google/sheets.ts` et les deux attentes de tests CPU du candidat conservateur F1/A1 précédent. Le workspace principal conserve son brouillon C2 inchangé : ne pas le pousser en bloc. `final.json` et `source-before-build.json` identifient le profil et les empreintes ; aucun commit, push ou déploiement n’a été effectué ici.

Avant toute future livraison : préparer un checkout Git propre sur la branche de production réelle, reprendre cette composition et `.env.example`, recontrôler les différences intervenues et les empreintes, préserver les paramètres de saisons et F1/S1. Ne publier aucun fichier de prévisualisation ni `.next-dev`. Les aperçus isolés ont été fermés et leur route synthétique supprimée ; aucun autre serveur n’a été arrêté.

À configurer avant usage réel des PDF : `GOOGLE_DRIVE_SITE_WEB_DOCUMENTS_FOLDER_ID`, dossier **privé dédié au Site Web**, distinct des documents métier. Le code refuse un dossier métier privé ou partagé publiquement ; aucun accès n’est élargi pour contourner ce manque. Le modèle `.env.example`, la cartographie et [le contrat de lecture public](../interfaces/administration-site-web.md) sont actualisés.

Recette restante : parcours avec une véritable session autorisée et écritures dans un environnement de test séparé (création/modification, upload Drive et reprise réelle, publication/dépublication, droits ADMIN/VIEWER et révocation). Les tests en navigateur de cette phase utilisent uniquement des fixtures et des réponses API simulées : ils ne constituent pas une session authentifiée ni une preuve d’écriture Sheets/Drive réelle. Aucun contenu de démonstration écrit en production. Aucun changement au site public ou à un autre dépôt.

Retour arrière : ne pas rétablir aveuglément l’ancien mapping ou un ancien déploiement supprimant F1/S1. Préparer un retrait ciblé du nouveau parcours dans un checkout isolé tout en conservant le classeur unique confirmé, les contrôles de médias déjà utilisés, les paramètres de saisons et les droits de sécurité. Conserver les lignes et fichiers créés, les IDs et les journaux ; aucune suppression automatique ou bascule vers un classeur homonyme. Valider à nouveau avant une éventuelle publication.
