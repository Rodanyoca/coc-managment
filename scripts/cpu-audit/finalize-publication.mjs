import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const context=JSON.parse(readFileSync('.cache/cpu-publication/context.json','utf8'))
const out='docs/implementation/audit-cpu-publication-2026-10-22/preuves'
const checks=JSON.parse(readFileSync(path.join(out,'checks.json'),'utf8'))
assert.equal(checks.length,6)
for(const check of checks)assert.equal(check.exitCode,check.name==='suite'?1:0,check.name)
assert.equal(checks.find(check=>check.name==='suite').fail,6)
assert.equal(checks.find(check=>check.name==='cpu').pass,19)
assert.equal(checks.find(check=>check.name==='permissions').pass,23)
const hash=buffer=>createHash('sha256').update(buffer).digest('hex')
const files=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{encoding:'utf8'}).split('\0').filter(Boolean)
const included={},application={}
for(const file of [...new Set(files)]){
 if(file===`${out}/composition.json`)continue
 if(file.split('/').some(part=>['.git','.cache','.next','.next-dev','node_modules'].includes(part))||path.basename(file).startsWith('.env')||file==='scripts/cpu-audit/mock-fonts.cjs')continue
 if(!existsSync(file)){
   assert.equal(context.included[file],null,`Unexpected deletion ${file}`)
   continue
 }
 const buffer=readFileSync(file),sourceHash=hash(buffer)
 if(!file.startsWith('docs/')&&!file.startsWith('scripts/cpu-audit/'))assert.equal(sourceHash,context.included[file],`Unvalidated source drift: ${file}`)
 if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(buffer.toString('utf8')))throw new Error(`Private key: ${file}`)
 // Keep the normal build's generated production type references.
 if(file!=='next-env.d.ts'){
   const target=path.join(context.target,file);mkdirSync(path.dirname(target),{recursive:true});copyFileSync(file,target)
 }
 included[file]=hash(readFileSync(path.join(context.target,file)))
 if(/^(app\/|components\/|lib\/|proxy\.ts$|next-env\.d\.ts$|next\.config\.|tsconfig\.|package\.json$|.*lock.*$)/.test(file))application[file]=included[file]
}
writeFileSync(path.join(out,'composition.json'),JSON.stringify({createdAt:new Date().toISOString(),checkout:context.target,base:context.base,previousProductionSha:context.previousProductionSha,previousDeployment:context.previousDeployment,excluded:context.excluded,application,files:included,normalBuildGeneratedFile:'next-env.d.ts: .next/types references',preservedOriginalWorkspace:true},null,2)+'\n')
copyFileSync(path.join(out,'composition.json'),path.join(context.target,out,'composition.json'))
console.log(JSON.stringify({files:Object.keys(included).length,applicationFiles:Object.keys(application).length,sourceDrift:'none outside audit documentation/tools',checks:'all required checks complete; six known failures retained'}))
