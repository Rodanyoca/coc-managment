import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const context=JSON.parse(readFileSync('.cache/cpu-publication/context.json','utf8'))
const cwd=context.target,out=path.join(context.root,'docs/implementation/audit-cpu-publication-2026-10-22/preuves')
mkdirSync(out,{recursive:true})
const resumeLint=process.argv.includes('--resume-lint')
const records=resumeLint?JSON.parse(readFileSync(path.join(out,'checks.json'),'utf8')):[]
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1'}
for(const name of Object.keys(env))if(/^(AUTH_|GOOGLE_|NEXT_FONT_GOOGLE_MOCKED_RESPONSES$|NEXT_DIST_DIR$|NODE_OPTIONS$)/.test(name))delete env[name]
assert(!readdirSync(cwd).some(file=>file.startsWith('.env')))
async function run(name,args){
 const started=Date.now(),chunks=[]
 const child=spawn(process.execPath,args,{cwd,env,windowsHide:true,stdio:['ignore','pipe','pipe']})
 child.stdout.on('data',data=>chunks.push(data));child.stderr.on('data',data=>chunks.push(data))
 const heartbeat=setInterval(()=>console.log(JSON.stringify({name,pid:child.pid,elapsedSeconds:Math.round((Date.now()-started)/1000)})),20000)
 const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve)})
 clearInterval(heartbeat)
 const log=Buffer.concat(chunks).toString('utf8');writeFileSync(path.join(out,`${name}.log`),log)
 const record={name,args,exitCode,startedAt:new Date(started).toISOString(),finishedAt:new Date().toISOString(),elapsedMs:Date.now()-started}
 if(['suite','cpu','permissions'].includes(name))Object.assign(record,{tests:Number(log.match(/# tests (\d+)/)?.[1]),pass:Number(log.match(/# pass (\d+)/)?.[1]),fail:Number(log.match(/# fail (\d+)/)?.[1]),failures:[...log.matchAll(/^not ok \d+ - (.+)$/gm)].map(match=>match[1]).sort()})
 records.push(record);writeFileSync(path.join(out,'checks.json'),JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(record))
 if(name==='suite'){
  const before=JSON.parse(readFileSync('docs/implementation/audit-cpu-livraison-2026-10-22/preuves/checks.json','utf8')).find(item=>item.label==='reference'&&item.name==='suite')
  assert.equal(record.tests,325);assert.equal(record.pass,319);assert.deepEqual(record.failures,before.failures)
 }else assert.equal(exitCode,0,name)
 return record
}
if(!resumeLint){
await run('build',['node_modules/next/dist/bin/next','build'])
const required=JSON.parse(readFileSync(path.join(cwd,'.next/required-server-files.json'),'utf8'))
assert.equal(required.config.typescript.ignoreBuildErrors,false)
const fonts=readdirSync(path.join(cwd,'.next/static/media')).filter(file=>file.endsWith('.woff2')).map(file=>{const data=readFileSync(path.join(cwd,'.next/static/media',file));assert.equal(data.subarray(0,4).toString(),'wOF2');assert(data.length>5000);return{file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')}})
assert.equal(fonts.length,11)
writeFileSync(path.join(out,'fonts.json'),JSON.stringify({mocked:false,normalConfig:true,buildId:readFileSync(path.join(cwd,'.next/BUILD_ID'),'utf8').trim(),fonts},null,2)+'\n')
await run('suite',['--test','--test-reporter=tap','--test-concurrency=1','tests/unit/*.test.ts','tests/integration/*.test.ts'])
await run('cpu',['--experimental-vm-modules','--test','--test-reporter=tap','tests/cpu/*.test.mjs'])
await run('permissions',['--test','--test-reporter=tap','tests/unit/authorization.test.ts','tests/unit/post-login-route.test.ts','tests/unit/authorization-matrix.test.ts'])
await run('typescript',['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'])
}else{
 assert.equal(records.length,5)
 assert(records.every(record=>record.exitCode===(record.name==='suite'?1:0)))
}
const changed=execFileSync('git',['ls-files','--modified','--others','--exclude-standard','-z'],{cwd,encoding:'utf8'}).split('\0').filter(file=>file&&existsSync(path.join(cwd,file))&&/\.(tsx?|mjs)$/.test(file)&&/^(app|components|lib)\//.test(file))
await run('lint',['node_modules/eslint/bin/eslint.js',...changed])
console.log('Final publication source validated; six identical preexisting failures retained.')
