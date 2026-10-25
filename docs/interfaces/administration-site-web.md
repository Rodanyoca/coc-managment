# Administration du Site Web COC

**Référence détaillée :** [Cahier des charges de la section Site Web](../cahier-des-charges-section-site-web.md) — périmètre, données, règles, sécurité, médias, API et recette.


## Navigation et écrans

L’entrée **Site Web** conserve les anciennes rubriques. Les huit rubriques implémentées sont Sliders, Événements, Communiqués, Actualités, Athlètes, Galeries/photos, Documents et Catégories d’actualités. Historique, Gouvernance, Jeux et Entités restent dans la navigation, sans nouveau développement de leurs écrans ni modification des feuilles correspondantes.

Chaque rubrique affiche un tableau compact avec recherche, filtres de publication/mise à la une lorsqu’ils s’appliquent, pagination de dix lignes, actions Consulter/Modifier/Archiver accessibles et bouton Ajouter en haut à droite. L’archivage se confirme par l’enregistrement du statut Archivé dans le panneau. Miniature (logo pour les événements), titre, dates, type/sport/distinction, statut, ordre et mise à la une sont affichés selon le bloc, sans identifiants techniques dans les formulaires.

Les formulaires s’ouvrent à droite dans le composant Sheet existant ; pleine largeur sur mobile, contenu défilant et pied Annuler/Enregistrer accessible. Les champs sont répartis entre Contenu et Dates/publication. Fermer un formulaire modifié demande confirmation ; une erreur conserve la saisie et les fichiers sélectionnés. Pas de rafraîchissement global du dashboard : le résultat confirmé remplace la ligne concernée dans l’état client. Actualiser relit uniquement la rubrique courante.

Le contenu long utilise Textarea et reste du texte simple, rendu échappé par React, y compris en consultation détaillée. Aucun HTML n’est exécuté. Les liens sont validés et les nouveaux fichiers sont envoyés via la fonction dédiée, jamais collés comme identifiants Drive arbitraires.

## Source et relations

Source unique : `10_SITE_WEB_CONTENUS`, ID `1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM`, déclaré dans `lib/site-web/config.ts`. Ce choix remplace l’ancien ID `1Amc-shqO9U-coS3Oyz0j_EXLZqK5lJHpI0tvF3w51Ew`. Le classeur supprimé `11_SITE_WEB_DONNEES_PUBLIQUES` n’est pas une source applicative. Aucune lecture des statuts Site Web dans Référentiel.

Le mapping de `lib/site-web/schema.ts` correspond aux en-têtes réels observés le 23 octobre 2026. Aucun onglet ou colonne ajouté. Les sélecteurs affichent les titres/libellés et enregistrent uniquement les IDs : catégorie d’actualité, galerie associée et document public de communiqué.

- Communiqué : extrait court, texte intégral, image facultative. Sélectionner un document public vide le lien direct de compatibilité ; aucun PDF dupliqué, aucune double saisie imposée. Un document en brouillon peut être préparé avant le communiqué, mais le communiqué publié exige un document lié PUB002.
- Actualité : une seule fiche alimente la liste publique et éventuellement l’accueil via `est_mis_en_avant`. Galerie facultative par ID ; publication de l’actualité refusée si la galerie choisie n’est pas publiée.
- Athlète public : nom, sport, photo et distinction factuelle ; aucune déduction de récompense/olympisme. Aucune lecture des acteurs métier, passeports, coordonnées ou documents privés pour remplir ces fiches. `id_athlete_public` n’est pas un ID d’acteur sportif.
- Galerie : photos chargées seulement à sa consultation. Une photo correspond à une ligne `MEDIAS_GALERIE_SITE` liée par `id_galerie`, avec sa légende, son crédit et son ordre. Les nouveaux médias sont de type PHOTO ; pas de module vidéo. L’envoi multiple indique chaque réussite/erreur ; réessayer ne réenvoie pas les photos déjà enregistrées.
- Événement : logo distinct de l’illustration, date de fin facultative, statut/ordre/mise à la une indépendants ; aucune activité métier créée dans un autre classeur.
- Catégorie : contrôle des doublons normalisés (casse/espaces). Pas de suppression implémentée, donc aucune rupture de référence par DELETE. Galerie et document ne peuvent pas être dépubliés tant qu’une actualité/un communiqué PUB002 les référence.

## Publication et médias

Les statuts viennent de `STATUTS_PUBLICATION` dans ce classeur : PUB001 Brouillon, PUB002 Publié, PUB003 Archivé. L’éligibilité utilise les IDs, jamais une comparaison approximative des libellés. La mise à la une ne publie pas une fiche. Les dates sont des dates civiles ISO et les décisions courantes utilisent Africa/Kinshasa.

Nouveaux fichiers : images JPEG/PNG/WebP/GIF de 5 Mo maximum, PDF de 25 Mo maximum selon les limites Documents existantes. Les signatures binaires sont vérifiées côté serveur ; SVG refusé. L’envoi est découpé en fragments de 3 Mio vers une session Drive privée : pas de corps HTTP de 25 Mo, pas de base64/binaire dans Sheets. Les autorisations d’envoi signées lient utilisateur, ressource, fiche, champ, taille/type et expiration (une heure). Les octets complets, métadonnées, permissions et dossier sont vérifiés avant d’autoriser le rattachement.

Les URLs enregistrées pointent sur le SaaS : `/api/site-web/media/{resource}/{id}/{champ}?file={id_drive}` à l’origine configurée. Ce serveur vérifie en lecture fraîche la ligne et sa publication, puis le dossier Site Web, le partage privé, le type et la taille du fichier **avant** de télécharger les octets. Une URL fabriquée dans Sheets ne transforme pas cette route en proxy des fichiers métier privés. Les photos héritent du statut de leur galerie. Une session AUT-COM READ valide peut prévisualiser un brouillon ; un anonyme reçoit 404. Une panne de source refuse la lecture, sans repli périmé.

Les réponses médias portent `private, no-store`, `nosniff` et un CSP restrictif ; les médias éligibles à la lecture publique autorisent CORS sans credentials. `download=1` demande un téléchargement. Aucun partage `anyone` créé, aucune suppression automatique d’ancien fichier potentiellement partagé. Les médias interrompus ou envoyés sans enregistrement de fiche peuvent rester privés dans le dossier : nettoyage éventuel séparé, après vérification des références et de l’audit.

**Compatibilité** : les URLs externes/directes déjà présentes restent conservées tant qu’elles ne sont pas remplacées. Un ancien lien Drive déjà public ne peut pas être rendu privé rétroactivement par cette intervention ; le site public doit toujours respecter le statut de sa fiche. Les nouveaux PDF ne sont jamais rendus publics par l’upload seul.

## Variables et sécurité

`.env.example` documente les variables sans valeurs : credentials Sheets/USERS et Drive OAuth existants, `GOOGLE_DRIVE_SITE_WEB_SLIDERS_FOLDER_ID` pour le dossier d’images existant, `GOOGLE_DRIVE_SITE_WEB_IMAGES_FOLDER_ID` facultatif pour un autre dossier privé et `GOOGLE_DRIVE_SITE_WEB_DOCUMENTS_FOLDER_ID` pour les PDF du Site Web. Le dernier doit être distinct de `GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID` et des dossiers privés des acteurs. L’origine des URLs médias est `SITE_WEB_MEDIA_BASE_URL`, facultative, par défaut `https://database.coc-rdc.net`. Aucun secret changé ni nouvel ID de classeur introduit dans l’environnement.

Les handlers et pages vérifient les droits AUT-COM READ/WRITE. Le proxy couvre les nouvelles rubriques ; seule la forme précise de l’URL média accepte les GET/HEAD anonymes, avec ses contrôles dans le handler. VIEWER ne peut pas écrire, même marqué super-admin. Pas de modification de S1, F1, des TTL de sécurité ou des droits des autres blocs. Les mutations en attente recontrôlent les droits frais avant leur exécution.

Les mutations de fiches et les débuts/achèvements d’envoi sont journalisés dans le journal existant. Pas de token/session d’upload, secret, contenu de fichier ou donnée privée dans l’audit. Une clé `x-request-id` stable accompagne chaque soumission ; les réussites déjà journalisées sont refusées en replay. Les IDs serveur dérivent d’une empreinte utilisateur/ressource/requête, indépendamment du nombre de lignes.

La file de mutations est partagée via globalThis dans un processus Node, pas entre toutes les instances. Google Sheets ne fournit pas de transaction entre précontrôle de relation, écritures, Drive et audit : une réponse perdue ou un échec tardif peut suivre une écriture réussie. Recharger la rubrique avant toute nouvelle tentative incertaine. Aucune garantie d’unicité distribuée ou de rollback transactionnel n’est revendiquée. Les doublons d’ID présents sont détectés et bloquent le traitement.

## Contrat pour le site public (autre dépôt inchangé)

1. Lire ce seul classeur, avec les en-têtes documentés ; ne pas utiliser les API d’administration authentifiées comme un flux public.
2. Afficher uniquement PUB002. Pour les sliders, respecter début/fin inclusifs ; pour actualités/communiqués, ne pas anticiper `date_publication`. La référence du jour est Africa/Kinshasa.
3. Appliquer `est_mis_en_avant` après l’éligibilité, puis `ordre_affichage`. Une fiche reste unique entre accueil et rubrique.
4. Résoudre catégorie, galerie et document par ID. Une galerie/document absent ou non PUB002 ne doit pas être exposé par un parent publié ; omettre ce lien ou refuser la fiche selon le besoin public. Ne jamais suivre des liens vers les documents privés du SaaS.
5. Lire les photos seulement pour la galerie demandée, type PHOTO, et seulement si cette galerie est publiée. Utiliser les légendes/crédits individuels.
6. Utiliser les URLs des images/PDF (les nouvelles pointent sur les médias contrôlés). Pas de credentials d’administration dans le navigateur public. Les textes sont du texte brut : les échapper, sans injection HTML. Aucun changement au site public n’a été effectué ici.

Voir le [rapport et les preuves de validation](../implementation/site-web-unifie-2026-10-23.md).


### Harmonisation des listes — 25 octobre 2026

Les huit listes utilisent désormais les conventions des tableaux Utilisateurs et du référentiel : barre de recherche et Select/Checkbox du système, en-tête bg-muted/70, titre consultable, miniatures 56 × 40 et emplacement discret sans image, badges secondary/outline, actions compactes alignées et pagination dans le pied du tableau. Sur mobile, les filtres occupent la largeur disponible et le tableau défile horizontalement dans sa carte. Les états vides et les erreurs restent accessibles.

Fichier applicatif modifié : components/site-web/content-manager.tsx. Le panneau de fiche, les mutations, les chargements, les droits et la journalisation restent identiques. Aucun changement serveur, aucune lecture supplémentaire, aucun changement de cache ou de source Sheets. Les modifications parallèles sont préservées, C2 demeure différé pour toute livraison.

Validation locale : ESLint réussi ; 15/15 tests Site Web ; 35 captures/parcours sur fixtures (1440 et 390 px), aucune erreur JavaScript ni débordement de page ; consultation, modification, confirmation de fermeture, erreur 503, lecture seule, photos à la demande et reprise des échecs partiels. Captures dans docs/interfaces/site-web-listes-2026-10-25. Aperçu de développement avec police de repli lorsque Google Fonts était inaccessible ; le build normal est vérifié séparément sans police simulée. Aucune recette authentifiée ni écriture de production. Aucun push ou déploiement de cette refonte.

Contrôles finaux : build normal réussi avec les vraies polices et TypeScript séparé réussi (exit 0). Seul avertissement de build : lockfile parent ignoré hors du checkout Git isolé ; aucune configuration modifiée pour le contourner. Preuves build/tests/TypeScript dans le dossier de captures.

### Accueil Site Web — correction du périmètre visuel
La page /dashboard/site-web elle-même utilise désormais une liste/table des douze rubriques, à la place des grandes cartes : icônes neutres, noms alignés, descriptions, statuts discrets et accès par chevron. Sur mobile, les descriptions sont masquées et le statut figure sous le titre. Aucun changement des destinations ni des droits. Fichier : app/dashboard/site-web/page.tsx. Deux captures du composant réel en aperçu isolé, ordinateur/mobile, sans débordement ni erreur JS (docs/interfaces/site-web-accueil-2026-10-25). Le serveur localhost:3000 répond ; la requête sans session est redirigée vers /login, donc sa vue authentifiée n’est pas prétendue vérifiée. Aucun redémarrage du serveur utilisateur.

### Accueil minimaliste en blocs — 25 octobre 2026
La variante en tableau est remplacée à la demande utilisateur par des blocs compacts regroupés en « À publier », « Vos ressources » et « Le Comité ». Icônes sans pastille, descriptions courtes, fond discret, accent doré au survol, aucun badge Disponible ni bouton répété. Quatre colonnes sur grand écran et deux sur mobile. Les douze destinations et la mention À configurer sont conservées. Seul app/dashboard/site-web/page.tsx change pour cette itération ; aucun appel serveur ajouté. Deux captures du composant réel dans un aperçu isolé, douze liens vérifiés, aucun débordement ni erreur JavaScript. Preuves : docs/interfaces/site-web-blocs-2026-10-25. Sans session authentifiée, sans push ni déploiement.

### Insertion des lignes — 25 octobre 2026
Les neuf ressources, photos incluses, demandent un placement par ID dans la première ligne admissible. Seuls les FALSE des colonnes booléennes déclarées sont ignorés ; toute autre donnée ou formule protège une ligne sans ID. L’insertion et le remplissage utilisent un batch atomique avec conservation formats/validations, sans écraser les cellules concurrentes ; les lignes suivantes peuvent être décalées. Les modifications Site Web recherchent désormais leur ID en lecture fraîche. Autres blocs inchangés par défaut, C2 toujours différé. Limites inter-instances et proposition non exécutée de déplacement de l’actualité : [rapport détaillé](../implementation/site-web-insertion-2026-10-25.md). Aucun changement automatique de date.
