# Entraîneurs — harmonisation avec les athlètes

Comparaison du code avant modification, dans COC uniquement. Référence : composants Athlètes et Officiels déjà harmonisés avec FEBACO.

| Élément | Référence | Entraîneurs avant | Adaptation | Fichiers |
|---|---|---|---|---|
| Sexe / âge | Cellule superposée commune | Sexe et date séparés | Utiliser ActorSexAge | entraineurs-client.tsx |
| Fédération | Texte 14 px, graisse 500 | Pastille outline | Texte sans pastille | liste et détail |
| Fiche | Bandeau, onglets, quatre cartes dans Général | Profil latéral et champs mélangés | ActorRecordLayout et cartes Identité, Contact, Identifiants, Observations | entraineur-detail-client.tsx |
| Documents | Carte passeport commune | Documents dans ancien layout | Étendre ActorPassportCard aux entraîneurs | actor-record-layout.tsx |

Conserver les contenus COC, formulaires, validations, médias, filtres, permissions et routes. Conserver les onglets Équipes nationales et Activités. Photo dans les formulaires uniquement. Observations lues depuis le champ existant de COACHS.

Analyse du code uniquement : pas de navigateur accessible pour les captures ou une validation visuelle ordinateur/mobile. Contrôles prévus : TypeScript, lint, tests ciblés et build.

## Livraison

Toutes les adaptations prévues sont réalisées avec les composants partagés. Équipes nationales, Activités, formulaires et médias conservés. Le bouton de consultation possède un nom accessible. Le badge de statut reste cohérent avec les autres acteurs ; le rattachement fédéral est en texte.

TypeScript, ESLint des fichiers modifiés, cinq tests ciblés (âge, identité et fraîcheur des listes), `git diff --check` et build de production réussis. Prévisualisation relancée sur le port 3107. Aucun push ni déploiement.

Reste à contrôler visuellement en navigateur : ordinateur/mobile, textes longs, contraste et focus clavier. Aucune capture ni validation visuelle revendiquée.
