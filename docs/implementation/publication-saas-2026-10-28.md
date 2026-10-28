# Push SaaS COC — 28 octobre 2026

## Composition

Checkout propre main depuis 29f7149570924bdb116afa368b434efb912d8b1c. Déploiement précédent servi par database.coc-rdc.net : dpl_5NcZZThbeqNZjQRHBwt8gSRWkdBn (READY, vérifié via API Vercel).

Retrait de l'image des communiqués : schéma partagé des formulaires/liste/détail, projection en lecture et écritures ; refus des images dans les requêtes et des anciens jetons d'upload. Association PDF et images des autres rubriques conservées. Quatre fichiers applicatifs et deux fichiers de tests modifiés. La comparaison de tous les fichiers applicatifs locaux avec main ne révèle pas d'autre delta fonctionnel à livrer : les écarts Sheets et tests CPU appartiennent à C2 différé et sont exclus.

D1/C1/S1/F1/A1, Utilisateurs, saisons, neuf KPI, journalisation et purges globales sont identiques à la référence publiée. Aucun changement de coc-website, de secret ou de configuration Vercel.

## Contrôles

Preuves de la composition finale dans publication-saas-2026-10-28/validation.json et journaux associés. 92 tests ciblés CPU/Site Web/livraison/Utilisateurs/paramètres passent. Les six échecs antérieurs de la suite générale restent documentés ; cette suite générale n'est pas revendiquée comme entièrement réussie. Aucune session authentifiée de production utilisée et aucune écriture métier de test. La recette visuelle de la suppression du champ reste à confirmer ; aucune structure TSX nouvelle n'est livrée.

Les résultats défavorables du premier essai (build local interrompu après 240 s et aperçu visuel indisponible) sont conservés dans le rapport communiques-sans-image-2026-10-28.md. Le présent contrôle de livraison lui succède ; les statuts antérieurs y restent historiques.

## Publication et retour arrière

Push fast-forward unique vers main via l'intégration Git Vercel ; aucun déploiement CLI supplémentaire. Le SHA final, l'état du déploiement et les contrôles anonymes seront consignés localement après push, sans déclencher de second déploiement documentaire.

Retour arrière code possible vers 29f7149570924bdb116afa368b434efb912d8b1c, qui conserve S1/F1 et les purges globales. Préférer un revert ciblé de ce commit. Tant que l'ancien schéma requiert image_url, ne pas supprimer cette colonne du classeur avant publication du code compatible. La migration physique préparée n'est pas exécutée dans cette opération Git ; si elle est exécutée ensuite, restaurer la colonne avant tout retour à l'ancien schéma. Aucun fichier Drive supprimé.

Aucun gain CPU Vercel mesuré ou annoncé. Aucun test de charge, nouvelle optimisation, changement d'offre ou modification de données de production.

## Validation finale avant push

Le 28 octobre 2026, composition reprise dans un checkout main propre, sans C2 ni modifications de coc-website : 92/92 tests ciblés, TypeScript, lint ciblé et build de production normal réussis. Build : 378,988 s écoulées, 11 polices woff2 réelles, ignoreBuildErrors=false. Aucun gain CPU runtime déduit de cette durée. Voir publication-saas-2026-10-28.md et son dossier de preuves. La recette visuelle authentifiée et la migration de colonne restent distinctes et non exécutées. La conclusion de blocage du premier essai ci-dessus est historique : le blocage de build est levé.
