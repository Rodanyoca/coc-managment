import assert from 'node:assert/strict'
import { cpSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { activityDashboardFixture } from './dashboard-fixture.mjs'

const candidate=process.cwd(),control=path.resolve('../a1-control')
mkdirSync(control,{recursive:true});cpSync('lib',path.join(control,'lib'),{recursive:true})
// One-variable comparison: same conservative Sheets module, only A1 differs.
for(const f of ['data.ts','dashboard.ts'])copyFileSync(path.resolve('../../cpu-dashboard/reference/lib/activites',f),path.join(control,'lib/activites',f))
const results=[]
for(const scenario of ['cold','warm','concurrent-cold-8','after-reference-write','after-activity-write']){
 const fs=await Promise.all([control,candidate].map(root=>activityDashboardFixture(root,200)))
 const answers=[],counts=[]
 for(const f of fs){
  if(scenario!=='cold'&&scenario!=='concurrent-cold-8')await f.load()
  f.raw.state.calls.length=0
  if(scenario.startsWith('after-')){const ref=scenario==='after-reference-write';await f.raw.namespace.appendSheetRow({spreadsheetId:ref?'REF':'ACTIVITIES',sheetName:ref?'TYPES_ACTIVITE':'ACTIVITES',row:ref?{id_type_activite:'NEW'}:{id_activite:'NEW'}})}
  answers.push(scenario==='concurrent-cold-8'?await Promise.all(Array.from({length:8},()=>f.load())):await f.load())
  counts.push(f.raw.state.calls.length)
 }
 assert.deepEqual(JSON.parse(JSON.stringify(answers[0])),JSON.parse(JSON.stringify(answers[1])))
 assert.deepEqual(counts,scenario==='warm'?[0,0]:[5,2])
 results.push({scenario,oldA1GetCalls:counts[0],selectedGetCalls:counts[1],equal:true})
}
writeFileSync('delivery-counts.json',JSON.stringify({scope:'Deterministic dependency counters on selected global raw-cache policy; no timing or CPU benchmark',results},null,2)+'\n')
console.log('Selected composition: A1 outputs equal and dependency counters verified on all five scenarios.')
