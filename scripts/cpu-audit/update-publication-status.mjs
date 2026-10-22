import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
const folder='docs/implementation/'
const proof=folder+'audit-cpu-publication-2026-10-22/preuves/'
const checks=JSON.parse(readFileSync(proof+'checks.json','utf8'))
assert.equal(checks.length,6)
assert(checks.every(check=>check.exitCode===(check.name==='suite'?1:0)))
const deployment=existsSync(proof+'deployment.json')?JSON.parse(readFileSync(proof+'deployment.json','utf8')):null
const smoke=existsSync(proof+'anonymous-http.json')?JSON.parse(readFileSync(proof+'anonymous-http.json','utf8')):null
let state='**Validation finale terminée ; publication autorisée, pas encore effectuée.** Build normal avec vraies polices : 489 764 ms ; 19/19 tests CPU/documents, 23/23 autorisations, suite complète 319/325 avec les six mêmes échecs préexistants ; TypeScript et lint des fichiers applicatifs modifiés passent. Les sources complètes, évolutions parallèles comprises, sont préparées dans le checkout propre. Aucun gain CPU Vercel établi.'
if(deployment){
 assert.equal(deployment.readyState,'READY')
 state=`**Publié et READY** : SHA \`${deployment.sha}\`, déploiement \`${deployment.id}\`, alias \`${deployment.alias}\`, vérifié à \`${deployment.observedAt}\` (UTC). Composition complète avec les évolutions fonctionnelles locales et D1/C1/S1 ; résultats finaux locaux : build normal/vraies polices, TypeScript et lint réussis, 19/19 CPU/documents, 23/23 autorisations et 319/325 avec les six échecs préexistants. `
 state+=smoke?`Contrôles HTTP anonymes : ${smoke.results.filter(item=>item.ok).length}/${smoke.results.length} conformes, fenêtre ${smoke.startedAt} — ${smoke.finishedAt}. `:'Contrôles HTTP anonymes en cours. '
 state+='Aucune recette authentifiée faute de session disponible, aucun gain CPU Vercel démontré. Les preuves après publication sont conservées dans le workspace documentaire ; aucun second push documentaire déclenchant un build redondant.'
}
const text=`## Publication complète — état courant\n\n${state}\n\nVoir le [rapport de publication](audit-cpu-publication-2026-10-22.md) et ses preuves. Le déploiement précédent reste \`dpl_ENVvMe52hN8h5PerjuwZ2p34woTw\` au SHA \`c1488d33b6fcd2953d2bf0becc25a83055e13e2f\`. Un patch de retour D1/C1 conservant S1 est préparé ; un retour complet pourrait réélargir les droits VIEWER. Invalidations globales et fraîcheur de sécurité restent au backlog distinct.\n\n`
for(const name of ['audit-cpu-suivi-2026-10-22.md','audit-cpu-cloture-2026-10-22.md','audit-cpu-ecarts-2026-10-22.md','audit-cpu-publication-2026-10-22.md']){
 const file=folder+name
 let content=readFileSync(file,'utf8').replace(/^\uFEFF/,'')
 content=content.replace('Aucun push ni déploiement autorisé pour cette livraison.','Phase initiale sans publication ; autorisation de publication complète reçue ensuite (voir état courant).')
 content=content.replace('Publication en préparation ; aucun succès de production ne doit être déduit de ce statut.','État initial de cette phase : publication en préparation ; l’état courant et les preuves ci-dessus prévalent.')
 content=content.replace('## Verdict\n','## Verdict de clôture locale avant publication\n')
 content=content.replace(/## Publication complète — état courant\n[\s\S]*?<!-- fin-statut-publication -->\n\n/,'')
 const split=content.indexOf('\n')
 content=content.slice(0,split+1)+'\n'+text+'<!-- fin-statut-publication -->\n\n'+content.slice(split+1).replace(/^\n/,'')
 writeFileSync(file,content)
}
// Delivery README uses a different relative path for the current release report.
const delivery=folder+'audit-cpu-livraison-2026-10-22/README.md'
let content=readFileSync(delivery,'utf8')
content=content.replace('Date : 22 octobre 2026. Aucun push ni déploiement effectué.','Date : 22 octobre 2026. État historique de préparation avant publication ; état courant ci-dessus.')
content=content.replace(/## Publication complète — état courant\n[\s\S]*?<!-- fin-statut-publication -->\n\n/,'')
const split=content.indexOf('\n')
writeFileSync(delivery,content.slice(0,split+1)+'\n'+text.replace('(audit-cpu-publication-2026-10-22.md)','(../audit-cpu-publication-2026-10-22.md)')+'<!-- fin-statut-publication -->\n\n'+content.slice(split+1).replace(/^\n/,''))
console.log(deployment?'Published status recorded locally; no redundant deploy.':'Final prepublication status recorded.')
