import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { loadServerModule } from '../../scripts/cpu-audit/module-harness.mjs'
import { authorize } from '../../lib/auth/authorization.ts'
import { routePolicy } from '../../lib/auth/route-policy.ts'

const root=process.cwd()
test('GET user detail reads only user and blocks, never audit, and excludes credentials',async()=>{
  let session=null,reads=0,auditReads=0,missing=false
  const user={idUser:'USR-SYNTHETIC',nomComplet:'Compte synthétique',email:'offline@example.invalid',typeUser:'VIEWER',statut:'ACTIF',estSuperAdmin:false,doitChangerMotDePasse:false,dateCreation:'2026-10-22T12:00:00Z',derniereConnexion:null,sessionVersion:1,passwordHash:'NEVER-SERIALIZE-HASH'}
  const authorizations=[{idUserAutorisation:'UA-SYNTHETIC',idUser:user.idUser,idBlocAutorisation:'AUT-SPT',statut:'ACTIF',dateDebut:'2026-01-01',dateFin:null}]
  class Repository {
    async requireUserById(id){reads++;assert.equal(id,user.idUser);if(missing)throw new Error('introuvable');return user}
    async getAuthorizationsForUser(id){reads++;assert.equal(id,user.idUser);return authorizations}
    async getAuditLog(){auditReads++;throw new Error('The detail must not read security history')}
  }
  const route=await loadServerModule(root,'app/api/users/[id]/route.ts',{
    'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},
    '@/lib/auth':{getSession:async()=>session},
    '@/lib/users/administration-workflows':{updateManagedUser:async()=>{throw new Error('No write in GET')}},
    '@/lib/users/google-adapter':{createGoogleUsersSheetsAdapter:()=>({})},
    '@/lib/users/repository':{UsersRepository:Repository},
  })
  const request=()=>route.GET(new Request('https://offline.invalid/api/users/USR-SYNTHETIC'),{params:Promise.resolve({id:user.idUser})})
  for(const identity of [null,{estSuperAdmin:false,typeUser:'VIEWER'},{estSuperAdmin:false,typeUser:'ADMIN'}]){
    session=identity;assert.equal((await request()).status,403)
  }
  assert.equal(reads,0)
  session={estSuperAdmin:true,typeUser:'ADMIN'}
  const response=await request(),body=await response.json()
  assert.equal(response.status,200);assert.equal(body.user.nom_complet,user.nomComplet)
  assert.equal(JSON.stringify(body.authorizations),JSON.stringify(authorizations))
  assert.equal('audit' in body,false);assert.equal(JSON.stringify(body).includes(user.passwordHash),false)
  assert.equal(reads,2);assert.equal(auditReads,0)
  missing=true;assert.equal((await request()).status,404);assert.equal(auditReads,0)
})

test('page/client have no history load or payload; shared audit writes and idempotency remain',()=>{
  const page=readFileSync(path.join(root,'app/dashboard/utilisateurs/[id]/page.tsx'),'utf8')
  const client=readFileSync(path.join(root,'app/dashboard/utilisateurs/[id]/user-detail-client.tsx'),'utf8')
  assert.doesNotMatch(page,/getAuditLog|audit=|sessionVersion/)
  assert.doesNotMatch(client,/Historique minimal|AuditLogEntry|audit\.map|sessionVersion/)
  const repository=readFileSync(path.join(root,'lib/users/repository.ts'),'utf8')
  const workflows=readFileSync(path.join(root,'lib/users/administration-workflows.ts'),'utf8')
  assert.match(repository,/appendAuditLog[\s\S]*?read: \(\) => this\.getAuditLog\(\)/)
  assert.match(workflows,/getAuditLog\(\).*requestId/)
})

test('each account command refuses non-super-admin before loading data; S1 proxy denies VIEWER even with inconsistent super-admin flag',async()=>{
  let session=null
  const forbidden=()=>{throw new Error('A refused command must not load or mutate data')}
  const mocks={
    'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},
    '@/lib/auth':{getSession:async()=>session},
    '@/lib/users/data':{getUserById:forbidden},
    '@/lib/users/administration-workflows':{updateManagedUser:forbidden,assignAuthorization:forbidden,changeAuthorization:forbidden,revokeAllSessions:forbidden},
    '@/lib/auth/account-workflows':{resetUserAccess:forbidden},
    '@/lib/users/google-adapter':{createGoogleUsersSheetsAdapter:forbidden},
    '@/lib/users/repository':{UsersRepository:class{constructor(){forbidden()}}},
  }
  for(const [file,methods,pathName] of [
    ['app/api/users/[id]/route.ts',['PATCH'],'/api/users/USR-DEMO'],
    ['app/api/users/[id]/reset-access/route.ts',['POST'],'/api/users/USR-DEMO/reset-access'],
    ['app/api/users/[id]/revoke-sessions/route.ts',['POST'],'/api/users/USR-DEMO/revoke-sessions'],
    ['app/api/users/[id]/authorizations/route.ts',['POST','PATCH','DELETE'],'/api/users/USR-DEMO/authorizations'],
  ]){
    const route=await loadServerModule(root,file,mocks)
    for(const method of methods){
      const policy=routePolicy(pathName,method)
      assert.equal(policy.scope,'SUPER_ADMIN')
      const viewer={idUser:'VIEWER',typeUser:'VIEWER',estSuperAdmin:true}
      assert.equal(authorize({user:viewer,authorizations:[],requirement:policy,action:policy.action}).allowed,false)
      for(const identity of [null,{estSuperAdmin:false,typeUser:'ADMIN'},{estSuperAdmin:false,typeUser:'VIEWER'}]){
        session=identity
        const response=await route[method](new Request(`https://offline.invalid${pathName}`,{method}),{params:Promise.resolve({id:'USR-DEMO'})})
        assert.equal(response.status,403,`${method} ${pathName}`)
      }
    }
  }
})
