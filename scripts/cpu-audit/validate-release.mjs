import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Run after the production builds, serially, to avoid contaminating their timings.
const context=JSON.parse(readFileSync('.cache/cpu-audit/validation-context.json','utf8'))
const output='docs/implementation/audit-cpu-livraison-2026-10-22/preuves'
mkdirSync(output,{recursive:true})
const records=[]
async function run(label,name,args){
  const started=Date.now(),chunks=[]
  const child=spawn(process.execPath,args,{cwd:context[label],windowsHide:true,stdio:['ignore','pipe','pipe']})
  child.stdout.on('data',data=>chunks.push(data));child.stderr.on('data',data=>chunks.push(data))
  const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve)})
  const log=Buffer.concat(chunks).toString('utf8'),file=`${label}-${name}.log`
  writeFileSync(path.join(output,file),log)
  const number=key=>Number(log.match(new RegExp(`(?:#|â„¹) ${key} (\\d+)`))?.[1])
  const record={label,name,args,exitCode,elapsedMs:Date.now()-started,log:file}
  if(name==='suite'||name==='cpu'||name==='permissions'){
    Object.assign(record,{tests:number('tests'),pass:number('pass'),fail:number('fail'),failures:[...log.matchAll(/^not ok \d+ - (.+)$/gm)].map(match=>match[1]).sort()})
  }
  records.push(record);writeFileSync(path.join(output,'checks.json'),JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(record))
  return record
}
for(const label of ['reference','variant']){
  await run(label,'suite',['--test','--test-reporter=tap','--test-concurrency=1','tests/unit/*.test.ts','tests/integration/*.test.ts'])
  await run(label,'typescript',['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'])
}
await run('variant','cpu',['--experimental-vm-modules','--test','--test-reporter=tap','tests/cpu/*.test.mjs'])
await run('variant','permissions',['--test','--test-reporter=tap','tests/unit/authorization.test.ts','tests/unit/post-login-route.test.ts','tests/unit/authorization-matrix.test.ts'])
await run('variant','lint',['node_modules/eslint/bin/eslint.js','lib/documents/data.ts','lib/google/sheets.ts','lib/auth.ts','lib/auth/authorization.ts','lib/auth/post-login-route.ts','tests/unit/authorization.test.ts','tests/unit/post-login-route.test.ts'])
const before=records.find(item=>item.label==='reference'&&item.name==='suite'),after=records.find(item=>item.label==='variant'&&item.name==='suite')
assert.deepEqual(after.failures,before.failures)
assert.equal(after.tests,before.tests);assert.equal(after.pass,before.pass)
assert.equal(before.tests,325);assert.equal(before.fail,6)
for(const record of records.filter(item=>item.name!=='suite'))assert.equal(record.exitCode,0,`${record.label} ${record.name}`)
console.log('Validation complete; six identical existing suite failures retained.')
