import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const out='docs/implementation/audit-cpu-livraison-2026-10-22/preuves'
const read=file=>JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''))
const context=read('.cache/cpu-audit/validation-context.json')
const manifest=read('docs/implementation/audit-cpu-livraison-2026-10-22/manifest.json')
const hash=buffer=>createHash('sha256').update(buffer).digest('hex')
const runtime=manifest.runtimeFiles.map(file=>{
  const current=hash(readFileSync(file)),frozen=hash(readFileSync(path.join(context.variant,file)))
  assert.equal(current,frozen,file);assert.equal(current,context.variantHashes[file],file)
  return{file,sha256:current,unchangedSinceFreeze:true}
})
for(const label of ['reference','variant']){
  const proof=read(`.cache/cpu-audit/build-${label}-normal.json`)
  assert.equal(proof.exitCode,0);assert.equal(proof.mockedFonts,false)
  assert.equal(proof.typescriptIgnoreBuildErrors,false);assert.equal(proof.fontAssets.length,11)
  assert(proof.fontAssets.every(font=>font.signature==='wOF2'&&font.bytes>5000))
  writeFileSync(path.join(out,`build-${label}-normal.json`),JSON.stringify(proof,null,2)+'\n')
  copyFileSync(proof.log,path.join(out,`build-${label}-normal.log`))
}
const production=read('.cache/cpu-audit/production-proof.json')
assert.equal(production.gitSource.sha,context.head)
writeFileSync(path.join(out,'production.json'),JSON.stringify(production,null,2)+'\n')
const source={createdAt:new Date().toISOString(),head:context.head,branch:context.branch,dependencyMode:context.dependencyMode,reference:context.reference,variant:context.variant,referenceDefinition:'HEAD plus preexisting local functional changes, before D1/C1/S1',runtime,checksComposition:'full frozen local workspace, including parallel functional changes; not HEAD plus only release patches',browser:'No enabled browser or app in inventory; no authenticated journey performed',productionWrites:0,pushed:false,deployed:false}
writeFileSync(path.join(out,'sources.json'),JSON.stringify(source,null,2)+'\n')
writeFileSync(path.join(out,'validation-input.json'),JSON.stringify(context,null,2)+'\n')
const preserved=JSON.parse(execFileSync(process.execPath,['scripts/cpu-audit/verify-preserved.mjs'],{encoding:'utf8'}))
assert.deepEqual(preserved.unexpected,[])
writeFileSync(path.join(out,'preservation.json'),JSON.stringify(preserved,null,2)+'\n')
for(const item of manifest.families.head.files){
  const normalized=readFileSync(item.file,'utf8').replace(/\r\n/g,'\n')
  assert.equal(hash(normalized),item.afterSha256,`Delivery patch drift: ${item.file}`)
}
console.log(JSON.stringify({runtimeFilesVerified:runtime.length,buildsArchived:2,productionSha:production.gitSource.sha}))
