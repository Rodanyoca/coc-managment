import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { validateEngagementInput } from "../../lib/competitions/validation.ts"
import { validateCampaignInput } from "../../lib/equipes-nationales/validation.ts"

test("valide plusieurs campagnes temporelles sans les confondre avec l’équipe permanente", () => {
  assert.equal(validateCampaignInput({ nom_campagne:"JO 2028",date_debut:"2028-07-01",statut:"ACTIF" }).statut,"ACTIF")
  assert.throws(()=>validateCampaignInput({nom_campagne:"Hors période",date_debut:"2028-08-01",date_fin:"2028-07-01",statut:"ACTIF"}),/période/i)
})

test("exige programme, campagne, statut, dates et provenance d’un engagement", () => {
  assert.throws(()=>validateEngagementInput({}),/id_programme_competition/)
  const row=validateEngagementInput({id_programme_competition:"PRG1",id_campagne:"CAM1",id_statut_engagement:"confirme",date_engagement:"2028-07-01",id_federation_source:"FED1",date_transmission:"2028-07-02"})
  assert.equal(row.id_statut_engagement,"CONFIRME")
  assert.throws(()=>validateEngagementInput({...row,date_debut:"2028-07-20",date_fin:"2028-07-19"}),/période/i)
})

test("les vues T06 sont responsives et n’exposent plus l’engagement direct de l’équipe",()=>{
  const engagement=readFileSync("components/dashboard/campaign-engagements.tsx","utf8"),competition=readFileSync("app/dashboard/competitions/[id]/competition-detail-client.tsx","utf8")
  assert.doesNotMatch(engagement,/overflow-x-auto/)
  assert.match(competition,/TabsTrigger value="teams"/)
  assert.match(competition,/<CampaignEngagements/)
  assert.doesNotMatch(competition,/\/equipes-nationales.*method:/)
})

test("les deux API T06 contrôlent lecture et écriture côté serveur",()=>{
  for(const file of ["app/api/competitions/[id]/engagements/route.ts","app/api/equipes-nationales/[id]/campagnes/route.ts"]){const source=readFileSync(file,"utf8");assert.match(source,/canAccess\("AUT-SPT", "READ"\)/);assert.match(source,/runSportMutation|canAccess\("AUT-SPT", "WRITE"\)/)}
})
