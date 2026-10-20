# Fiche compétition COC — référence FEBACO

## Analyse avant modification

Cible : `coc-cible`, branche isolée existante `design/coc-febaco-visual-20261019`. Référence lue : `febaco-reference/app/dashboard/competitions/[id]/page.tsx`, `components/dashboard/detail-card.tsx`, composants Card/Tabs/Header et variables globales. FEBACO reste inchangé, CPU/P3 hors périmètre.

| Élément | Référence FEBACO | COC avant | Écart et adaptation prévue | Fichiers COC |
|---|---|---|---|---|
| Cadre de page | Header puis main `space-y-5 p-4 sm:p-6`, retour outline | `space-y-6`, retour ghost petit | Reprendre espacements et retour FEBACO | competition-detail-client.tsx |
| Onglets | Hors carte englobante, grille 2 puis 3 puis 5/9 colonnes, gap/padding 4 px, texte multiligne | Dans une grande carte, contenu doublement rembourré, 2 puis 5 colonnes, texte sans retour | Retirer la carte englobante ; grille 2/3/5 adaptée aux cinq onglets COC ; padding vertical 8 px | même fichier |
| Action modifier | Dans Général, au-dessus des cartes à droite | Hors onglets, près du retour | Même position et bouton normal, sous contrôle canEdit existant | même fichier |
| Général | Deux cartes égales `lg:grid-cols-2 gap-5`, Informations générales (Trophy), Organisation (MapPin) | Profil latéral 1/3 et sections texte 2/3, faux avatar initiales | Reprendre les deux cartes et leurs icônes, sans avatar artificiel | même fichier, detail-card.tsx |
| Champs | Libellé 14 px atténué, valeur 14 px / 500 alignée droite, lignes espacées de 12 px ; titres 18 px / 600, icônes 20 px | Titres de sections 14 px capitales et champs en sous-grille | Copier les règles DetailCard FEBACO ; protéger les longs libellés et valeurs | detail-card.tsx |
| Fond et composants | Card #0c2742 à 95 %, bordure 80 %, arrondi 12 px, ombre 0 12px 30px rgba(1,10,20,.12), py 24 px ; onglets muted #102d49, texte secondaire #9db2c6 | Composants globaux déjà identiques ; surcharges locales border/50, bg-muted/10 et p-5 | Supprimer les surcharges locales de la fiche, conserver les composants globaux | competition-detail-client.tsx |
| Chargement | Chargement simple sans maquette de tableau | Squelette tableau sans rapport avec la fiche actuelle | Squelette onglets et deux cartes responsive aligné sur la fiche finale | loading.tsx |

Polices : Geist commun, COC chargé via variables de next/font avec secours système ; pas de nouvelle règle globale nécessaire. Les styles ci-dessus ont été vérifiés dans les composants réels et les surcharges de page, pas uniquement leurs noms de classes.

## Adaptation institutionnelle et différences métier

Conserver nom et édition COC, type, niveau, caractère multisport, statut, pays/ville/lieu, observations, identifiant et trois compteurs existants. COC ne possède pas la même saison ou discipline au niveau compétition : ne pas inventer ces champs ni recopier les libellés/données FEBACO. Dates de début/fin COC présentes dans le modèle : les afficher dans Organisation comme FEBACO.

Conserver les cinq onglets Général, Programmes, Équipes / unités, Participants, Résultats, les sous-composants métier et leurs erreurs/retry, la qualité de la fiche, les formulaires et le contrôle canEdit. Les onglets Matchs/Phases/Classement propres au basket ne sont pas importés. Aucun changement d'API, calcul, permission ou route.

## Limites de vérification

Comparaison par lecture du code. Aucun navigateur accessible lors des interventions précédentes : captures avant/après et inspection visuelle non réalisées. Le contrôle des débordements, contraste et focus en navigateur reste distinct des contrôles TypeScript/lint/tests/build prévus.

## Réalisation et contrôles

Les adaptations du tableau sont réalisées. Un composant `components/dashboard/detail-card.tsx` reprend les règles du DetailCard FEBACO, avec garde sur les valeurs absentes et retour à la ligne pour les libellés longs. Le contenu Général utilise deux cartes ; les trois compteurs existants restent visibles dans une rangée dédiée et DataQualitySummary reste à la suite. Les sous-composants des quatre autres onglets, les lectures serveur, les formulaires et les API ne sont pas modifiés.

Le squelette reprend les onglets responsive et les deux cartes. Son test existant a été adapté : l'ancien contrat exigeait une silhouette Gantt alors que l'onglet initial est Général.

- TypeScript sans émission, ESLint ciblé et `git diff --check` réussis.
- Build de production réussi, prévisualisation relancée sur le port 3107.
- Suite compétition : 100 tests, 97 réussis et trois échecs préexistants. Vérification effectuée en réexécutant les mêmes tests avec les deux fichiers de fiche/chargement remis temporairement à leur contenu HEAD, puis restaurés intégralement : mêmes trois échecs (liste finale, écritures contextuelles, enveloppe serveur T12). Les deux nouveaux écarts de tests liés aux changements visuels ont été résolus ; aucun échec supplémentaire.
- L'échec « écritures contextuelles » utilise notamment une expression régulière imposant un bouton directement après `canEdit&&` ; le contrôle canEdit reste présent autour du conteneur du bouton. Les autres échecs concernent des fichiers hors intervention ; leurs corrections métier restent hors périmètre.
- Disponibilité navigateur revérifiée : aucune application ni navigateur exposé. Aucune capture, inspection mobile, vérification visuelle des contrastes/focus ou preuve de rendu final n'est revendiquée.

Écarts conservés volontairement : cinq onglets COC contre neuf FEBACO, compteur/qualité propres au COC, édition plutôt que saison et absence de discipline directe dans le modèle COC. Aucun contenu ou logo FEBACO importé, aucun push ni déploiement.
