# Timeout PostCSS local — 23 octobre 2026

Intervention exclusive dans coc-cible, sans changement applicatif, dépendance, configuration, secret, donnée métier, push ou déploiement.

## Observations et reproduction

- Serveur Next 16.3.4/Turbopack local identifié sur le port 3000. `GET /login` reproduit HTTP 500 en 264 ms avec `Error evaluating Node.js code`, `failed to receive message` et `deadline has elapsed` dans la réponse.
- Mémoire libre mesurée : 0,829 Gio sur 7,652 Gio. La pression mémoire est un facteur possible, pas une cause démontrée de ce timeout.
- Compilation directe du véritable `app/globals.css` avec `postcss` et `@tailwindcss/postcss` installés : succès en 2 372 ms, 175 209 octets CSS, aucun avertissement. Elle ne reproduit pas le protocole IPC Turbopack ; elle ne suffit donc pas seule à valider le serveur.
- Le build normal isolé de la même composition avait réussi auparavant : voir le rapport C2/F1. Cela ne démontre pas que le worker de développement en cours était sain.

## Intervention et vérification

Arrêt limité au serveur COC identifié et à son enfant Next. Conservation de `.next-dev` dans `.cache/postcss-timeout-20261023-original`, puis redémarrage normal `node node_modules/next/dist/bin/next dev --port 3000`, sans modifier les options de compilation. Journaux locaux dans `.cache/postcss-timeout-dev*.log`, PID et heure dans `.cache/postcss-timeout-server.json` (démarrage à 2026-10-23T09:12:46.892Z).

La première sonde est arrivée avant la disponibilité du serveur et a échoué à se connecter ; elle ne constitue pas un nouvel échec de compilation. Après disponibilité :

- `GET /login` : HTTP 200 en 16 904 ms, aucun timeout PostCSS ni erreur d’évaluation dans la réponse ;
- seconde lecture : HTTP 200, deux feuilles de styles servies en HTTP 200, respectivement 186 508 et 10 639 caractères ;
- aucun formulaire soumis, aucune session fabriquée, aucune recette authentifiée revendiquée.

Le démarrage Next a généré ses fichiers AGENTS.md/CLAUDE.md ; ces fichiers nouveaux ont été conservés dans `.cache/postcss-generated-agent-rules` et ne font pas partie de la livraison.

## Conclusion et limites

Le symptôme local est résolu après renouvellement du worker et du cache de développement. Ces deux variables ayant changé ensemble, impossible d’attribuer la cause exacte au seul cache ou au seul processus. Aucun défaut CSS démontré, aucune raison établie de modifier Tailwind, les versions ou les délais. Pas de nouveau build de production nécessaire pour cette intervention sans changement de source ; les validations C2/F1 précédentes restent distinctes.

Le serveur local est laissé disponible sur http://localhost:3000. Si l’onglet conserve l’ancienne superposition d’erreur, recharger la page. En cas de récidive, conserver le journal et la mémoire disponible avant tout nouveau redémarrage, puis comparer un redémarrage conservant le cache à un démarrage avec cache neuf. Aucun gain CPU Vercel déduit de cet incident.
