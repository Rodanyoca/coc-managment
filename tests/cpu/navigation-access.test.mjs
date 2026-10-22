import assert from 'node:assert/strict'
import test from 'node:test'
import { loadServerModule } from '../../scripts/cpu-audit/module-harness.mjs'

test('server navigation and canAccess enforce assigned VIEWER blocks and fail closed',async()=>{
  const user={idUser:'SYNTHETIC',typeUser:'VIEWER',estSuperAdmin:false,doitChangerMotDePasse:false}
  let grants=[],fail=false,loads=0
  const auth=await loadServerModule(process.env.CPU_TEST_ROOT || process.cwd(),'lib/auth.ts',{
    'next/headers':{cookies:async()=>({get:()=>({value:'synthetic-token'})})},
    '@/lib/users/data':{getUserById:async()=>user,getAuthorizationsForUser:async()=>{loads++;if(fail)throw new Error('offline');return grants}},
    '@/lib/auth/session-cookie':{SESSION_COOKIE_NAME:'test',sessionCookieOptions:()=>({})},
    '@/lib/auth/session-resolution':{resolveSession:async()=>({ok:true,user,payload:{session_version:1},requiresActivation:false})},
    '@/lib/auth/session-token':{createSessionToken:async()=>''},
  })
  let access=await auth.getNavigationAccess(user)
  assert.equal(Object.values(access).some(Boolean),false)
  grants=[{idUser:user.idUser,idBlocAutorisation:'AUT-SPT',statut:'ACTIF',dateDebut:'2020-01-01',dateFin:null}]
  access=await auth.getNavigationAccess(user)
  assert.equal(access['AUT-SPT:READ'],true)
  assert.equal(access['AUT-ADM:READ'],false)
  assert.equal(access['AUT-COM:READ'],false)
  assert.equal(Object.entries(access).filter(([key])=>key.endsWith(':WRITE')).some(([,value])=>value),false)
  assert.equal(await auth.canAccess('AUT-SPT','READ'),true)
  assert.equal(await auth.canAccess('AUT-ADM','READ'),false)
  assert.equal(await auth.canAccess('AUT-SPT','WRITE'),false)
  fail=true
  assert.equal(Object.values(await auth.getNavigationAccess(user)).some(Boolean),false)
  assert.equal(await auth.canAccess('AUT-SPT','READ'),false)
  assert.ok(loads>=5)
})
