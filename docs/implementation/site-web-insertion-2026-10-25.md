# Site Web — insertion dans les gabarits Sheets

Date : 25 octobre 2026. Statut : implémenté localement, sans push, déploiement ni écriture de données de production. Périmètre exclusivement coc-cible.

## Référence et cause

La demande concerne toutes les créations Site Web, y compris les photos. Elles passent par `saveContent`, puis `appendSheetRow`. L’ancien helper utilise `values.append`, plage A:Z, RAW, INSERT_ROWS. Les anciennes façades Sliders délèguent aux handlers communs ; aucun second créateur Sliders indépendant n’est à corriger. Les envois de fichiers ne créent une ligne éditoriale qu’au moment de la sauvegarde commune.

**Reproduction avant correctif :** `node --experimental-vm-modules --test tests/site-web/insertion.test.mjs` échoue avec `1001 !== 2` lorsque 999 lignes portent seulement un booléen FALSE. Ce test passe après correction.

**Observation distante, lecture seule :** `ACTUALITES_SITE!A1:O1001` contient un seul ID d’actualité, en ligne 1001. Les lignes 2 à 1000 n’ont que FALSE dans `est_mis_en_avant`. Les cellules échantillonnées ont une valeur booléenne FALSE réellement stockée et une validation BOOLEAN. Le simple format n’est pas une valeur ; les FALSE, eux, sont du contenu pour la détection de table de l’append Google. La catégorie est en ligne 2, sans gabarit booléen similaire.

Hypothèses examinées : (1) valeurs FALSE prises dans la table Google ; (2) plage d’append trop large ; (3) calcul d’index applicatif. Le test avec l’ancien helper et l’observation des cellules établissent le mécanisme (1), utilisé par la plage (2). Aucune génération d’ID à partir de la ligne 1001 : les IDs restent déterministes, indépendants du nombre de lignes.

## Rubriques vérifiées

Toutes utilisent désormais la même option de placement fondée sur leur ID de schéma. Métadonnées et trois premières lignes observées dans chacune ; inspection complète de la plage de l’actualité seulement, pas inventaire intégral de toutes les données.

| Ressource | Feuille | ID métier | Colonnes FALSE de gabarit observées |
|---|---|---|---|
| Sliders | SLIDERS_SITE | id_slide | Aucune dans l’échantillon |
| Événements | ACTIVITES_PUBLIQUES | id_evenement_public | est_mis_en_avant |
| Communiqués | COMMUNIQUES_SITE | id_communique | est_mis_en_avant |
| Actualités | ACTUALITES_SITE | id_actualite | est_mis_en_avant |
| Athlètes publics | ATHLETES_PUBLICS | id_athlete_public | est_olympien, est_mis_en_avant |
| Galeries | GALERIES_SITE | id_galerie | est_mis_en_avant |
| Photos | MEDIAS_GALERIE_SITE | id_media_galerie | Aucune dans l’échantillon |
| Documents | DOCUMENTS_PUBLICS | id_document_public | Aucune dans l’échantillon |
| Catégories | CATEGORIES_ACTUALITES | id_categorie_actualite | Aucune ; catégorie existante en ligne 2 |

STATUTS_PUBLICATION est lu, pas créé par le module. Historique/Gouvernance/Jeux/Entités restent différés ; aucun nouveau CRUD ni écriture ajouté.

## Règle d’occupation

1. Ligne d’en-têtes toujours exclue ; ID métier obligatoire à la création.
2. Toute ligne avec ID est occupée. Un ID déjà présent sert à reconnaître un retry, sans réécrire la ligne ; plusieurs occurrences du même ID provoquent une erreur.
3. Sans ID, toute donnée réelle réserve la ligne : titre, relation, date, URL, statut, ordre 0, TRUE, valeur dans une colonne inconnue ou sans en-tête.
4. Seuls blanc et FALSE dans les colonnes booléennes **explicitement déclarées par le schéma** sont ignorés. Un texte FALSE dans une autre colonne reste protégé. Les autres valeurs par défaut ne sont pas présumées jetables.
5. Lecture brute avec `valueRenderOption: FORMULA` : une formule qui calcule vide ou FALSE reste une formule à protéger. Les trous physiques ne sont pas supprimés avant le calcul du rang.
6. ID/en-têtes manquants ou ambigus refusés ; aucune réparation automatique du classeur.

## Écriture et concurrence

Le helper partagé reçoit une option `placement`, fournie uniquement par Site Web. Les autres appels append du SaaS restent inchangés ; `appendSheetRows` n’est pas modifié.

Après sélection de la première ligne admissible et relecture de cette ligne, le helper récupère le sheetId et effectue **une opération atomique `spreadsheets.batchUpdate`** :

- insérer une nouvelle ligne à cet emplacement ;
- recopier uniquement formats et validations depuis la ligne de gabarit déplacée ;
- écrire les champs déclarés par `updateCells`, `userEnteredValue.stringValue`, sans copier les valeurs du gabarit.

L’insertion physique, plutôt qu’un écrasement de cellules repérées par un ancien instantané, conserve une donnée qu’un autre écrivain aurait ajoutée entre vérification et écriture : elle est décalée avec sa ligne. Deux créateurs de deux instances distinctes choisissant le même trou conservent tous deux leurs enregistrements. Si aucune ligne réutilisable n’apparaît dans la plage retournée, l’append Google existant ajoute la première nouvelle ligne, y compris pour agrandir une grille pleine.

**Effet visible :** l’occupation du premier trou peut décaler les lignes suivantes, y compris l’actualité actuellement en ligne 1001. Il n’y a pas de compactage global, suppression de ligne ou déplacement préalable de cette actualité. Une création future devra la retrouver par ID, pas par rang mémorisé.

Une file globale au processus sérialise les placements par classeur/feuille. Les handlers conservent leur file et recontrôle des droits après attente. Les mutations passent toujours par `runSheetMutation` : pas de retry aveugle d’écriture, invalidation même après un accusé perdu, protections des générations conservées.

**Compatibilité modification :** Site Web demande désormais `fresh:true` à `updateSheetCells`. Ce mode relit en-têtes et lignes pour retrouver le rang physique de l’ID au lieu d’utiliser le cache ancien d’une autre instance après insertion. Le comportement par défaut des autres blocs reste inchangé. Un test utilise deux contextes distincts : le second a un cache antérieur à l’insertion du premier ; sa modification fraîche atteint le bon ID.

**Limites restantes :** la file mémoire n’est pas distribuée. Deux instances traitant exactement la même clé peuvent encore produire le même ID deux fois avant de se voir ; les lectures futures détectent ce doublon, il n’existe pas de contrainte d’unicité Google. L’atomicité de l’insertion n’est pas une transaction audit/Sheets/Drive. Une modification déjà en vol dans une autre instance peut encore subir un décalage entre sa recherche fraîche et son écriture ; pas de CAS ni de verrou distribué. Les écritures directes, tris/suppressions externes et références externes par numéro de ligne restent à considérer. Aucun élargissement de sécurité pour contourner ces limites.

Documentation officielle : [atomicité de batchUpdate](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate), [requêtes d’insertion, copie et écriture](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request). Cette garantie concerne les sous-requêtes du batch ; Google ne garantit pas que la feuille reste ensuite immuable face à ses collaborateurs.

## Date : constat séparé

La cellule C1001 stocke la **chaîne** `2025-03-21`, pas un numéro de série converti selon une locale. Le contenu mentionne « 21 octobre 2026 ».

Le formulaire utilise un Input date ISO, conserve sa chaîne dans l’état puis l’envoie dans `row.date_publication`. Le validateur contrôle calendrier/format/périodes sans déduire de date depuis le texte ; le stockage RAW ou stringValue ne convertit pas cette chaîne. `dateLabel` sert à l’affichage, pas à l’écriture. Africa/Kinshasa intervient dans l’éligibilité de publication, pas pour réécrire la date saisie.

Le test navigateur isolé remplit la publication avec `2025-03-21` et le texte avec « Événement le 21 octobre 2026. » : la requête PUT transmet exactement ces deux valeurs. Aucune erreur JavaScript. Cela ne prouve pas ce que l’utilisateur a saisi historiquement ni l’absence de tout autre défaut ; aucun bug de conversion n’est démontré par les preuves disponibles. **Ne modifier aucune date sans décision éditoriale.**

## Proposition de remise en place de l’actualité — non exécutée

ID : `WEB-ACTUALITES-bb935e5a8fa9467f0a32bd08681aa476`. Catégorie : `WEB-CATEGORIES-74fd779becb2edb17f0b59ec16830e59`, existante en ligne 2 de CATEGORIES_ACTUALITES.

Destination proposée au moment du constat : **ACTUALITES_SITE, ligne 2**, après relecture juste avant intervention. Les colonnes A:O sont vides hors FALSE de gabarit ; seule la ligne 1001 a un ID. Le code résout la catégorie par ID. Les dépendances externes hors application ne sont pas prouvées inexistantes.

Procédure proposée après autorisation distincte de modification des données :

1. Suspendre les saisies concurrentes concernées ; retrouver l’article par ID, car une nouvelle création peut avoir décalé son rang.
2. Relire en FORMULA et CellData les en-têtes, A:O de source/destination, validation, notes et références pertinentes ; vérifier unicité ID et existence de catégorie. Rechercher les éventuelles références externes à un rang physique avant tout mouvement.
3. Conserver une sauvegarde précise et empreinte des cellules source/destination. Préserver ID, catégorie, titre, texte, publication, mise à la une, ordre et liens sans recalculer la date.
4. Employer un déplacement de cellules borné et atomique (par exemple CutPaste validé sur l’état réel), pas une création API, ni une copie suivie d’une suppression séparée. Aucun effacement global de plage ou suppression de lignes.
5. Relire : une seule occurrence de l’ID, destination complète identique à la source sauvegardée, source libérée par le déplacement, catégorie et autres enregistrements inchangés. Contrôler la fiche et l’affichage public, puis actualiser les caches nécessaires selon procédure d’exploitation autorisée.
6. En cas de divergence, arrêter et restaurer seulement les cellules sauvegardées après contrôle de l’absence d’écriture concurrente. Pas de suppression improvisée d’un prétendu doublon.

**Aucune étape d’écriture de cette procédure n’a été effectuée.** La lecture seule ne constitue pas une autorisation de déplacer les données.

## Tests et contrôles

`tests/site-web/insertion.test.mjs` : 14 tests ciblés sur le véritable adaptateur Sheets, dépendance Google simulée. Cas : 999 FALSE et ligne 2 ; neuf ressources ; grille vide/pleine ; formats sans valeurs ; lignes incomplètes ; TRUE/0/statut ; formules ; colonnes inconnues/sans libellé ; trous et mise à jour après décalage ; même ID/retry/IDs doublonnés ; 12 créations simultanées ; accusé perdu ; auteur extérieur avant relecture ; deux instances choisissant le même trou ; donnée arrivant après relecture ; modification fraîche avec ancien cache d’une autre instance ; ancien append sans option inchangé.

`tests/site-web/content.test.mjs` vérifie pour chaque ressource que la création transmet son ID et ses colonnes booléennes et que la modification demande une recherche fraîche. Les tests existants couvrent toujours références, confirmation, autorisations, idempotence, médias privés et révocation pendant attente.

Composition isolée : `.cache/site-web-20261023/checkout`, dépendances physiques, **profil de livraison conservateur** maintenu. Le workspace principal conserve le brouillon C2 et les travaux UI parallèles. Seules les fonctions modifiées sont reportées dans l’adaptateur isolé ; aucune copie globale du brouillon C2 vers la livraison.

Résultat ciblé final : **114/114** dans cette composition. ESLint ciblé réussi. Build normal et TypeScript final : résultat à consigner ci-dessous après achèvement. Navigateur : date saisie/transmise identique, zéro erreur, fixtures uniquement ; aucune session authentifiée de production ni écriture Google de test.

Résultats intermédiaires conservés : test initial rouge 1001/2 ; deux assertions de fixture corrigées (prototypes des objets VM, plage A2:Z simulée) ; premier TypeScript interrompu par suppression concomitante de la route temporaire de preview, puis rejoué séquentiellement. Le run large depuis le workspace principal donne 110/112 : deux tests exigent les purges globales mais rencontrent le brouillon C2. Les deux mêmes échecs sont reproduits sur l’adaptateur principal avant ce correctif reconstruit sans les ajouts d’insertion ; ils ne sont pas masqués. La composition conservatrice passe ces tests.

Pas de nouveau run de toute la suite générale 325 tests pour ce lot ; ses six échecs antérieurs restent référencés dans le rapport Site Web précédent, sans prétendre à une suite générale verte ici.

## Coût, fichiers et livraison

Le chemin protégé ajoute lectures fraîches du contenu brut, de la ligne candidate et du sheetId par rapport à l’append simple ; il privilégie la non-destruction et la cohérence. La lecture couvre les colonnes utilisées de la feuille pour protéger aussi les données hors schéma. Chaque création dans un trou insère une ligne : les gabarits ne sont pas compactés et leur nombre peut croître. Aucun gain CPU Vercel annoncé.

Fichiers applicatifs : `lib/site-web/content.ts`, ajouts optionnels dans `lib/google/sheets.ts`. Tests : `tests/site-web/insertion.test.mjs`, adaptation de `tests/site-web/content.test.mjs`, métadonnées optionnelles de la fixture `scripts/cpu-audit/fixtures.mjs`. Documentation et preuves dans ce dossier, cahier des charges et interface du module. Les autres append/update ne demandant pas les options conservent leur chemin existant.

Une future livraison doit isoler ces ajouts du brouillon C2 déjà présent dans le fichier partagé et préserver D1/C1/S1/F1/A1, les saisons, Utilisateurs, neuf KPI et la journalisation. Retour arrière ciblé : enlever les options Site Web et leurs helpers, en acceptant le retour du défaut d’append ; ne pas annuler les règles de sécurité ou revenir au classeur supprimé. Les données déjà enregistrées par ID restent lisibles après retour arrière. Aucun rollback des données automatique.

Preuves : [source observée](site-web-insertion-2026-10-25/source-observation.json), [neuf ressources](site-web-insertion-2026-10-25/resources-observed.json), [date navigateur](site-web-insertion-2026-10-25/browser-date.json).

### Clôture des contrôles

Version finale : **114/114 tests ciblés, ESLint exit 0, build normal exit 0, TypeScript séparé exit 0**. Aucun artefact de police simulée ni route de fixture conservé dans le build. Préfixe et suffixe de l’adaptateur isolé comparés au profil conservateur publié : identiques hors des fonctions ciblées. Preuves et empreintes dans [validation.json](site-web-insertion-2026-10-25/validation.json). Aucun push, déploiement ou déplacement de données.
