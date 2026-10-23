import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, copyFileSync, renameSync, readdirSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const evidence='docs/implementation/audit-dashboard-2026-10-23',variant=path.resolve('.cache/cpu-next/variant'),reference=path.resolve('.cache/cpu-dashboard/reference')
const before=JSON.parse(readFileSync('.cache/cpu-dashboard/before.json','utf8'))
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex')
const previous=JSON.parse(readFileSync('docs/implementation/audit-cpu-suite-2026-10-23/checks.json','utf8'))
const build=previous.find(x=>x.label==='variant-build'),ts=previous.find(x=>x.label==='variant-typescript'),suite=previous.find(x=>x.label==='variant-suite')
assert.equal(build.exitCode,0);assert.equal(ts.exitCode,0);assert.equal(suite.pass,319);assert.equal(suite.fail,6)
const compiledInputs=Object.keys(before.files).filter(f=>/^(app|components|lib)\//.test(f)&&/\.(ts|tsx|css)$/.test(f)||['proxy.ts','next.config.mjs','postcss.config.mjs','tsconfig.json','package.json','pnpm-lock.yaml'].includes(f))
for(const f of compiledInputs)assert.equal(hash(path.join(reference,f)),hash(path.join(variant,f)),`Previous build is not this baseline: ${f}`)
writeFileSync(`${evidence}/reference-build-reuse.json`,JSON.stringify({at:new Date().toISOString(),basis:'Exact compile-source hashes compared to previously successful isolated C2/F1 variant, before replacement; no timing benchmark inferred',identicalInputs:compiledInputs.length,build,typescript:ts,suite,previousProofDirectory:'../audit-cpu-suite-2026-10-23',hashes:Object.fromEntries(compiledInputs.map(f=>[f,hash(path.join(reference,f))]))},null,2)+'\n')
assert.equal(execFileSync('git',['rev-parse','--show-toplevel'],{cwd:variant,encoding:'utf8'}).trim().toLowerCase(),variant.replaceAll('\\','/').toLowerCase())
assert(!existsSync('.cache/cpu-dashboard/pre-dashboard-build'))
renameSync(path.join(variant,'.next'),path.resolve('.cache/cpu-dashboard/pre-dashboard-build'))
const files=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{encoding:'utf8'}).split('\0').filter(Boolean)
for(const file of files){if(!existsSync(file)||path.basename(file).startsWith('.env')||file==='scripts/cpu-audit/mock-fonts.cjs')continue;const dest=path.join(variant,file);mkdirSync(path.dirname(dest),{recursive:true});copyFileSync(file,dest)}
writeFileSync(`${evidence}/environment.json`,JSON.stringify({at:new Date().toISOString(),node:process.version,freeGiB:os.freemem()/2**30,totalGiB:os.totalmem()/2**30,availableCpus:os.availableParallelism(),variant,reference,normalBuild:true,mockedFonts:false},null,2)+'\n')
const records=[]
async function run(label,args){
 const started=Date.now(),log=`${evidence}/${label}.log`;writeFileSync(log,'')
 const child=spawn(process.execPath,args,{cwd:variant,env:process.env,windowsHide:true,stdio:['ignore','pipe','pipe']})
 child.stdout.on('data',b=>appendFileSync(log,b));child.stderr.on('data',b=>appendFileSync(log,b))
 const timer=setInterval(()=>console.log(JSON.stringify({label,seconds:Math.round((Date.now()-started)/1000),pid:child.pid})),20000)
 const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve)});clearInterval(timer)
 const text=readFileSync(log,'utf8'),record={label,args,exitCode,elapsedMs:Date.now()-started}
 if(/cpu|permissions|users|suite/.test(label))Object.assign(record,{tests:Number(text.match(/# tests (\d+)/)?.[1]),pass:Number(text.match(/# pass (\d+)/)?.[1]),fail:Number(text.match(/# fail (\d+)/)?.[1]),failures:[...text.matchAll(/^not ok \d+ - (.+)$/gm)].map(m=>m[1]).sort()})
 records.push(record);writeFileSync(`${evidence}/checks.json`,JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(record))
 if(label==='suite'){assert.equal(record.tests,suite.tests);assert.equal(record.pass,suite.pass);assert.deepEqual(record.failures,suite.failures)}else assert.equal(exitCode,0,label)
}
await run('lint',['node_modules/eslint/bin/eslint.js','app','components','lib','proxy.ts','scripts/cpu-audit/dashboard-fixture.mjs','scripts/cpu-audit/benchmark-dashboard.mjs','scripts/cpu-audit/validate-dashboard.mjs','tests/cpu/dashboard.test.mjs'])
await run('cpu',['--experimental-vm-modules','--test','--test-reporter=tap','tests/cpu/*.test.mjs'])
await run('users',['--experimental-vm-modules','--test','--test-reporter=tap','tests/users-ui/*.test.mjs'])
await run('permissions',['--test','--test-reporter=tap','tests/unit/authorization.test.ts','tests/unit/post-login-route.test.ts','tests/unit/authorization-matrix.test.ts'])
await run('build',['node_modules/next/dist/bin/next','build'])
assert.equal(JSON.parse(readFileSync(path.join(variant,'.next/required-server-files.json'),'utf8')).config.typescript.ignoreBuildErrors,false)
const fonts=readdirSync(path.join(variant,'.next/static/media')).filter(f=>f.endsWith('.woff2')).map(file=>{const p=path.join(variant,'.next/static/media',file),bytes=readFileSync(p);assert.equal(bytes.subarray(0,4).toString(),'wOF2');return{file,bytes:bytes.length,sha256:hash(p)}})
assert.equal(fonts.length,11);writeFileSync(`${evidence}/fonts.json`,JSON.stringify({mocked:false,fonts},null,2)+'\n')
await run('typescript',['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'])
await run('suite',['--test','--test-reporter=tap','--test-concurrency=1','tests/unit/*.test.ts','tests/integration/*.test.ts'])
const allowed=new Set(['lib/activites/data.ts','lib/activites/dashboard.ts','docs/implementation/audit-cpu-suivi-2026-10-22.md','docs/implementation/audit-cpu-suite-2026-10-23.md'])
let protectedFiles=0;const changed=[]
for(const [f,h]of Object.entries(before.files)){if(hash(f)!==h){assert(allowed.has(f),`Unexpected parallel change: ${f}`);changed.push(f)}else protectedFiles++}
const sources=Object.fromEntries(['lib/activites/data.ts','lib/activites/dashboard.ts','lib/google/sheets.ts','lib/users/google-adapter.ts','lib/users/repository.ts','lib/users/types.ts'].map(f=>{assert.equal(hash(f),hash(path.join(variant,f)));return[f,hash(f)]}))
writeFileSync(`${evidence}/preservation.json`,JSON.stringify({at:new Date().toISOString(),beforeHead:before.head,protectedFiles,changed,sources},null,2)+'\n')
console.log('Final validation complete; no development server started or publication performed.')
