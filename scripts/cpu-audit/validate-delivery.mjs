import assert from 'node:assert/strict'
import { spawn,execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync,writeFileSync,appendFileSync,existsSync,copyFileSync,mkdirSync,readdirSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const root=process.cwd(),candidate=path.resolve('.cache/cpu-delivery/candidate'),evidence=path.resolve('docs/implementation/audit-livraison-f1-a1-2026-10-23')
const before=JSON.parse(readFileSync('.cache/cpu-delivery/before.json','utf8')),previous=JSON.parse(readFileSync('docs/implementation/audit-dashboard-2026-10-23/checks.json','utf8')).find(x=>x.label==='suite')
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex')
assert(!existsSync(path.join(candidate,'.next')),'Never reuse build artifacts')
assert.equal(execFileSync('git',['rev-parse','--show-toplevel'],{cwd:candidate,encoding:'utf8'}).trim().toLowerCase(),candidate.replaceAll('\\','/').toLowerCase())
assert(!readdirSync(candidate).some(f=>f.startsWith('.env')))
for(const file of ['scripts/cpu-audit/verify-summary.mjs','scripts/cpu-audit/verify-delivery-counts.mjs','scripts/cpu-audit/validate-delivery.mjs','scripts/cpu-audit/prepare-delivery.mjs']){const target=path.join(candidate,file);mkdirSync(path.dirname(target),{recursive:true});copyFileSync(file,target)}
writeFileSync(path.join(evidence,'environment.json'),JSON.stringify({at:new Date().toISOString(),node:process.version,freeGiB:os.freemem()/2**30,totalGiB:os.totalmem()/2**30,availableCpus:os.availableParallelism(),candidate,normalBuild:true,mockedFonts:false,policy:'global raw invalidation, precise fresh-source fences'},null,2)+'\n')
const sourceFiles=Object.keys(before.files).filter(f=>/^(app|lib|components)\//.test(f)&&/\.(ts|tsx|css)$/.test(f)||['proxy.ts','next.config.mjs','postcss.config.mjs','package.json','tsconfig.json','pnpm-lock.yaml'].includes(f))
const sourceHashes=Object.fromEntries(sourceFiles.map(f=>[f,hash(path.join(candidate,f))]))
writeFileSync(path.join(evidence,'source-before-build.json'),JSON.stringify(sourceHashes,null,2)+'\n')
const records=[]
async function run(label,args){const started=Date.now(),log=path.join(evidence,`${label}.log`);writeFileSync(log,'');const child=spawn(process.execPath,args,{cwd:candidate,windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',x=>appendFileSync(log,x));child.stderr.on('data',x=>appendFileSync(log,x));const timer=setInterval(()=>console.log(JSON.stringify({label,seconds:Math.round((Date.now()-started)/1000),pid:child.pid})),20000);const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve)});clearInterval(timer);const text=readFileSync(log,'utf8'),r={label,args,exitCode,elapsedMs:Date.now()-started};if(/cpu|suite|users|permissions/.test(label))Object.assign(r,{tests:Number(text.match(/# tests (\d+)/)?.[1]),pass:Number(text.match(/# pass (\d+)/)?.[1]),fail:Number(text.match(/# fail (\d+)/)?.[1]),failures:[...text.matchAll(/^not ok \d+ - (.+)$/gm)].map(m=>m[1]).sort()});records.push(r);writeFileSync(path.join(evidence,'checks.json'),JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(r));if(label==='suite'){assert.equal(r.tests,previous.tests);assert.equal(r.pass,previous.pass);assert.deepEqual(r.failures,previous.failures)}else assert.equal(exitCode,0,label)}
await run('lint',['node_modules/eslint/bin/eslint.js','app','components','lib','proxy.ts','scripts/cpu-audit/prepare-delivery.mjs','scripts/cpu-audit/validate-delivery.mjs','scripts/cpu-audit/verify-summary.mjs','scripts/cpu-audit/verify-delivery-counts.mjs','tests/cpu/freshness-invalidation.test.mjs','tests/cpu/dashboard.test.mjs','tests/delivery/conservative-cache.test.mjs'])
await run('cpu',['--experimental-vm-modules','--test','--test-reporter=tap','tests/cpu/*.test.mjs','tests/delivery/conservative-cache.test.mjs'])
await run('users',['--experimental-vm-modules','--test','--test-reporter=tap','tests/users-ui/*.test.mjs'])
await run('permissions',['--test','--test-reporter=tap','tests/unit/authorization.test.ts','tests/unit/post-login-route.test.ts','tests/unit/authorization-matrix.test.ts'])
await run('summary',['scripts/cpu-audit/verify-summary.mjs'])
await run('dependencies',['--experimental-vm-modules','scripts/cpu-audit/verify-delivery-counts.mjs'])
copyFileSync(path.join(candidate,'delivery-counts.json'),path.join(evidence,'delivery-counts.json'))
await run('build',['node_modules/next/dist/bin/next','build'])
assert.equal(JSON.parse(readFileSync(path.join(candidate,'.next/required-server-files.json'),'utf8')).config.typescript.ignoreBuildErrors,false)
const fonts=readdirSync(path.join(candidate,'.next/static/media')).filter(f=>f.endsWith('.woff2')).map(file=>{const target=path.join(candidate,'.next/static/media',file),bytes=readFileSync(target);assert.equal(bytes.subarray(0,4).toString(),'wOF2');return{file,bytes:bytes.length,sha256:hash(target)}});assert.equal(fonts.length,11);writeFileSync(path.join(evidence,'fonts.json'),JSON.stringify({mocked:false,fonts},null,2)+'\n')
await run('typescript',['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'])
await run('suite',['--test','--test-reporter=tap','--test-concurrency=1','tests/unit/*.test.ts','tests/integration/*.test.ts'])
for(const[f,h]of Object.entries(sourceHashes))assert.equal(hash(path.join(candidate,f)),h,`Changed during build: ${f}`)
const allowed=new Set(['docs/implementation/audit-cpu-suivi-2026-10-22.md','docs/implementation/audit-dashboard-2026-10-23.md','scripts/cpu-audit/prepare-delivery.mjs'])
const changed=[];let protectedFiles=0
for(const[f,h]of Object.entries(before.files)){if(hash(path.join(root,f))!==h){assert(allowed.has(f),`Parallel workspace drift: ${f}`);changed.push(f)}else protectedFiles++}
writeFileSync(path.join(evidence,'preservation.json'),JSON.stringify({at:new Date().toISOString(),rootHead:before.head,protectedFiles,changed,sourceHashes,workspaceRuntimeUntouched:true},null,2)+'\n')
console.log('Selected F1/A1 composition validated. C2 remains in root workspace, not in selected raw-cache write policy. No server, push or deployment.')
