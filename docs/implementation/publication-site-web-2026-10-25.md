# Publication COC — Site Web, 25 octobre 2026

Composition préparée dans un checkout main propre depuis 21822f51acf51667d27acee3107716e3c5b06210.

Inclus : accueil minimaliste en blocs, listes harmonisées, cahier des charges détaillé, insertion Site Web par ID sur les neuf ressources dont photos, protection des lignes incomplètes et des formules, création atomique avec conservation formats/validations, recherche fraîche de l’ID lors des modifications, tests et preuves.

C2 exclu : profil conservateur de livraison conservé ; les purges globales, D1/C1/S1/F1/A1, Utilisateurs, saisons et neuf KPI restent présents. Aucun changement du site public ou du workspace VS Code.

Validation de la composition : 114/114 tests ciblés, ESLint, TypeScript et build normal avec les vraies polices réussis avant préparation ; absence de dérive applicative vérifiée. Recette visuelle sur fixtures et test navigateur de date documentés. La suite générale complète n’est pas rejouée ; ses six échecs antérieurs restent décrits.

Référence de retour arrière : SHA 21822f51acf51667d27acee3107716e3c5b06210, déploiement dpl_3SfWTtJqZJfDtcM7AkQQV7fXcxWk, alias database.coc-rdc.net. Un retour sur ce SHA conserve S1/F1 mais réintroduit le défaut d’append des gabarits. Préférer une correction ciblée en cas d’incident ; ne pas modifier les données pour un rollback de code.

Limites : pas de verrou distribué ni d’unicité transactionnelle inter-instances, pas de transaction Sheets/Drive/audit ; modification en vol dans une autre instance non protégée par CAS. Les créations peuvent décaler les rangs ; les mises à jour Site Web relisent le rang frais. Voir le rapport d’insertion pour détails et coûts supplémentaires. Aucune donnée de production déplacée et aucune date corrigée automatiquement. Dossier PDF dédié et recette authentifiée restent à vérifier. Aucun gain CPU Vercel revendiqué.

Push main unique via intégration Git Vercel, sans déploiement CLI supplémentaire. SHA final, READY, alias et contrôles après publication seront consignés localement après le push pour éviter un déploiement documentaire redondant.

## Publication confirmée

- SHA : **29f7149570924bdb116afa368b434efb912d8b1c**, push main sans force push.
- Déploiement : **dpl_2iDignCCnpFJwNiun1i17Vmv7sEE**, **READY**, production. Heure UTC retournée par Vercel : **2026-10-25T17:55:43.733Z**.
- Alias indépendant vérifié : **database.coc-rdc.net**, pointant sur ce déploiement.
- Huit contrôles anonymes réussis entre 17:56:13 et 17:56:20 UTC : login 200, pages privées redirigées vers login, API Actualités/photos/uploads/users/documents 401. Aucun formulaire métier soumis.
- Journaux accessibles du 25 octobre **17:56:00–17:56:34 UTC** : commande réussie, zéro enregistrement retourné, sans intervalle exclu. Cela ne remplace pas une recette authentifiée et ne prouve pas une absence d’erreurs hors fenêtre.
- 114 tests ciblés rejoués dans le checkout de commit ; index de 375 sources comparé au build normal validé, sans dérive hormis fins de ligne équivalentes. Contrôle des secrets et artefacts réussi.
- C2 différé, garanties S1/F1 conservées. coc-website et configuration du workspace non modifiés par ce push. L’actualité n’a été ni déplacée ni redatée.
- Restent : recette authentifiée autorisée, dossier PDF dédié, limites inter-instances décrites dans le rapport d’insertion. Aucun gain CPU Vercel revendiqué.

Cette clôture et les preuves post-publication restent locales pour éviter un second déploiement documentaire redondant.
