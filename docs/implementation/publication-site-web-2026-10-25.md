# Publication COC — Site Web, 25 octobre 2026

Composition préparée dans un checkout main propre depuis 21822f51acf51667d27acee3107716e3c5b06210.

Inclus : accueil minimaliste en blocs, listes harmonisées, cahier des charges détaillé, insertion Site Web par ID sur les neuf ressources dont photos, protection des lignes incomplètes et des formules, création atomique avec conservation formats/validations, recherche fraîche de l’ID lors des modifications, tests et preuves.

C2 exclu : profil conservateur de livraison conservé ; les purges globales, D1/C1/S1/F1/A1, Utilisateurs, saisons et neuf KPI restent présents. Aucun changement du site public ou du workspace VS Code.

Validation de la composition : 114/114 tests ciblés, ESLint, TypeScript et build normal avec les vraies polices réussis avant préparation ; absence de dérive applicative vérifiée. Recette visuelle sur fixtures et test navigateur de date documentés. La suite générale complète n’est pas rejouée ; ses six échecs antérieurs restent décrits.

Référence de retour arrière : SHA 21822f51acf51667d27acee3107716e3c5b06210, déploiement dpl_3SfWTtJqZJfDtcM7AkQQV7fXcxWk, alias database.coc-rdc.net. Un retour sur ce SHA conserve S1/F1 mais réintroduit le défaut d’append des gabarits. Préférer une correction ciblée en cas d’incident ; ne pas modifier les données pour un rollback de code.

Limites : pas de verrou distribué ni d’unicité transactionnelle inter-instances, pas de transaction Sheets/Drive/audit ; modification en vol dans une autre instance non protégée par CAS. Les créations peuvent décaler les rangs ; les mises à jour Site Web relisent le rang frais. Voir le rapport d’insertion pour détails et coûts supplémentaires. Aucune donnée de production déplacée et aucune date corrigée automatiquement. Dossier PDF dédié et recette authentifiée restent à vérifier. Aucun gain CPU Vercel revendiqué.

Push main unique via intégration Git Vercel, sans déploiement CLI supplémentaire. SHA final, READY, alias et contrôles après publication seront consignés localement après le push pour éviter un déploiement documentaire redondant.
