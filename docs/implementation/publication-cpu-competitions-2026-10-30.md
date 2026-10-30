# Livraison Git du lot CPU Compétitions — 30 octobre 2026

Préparation à la demande explicite de push, sur un checkout isolé de main au SHA `e6dbe7109fba06ab48b4a4131bc809cabcf1a1d2`. Les trois fichiers applicatifs avant correction correspondent exactement à cette base ; les trois fichiers après correction correspondent aux empreintes de la validation locale. Aucun conflit, changement de contrat ou nouvelle dépendance.

Composition : CP1 filtrage avant projection ; CP2 index locaux de membres et délégations ; CP3 options limitées aux besoins de la liste. Trois fichiers applicatifs, deux outils synthétiques, sept tests et documentation/preuves. Aucune modification de `lib/google`, de l'authentification, des permissions, des écritures ou du cache du site public. Le profil conservateur de main est préservé ; C2 et les autres travaux du workspace ne sont pas repris.

Le [rapport d'analyse](audit-cpu-competitions-2026-10-30.md) et ses preuves constituent une photographie de l'analyse et de la validation **avant cette demande de publication**. Ses mentions « non publié » décrivent cette étape historique. Le présent rapport décrit la composition de livraison, sans présenter un push comme une preuve de déploiement READY.

Contrôles de référence : 81 comparaisons de services et 100 cas de délégations, 57/57 tests CPU, TypeScript, lint et build normal local réussis avec 11 vraies polices. Suite générale 316/325, mêmes neuf échecs avant/après. Navigateur synthétique ordinateur/mobile : 14 contrôles, zéro erreur, un GET unités par visite. Aucun gain CPU Vercel démontré et aucune recette authentifiée de production.

Sur le checkout main de livraison, les 57 tests CPU sont rejoués avec le profil Google conservateur de main. Les transformations Compétitions sont identiques aux sources compilées précédemment ; le build local antérieur était celui du workspace d'analyse, pas une nouvelle mesure du déploiement Git. Les contrôles TypeScript et lint ciblé de la composition sont consignés dans les preuves `push-*`.

Le push fast-forward main utilise l'intégration Vercel existante ; aucun déploiement CLI additionnel. Vérifier ensuite séparément l'état READY et l'alias avant de qualifier la version de servie. Les preuves après push resteront locales afin de ne pas déclencher un second déploiement documentaire.

Retour arrière ciblé : préférer le revert de ce commit de livraison ou le patch `audit-cpu-competitions-2026-10-30/rollback.patch` après vérification de son contexte. Il retire ensemble la fonction de références et son appel, conserve S1/F1 et le profil conservateur de main. Aucune migration ou restauration de données Sheets/Drive n'est nécessaire.
