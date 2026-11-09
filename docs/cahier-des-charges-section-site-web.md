# Cahier des charges détaillé — Section Site Web du COC

**Projet :** SaaS du Comité Olympique Congolais · **Dépôt :** coc-cible  
**Version documentaire :** 1.0 · **Date :** 25 octobre 2026  
**Objet :** référence fonctionnelle, visuelle et technique de l’administration des contenus du site public.  
**Statut :** consolidation des demandes, du code et des preuves existantes. Les propositions et contrôles manquants sont séparés des réalisations. Ce document ne vaut pas recette authentifiée ni publication de la dernière maquette.

## Sommaire

1. Objet, vocabulaire et périmètre
2. Référence et niveaux de preuve
3. Architecture et sources
4. Profils et permissions
5. Direction visuelle et navigation
6. Listes et fiches : comportements communs
7. Spécifications par rubrique
8. Dictionnaire des données
9. Publication et dépendances
10. Médias et accès Drive
11. Contrat HTTP
12. Cohérence, concurrence et performance
13. Audit, erreurs et reprise
14. Contrat de lecture du site public
15. Configuration et exploitation
16. Recette et critères d’acceptation
17. Livraison, retour arrière et limites
18. Sources et responsabilités

## 1. Objet, vocabulaire et périmètre

Le module permet aux utilisateurs habilités de préparer, consulter, corriger et publier les contenus éditoriaux du site public depuis le SaaS. Google Sheets conserve les fiches ; Drive conserve les nouveaux fichiers, servis sous contrôle du SaaS.

| Terme | Définition |
|---|---|
| Contenu public | Fiche destinée au site, qui peut encore être en brouillon ou archivée ; son accès anonyme n’est pas automatique |
| Publication | Statut PUB002, complété par les conditions de date et de dépendances |
| Mise à la une | Choix éditorial pour l’accueil ; ne publie pas la fiche |
| Athlète public | Profil éditorial indépendant du dossier privé d’un acteur sportif |
| Événement public | Annonce du site ; ne crée pas une activité métier |
| Document public | Pièce éditoriale, distincte des justificatifs et documents privés du SaaS |
| Galerie | Album dont chaque photo possède sa ligne, légende, crédit et ordre |

### 1.1 Inclus

Sliders, événements à la une, communiqués, actualités, athlètes mis en avant, galeries et photos, documents publics et catégories d’actualités. Les statuts sont un référentiel lu, sans interface de modification dans ce lot.

### 1.2 Rubriques conservées et différées

Historique, Gouvernance, Jeux et Entités restent dans la navigation, avec mention « À configurer ». Leur présence ne prouve pas l’existence d’un CRUD opérationnel. Aucun développement de jeux, éditions, résultats ou médailles ; aucune suppression de leurs feuilles.

### 1.3 Hors périmètre

Pas de modification du dépôt du site public, d’intégration automatique aux dossiers sportifs, de vidéo, de suppression définitive, de refonte d’authentification, de nouveau service payant ou de nouvelle infrastructure. Aucun workflow multi-validateur, historique de versions, recherche serveur ou nettoyage automatique de Drive introduit par ce lot. Les traces et données existantes sont conservées.

## 2. Référence et niveaux de preuve

| Niveau | Signification |
|---|---|
| Exigence | Besoin demandé ou invariant à préserver ; peut rester à recetter |
| Constat code | Comportement identifiable dans les sources, sans prétendre à une exécution authentifiée |
| Vérifié localement | Couvert par tests, compilation ou navigateur sur fixtures, selon les preuves |
| Publié | Présent dans la composition publiée identifiée, sous réserve de configuration réelle |
| À confirmer / proposé | Information manquante ou évolution future, sans autorisation implicite de réalisation |

Dernière référence publiée **consignée dans le rapport**, contrôlée le 25 octobre : SHA `21822f51acf51667d27acee3107716e3c5b06210`, déploiement `dpl_3SfWTtJqZJfDtcM7AkQQV7fXcxWk`, alias `database.coc-rdc.net`, READY. Ce n’est pas une nouvelle interrogation de production effectuée pour cette rédaction.

Les tableaux harmonisés et l’accueil minimaliste en blocs du 25 octobre sont des **évolutions locales non publiées**. La variante en tableau de l’accueil a été remplacée après retour utilisateur. Ses captures sont intermédiaires ; les blocs constituent la référence locale actuelle, dont l’acceptation visuelle finale reste à recueillir.

Préserver D1/C1/S1/F1/A1. **C2 reste différé pour la livraison** : conserver les purges globales. Le workspace contient encore un brouillon C2 dans `lib/google/sheets.ts`, distinct du profil conservateur de la livraison isolée validée. Ce document ne réactive pas C2.

## 3. Architecture et sources

### 3.1 Source unique

- Nom applicatif : **10_SITE_WEB_CONTENUS**.
- ID : `1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM`.
- Configuration : `lib/site-web/config.ts`.
- [Classeur de référence](https://docs.google.com/spreadsheets/d/1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM/edit).
- Ancien ID remplacé : `1Amc-shqO9U-coS3Oyz0j_EXLZqK5lJHpI0tvF3w51Ew` ; aucun repli sur cet ancien classeur.

Le transfert et la suppression de l’ancien classeur ont été déclarés par l’utilisateur. Les en-têtes du nouveau classeur ont été observés en lecture seule le 23 octobre. Aucune nouvelle lecture distante ni modification des classeurs pour rédiger ce document.

Les neuf feuilles de contenu et `STATUTS_PUBLICATION` sont détaillées en section 8. Les statuts Site Web ne proviennent plus du Référentiel général. Aucun secret Google ou OAuth ne figure ici.

### 3.2 Circulation des données

1. Le navigateur ouvre une page privée du SaaS.
2. Proxy et contrôles serveur vérifient session et droits.
3. La page lit rubrique et statuts puis transmet les données utiles à la liste.
4. La mutation utilise une API privée : validation, références, audit, écriture puis relecture de confirmation.
5. Un fichier est envoyé par fragments au serveur puis à Drive ; Sheets reçoit une URL, pas les octets.
6. Le navigateur actualise uniquement la ligne concernée.
7. Le site public lit le classeur selon le contrat de la section 14 ; les API de gestion restent privées.
8. Le média géré est servi par le SaaS après vérification de publication ou de prévisualisation autorisée.

Le classeur USERS reste impliqué pour comptes, attributions et audit. Une requête du module peut donc solliciter plusieurs sources malgré le classeur éditorial unique.

## 4. Profils et permissions

Bloc métier : **Communication — AUT-COM**. Compte authentifié, utilisable et activation terminée nécessaires.

| Situation | Lecture privée | Création, modification, archivage, upload |
|---|---|---|
| Anonyme | Refus ; pages vers connexion, API 401 | Refus |
| ADMIN, AUT-COM valide | Oui | Oui |
| ADMIN sans attribution valide | Non | Non |
| VIEWER, AUT-COM valide | Oui | Non |
| VIEWER sans attribution valide | Non | Non |
| Super-admin non VIEWER | Oui, suivant l’exception centrale | Oui |
| VIEWER marqué super-admin | Attribution explicite nécessaire | Toujours refusé |
| Activation encore requise | Pas de parcours métier normal | Refus |
| Source d’autorisation indisponible | Refus lorsque sa consultation est nécessaire | Refus sans réaccorder des droits périmés |

Une attribution doit appartenir à l’utilisateur, concerner AUT-COM, être ACTIF, avoir commencé et ne pas être expirée. Les bornes sont inclusives selon Africa/Kinshasa. Le super-admin non VIEWER bénéficie de la politique centrale ; ne pas lui inventer une attribution nécessaire.

Masquer les commandes WRITE aux lecteurs, mais toujours recontrôler côté serveur. Une mutation en attente doit relire les droits avant exécution pour respecter une révocation intervenue pendant l’attente. Ne pas augmenter les TTL de sécurité pour économiser des appels.

## 5. Direction visuelle et navigation

### 5.1 Accueil `/dashboard/site-web`

Direction demandée : **créative, minimaliste et raccord au COC**, sans nouveau système visuel.

| Groupe | Blocs dans l’ordre |
|---|---|
| À publier | Sliders, Actualités, Communiqués, Événements |
| Vos ressources | Galeries, Documents, Athlètes, Catégories d’actualités |
| Le Comité | Historique, Gouvernance, Jeux, Entités |

- En-tête partagé : « Site Web », sous-titre « Votre espace de publication ».
- Bloc entièrement cliquable : icône discrète, nom, courte indication, flèche diagonale.
- Pas de bouton « Ouvrir » répété, badge Disponible ni compteur décoratif.
- Fond léger, bordure fine, accent doré au survol et focus clavier visible.
- « À configurer » seulement sur les quatre rubriques différées.
- Quatre colonnes à partir de xl ; deux colonnes en dessous, y compris sur mobile.
- Marges de 16 px puis 24 px à partir de sm ; espacements réguliers entre groupes.
- Aucune police supplémentaire, ombre lourde ou animation de déplacement.

Tokens existants : fond `#071c32`, carte `#0c2742`, texte `#f7fafc`, secondaire `#9db2c6`, bordure `#28445e`, accent `#f6c515`. Employer les tokens du projet plutôt que recopier les valeurs dans les composants.

### 5.2 Sous-rubriques

Routes sous `/dashboard/site-web/{resource}` ; retour vers l’accueil. Les photos se gèrent dans leur galerie, sans page autonome de collection globale. Préserver les destinations existantes des rubriques différées ; ne pas supprimer une rubrique pour contourner son absence d’implémentation.

## 6. Listes et fiches : comportements communs

### 6.1 Liste

- Tableau compact, en-têtes `bg-muted/70`, composants du système, titre consultable.
- Recherche locale insensible à la casse française sur libellé, description, extrait, sport, type de document ou nom de catégorie. Pas de recherche plein texte sur tous les champs ni d’équivalence des accents garantie.
- Select de publication et Checkbox « À la une uniquement » lorsqu’applicables.
- **10 lignes par page côté client** : la collection est chargée ; aucune pagination Sheets serveur de dix lignes n’est revendiquée.
- Changement de filtre → page 1 ; page bornée au nombre de résultats.
- Tri client actuel : ordre croissant puis date publication/document décroissante. Le service trie aussi ordre/libellé ; pas de tri interactif sur en-têtes.
- Actualiser ne relit que la rubrique. Ajouter désactivé si erreur/chargement et masqué sans WRITE.
- Actions : consulter, modifier, archiver si statut applicable et non déjà PUB003 ; icônes, infobulles et noms accessibles.
- Archiver ouvre le panneau avec PUB003 ; l’écriture exige Enregistrer.
- Pas de suppression définitive, sélection multiple ou édition de masse.
- Miniature paresseuse et emplacement neutre sans image ; logo pour les événements.
- Pied intégré : plage, nombre de résultats, page et commandes précédent/suivant.
- Mobile : filtres pleine largeur et défilement horizontal du tableau dans sa carte, sans débordement de page.

### 6.2 Fiche

Le panneau Sheet ouvre à droite, pleine largeur sur mobile, corps défilant et pied accessible. Groupes « Contenu » et « Dates et publication ». Étoile sur les champs requis ; aucun ID demandé.

Valeurs initiales : PUB001 ; FALSE pour les booléens ; ordre 0 sauf slider 1. Les relations chargent leurs options à l’ouverture, affichent des titres et stockent des IDs. Une référence non publiée est signalée. Panne de sélecteurs → message, Réessayer et Enregistrer bloqué, pas de fausse liste vide.

- Annuler/Fermer et Enregistrer ; progression des fichiers et état d’enregistrement.
- Verrou de double soumission et clé stable pendant une tentative.
- Saisie et fichiers conservés après erreur ; renouvellement d’autorisation de fichier si expirée.
- Confirmation de fermeture après modification ; beforeunload selon prise en charge du navigateur.
- Consultation intégrale en texte simple, lignes conservées, aucun HTML exécuté.
- Succès : confirmation et remplacement/ajout de ligne sans rafraîchissement global du dashboard.
- Pas de sauvegarde automatique ni de persistance garantie du brouillon après fermeture/redémarrage.

### 6.3 États et accessibilité

Distinguer chargement, liste vide, zéro résultat filtré, source indisponible, sélecteurs en erreur et échec de sauvegarde. Une panne n’est pas une absence de données. Utiliser role=alert pour erreurs, role=status pour confirmations/progression, libellés des champs et commandes clavier. Aucune conformité WCAG complète n’est revendiquée à partir des seules captures.

## 7. Spécifications par rubrique

### 7.1 Sliders

Route `sliders`, feuille `SLIDERS_SITE`. Liste : visuel, titre, période, statut, ordre, actions. Requis : titre, description, statut et ordre ≥ 1. L’image est gérée mais pas obligatoire dans le schéma actuel. Le bouton est facultatif ; libellé et lien vont ensemble. Lien HTTP/HTTPS ou chemin local commençant par un seul `/`, sans `//`.

Période facultative, fin ≥ début ; bornes inclusives, côté non renseigné ouvert. PUB002 hors période est inéligible sans devoir modifier automatiquement son statut.

### 7.2 Événements à la une

Route `evenements`, feuille `ACTIVITES_PUBLIQUES`. Titre, début et statut requis ; fin facultative ≥ début. Logo et illustration distincts ; miniature basée sur le logo. Type, lieu, description, mise à la une et ordre disponibles. Accueil public demandé : logo, titre et date.

Pas de création d’activité métier ni de rattachement implicite à une compétition. Le code de publication média ne retire pas automatiquement un événement à sa date de fin ; la politique du site public sur les événements passés reste à définir.

### 7.3 Communiqués

Route `communiques`, feuille `COMMUNIQUES_SITE`. Date de publication, titre et statut requis. Extrait court et texte intégral. Aucune image : le seul média est le document PDF associé. PDF réutilisé via sélection d’un document par titre, stockant `id_document_public`, sans copie.

`fichier_url` assure la compatibilité d’anciens liens directs. Sélectionner le document vide ce lien : pas de double saisie. Nouveau lien direct Google, média géré ou route `/api/` refusé pour éviter le contournement documentaire privé. La validation n’impose pas un PDF à tout communiqué.

Parent PUB002 → document lié PUB002 requis. Une date future empêche l’éligibilité publique avant le jour prévu à Kinshasa. Le site public doit appliquer la même règle au texte.

### 7.4 Actualités

Route `actualites`, feuille `ACTUALITES_SITE`. Titre, catégorie existante, date et statut requis. Extrait, contenu, image, auteur, galerie et mise à la une selon le schéma. Une seule fiche pour accueil et rubrique.

Galerie facultative choisie par titre, stockée par ID ; aucune URL de galerie redondante. Si actualité PUB002, galerie liée PUB002 requise. Date future → inéligibilité avant le jour prévu.

### 7.5 Athlètes mis en avant

Route `athletes`, feuille `ATHLETES_PUBLICS`. Nom, sport et statut requis. Sexe et discipline sont des textes, pas de nouveaux référentiels inventés. Photo, biographie, olympisme vérifié, mise à la une, ordre et distinction disponibles.

Distinction factuelle validée et olympisme saisi explicitement ; jamais déduits automatiquement. Besoin public : nom/photo/sport/distinction, mais photo et distinction ne sont pas obligatoires dans le schéma actuel. Aucune lecture des passeports, coordonnées ou pièces privées. Aucun ID public assimilé à un ID d’acteur sportif ni sélecteur automatique d’acteur.

### 7.6 Galeries

Route `galeries`, feuille `GALERIES_SITE`. Titre et statut requis ; description, date, couverture, mise à la une et ordre facultatifs. Photos chargées à la consultation détaillée.

Une galerie référencée par une actualité PUB002 ne peut pas être dépubliée sans traiter le parent. Pas de couverture copiée automatiquement depuis la première photo ; aucune suppression en cascade.

### 7.7 Photos

Ressource `photos`, feuille `MEDIAS_GALERIE_SITE`. Galerie existante et titre requis ; fichier image obligatoire à l’enregistrement. Type fixé à PHOTO côté serveur, sans vidéo. Galerie fournie par le contexte ; déplacement implicite d’une photo existante vers une autre galerie refusé.

Légende, crédit et ordre individuels. En sélection multiple : titre initial issu du nom de fichier, ordre séquentiel initial et corrections avant envoi. Réussite/erreur par fichier ; les réussites demeurent et ne sont pas renvoyées lors d’un retry. Confirmation si fermeture avec éléments non enregistrés. Pas de suppression des fichiers déjà créés.

### 7.8 Documents publics

Route `documents`, feuille `DOCUMENTS_PUBLICS`. Type, titre, date, statut et PDF requis ; description facultative. Type en texte libre, sans référentiel supplémentaire. Liste : titre, type, date, statut, actions. Ouverture et téléchargement du PDF.

Préparation en brouillon, réutilisation dans les communiqués. Dépublication bloquée si un communiqué PUB002 le référence. Dossier Drive dédié au Site Web obligatoire, distinct des pièces métier privées.

### 7.9 Catégories

Route `categories`, feuille `CATEGORIES_ACTUALITES`. Nom requis, observation facultative. Recherche, consultation, ajout, modification. Pas de statut, mise à la une, ordre saisi ni archivage.

Unicité : normalisation Unicode NFKC, casse française, espaces multiples et périphériques ; accents non éliminés. Aucune suppression. Une future suppression devra définir le traitement des actualités liées et ses contrôles serveur ; elle n’est pas autorisée par ce document.

## 8. Dictionnaire des données

Les tableaux reprennent les champs de `lib/site-web/schema.ts`. « Obligatoire » reflète le schéma ou un contrôle serveur complémentaire identifié, sans ajouter de colonne. Les IDs internes sont générés serveur, non saisis. Une valeur manquante n’est pas inventée.

Conventions : texte court ≤ 2 000 caractères ; texte long ≤ 100 000 selon le validateur actuel. Ces bornes ne garantissent pas à elles seules l’acceptation d’une cellule par Sheets : les limites de la source restent applicables. Date civile ISO `AAAA-MM-JJ`, affichée `JJ/MM/AAAA`. Booléens stockés TRUE/FALSE. Ordre entier sûr ≥ 0, sauf slider ≥ 1. URLs fichiers issues de l’upload, pas d’ID Drive collé arbitrairement.

### 8.1 Sliders — `SLIDERS_SITE`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_slide` | Identifiant interne | ID serveur | Oui, non saisi |
| `titre` | Titre | Texte court | Oui |
| `description` | Description | Texte long | Oui |
| `image_url` | Image | Image gérée | Non |
| `libelle_bouton` | Libellé du bouton | Texte court | Non |
| `lien_bouton` | Lien du bouton | Lien | Non |
| `ordre_affichage` | Ordre d’affichage | Entier | Oui, entier ≥ 1 (contrôle complémentaire) |
| `id_statut_publication` | Statut de publication | Statut | Oui |
| `date_debut_publication` | Début de publication | Date ISO | Non |
| `date_fin_publication` | Fin de publication | Date ISO | Non |


### 8.2 Événements à la une — `ACTIVITES_PUBLIQUES`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_evenement_public` | Identifiant interne | ID serveur | Oui, non saisi |
| `titre` | Titre | Texte court | Oui |
| `type_evenement` | Type d’événement | Texte court | Non |
| `date_debut` | Date de début | Date ISO | Oui |
| `date_fin` | Date de fin | Date ISO | Non |
| `lieu` | Lieu | Texte court | Non |
| `description` | Description | Texte long | Non |
| `image_url` | Image d’illustration | Image gérée | Non |
| `id_statut_publication` | Statut de publication | Statut | Oui |
| `logo_url` | Logo de l’événement | Image gérée | Non |
| `est_mis_en_avant` | À la une | Oui/non | Non |
| `ordre_affichage` | Ordre d’affichage | Entier | Non |


### 8.3 Communiqués — `COMMUNIQUES_SITE`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_communique` | Identifiant interne | ID serveur | Oui, non saisi |
| `date_publication` | Date de publication | Date ISO | Oui |
| `titre` | Titre | Texte court | Oui |
| `extrait` | Description courte | Texte long | Non |
| `contenu` | Texte intégral | Texte long | Non |
| `fichier_url` | Ancien lien direct (facultatif) | Lien | Non |
| `id_statut_publication` | Statut de publication | Statut | Oui |
| `est_mis_en_avant` | À la une | Oui/non | Non |
| `ordre_affichage` | Ordre d’affichage | Entier | Non |
| `id_document_public` | Document public | Relation | Non ; référence `DOCUMENTS_PUBLICS` |


### 8.4 Actualités — `ACTUALITES_SITE`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_actualite` | Identifiant interne | ID serveur | Oui, non saisi |
| `titre` | Titre | Texte court | Oui |
| `id_categorie_actualite` | Catégorie | Relation | Oui ; référence `CATEGORIES_ACTUALITES` |
| `date_publication` | Date de publication | Date ISO | Oui |
| `extrait` | Description courte | Texte long | Non |
| `contenu` | Texte intégral | Texte long | Non |
| `image_url` | Image principale | Image gérée | Non |
| `auteur` | Auteur | Texte court | Non |
| `id_statut_publication` | Statut de publication | Statut | Oui |
| `est_mis_en_avant` | À la une | Oui/non | Non |
| `ordre_affichage` | Ordre d’affichage | Entier | Non |
| `id_galerie` | Galerie associée | Relation | Non ; référence `GALERIES_SITE` |


### 8.5 Athlètes mis en avant — `ATHLETES_PUBLICS`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_athlete_public` | Identifiant interne | ID serveur | Oui, non saisi |
| `nom_complet` | Nom complet | Texte court | Oui |
| `sexe` | Sexe | Texte court | Non |
| `sport` | Sport | Texte court | Oui |
| `discipline` | Discipline | Texte court | Non |
| `photo_url` | Photo | Image gérée | Non |
| `biographie_courte` | Biographie courte | Texte long | Non |
| `est_olympien` | Olympien (information vérifiée) | Oui/non | Non |
| `est_mis_en_avant` | À la une | Oui/non | Non |
| `ordre_affichage` | Ordre d’affichage | Entier | Non |
| `id_statut_publication` | Statut de publication | Statut | Oui |
| `distinction` | Distinction factuelle validée | Texte court | Non |


### 8.6 Galeries — `GALERIES_SITE`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_galerie` | Identifiant interne | ID serveur | Oui, non saisi |
| `titre` | Titre | Texte court | Oui |
| `description` | Description | Texte long | Non |
| `date_evenement` | Date de l’événement | Date ISO | Non |
| `image_couverture_url` | Image de couverture | Image gérée | Non |
| `id_statut_publication` | Statut de publication | Statut | Oui |
| `est_mis_en_avant` | À la une | Oui/non | Non |
| `ordre_affichage` | Ordre d’affichage | Entier | Non |


### 8.7 Photos de la galerie — `MEDIAS_GALERIE_SITE`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_media_galerie` | Identifiant interne | ID serveur | Oui, non saisi |
| `id_galerie` | Galerie | Relation | Oui ; référence `GALERIES_SITE` |
| `type_media` | Type de média | Texte court | Fixé serveur à PHOTO |
| `titre_media` | Titre de la photo | Texte court | Oui |
| `fichier_url` | Photo | Image gérée | Oui, fichier conservé ou nouvel upload valide |
| `legende` | Description de la photo | Texte long | Non |
| `credit` | Crédit photo | Texte court | Non |
| `ordre_affichage` | Ordre d’affichage | Entier | Non |


### 8.8 Documents publics — `DOCUMENTS_PUBLICS`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_document_public` | Identifiant interne | ID serveur | Oui, non saisi |
| `type_document` | Type de document | Texte court | Oui |
| `titre` | Titre | Texte court | Oui |
| `date_document` | Date du document | Date ISO | Oui |
| `description` | Description | Texte long | Non |
| `fichier_url` | Fichier PDF | PDF géré | Oui, fichier conservé ou nouvel upload valide |
| `id_statut_publication` | Statut de publication | Statut | Oui |


### 8.9 Catégories d’actualités — `CATEGORIES_ACTUALITES`

| Champ physique | Libellé | Type | Obligatoire / règle |
|---|---|---|---|
| `id_categorie_actualite` | Identifiant interne | ID serveur | Oui, non saisi |
| `nom_categorie_actualite` | Nom de la catégorie | Texte court | Oui |
| `observation` | Observation | Texte long | Non |


### 8.10 Statuts — `STATUTS_PUBLICATION`

| Champ | Usage |
|---|---|
| `id_statut_publication` | Clé PUB001 / PUB002 / PUB003 |
| `nom_statut_publication` | Libellé affiché |
| `observation` | Référentiel, pas de modification dans ce lot |

Les trois IDs doivent être présents, sinon le référentiel est considéré incomplet. Libellés attendus : Brouillon, Publié, Archivé. Les comparaisons de publication portent sur les IDs.


## 9. Publication et dépendances

### 9.1 Cycle

Brouillon PUB001 → Publié PUB002 → Archivé PUB003. Le formulaire permet aussi le retour à Brouillon ou la republication, sous les mêmes contrôles. Aucun circuit multi-approbateur, purge automatique ou changement automatique du statut par la date.

| Contenu | Condition complémentaire au statut PUB002 |
|---|---|
| Slider | Début ≤ aujourd’hui ≤ fin, bornes renseignées inclusives |
| Actualité / communiqué | Date de publication non future ; cible liée éligible à respecter |
| Photo | Galerie existante et publiée ; pas de statut autonome |
| Galerie, document, athlète, événement | Pas de filtre de date ajouté par `isPublished` |
| Catégorie | Pas de publication autonome |

Une édition directe de Sheets peut créer une incohérence malgré les contrôles du SaaS. Les garde-fous d’écriture ne sont pas des contraintes de base sur les changements externes ; le lecteur public doit vérifier lui aussi.

### 9.2 Graphe de dépendances

| Source | Cible | Contrôle à l’écriture | Dépublication de la cible |
|---|---|---|---|
| Actualité | Catégorie | Référence existante obligatoire | Pas de suppression dans ce lot |
| Actualité | Galerie facultative | Si parent PUB002, galerie PUB002 | Refus si actualité PUB002 la référence |
| Communiqué | Document facultatif | Si parent PUB002, document PUB002 | Refus si communiqué PUB002 le référence |
| Photo | Galerie | Référence existante ; déplacement implicite interdit | Les photos héritent du statut de galerie |

Le refus de dépublication examine les parents au **statut PUB002**, même datés dans le futur. Ne pas le limiter aux parents visibles aujourd’hui. Pas de cascade-delete. Les relations stockent l’ID, pas le titre.

## 10. Médias et accès Drive

### 10.1 Formats et limites

| Média | Formats | Maximum | Validation |
|---|---|---|---|
| Image | JPEG, PNG, WebP, GIF | 5 × 1 024 × 1 024 octets | Taille, MIME déclaré et signature binaire |
| Document | PDF | 25 × 1 024 × 1 024 octets | Type, taille et signature PDF |
| Autres | SVG, vidéo, formats non acceptés | Refus | Aucun périmètre ajouté implicitement |

L’interface affiche Mo, les constantes sont des multiples de 1 024. Nom et extension ne suffisent pas. Une signature binaire n’est pas un antivirus ni une analyse exhaustive du document. Aucun recadrage, compression, conversion ou miniature générée serveur revendiqués.

### 10.2 Upload fragmenté

1. Préparer avec ressource, champ, ID éventuel, taille, MIME et clé de soumission.
2. Vérifier WRITE et existence de la fiche si modification.
3. Ouvrir une session Drive privée dans le dossier autorisé.
4. Signer une autorisation HMAC liée à utilisateur, fiche, champ, type, taille et expiration d’une heure.
5. Envoyer par fragments de **3 Mio maximum**, alignement Drive de 256 Kio hors dernier fragment.
6. Recontrôler les droits à chaque fragment, positions, limites et signature initiale.
7. À la fin : vérifier dossier, partage privé, MIME, taille et octets complets ; journaliser et signer le rattachement.
8. Soumettre la fiche JSON avec cette autorisation ; construire l’URL canonique et confirmer la ligne enregistrée.

Routes upload et média : Node.js, `maxDuration=60`. Ce n’est pas un SLA de réponse. Le client prévoit 60 secondes pour chaque appel upload/persistance.

Le corps de mutation ne doit pas porter le PDF complet. Un ancien petit multipart reste accepté ; au-delà de 4 Mio déclarés, la route exige les fragments. Aucun octet/base64 dans Sheets ; les jetons ne sont pas des champs métier. La route limite effectivement la lecture de chaque fragment, indépendamment du seul Content-Length.

### 10.3 Fichiers privés, remplacement et orphelins

Pas de partage anyone/domain créé. Dossiers Site Web distincts des documents privés, passeports et avatars métier. Remplacer change le lien sans effacer l’ancien fichier potentiellement partagé. Un upload sans fiche ou interrompu peut laisser un fichier privé orphelin ; nettoyage distinct après examen des références et de l’audit, jamais automatique dans ce lot.

### 10.4 Lecture contrôlée

URL type : `https://database.coc-rdc.net/api/site-web/media/{resource}/{id}/{field}?file={driveId}`, ou origine configurée. Vérifier successivement : ressource/champ, ligne fraîche, correspondance exacte avec le lien stocké, publication ou prévisualisation autorisée, dossier autorisé privé, MIME et taille avant téléchargement ; signature et taille réelle après lecture des octets.

- Brouillon/archivé/hors période : 404 anonyme, prévisualisation si AUT-COM READ valide.
- Photo : publication héritée de la galerie.
- Panne de source : 503 sans repli périmé.
- Réponse : `private, no-store`, `nosniff`, CSP restrictive ; CORS `*` pour média publié seulement, sans credentials ajoutés.
- `download=1` → attachment ; sinon inline.
- Exception proxy GET/HEAD étroite, sans ouvrir les collections ni mutations. Le handler implémente GET ; HEAD repose sur la convention de route Next.

Les anciennes URLs externes/directes peuvent subsister. Une ancienne URL Drive déjà publique n’est pas rendue privée rétroactivement par ce mécanisme. Leur inventaire/migration reste distinct ; ne pas promettre leur révocation par la seule dépublication du SaaS.

## 11. Contrat HTTP

| Route | Méthode | Fonction | Accès |
|---|---|---|---|
| `/api/site-web/{resource}` | GET | Collection + statuts `{rows,statuses}` | AUT-COM READ |
| Même route, `?options=1` | GET | Sélecteurs `{options}` | AUT-COM READ |
| `/api/site-web/photos?galerie={id}` | GET | Photos, paramètre galerie obligatoire | AUT-COM READ |
| `/api/site-web/{resource}` | POST | Créer `{row,assets}` → `{ok,row,request_id}` | AUT-COM WRITE |
| `/api/site-web/{resource}/{id}` | PUT | Modifier une fiche existante | AUT-COM WRITE |
| `/api/site-web/uploads` | POST | Préparer la session d’envoi | AUT-COM WRITE |
| `/api/site-web/uploads` | PUT | Envoyer un fragment binaire | AUT-COM WRITE |
| `/api/site-web/media/{resource}/{id}/{field}?file=…` | GET / HEAD | Média géré | Publication ou prévisualisation autorisée |

Aucun DELETE ni flux JSON public. Les routes spécifiques Sliders restent des façades compatibles ; `sliders` ou `slider` peuvent compléter les réponses communes. Une ressource inconnue n’entraîne pas la création d’un onglet.

POST/PUT fiche : `x-request-id`, 8 à 100 caractères alphanumériques, `_` ou `-`. Upload PUT : `x-upload-token` et `x-upload-start`, corps binaire. Aucun jeton d’envoi dans une URL publique ou un journal.

ID serveur : `WEB-{RESSOURCE}-{empreinte}`, issu d’acteur/ressource/requestId, SHA-256 tronqué à 32 caractères hexadécimaux, indépendant du nombre de lignes. Réutiliser la clé durant la même tentative, pas un nouvel ID à chaque clic.

### 11.1 Création type

Session et droit Communication → accueil → rubrique → Ajouter → saisie → upload éventuel → validation/références → audit/écriture → relecture confirmée → mise à jour locale. Aucun changement de code du site public déclenché par cette saisie.

### 11.2 Publication liée

Préparer document/galerie → publier la cible → sélectionner dans le parent → publier le parent → vérifier date et affichage public. En sens inverse, traiter d’abord les parents avant de dépublier la cible. Une catégorie n’a pas de cycle de publication propre.

## 12. Cohérence, concurrence et performance

### 12.1 Lectures et travail exécuté

Contrôler les en-têtes attendus ; ignorer les lignes sans ID ; projeter les champs déclarés ; refuser les IDs dupliqués dans le périmètre traité. Le filtre de galerie précède la projection des photos. Le service trie la collection ; le navigateur refiltre et pagine localement. Aucune jointure avec les dossiers privés des acteurs.

L’ouverture initiale peut utiliser les caches de lignes/en-têtes. GET de rafraîchissement, mutations, vérifications des relations et médias utilisent les chemins frais appropriés. Les options attendent l’ouverture de la fiche ; les photos attendent la consultation de la galerie. Les blocs d’accueil ne nécessitent pas de lectures de compteurs.

### 12.2 Politique de livraison à préserver

- Profil conservateur validé : purges globales après écriture ; C2 exclu.
- Mémoire locale au processus/instance, pas de cache ou invalidation distribués.
- TTL de lignes par défaut : 300 000 ms, configurable ; ce n’est pas le délai de révocation de sécurité.
- Une édition directe Sheets, un script externe ou une autre instance ne purge pas automatiquement toutes les mémoires. Les lectures cache peuvent attendre expiration ou actualisation explicite.
- Préserver les lectures fraîches de sécurité et la protection contre les anciennes lectures terminant après invalidation.
- Aucun cache d’agrégats Site Web ni rafraîchissement global systématique après saisie.
- Aucun gain CPU Vercel ou débit annoncé sans mesure appropriée ; distinguer CPU actif, attente Google et durée HTTP.

### 12.3 Concurrence

File de mutations `globalThis` partagée dans un processus Node, pas entre toutes les instances ni avec les éditeurs directs Sheets. Recontrôle des droits après attente. Les IDs déterministes et lectures du journal réduisent les doublons de retries, sans contrainte d’unicité transactionnelle distribuée.

La sauvegarde relit et compare les valeurs attendues. Pas de version optimiste ou d’ETag de fiche : risque d’écrasement concurrent et de dernière écriture gagnante. Une course inter-instance sur les références reste possible. Aucune atomicité Sheets/Drive/audit/site public ni rollback transactionnel global revendiqués.

## 13. Audit, erreurs et reprise

### 13.1 Traces

Conserver le journal existant et l’historique. Actions : `SITE_WEB_DEMANDE`, `SITE_WEB_CREATION`, `SITE_WEB_MODIFICATION`, `SITE_WEB_ECHEC`, `SITE_WEB_ENVOI_DEMANDE`, `SITE_WEB_ENVOI_TERMINE`. Débuts et résultats corrélés. Tracer acteur, objet/feuille, ID, date, résultat, requestId et détails non sensibles. Ne pas tracer fichiers, jetons, cookies, mots de passe, clés OAuth ou textes intégraux. L’ID Drive peut figurer à la fin de l’envoi ; il n’accorde aucun droit de lecture.

### 13.2 Erreurs

| Situation | Résultat |
|---|---|
| Sans session | API 401 / connexion pour page privée |
| Mauvais bloc, WRITE VIEWER, activation requise | 403 |
| Ressource inconnue ou média non accessible | 404 sans divulguer un fichier privé |
| Champs, dates, liens, signatures, relations invalides | 400, champ concerné si disponible |
| Succès déjà journalisé avec même clé de mutation | 409, `alreadyProcessed`, rechargement demandé |
| Quota/limitation reconnu | 429 selon classificateur partagé |
| Source indisponible | 503, saisie conservée, reprise proposée |

L’erreur commune comprend notamment code, message/error, request_id, champ_concerne et retryable. L’idempotence 409 et le média ont des formes spécifiques ; ne pas promettre une enveloppe unique à tous les handlers. ContentInputError force 400, même lorsqu’un autre classificateur pourrait associer un doublon à 409.

### 13.3 Incertitude et reprise

Une écriture peut réussir avant la perte de réponse ou l’échec de l’audit final. Saisie conservée ne signifie pas absence d’écriture. Recharger et vérifier avant nouvelle tentative incertaine ; ne pas créer manuellement une seconde ligne. Garder les réussites partielles. Un jeton expiré peut imposer un nouvel envoi ; aucune reprise binaire durable après fermeture garantie par le client actuel.

## 14. Contrat de lecture du site public

Consommateur distinct, **non modifié dans cette intervention**. Exigences d’intégration :

1. Lire la source unique et les noms physiques, sans copie métier redondante.
2. Garder les credentials Google côté serveur ; jamais dans le navigateur public.
3. Sélectionner PUB002, dates non futures, période inclusive des sliders, jour Africa/Kinshasa.
4. Appliquer mise à la une après éligibilité puis ordre ; définir le départage des ordres égaux côté public, sans considérer les tris admin comme un contrat universel.
5. Résoudre les relations par ID et ne pas exposer une cible absente/non publiée via un parent ; jamais un justificatif privé.
6. Lire les seules photos de la galerie demandée avec légendes, crédits et ordre ; pas de vidéo.
7. Échapper les textes, sans injection HTML.
8. Utiliser les URLs médias gérées, traiter 404/503, ne pas remplacer un média manquant par un fichier privé.
9. Ne pas utiliser les API de gestion comme API publique anonyme.
10. Définir la fraîcheur du propre cache du site public : no-store média et invalidation SaaS ne purgent pas automatiquement pages, CDN et autres applications.

À confirmer : intégration effective de la nouvelle source, dates, dépublication/cache, tri, relation invalide et accessibilité des illustrations. Aucune recette de l’autre dépôt revendiquée.

## 15. Configuration et exploitation

| Variable / paramètre | Usage |
|---|---|
| `AUTH_SECRET` | Authentification et signature upload, secret serveur |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` | Identité Google existante selon configuration de l’adaptateur |
| `GOOGLE_SHEETS_USERS_SPREADSHEET_ID` | Comptes, attributions, audit |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN` | Intégration Google/Drive OAuth existante |
| `GOOGLE_DRIVE_SITE_WEB_SLIDERS_FOLDER_ID` | Dossier privé images historique |
| `GOOGLE_DRIVE_SITE_WEB_IMAGES_FOLDER_ID` | Facultatif, dossier privé pour nouvelles images ; ancien Sliders lisible si autorisé |
| `GOOGLE_DRIVE_SITE_WEB_DOCUMENTS_FOLDER_ID` | Dossier privé dédié aux PDF Site Web, distinct des dossiers métier |
| `SITE_WEB_MEDIA_BASE_URL` | Origine HTTPS SaaS, défaut `https://database.coc-rdc.net` ; HTTP localhost/127.0.0.1 accepté en développement |
| `GOOGLE_SHEETS_CACHE_TTL_MS` | TTL existant des lignes, distinct des garanties de sécurité |
| Source Site Web | Constante de `lib/site-web/config.ts`, pas une nouvelle variable secrète |

Le dossier PDF dédié était **non configuré localement au dernier constat** ; état de production à confirmer. Ne pas annoncer l’upload PDF opérationnel avant ce contrôle. Aucun repli vers un dossier métier privé ni création automatique d’infrastructure pour masquer ce manque.

Tout changement d’en-têtes doit être répercuté dans mapping, schéma, services, tests et contrat public. Pas de création de colonne ou de réparation de classeur silencieuse à l’ouverture. Les colonnes attendues manquantes provoquent une erreur.

## 16. Recette et critères d’acceptation

### 16.1 Matrice de recette

| ID | Scénario | Attendu |
|---|---|---|
| SW-01 | Accueil desktop/mobile | Douze liens et groupes actuels, focus visible, pas de débordement |
| SW-02 | VIEWER attribué/non attribué | Lecture seulement si attribution valide ; aucun WRITE |
| SW-03 | WRITE forgé par VIEWER | Refus serveur avant upload/écriture éditoriale |
| SW-04 | Attribution expirée, future, inactive | Refus, bornes inclusives testées |
| SW-05 | Super-admin / VIEWER super-admin | Politique centrale respectée, jamais WRITE VIEWER |
| SW-06 | Panne d’autorisation | Refus sans résultat de sécurité périmé |
| SW-07 | Révocation pendant attente | Nouveau contrôle, refus avant mutation |
| SW-08 | Recherche, filtres, pagination | Résultats cohérents, dix lignes, page 1 après filtre |
| SW-09 | Créer/modifier/consulter chaque rubrique | Bons champs et actions accessibles |
| SW-10 | Sauvegarde 503 | Saisie conservée, erreur claire, reprise contrôlée |
| SW-11 | Fermer après modification | Confirmation, retour à la saisie possible |
| SW-12 | Slider bouton incomplet, ordre 0, dates inversées | Refus explicite |
| SW-13 | Slider avant/pendant/après période | Éligibilité dans bornes Kinshasa uniquement |
| SW-14 | Événement logo et illustration | Deux médias, aucune activité métier créée |
| SW-15 | Communiqué lié au document | ID, lien direct vidé, PDF non dupliqué |
| SW-16 | Actualité avec catégorie et galerie | Références exactes, galerie facultative |
| SW-17 | Parent PUB002, cible brouillon | Refus et absence d’exposition publique de cible |
| SW-18 | Dépublier cible utilisée | Refus avant traitement du parent PUB002 |
| SW-19 | Athlète public | Aucune donnée sportive privée chargée/exposée |
| SW-20 | Ouvrir une galerie | Chargement photos à la demande, filtré |
| SW-21 | Lot photos avec un échec | Succès conservés, retry des seuls non réussis |
| SW-22 | Déplacement implicite de photo | Refus serveur |
| SW-23 | Catégorie doublon casse/espaces | Refus normalisé, sans assimilation arbitraire des accents |
| SW-24 | Fichier vide, trop grand, SVG ou mauvaise signature | Refus, pas de ligne publique créée |
| SW-25 | PDF 25 Mio en fragments ≤ 3 Mio | Progression, positions confirmées, rattachement à la bonne fiche |
| SW-26 | Jeton expiré, mauvais acteur/champ/fiche | Refus |
| SW-27 | URL média forgée vers fichier privé métier | Refus avant téléchargement privé |
| SW-28 | Média brouillon/archivé/hors période | 404 anonyme, prévisualisation READ autorisée |
| SW-29 | Photo de galerie dépubliée | Accès anonyme refusé |
| SW-30 | Panne de source média | 503 sans repli périmé |
| SW-31 | Double soumission avec même clé | Replay maîtrisé, audit vérifié |
| SW-32 | ID dupliqué/en-tête manquant | Erreur, aucune réparation ni fausse liste vide |
| SW-33 | Remplacement média | Nouveau lien confirmé, ancien fichier conservé |
| SW-34 | Balises script dans texte | Échappées, non exécutées |
| SW-35 | Modification externe/autre instance | Limites de cache connues, lecture fraîche et reprise testées |
| SW-36 | Dépublication sur site public | Vérifier son cache réel, pas seulement le SaaS |

### 16.2 Preuves existantes

- Livraison Site Web/saisons : 100 tests ciblés, TypeScript, lint et build normal avec vraies polices selon le rapport.
- Suite générale : 319/325, **six échecs préexistants**, pas de suite générale entièrement verte.
- Uploads et concurrence sur fixtures ; pas de charge ni d’écritures de test en production.
- Listes harmonisées : 15 tests Site Web, 35 captures/parcours sur fixtures, aucune erreur JS ni débordement ; build/TypeScript dans le dossier de preuves.
- Accueil minimaliste actuel : douze liens et deux captures du composant réel, desktop 1440/mobile 390, sans erreur JS ni débordement ; lint réussi. Pas de nouveau build complet revendiqué pour cette dernière itération visuelle.
- Certains aperçus dev ont une police de repli faute d’accès Google Fonts ; pas un artefact de production ni une validation typographique finale.
- Production : huit contrôles HTTP anonymes réussis et zéro enregistrement retourné sur la fenêtre de logs du rapport ; aucune preuve de recette des formulaires authentifiés.

### 16.3 Recette restante

Sessions autorisées ADMIN, VIEWER attribué et super-admin ; refus et révocations réels ; PDF avec dossier dédié ; rattachements et publication médias sur environnement de recette ; intégration du site public. Ni session fabriquée ni changement de droits pour simuler un contrôle.

Les écritures métier se testent sur fixtures/environnement prévu. Aucun contenu de démonstration, fichier test, charge ou suppression en production sans instruction distincte. La présente intervention est documentaire.

## 17. Livraison, retour arrière et limites

### 17.1 Composition

Sources : `app/dashboard/site-web`, `components/site-web`, `app/api/site-web`, `lib/site-web`. Dépendances : proxy, politique de routes, droits/sessions, Sheets, Drive, audit et limites PDF. Préserver Utilisateurs, neuf KPI, saisons et correctifs CPU/sécurité parallèles.

Pour la livraison conservatrice, employer l’adaptateur validé de livraison, pas le brouillon C2. Exclure secrets, caches, `.next`, fixtures temporaires et polices simulées. Une publication ultérieure demande sa propre instruction ; ce document ne déclenche pas de push.

### 17.2 Retour arrière

Conserver S1 et F1. Un retour aveugle peut réélargir VIEWER ou remettre l’ID du classeur supprimé. Si des URLs médias sont déjà dans Sheets, préserver la route de lecture et ses protections même en retirant les nouveaux écrans. Préférer correction ciblée de l’interface. Aucun effacement de fichiers, lignes ou historiques pour restaurer une présentation.

### 17.3 Limites et sujets distincts

| Sujet | État / décision |
|---|---|
| Dossier PDF | Manquant localement au dernier constat, production à confirmer |
| Synchronisations externes | Existence globale non établie ; absence dans le dépôt ≠ absence réelle |
| C2 | Différé, non repris dans ce lot |
| Multi-instance | Pas de verrou distribué ni transaction Sheets/Drive/audit |
| Conflits de fiche | Pas de contrôle optimiste de version |
| Fichiers orphelins | Nettoyage non implémenté, chantier séparé |
| Rich text / HTML | Non implémenté, texte simple échappé |
| SEO, slug, traduction, textes alternatifs dédiés | Pas de colonnes ajoutées ; besoin à spécifier avant extension |
| Validation éditoriale multi-niveaux | Non implémentée, décision métier nécessaire |
| Dimensions/recadrage/compression images | Pas de traitement serveur constaté |
| Suppression / drag-and-drop | Non implémentés, ordre numérique et archivage existants |
| Autre site public | Contrat défini, intégration réelle à confirmer |
| Gain CPU Vercel | Aucun chiffre établi ici |

Ces sujets ne constituent ni des défauts automatiquement démontrés ni une autorisation de les développer.

## 18. Sources et responsabilités

- [Documentation du module](interfaces/administration-site-web.md).
- [Mappings des classeurs](mappings/google-sheets-workbooks.md).
- [Rapport et preuves Site Web](implementation/site-web-unifie-2026-10-23.md).
- [Publication Site Web et saisons](implementation/publication-site-web-saisons-2026-10-24.md).
- [Canevas CPU](implementation/audit-cpu-suivi-2026-10-22.md).
- [Accueil actuel : preuve navigateur](interfaces/site-web-blocs-2026-10-25/browser.json), [ordinateur](interfaces/site-web-blocs-2026-10-25/site-web-desktop.png), [mobile](interfaces/site-web-blocs-2026-10-25/site-web-mobile.png).
- [Validation des listes](interfaces/site-web-listes-2026-10-25/validation.json).
- Sources lues : schéma, validation, content, http, media, upload-tokens, client-upload ; content-manager, gallery-photos, content-page ; routes médias/uploads ; accueil et politique d’autorisation.

**Métier COC :** exactitude des contenus, distinctions factuelles, décision de publication, habilitations. **Administration technique :** accès Google, dossiers dédiés, secrets et exploitation selon les procédures existantes. **Développement :** schémas cohérents, contrôles serveur, tests, documentation et livraison préservant la sécurité. **Équipe du site public :** contrat de lecture et dépublication. Ce sont des responsabilités, pas de nouvelles délégations de droits ni des personnes nommées.

Toute évolution du schéma, de la publication, des permissions ou du design met à jour cette référence, en distinguant proposé, implémenté, vérifié localement, publié et observé en production.

## Addendum — insertion des contenus du 25 octobre 2026

Correction locale : création par identifiant métier à la première ligne admissible, sans compter formats/validations/FALSE booléens comme des fiches. Une ligne sans ID mais contenant une autre donnée ou formule reste protégée. L’insertion atomique conserve les données concurrentes en décalant les lignes ; recherche fraîche de l’ID pour les modifications Site Web. Le lecteur conserve les positions physiques avant filtrage. Cela couvre les neuf ressources dont photos ; ne modifie pas les autres append par défaut et ne réactive pas C2. Les limites d’unicité distribuée, de modification inter-instance en vol et les coûts de lectures supplémentaires subsistent. Voir [cause, tests, migration proposée et preuves](implementation/site-web-insertion-2026-10-25.md). La date publication reste distincte de la date mentionnée dans le texte. L’actualité n’a pas été déplacée.
