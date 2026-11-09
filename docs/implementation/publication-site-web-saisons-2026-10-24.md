# Publication Site Web et saisons - 24 octobre 2026

Composition preparee depuis les 375 sources applicatives figees et validees le 23 octobre. Verification avant commit : aucune derive de ces sources ; seules les fins de ligne equivalentes ont ete conservees pour les fichiers inchanges. Le checkout de livraison part de main cd9f29fbdfba9d35a60af358041dd8ad852c1173.

Inclus : administration Site Web (huit rubriques), classeur unique 1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM, medias prives controles selon publication, parametrage des saisons. Les evolutions Utilisateurs, neuf KPI et D1/C1/S1/F1/A1 precedemment publies sont conserves. C2 est exclu : lib/google/sheets.ts est identique a main, purges globales conservees.

Validation : 100/100 tests cibles rejoues dans ce checkout ; sources equivalentes a celles du build normal reussi (85 s, vraies polices), TypeScript et lint reussis. Suite generale : 319/325, six echecs preexistants documentes dans le rapport Site Web. Captures ordinateur/mobile sur fixtures, pas de recette authentifiee de production ni d'ecriture de test. Aucun gain CPU Vercel revendique.

Limite de configuration : GOOGLE_DRIVE_SITE_WEB_DOCUMENTS_FOLDER_ID doit designer un dossier PDF public dedie mais prive dans Drive. Non configure localement ; aucun dossier metier prive utilise en repli. Pas de modification des secrets ou de Drive dans cette livraison.

Reference avant publication : cd9f29fbdfba9d35a60af358041dd8ad852c1173, dpl_EGA6j7Qwf4euUNywAXRj8KehA4z3, alias database.coc-rdc.net. Publication par un seul push main et integration Git Vercel, sans deployment CLI supplementaire.

Retour arriere : conserver S1 et F1. Preferer une correction ciblee des nouvelles interfaces ; ne pas retablir l'ancien mapping du classeur supprime. Si des medias sont enregistres, conserver leur route de lecture et son controle de publication. Aucun effacement de fichiers, historiques ou lignes Sheets.

Le SHA final, l'etat Vercel et les controles HTTP apres push seront consignes dans les preuves locales de publication ; ce document prepare ne les presume pas acquis.

## Publication confirmee et controles du 25 octobre 2026

- Push non force effectue sur main : **21822f51acf51667d27acee3107716e3c5b06210**.
- Deployment production : **dpl_3SfWTtJqZJfDtcM7AkQQV7fXcxWk**, etat **READY**. Horodatage ready retourne par Vercel : **2026-10-23T23:33:02.905Z**. Cette date provient de Vercel et differe de la date de reprise de la verification ; elle ne doit pas etre remplacee par l'heure du controle.
- Alias relu le 25 octobre : **database.coc-rdc.net** pointe vers ce deployment et ce SHA.
- Controles anonymes : **8/8**, du **2026-10-25T16:40:14.544Z** au **16:40:21.383Z** : login 200, pages Parametres et Site Web 307 vers login, API saisons/actualites/uploads/users/documents 401.
- Journaux runtime accessibles sur **2026-10-25T16:40:00Z - 16:40:34Z** : commande reussie, **0 enregistrement retourne**, sans intervalle exclu. Ce resultat ne demontre pas l'absence d'erreurs hors de cette fenetre ou dans une recette authentifiee.
- Aucun second deployment lance. Lecture initiale des logs build interrompue par expiration du controle automatique d'autorisation ; etat READY et absence d'erreur de deployment confirmes ensuite par API Vercel.
- Recette authentifiee et envois Drive reels non effectues. Configuration du dossier PDF dedie restant a confirmer avant son usage. Aucun gain CPU Vercel mesure ou annonce.

Cette cloture et les preuves post-publication restent locales pour ne pas declencher un deployment redondant de documentation.
