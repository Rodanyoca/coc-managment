# Communiqués sans image — 28 octobre 2026

## Changement local

Le seul média d'un communiqué est son document PDF associé via `id_document_public`. `image_url` est retiré du schéma de `communiques`. Les composants d'administration génériques dérivent de ce schéma : pas de miniature/colonne Visuel en liste, pas de champ/image au détail ni en création/modification. Le site public n'utilisait déjà pas d'image de communiqué et son DTO n'en contient pas.

Le lecteur du SaaS ne requiert plus cet en-tête et ne renvoie plus les anciennes valeurs. Les créations et mises à jour n'écrivent plus ce champ. Une requête ancienne contenant une image, un fichier ou un jeton d'image est refusée. L'ancienne route média est 404 avant lecture Sheets/Drive, y compris pour un administrateur. Un ancien jeton d'upload fragmenté ne permet plus de poursuivre son transfert. Les fichiers Drive historiques restent intacts.

Autres ressources inchangées : images des sliders, actualités, événements, athlètes et galeries conservées. La relation documentaire, les contrôles de publication/permission, les refus VIEWER, les droits frais, la journalisation, l'idempotence et les protections PDF restent en place.

Fichiers applicatifs : `lib/site-web/schema.ts`, `validation.ts`, `content.ts`, `app/api/site-web/uploads/route.ts`. Tests adaptés dans `tests/site-web/content.test.mjs` et `http-media.test.mjs`. Le test de contrat identifie explicitement l'écart avec la photographie historique d'en-têtes, qui n'a pas été réécrite comme si elle était récente.

## Classeur : retrait préparé, non exécuté

Classeur `1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM`, feuille `COMMUNIQUES_SITE`, sheetId `1810000001`. Observation directe : colonne G = `image_url` ; lecture bornée G1:G1001 = en-tête seul, aucune valeur affichée dans les lignes métier. Les autres colonnes et les données métier ne doivent pas être modifiées.

**Ordre indispensable : publier d'abord le code compatible, puis supprimer la colonne.** Le code actuellement publié conserve l'ancien schéma qui requiert `image_url` et vérifie tous ses en-têtes avant lecture. Supprimer la colonne immédiatement pourrait rendre les lectures de communiqués indisponibles pour cette version. Aucun push/déploiement n'est autorisé dans ce lot : la suppression physique est donc différée, pas déclarée réalisée.

Requête préparée dans `communiques-sans-image-2026-10-28/retrait-colonne.prepare.json`. Avant de l'appliquer après publication : relire les en-têtes et les métadonnées de cellules, vérifier que G est toujours `image_url`, sauvegarder les éventuelles valeurs nouvelles en dehors du dépôt, puis supprimer uniquement cette dimension. L'inspection de métadonnées de cellules via le connecteur a échoué sur le binding des arguments ; seule la lecture de valeurs a abouti. Ce contrôle devra être refait avant l'écriture. Aucune requête d'écriture envoyée au classeur.

Après retrait : vérifier les en-têtes restants par nom et confirmer l'identité/contenu/statut/mise à la une/ordre/référence PDF de chaque enregistrement, puis tester création/modification et affichage sur la nouvelle version sans écriture métier de test non autorisée. Ne pas supprimer de fichier Drive.

Retour arrière : conserver le nouveau code compatible avec les deux formes du classeur. Un retour au schéma applicatif qui exige l'image nécessite de restaurer d'abord la colonne au bon endroit ; ne pas faire un rollback global annulant les protections de sécurité ou les optimisations CPU.

## Vérifications

Résultats et journaux dans `communiques-sans-image-2026-10-28/validation.json`. 30 tests Site Web réussis, dont suppression de champ/lecture/écriture, refus des uploads anciens, route média 404, conservation de la relation PDF et des images des autres rubriques, concurrence et permissions. TypeScript et lint ciblé réussis. La recette Chromium isolée et le build normal sont décrits ci-dessous à leur clôture ; pas de prétention de validation authentifiée en production. Aucun gain CPU Vercel annoncé.
### Clôture des vérifications de ce lot

- Tests : **30/30**, journal conservé.
- TypeScript : exit 0 (62,6 s écoulées sur ce poste).
- Lint ciblé : exit 0 (115 s écoulées).
- Build normal Next 16.3.4 / vraies polices : non validé, délai de 240 s dépassé pendant « Creating an optimized production build », sans erreur TypeScript ou applicative démontrée. Ne pas assimiler cette durée à du CPU runtime Vercel.
- Navigateur : non validé. Première copie synthétique : refus réseau EACCES sur téléchargement des polices Google puis aperçu indisponible ; elle a été fermée explicitement. Deuxième tentative ciblée avec deux attentes de 30 s : aperçu toujours indisponible, fermeture et nettoyage de sa route synthétique par son propre script. Aucun serveur utilisateur arrêté, aucune session authentifiée fabriquée. Aucune capture déclarée réussie.
- La vérification de l'absence du champ dans ajout/détail/liste est établie par le schéma partagé et les tests serveur ; la recette visuelle reste à confirmer sur un environnement disponible.

La composition n'est pas déclarée prête à publier tant que le build et la recette visuelle n'ont pas abouti. La suppression physique de la colonne G reste préparée et différée jusqu'au déploiement d'une version compatible ; aucune écriture du classeur exécutée. Les valeurs observées étaient vides sous l'en-tête ; aucun fichier Drive supprimé.
## Validation finale avant push

Le 28 octobre 2026, composition reprise dans un checkout main propre, sans C2 ni modifications de coc-website : 92/92 tests ciblés, TypeScript, lint ciblé et build de production normal réussis. Build : 378,988 s écoulées, 11 polices woff2 réelles, ignoreBuildErrors=false. Aucun gain CPU runtime déduit de cette durée. Voir publication-saas-2026-10-28.md et son dossier de preuves. La recette visuelle authentifiée et la migration de colonne restent distinctes et non exécutées. La conclusion de blocage du premier essai ci-dessus est historique : le blocage de build est levé.
