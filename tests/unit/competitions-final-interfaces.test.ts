import assert from "node:assert/strict"
import {readFile} from "node:fs/promises"
import test from "node:test"
const source=(path:string)=>readFile(new URL(`../../${path}`,import.meta.url),"utf8")

test("la liste finale expose les champs, la période et une action accessible",async()=>{
 const code=await source("app/dashboard/competitions/competitions-client.tsx")
 for(const value of ["Nom de la compétition","Édition","Période","Statut"])assert.match(code,new RegExp(value))
 assert.doesNotMatch(code,/<TableHead>Identifiant<\/TableHead>/)
 assert.match(code,/Période à partir du/);assert.match(code,/Période jusqu’au/);assert.match(code,/Voir les détails de/);assert.match(code,/TooltipContent>Voir les détails/);assert.doesNotMatch(code,/overflow-x-auto/)
})

test("la fiche finale possède cinq onglets et conserve le modèle campagne-programme-unité",async()=>{
 const code=await source("app/dashboard/competitions/[id]/competition-detail-client.tsx")
 const engagements=await source("components/dashboard/campaign-engagements.tsx")
 for(const tab of ["Général","Programmes","Participants","Équipes / unités","Résultats"])assert.match(code,new RegExp(`>${tab}<`))
 assert.match(code,/id_engagement_campagne/);assert.match(engagements,/id_programme_competition/);assert.match(code,/id_statut_selection/);assert.match(code,/id_statut_participation/);assert.match(code,/Aucun athlète enregistré pour cette compétition/);assert.doesNotMatch(code,/overflow-x-auto/)
})

test("les écritures restent contextuelles et masquées sans droit",async()=>{
 const code=await source("app/dashboard/competitions/[id]/competition-detail-client.tsx"),list=await source("app/dashboard/competitions/competitions-client.tsx"),create=await source("app/dashboard/competitions/nouveau/page.tsx")
 assert.match(code,/canEdit&&<Button onClick=\{openEdit\}/);assert.match(code,/Gérer les participants/);assert.match(code,/<CampaignEngagements[^>]+canEdit=\{canEdit\}/);assert.match(code,/Ajouter ou modifier un résultat/);assert.match(code,/\/api\/competitions/);assert.match(list,/Sheet open=\{createOpen\}/);assert.match(list,/CompetitionForm value=\{form\}/);assert.match(create,/redirect\("\/dashboard\/competitions\?nouveau=1"\)/)
})

test("les unités sont créables et modifiables, et les erreurs de résultat conservent le formulaire",async()=>{
 const units=await source("components/dashboard/participating-units.tsx"),participants=await source("components/dashboard/athlete-participations.tsx"),route=await source("app/api/competitions/[id]/unites/route.ts"),results=await source("components/dashboard/competition-results.tsx")
 assert.match(units,/method:\s*editing\s*\?\s*"PUT"\s*:\s*"POST"/);assert.match(units,/Modifier l’unité/);assert.match(units,/membres:\s*row\.membres\s*\|\|\s*\[\]/)
 for(const heading of ["Sport","Fédération","Période"])assert.match(units,new RegExp(`TableHead[^>]*>${heading}`))
 assert.doesNotMatch(units,/TableHead[^>]*>Date de début|TableHead[^>]*>Date de fin/)
 assert.doesNotMatch(units,/TableHead>Programme</)
 assert.match(participants,/router\.refresh\(\)/)
 assert.match(participants,/<Table>/);assert.match(participants,/<TableHead>Athlète<\/TableHead>/);assert.match(participants,/<TableHead>Campagne<\/TableHead>/);assert.doesNotMatch(participants,/ID acteur|ID engagement|<Card/)
 assert.match(route,/export async function PUT/);assert.match(results,/catch\(error\)\{toast\.error/);assert.doesNotMatch(results,/catch\(error\)[\s\S]*setForm\(empty\)/)
})

test("la fiche relit les participations modifiées directement dans le classeur",async()=>{
 const page=await source("app/dashboard/competitions/[id]/page.tsx"),data=await source("lib/competitions/data.ts")
 assert.match(page,/getAthleteParticipations\(\{\s*competitionId:\s*id,\s*fresh:\s*true\s*\}\)/)
 assert.match(data,/PARTICIPATIONS_ACTEURS_COMPETITION[^\n]+bypassCache:\s*filters\.fresh/)
})

test("la liste des compétitions résiste au quota des données de délégation",async()=>{
 const page=await source("app/dashboard/competitions/page.tsx")
 assert.doesNotMatch(page,/getCompetitions\(\{\s*bypassCache:\s*true\s*\}\)/)
 assert.match(page,/Promise\.allSettled/)
 assert.match(page,/staffResult\.status === "fulfilled"/)
})

test("la fiche compétition ne conserve pas l’ancien résumé des équipes engagées",async()=>{
 const page=await source("app/dashboard/competitions/[id]/page.tsx")
 const detail=await source("app/dashboard/competitions/[id]/competition-detail-client.tsx")
 assert.doesNotMatch(page,/getTeamParticipations|teamsResult|teamsError/)
 assert.doesNotMatch(detail,/title="Équipes engagées"|selectedCount|participantCount|programMap|eventMap/)
 assert.match(detail,/<CampaignEngagements/)
 assert.match(detail,/<ParticipatingUnits/)
})

test("le tableau des résultats affiche la synthèse référencée",async()=>{
 const results=await source("components/dashboard/competition-results.tsx")
 assert.match(results,/TableHead[^>]*>Synthèse<\/TableHead>/)
 assert.match(results,/label\(references\.synthetics,row\.id_resultat_synthetique\)/)
 assert.match(results,/colSpan=\{7\}/)
})

test("les unités participantes partagent une seule lecture client",async()=>{
 const units=await source("components/dashboard/participating-units.tsx")
 const results=await source("components/dashboard/competition-results.tsx")
 const loader=await source("lib/competitions/client-units.ts")
 assert.match(units,/loadCompetitionUnits/)
 assert.match(results,/loadCompetitionUnits/)
 assert.doesNotMatch(results,/fetch\(`\/api\/competitions\/\$\{encodeURIComponent\(competitionId\)\}\/unites/)
 assert.match(units,/useEffect\(\(\) => \{[^\n]+loadCompetitionUnits\(competitionId\)/)
 assert.match(loader,/pendingUnitRequests/)
})

test("le formulaire de participation affiche la fédération à la place de l’identifiant programme",async()=>{
 const participants=await source("components/dashboard/athlete-participations.tsx")
 assert.match(participants,/federationLabel\(item\)/)
 assert.doesNotMatch(participants,/item\.nom_campagne\} · \{item\.id_programme_competition/)
})

test("la couche Sheets mutualise les lectures simultanées après un redémarrage",async()=>{
 const sheets=await source("lib/google/sheets.ts")
 assert.match(sheets,/__cocGoogleSheetsPendingReads/)
 assert.match(sheets,/pendingReads\.get\(cacheKey\)/)
 assert.match(sheets,/pendingReads\.set\(cacheKey, request\)/)
})

test("le formulaire de résultat affiche la fédération dans la liste des engagements",async()=>{
 const results=await source("components/dashboard/competition-results.tsx")
 assert.match(results,/getFederationLabel\(x\)/)
 assert.doesNotMatch(results,/x\.nom_campagne\|\|x\.id_campagne\} · \$\{x\.id_programme_competition/)
})
