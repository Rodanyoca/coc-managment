import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const before=JSON.parse(readFileSync('.cache/users-ui/before.json','utf8'))
const hash=file=>existsSync(file)?createHash('sha256').update(readFileSync(file)).digest('hex'):null
const allowed=new Set(['app/dashboard/utilisateurs/users-client.tsx','app/dashboard/utilisateurs/[id]/user-detail-client.tsx','app/dashboard/utilisateurs/[id]/page.tsx','app/api/users/[id]/route.ts','docs/lot-2-utilisateurs-authentification-autorisations.md'])
const changed=Object.keys(before).filter(file=>hash(file)!==before[file])
const unexpected=changed.filter(file=>!allowed.has(file))
assert.deepEqual(unexpected,[])
const core=['lib/documents/data.ts','lib/google/sheets.ts','lib/auth.ts','lib/auth/authorization.ts','lib/auth/post-login-route.ts']
for(const file of core)assert.equal(hash(file),before[file],file)
const application=[...allowed].filter(file=>!file.startsWith('docs/')).concat(['components/dashboard/user-account-ui.tsx','app/dashboard/utilisateurs/loading.tsx','app/dashboard/utilisateurs/[id]/loading.tsx','app/dashboard/utilisateurs/error.tsx'])
for(const file of application)assert.equal(hash(file),hash(path.join('.cache/users-ui/validation',file)),`Compiled source drift ${file}`)
assert(!existsSync('app/users-ui-preview'))
const proof={preserved:Object.keys(before).length-changed.length,intentionalExistingChanges:changed,unexpected,coreLotsPreserved:core,application:application.map(file=>({file,sha256:hash(file)})),noPush:true,noDeployment:true,browserPreviewInOriginal:false}
writeFileSync('docs/interfaces/preuves-utilisateurs-2026-10-23/preservation.json',JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify({preserved:proof.preserved,changed,unexpected,compiledFilesChecked:application.length}))
