import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
const manifest=JSON.parse(readFileSync(process.argv[2] || '.cache/cpu-audit/baseline.json','utf8'))
const allowed=new Set(['package.json','lib/documents/data.ts','lib/google/sheets.ts','lib/auth.ts','lib/auth/authorization.ts','lib/auth/post-login-route.ts','tests/unit/authorization.test.ts','tests/unit/post-login-route.test.ts'])
let preserved=0
const changed=[],unexpected=[]
for(const [file,hash] of Object.entries(manifest.files)){
  const target=path.resolve(file)
  const current=existsSync(target)?createHash('sha256').update(readFileSync(target)).digest('hex'):null
  if(current===hash){preserved++;continue}
  changed.push(file)
  if(!allowed.has(file)&&!file.startsWith('scripts/cpu-audit/'))unexpected.push(file)
}
console.log(JSON.stringify({preserved,changed,unexpected},null,2))
if(unexpected.length)process.exitCode=1
