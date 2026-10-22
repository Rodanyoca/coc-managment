import assert from 'node:assert/strict'
import test from 'node:test'
import { loadServerModule } from '../../scripts/cpu-audit/module-harness.mjs'
import { documentsModule, documentRows } from '../../scripts/cpu-audit/fixtures.mjs'
const root=process.env.CPU_TEST_ROOT || process.cwd()

for(const endpoint of ['preview','download'])test(`private ${endpoint}: assigned VIEWER only, missing files, size and binary cache headers`,async()=>{
  const user={idUser:'OFFLINE-VIEWER',typeUser:'VIEWER',estSuperAdmin:false,doitChangerMotDePasse:false}
  let grants=[],sourceFailure=false,documentLoads=0,downloads=0,driveFailure=false
  const auth=await loadServerModule(root,'lib/auth.ts',{
    'next/headers':{cookies:async()=>({get:()=>({value:'offline-token'})})},
    '@/lib/users/data':{getUserById:async()=>user,getAuthorizationsForUser:async()=>{if(sourceFailure)throw new Error('offline');return grants}},
    '@/lib/auth/session-cookie':{SESSION_COOKIE_NAME:'offline',sessionCookieOptions:()=>({})},
    '@/lib/auth/session-resolution':{resolveSession:async()=>({ok:true,user,payload:{session_version:1},requiresActivation:false})},
    '@/lib/auth/session-token':{createSessionToken:async()=>''},
  })
  const rows=documentRows(30)
  rows[11].drive_document_id=''
  const {namespace:data,state}=await documentsModule(root,rows)
  const route=await loadServerModule(root,`app/api/documents/[id]/${endpoint}/route.ts`,{
    'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},
    '@/lib/documents/auth':{canReadDocuments:()=>auth.canAccess('AUT-ADM','READ')},
    '@/lib/documents/data':{getDocument:async id=>{documentLoads++;return data.getDocument(id)}},
    '@/lib/google/drive':{downloadDriveFile:async()=>{downloads++;if(driveFailure)throw new Error('Synthetic Drive failure');return{buffer:Buffer.from('%PDF-1.4\nsynthetic'),mimeType:'application/pdf',name:'test\r\n".pdf'}}},
  })
  const request=()=>route.GET(new Request('https://offline.invalid/documents'),{params:Promise.resolve({id:'DOC10'})})
  const grant={idUser:user.idUser,idBlocAutorisation:'AUT-ADM',statut:'ACTIF',dateDebut:'2020-01-01',dateFin:null}
  for(const invalid of [[],[{...grant,idBlocAutorisation:'AUT-SPT'}],[{...grant,statut:'INACTIF'}],[{...grant,dateFin:'2020-01-02'}],[{...grant,dateDebut:'2099-01-01'}]]){
    grants=invalid
    assert.equal((await request()).status,403)
  }
  grants=[grant];sourceFailure=true
  assert.equal((await request()).status,403)
  assert.equal(documentLoads,0);assert.equal(downloads,0);assert.equal(state.sizeCalls.length,0)
  sourceFailure=false
  const result=await request()
  assert.equal(result.status,200)
  assert.equal(result.headers.get('cache-control'),'private, no-store')
  assert.equal(result.headers.get('content-type'),'application/pdf')
  assert.match(result.headers.get('content-disposition'),endpoint==='preview'?/^inline$/:/^attachment; filename="test___\.pdf"$/)
  assert.equal(await result.text(),'%PDF-1.4\nsynthetic')
  assert.deepEqual(state.sizeCalls,['FILE10']);assert.equal(downloads,1)
  const missing=await route.GET(new Request('https://offline.invalid/documents'),{params:Promise.resolve({id:'missing'})})
  assert.equal(missing.status,404);assert.equal(downloads,1)
  const withoutFile=await route.GET(new Request('https://offline.invalid/documents'),{params:Promise.resolve({id:'DOC11'})})
  assert.equal(withoutFile.status,404);assert.equal(downloads,1)
  driveFailure=true
  assert.equal((await request()).status,503)
})
