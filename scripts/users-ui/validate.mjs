import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const target=path.resolve('.cache/users-ui/validation'),out='docs/interfaces/preuves-utilisateurs-2026-10-23'
assert.equal(realpathSync(target),target)
for(const relative of ['app/users-ui-preview','.next-dev']){
 const file=path.resolve(target,relative)
 assert(file.startsWith(target+path.sep))
 if(existsSync(file)){assert(realpathSync(file).startsWith(target+path.sep));rmSync(file,{recursive:true,force:true})}
}
const files=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{encoding:'utf8'}).split('\0').filter(Boolean)
for(const file of new Set(files)){
 if(path.basename(file).startsWith('.env')||file==='scripts/cpu-audit/mock-fonts.cjs'||!existsSync(file))continue
 const output=path.join(target,file);mkdirSync(path.dirname(output),{recursive:true});copyFileSync(file,output)
}
assert(!existsSync(path.join(target,'app/users-ui-preview')))
assert(!readdirSync(target).some(file=>file.startsWith('.env')))
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1'}
for(const key of Object.keys(env))if(/^(AUTH_|GOOGLE_|NEXT_FONT_GOOGLE_MOCKED_RESPONSES$|NEXT_DIST_DIR$|NODE_OPTIONS$)/.test(key))delete env[key]
const records=[]
async function run(name,args){
 const started=Date.now(),chunks=[]
 const child=spawn(process.execPath,args,{cwd:target,env,windowsHide:true,stdio:['ignore','pipe','pipe']})
 child.stdout.on('data',data=>chunks.push(data));child.stderr.on('data',data=>chunks.push(data))
 const tick=setInterval(()=>console.log(JSON.stringify({name,pid:child.pid,seconds:Math.round((Date.now()-started)/1000)})),20000)
 const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve)});clearInterval(tick)
 const log=Buffer.concat(chunks).toString('utf8');writeFileSync(`${out}/${name}.log`,log)
 const record={name,args,exitCode,elapsedMs:Date.now()-started}
 if(['suite','cpu','users','permissions'].includes(name))Object.assign(record,{tests:Number(log.match(/# tests (\d+)/)?.[1]),pass:Number(log.match(/# pass (\d+)/)?.[1]),fail:Number(log.match(/# fail (\d+)/)?.[1]),failures:[...log.matchAll(/^not ok \d+ - (.+)$/gm)].map(match=>match[1]).sort()})
 records.push(record);writeFileSync(`${out}/checks.json`,JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(record))
 if(name==='suite'){
  const previous=JSON.parse(readFileSync('docs/implementation/audit-cpu-publication-2026-10-22/preuves/checks.json','utf8')).find(item=>item.name==='suite')
  assert.equal(record.tests,previous.tests);assert.equal(record.pass,previous.pass);assert.deepEqual(record.failures,previous.failures)
 }else assert.equal(exitCode,0,name)
}
await run('build',['node_modules/next/dist/bin/next','build'])
assert.equal(JSON.parse(readFileSync(path.join(target,'.next/required-server-files.json'),'utf8')).config.typescript.ignoreBuildErrors,false)
const fonts=readdirSync(path.join(target,'.next/static/media')).filter(file=>file.endsWith('.woff2')).map(file=>{const data=readFileSync(path.join(target,'.next/static/media',file));assert.equal(data.subarray(0,4).toString(),'wOF2');return{file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')}})
assert.equal(fonts.length,11)
writeFileSync(`${out}/fonts.json`,JSON.stringify({mocked:false,fonts},null,2)+'\n')
await run('typescript',['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'])
await run('lint',['node_modules/eslint/bin/eslint.js','app/dashboard/utilisateurs','app/api/users/[id]/route.ts','components/dashboard/user-account-ui.tsx','tests/users-ui','scripts/users-ui'])
await run('suite',['--test','--test-reporter=tap','--test-concurrency=1','tests/unit/*.test.ts','tests/integration/*.test.ts'])
await run('cpu',['--experimental-vm-modules','--test','--test-reporter=tap','tests/cpu/*.test.mjs'])
await run('users',['--experimental-vm-modules','--test','--test-reporter=tap','tests/users-ui/*.test.mjs'])
await run('permissions',['--test','--test-reporter=tap','tests/unit/authorization.test.ts','tests/unit/post-login-route.test.ts','tests/unit/authorization-matrix.test.ts'])
console.log('Validation complete; no application error added; known six suite failures retained.')
