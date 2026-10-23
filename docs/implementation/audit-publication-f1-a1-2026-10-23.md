# Publication F1/A1 — 23 octobre 2026

Composition autorisée : F1, A1, interfaces Utilisateurs et neuf KPI. D1/C1/S1 et journalisation conservés. C2 différé : les purges globales des caches bruts restent actives. Aucun nouveau lot.

Référence précédente : e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964, déploiement dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx, alias database.coc-rdc.net. Checkout isolé .cache/cpu-delivery/release ; travaux parallèles du workspace préservés.

Les 744 empreintes du candidat correspondent au manifeste validé ; aucune dérive applicative. Contrôles réutilisés sur sources identiques : build normal 315746 ms avec onze vraies polices, TypeScript et lint réussis (un avertissement préexistant), 53/53 tests CPU, 3/3 UI Utilisateurs, 23/23 permissions, neuf KPI vérifiés. Suite complète : 319/325, exactement les six échecs préexistants documentés. Le build local ne mesure pas le CPU runtime Vercel.

## Retour arrière protégeant F1 et S1

Ne pas revenir globalement à e6fa5b2 : il ne contient pas F1. Pour retirer A1, appliquer le patch audit-livraison-f1-a1-2026-10-23/a1-rollback-keep-f1-s1.patch (trois fichiers, tests compris), puis tests ciblés, TypeScript, lint et build normal avant publication. Ce patch conserve F1, S1, D1/C1, Utilisateurs, les KPI et les purges globales. Les 53 tests CPU du retour ciblé ont passé ; son build reste à refaire avant utilisation. Tout incident F1 demande une correction conservant les lectures fraîches et le refus du repli périmé.

## Publication et contrôles

Un seul push main via l’intégration Git habituelle ; aucun déploiement CLI redondant. Les preuves après publication seront ajoutées localement à ce rapport et au canevas pour éviter un second build documentaire. Aucun navigateur ni session autorisée disponible : recette authentifiée des attributions VIEWER, refus d’écriture, révocations et documents privés restante. Aucune écriture métier de test ni test de charge en production. C2 reste séparé, invalidation mémoire non distribuée. Aucun gain CPU Vercel revendiqué.
