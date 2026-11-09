import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
const folder='docs/implementation/audit-cpu-publication-2026-10-22/preuves/'
const deployment=JSON.parse(readFileSync(folder+'deployment.json','utf8'))
assert.equal(deployment.readyState,'READY')
const startedAt=new Date().toISOString(),results=[]
const scenarios=[
 ['/login',200],['/service-indisponible',200],['/dashboard',307],['/dashboard/documents',307],['/activation',307],
 ['/api/auth/session',401],['/api/documents',401],['/api/documents/AUDIT-ANONYME/preview',401],['/api/documents/AUDIT-ANONYME/download',401],['/api/users',401],
]
for(const [route,expected] of [...scenarios,['https://coc-managment.vercel.app/login',200]]){
 const url=route.startsWith('https:')?route:`https://${deployment.alias}${route}`
 const started=Date.now()
 try{
  const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(45000),headers:{'user-agent':'COC-release-check/2026-10-22'}})
  const body=await response.text(),location=response.headers.get('location')
  const noData=!route.startsWith('/api/')||Boolean(JSON.parse(body).error)
  const loginRedirect=expected!==307||new URL(location,url).pathname==='/login'
  results.push({route,expected,status:response.status,elapsedHttpMs:Date.now()-started,location,contentType:response.headers.get('content-type'),bytes:Buffer.byteLength(body),vercelRequestId:response.headers.get('x-vercel-id'),ok:response.status===expected&&noData&&loginRedirect})
 }catch(error){results.push({route,expected,ok:false,error:error.message,elapsedHttpMs:Date.now()-started})}
}
const proof={startedAt,finishedAt:new Date().toISOString(),deploymentId:deployment.id,sha:deployment.sha,method:'GET only; no Cookie or Authorization; manual redirects; sequential, no load test',metric:'elapsed HTTP, not active CPU',results}
writeFileSync(folder+'anonymous-http.json',JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify(proof,null,2))
assert(results.every(item=>item.ok),'Post-publication anonymous checks failed')
