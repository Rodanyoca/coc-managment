# Publication F1/A1 — 23 octobre 2026

## Première vague publiée — clôture

**Publié et READY** : SHA `cd9f29fbdfba9d35a60af358041dd8ad852c1173`, déploiement `dpl_EGA6j7Qwf4euUNywAXRj8KehA4z3`, alias `database.coc-rdc.net` confirmé à 2026-10-23T11:18:24.5590906Z. READY à **2026-10-23T11:17:12.4740000Z**. F1, A1, Utilisateurs et neuf KPI livrés ; D1/C1/S1 conservés. **C2 reste différé ; purges globales conservées.**

Un seul push main, aucun déploiement redondant. Sources applicatives inchangées depuis les validations : build normal/vraies polices, TypeScript et lint réussis ; 53/53 CPU rejoués depuis le checkout ; 3/3 UI, 23/23 permissions ; suite 319/325 avec les six mêmes échecs préexistants. Retour ciblé A1 préservant F1/S1 vérifié, référence locale `release/f1-a1-users-20261023` dans le checkout de publication.

Après publication : **11/11 contrôles anonymes conformes**, fenêtre 2026-10-23T11:17:59.148Z — 2026-10-23T11:18:06.640Z. Journaux runtime consultés de 2026-10-23T11:17:12Z à 2026-10-23T11:18:30Z : 0 enregistrement, aucune page suivante. Cela ne prouve pas l’absence d’erreurs sur des parcours non exercés. Aucune session navigateur autorisée : recette authentifiée VIEWER/blocs, refus d’écriture, révocations et documents privés restante. Aucun gain CPU Vercel mesuré ou revendiqué.

Les preuves après publication et cette clôture restent documentées dans le workspace, sans second push documentaire déclenchant un build. Le workspace principal conserve les travaux parallèles C2 ; il ne doit pas être poussé en bloc. Voir le [rapport de publication](audit-publication-f1-a1-2026-10-23.md).


Composition autorisée : F1, A1, interfaces Utilisateurs et neuf KPI. D1/C1/S1 et journalisation conservés. C2 différé : les purges globales des caches bruts restent actives. Aucun nouveau lot.

Référence précédente : e6fa5b24a0a3da6491aec19f8bdd9b1ebe8e8964, déploiement dpl_DFHRq2mKp62EVz3nkmJ1THoaczdx, alias database.coc-rdc.net. Checkout isolé .cache/cpu-delivery/release ; travaux parallèles du workspace préservés.

Les 744 empreintes du candidat correspondent au manifeste validé ; aucune dérive applicative. Contrôles réutilisés sur sources identiques : build normal 315746 ms avec onze vraies polices, TypeScript et lint réussis (un avertissement préexistant), 53/53 tests CPU, 3/3 UI Utilisateurs, 23/23 permissions, neuf KPI vérifiés. Suite complète : 319/325, exactement les six échecs préexistants documentés. Le build local ne mesure pas le CPU runtime Vercel.

## Retour arrière protégeant F1 et S1

Ne pas revenir globalement à e6fa5b2 : il ne contient pas F1. Pour retirer A1, appliquer le patch audit-livraison-f1-a1-2026-10-23/a1-rollback-keep-f1-s1.patch (trois fichiers, tests compris), puis tests ciblés, TypeScript, lint et build normal avant publication. Ce patch conserve F1, S1, D1/C1, Utilisateurs, les KPI et les purges globales. Les 53 tests CPU du retour ciblé ont passé ; son build reste à refaire avant utilisation. Tout incident F1 demande une correction conservant les lectures fraîches et le refus du repli périmé.

## Publication et contrôles

Un seul push main via l’intégration Git habituelle ; aucun déploiement CLI redondant. Les preuves après publication seront ajoutées localement à ce rapport et au canevas pour éviter un second build documentaire. Aucun navigateur ni session autorisée disponible : recette authentifiée des attributions VIEWER, refus d’écriture, révocations et documents privés restante. Aucune écriture métier de test ni test de charge en production. C2 reste séparé, invalidation mémoire non distribuée. Aucun gain CPU Vercel revendiqué.

Contrôle pré-push : index Git conforme aux sources validées, seules 433 conversions CRLF/LF sans changement de contenu ; 53/53 tests CPU rejoués dans le checkout. Le patch de retour se vérifie avec `git apply --ignore-space-change --check` ; utiliser la même option pour son application (contexte CRLF/LF). Aucun changement applicatif depuis le build validé.
