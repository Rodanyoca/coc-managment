# Médecins, arbitres et autres acteurs

Analyse préalable du code COC, référence : modèle Athlètes/Officiels/Entraîneurs harmonisé avec FEBACO. Aucune modification des dépôts de référence.

| Élément | Référence | État avant | Adaptation prévue | Fichiers concernés |
|---|---|---|---|---|
| Sexe / âge | Cellule superposée partagée | Médecins : deux colonnes ; arbitres : sexe seul ; autres : absent | ActorSexAge ; projeter la naissance des arbitres ; affichage aussi dans les cartes mobiles Autres | trois listes et page serveur Arbitres |
| Rattachement | Texte sans pastille | Pastilles médecins/arbitres, texte Autres | Texte 14 px / 500 | listes et détails |
| Détail | Bandeau, onglets, quatre cartes Général | Ancien profil latéral | Modèle partagé, observations quatrième carte | trois détails et pages serveur |
| Champs spécifiques | Contenus COC conservés | Spécialité, grade, affiliation, fonction et entité liée | Conserver chaque champ et les onglets métier existants | trois détails |
| Édition et médias | Photo dans formulaires | Formulaires existants, autorisation spécifique Autres | Conserver autorisations, éditeur Autres, validations et API ; documents Autres en lecture seule | composant partagé et détail Autres |

Le statut conserve son badge comme les autres familles. Les rattachements restent en texte. Aucun changement de routes, données persistées ou permissions. Analyse du code uniquement : captures et validation visuelle non disponibles faute de navigateur accessible. Contrôles prévus : TypeScript, lint, tests adaptés et build.

## Réalisation et validation

Adaptations réalisées dans les trois listes et fiches. Les arbitres exposent leur date de naissance existante à la liste pour le calcul commun de l'âge. Les observations existantes sont projetées dans les détails Médecins et Arbitres. Les champs propres à chaque famille et les formulaires restent conservés. Autres conserve ses cartes mobiles, sa pagination, son entité liée, ses droits READ/WRITE et uniquement Général/Documents ; aucun identifiant national ajouté à son interface.

Le composant partagé accepte les trois nouvelles familles pour les passeports, une action d'édition fournie par le serveur et un mode Documents sans gestion des médias. Le détail Autres utilise ce dernier pour préserver l'édition exclusivement dans son formulaire. Son test existant d'onglets a été adapté au nouveau composant, avec contrôle du mode lecture seule.

Contrôles réussis : TypeScript sans émission, ESLint des composants concernés, 21 tests ciblés, `git diff --check`, build de production. Prévisualisation locale relancée sur le port 3107. Aucun push ni déploiement.

Reste ouvert : inspection visuelle ordinateur/mobile, textes longs, contraste et focus clavier ; aucune capture avant/après ni validation visuelle réalisée.
