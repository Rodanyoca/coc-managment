import assert from "node:assert/strict"
import {readFile} from "node:fs/promises"
import test from "node:test"
const source=(path:string)=>readFile(new URL(`../../${path}`,import.meta.url),"utf8")

test("la liste finale expose les champs, la période et une action accessible",async()=>{
 const code=await source("app/dashboard/competitions/competitions-client.tsx")
 for(const value of ["Identifiant","Nom de la compétition","Édition","Période","Statut"])assert.match(code,new RegExp(value))
 assert.match(code,/Période à partir du/);assert.match(code,/Période jusqu’au/);assert.match(code,/Voir les détails de/);assert.match(code,/TooltipContent>Voir les détails/);assert.doesNotMatch(code,/overflow-x-auto/)
})

test("la fiche finale possède quatre onglets et conserve le modèle campagne-programme",async()=>{
 const code=await source("app/dashboard/competitions/[id]/competition-detail-client.tsx")
 for(const tab of ["Général","Participants","Équipes engagées","Résultats"])assert.match(code,new RegExp(`>${tab}<`))
 assert.match(code,/id_engagement_campagne/);assert.match(code,/id_programme_competition/);assert.match(code,/id_statut_selection/);assert.match(code,/id_statut_participation/);assert.match(code,/Aucun athlète enregistré pour cette compétition/);assert.doesNotMatch(code,/overflow-x-auto/)
})

test("les écritures restent contextuelles et masquées sans droit",async()=>{
 const code=await source("app/dashboard/competitions/[id]/competition-detail-client.tsx"),list=await source("app/dashboard/competitions/competitions-client.tsx"),create=await source("app/dashboard/competitions/nouveau/page.tsx")
 assert.match(code,/canEdit&&<Button onClick=\{openEdit\}/);assert.match(code,/Gérer les participants/);assert.match(code,/Gérer l’engagement/);assert.match(code,/Ajouter ou modifier un résultat/);assert.match(code,/\/api\/competitions/);assert.match(list,/Sheet open=\{createOpen\}/);assert.match(list,/CompetitionForm value=\{form\}/);assert.match(create,/redirect\("\/dashboard\/competitions\?nouveau=1"\)/)
})
