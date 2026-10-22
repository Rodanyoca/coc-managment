from pathlib import Path

folder = Path('docs/implementation')
central = folder / 'audit-cpu-suivi-2026-10-22.md'
text = central.read_text(encoding='utf-8-sig')
marker = '## États et tâches'
update = '''## Clôture de validation — état prioritaire

La [clôture détaillée](audit-cpu-cloture-2026-10-22.md) et le [dossier de livraison](audit-cpu-livraison-2026-10-22/README.md) remplacent les anciens blocages ci-dessous : **les deux builds normaux avec vraies polices réussissent**, dans des copies à dépendances physiques et sans changement de configuration. Référence 133 500 ms, variante 749 199 ms ; cet écart défavorable de durée reste inexpliqué et n'est pas une mesure CPU de requêtes. Les anciens essais sont conservés comme historique.

Tests de clôture : **19/19** ciblés CPU/documents ; **23/23** autorisations ; **319/325** sur chacune des suites complètes, exactement les six mêmes échecs ; TypeScript et lint ciblé passent. Aucune erreur applicative nouvelle démontrée. Aucune session navigateur disponible, aucune recette authentifiée prétendue.

Production identifiée par CLI en lecture seule : `dpl_ENVvMe52hN8h5PerjuwZ2p34woTw`, SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f`, alias `database.coc-rdc.net`. Ce SHA est HEAD, pas le workspace modifié. Aucun lot local publié. Aucune requête Plus réessayée, aucun compteur CPU actif attribué. Preuves durables dans `audit-cpu-livraison-2026-10-22/preuves`.

Les invalidations globales, `fresh:true` ignoré et le repli périmé de sécurité restent au backlog distinct. La livraison conserve S1 en cas de retour arrière limité aux optimisations ; un rollback complet pourrait réintroduire des droits VIEWER trop larges.

'''
assert marker in text
if '## Clôture de validation — état prioritaire' not in text:
    text = text.replace(marker, update + marker, 1)
text = text.replace('Référence isolée créée ; production inaccessible (403)', 'Références physiques isolées ; SHA de production identifié par CLI malgré connecteur 403')
text = text.replace('build variante non validé (blocages/délai ci-dessous)', 'builds normaux avec vraies polices réussis ; voir clôture')
text = text.replace('| P0 — observation production | Non publié, non observé | Accès bloqué |', '| P0 — observation production | Lots non publiés/non observés ; SHA connu | Métriques de parcours manquantes |')
text = text.replace('## Validation\n', '## Validation historique — essais initiaux\n\nLes paragraphes suivants décrivent les anciens snapshots avec jonction et polices simulées. Ils sont conservés pour traçabilité ; la clôture ci-dessus les remplace pour le verdict courant. Ne publier aucun de ces anciens artefacts.\n', 1)
text = text.replace('SHA publié, offre, Fluid, compteur/période réellement dépassés restent inconnus.', 'À ce stade initial, SHA publié, offre, Fluid, compteur/période étaient inconnus ; le SHA est depuis identifié dans la clôture, les métriques de requêtes restent manquantes.')
central.write_text(text, encoding='utf-8', newline='\n')

report = folder / 'audit-cpu-ecarts-2026-10-22.md'
text = report.read_text(encoding='utf-8-sig')
header, rest = text.split('\n', 1)
update = '''

## État après validation des lots

Voir la [clôture](audit-cpu-cloture-2026-10-22.md) et les [diffs de livraison](audit-cpu-livraison-2026-10-22/README.md). D1, C1 et S1 sont implémentés ; les builds normaux référence/variante réussissent avec vraies polices et dépendances physiques isolées. Aucun correctif applicatif ajouté pendant cette clôture. Tests hors réseau : 19/19 CPU/documents, 23/23 autorisations, suites 319/325 de chaque côté avec les six mêmes échecs ; TypeScript et lint ciblé passent. Les journaux et résultats défavorables sont conservés ; aucun gain CPU Vercel établi.

La production est identifiée par CLI au SHA `c1488d33b6fcd2953d2bf0becc25a83055e13e2f` ; les changements locaux ne sont pas publiés. Les constats initiaux de production inaccessible sont historiques. Les écarts **invalidations globales**, **`fresh:true` ignoré** et **repli périmé de sécurité** restent au backlog distinct : ils ne sont pas résolus par cette livraison. Les tests de panne de politique S1 ne certifient pas la fraîcheur de l'adaptateur utilisateurs en situation réelle. Aucune session navigateur disponible pour une recette authentifiée.

## Rapport initial et hypothèses conservées
'''
if '## État après validation des lots' not in text:
    report.write_text(header + update + rest, encoding='utf-8', newline='\n')
