# Navigation conservée pendant une indisponibilité — 30 octobre 2026

Correction locale limitée à `coc-managment`, sans push ni déploiement.

## Comportement

La page `/service-indisponible` réutilise Sidebar et Header. Le message « Service momentanément indisponible » occupe le contenu central. Sur mobile, le bouton Menu ouvre la même navigation dans un panneau. Les liens de ce parcours ne préchargent pas les rubriques pendant la panne.

Une erreur 503 du proxy conserve le chemin et les paramètres de la rubrique demandée dans `retour`. Réessayer revient à cette rubrique plutôt que systématiquement à Compétitions. La destination est limitée à `/dashboard` et ses sous-routes ; destinations externes, chemins normalisés hors périmètre, valeurs multiples, retours ligne et antislashs sont refusés. Les réponses API restent des erreurs JSON ; 401, 403 et activation ne changent pas de politique.

## Menu d'affichage, distinct des autorisations

Après un contrôle réussi d'une page dashboard, le proxy signe un cookie `coc_navigation` avec les seuls blocs lisibles et le marqueur de menu super-admin valide. Il réutilise les autorisations déjà lues : aucune requête Google supplémentaire. Le cookie est HttpOnly, SameSite=Lax, Secure en production et expire avec la session. Il contient une empreinte de la session, une échéance et des indicateurs de menu, sans nom, adresse ou donnée métier. La signature HMAC a un préfixe de finalité distinct de la session.

La page d'erreur vérifie le jeton de session, la signature, l'empreinte et l'échéance, **sans relire la source en panne**. Ce dernier menu confirmé sert uniquement à l'affichage ; tous les droits WRITE du modèle d'affichage sont faux. Il n'est jamais consulté pour autoriser une page, une API ou une mutation. Un compte révoqué, une panne source ou une absence d'attribution restent contrôlés fraîchement par le proxy. Le cookie n'est pas un substitut à une session et ne fonctionne pas avec une autre session ou après son expiration.

Si aucun menu confirmé n'est disponible (premier accès, cookie absent/altéré, session perdue), la barre reste présente avec Tableau de bord uniquement ; aucune rubrique privilégiée n'est inventée. Une reconnexion ou rotation de session rend l'ancien affichage inutilisable. Les pages normales gardent leurs règles et leurs préchargements existants.

## Validation

- Sept tests unitaires ciblés : intégrité, échéance, liaison à la session, refus de WRITE, super-admin incohérent VIEWER, destination de reprise et contrats d'erreur existants.
- Suite CPU : 58/58, dont un scénario réel de proxy simulant des lectures fraîches, une panne avec menu déjà conservé, révocation et refus d'écriture VIEWER.
- Suite générale : 319/328, exactement les neuf échecs préexistants de la référence précédente. Aucun nouveau nom d'échec ; comparatif dans `.cache/unavailable-navigation-20261030/comparison.json`.
- TypeScript sans émission et sans mise à jour incrémentale : réussi. Lint ciblé : réussi.
- Navigateur : 14 contrôles à 1440 et 390 px, cinq rubriques et leurs destinations de reprise, menu filtré, repli sans contexte confirmé, zéro erreur de page. La vraie page et le vrai proxy sont compilés dans un aperçu isolé sans configuration Google ; une demande protégée est redirigée vers l'erreur et les deux GET API de vérification restent 503. Aucune écriture métier, session ou donnée de production.

Les preuves et captures synthétiques sont conservées dans `.cache/unavailable-navigation-20261030`. Le premier harnais a été corrigé pour refermer le panneau avant d'interroger un contenu rendu inaccessible par la modale et pour copier le logo public dans l'aperçu. Les captures finales attendent la fin du mouvement du panneau. Aucun build de production n'est revendiqué pour ce correctif : validation de types, lint, tests et compilation/exécution Next en navigateur.

## Fichiers

`proxy.ts`, `app/service-indisponible/page.tsx`, `components/dashboard/service-unavailable.tsx`, `components/dashboard/sidebar.tsx`, `components/dashboard/header.tsx`, `lib/navigation/snapshot.ts` ; tests `tests/unit/navigation-snapshot.test.ts` et `tests/cpu/unavailable-navigation.test.mjs`. `lib/auth.ts` reste exactement identique à son état avant intervention. Les travaux CPU Compétitions, C2 et les autres changements parallèles ne sont pas repris ni annulés.


## Livraison demandee apres validation

Preparation dans un checkout main isole depuis 01733bdbf22783efb4ddaa9f0a7ad72211a9870c. Les quatre fichiers applicatifs existants avant correction correspondent exactement a cette base. Les six fichiers applicatifs finaux correspondent aux sources verifiees. Les 7 tests cibles, 58 tests CPU et TypeScript passent aussi dans cette composition ; lint cible revalide sur les memes sources. Aucun changement C2, CPU Competitions, secret ou configuration Vercel. Le push main doit declencher le deploiement Git existant ; son etat READY sera verifie separement. Les mentions de validation locale ci-dessus decrivent la phase anterieure au push.
