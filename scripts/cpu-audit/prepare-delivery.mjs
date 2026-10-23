import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import path from 'node:path'

const base=path.resolve('.cache/cpu-delivery'),candidate=path.join(base,'candidate'),reference=path.join(base,'reference'),evidence='docs/implementation/audit-livraison-f1-a1-2026-10-23'
assert(!existsSync(path.join(base,'before.json')),'Use a new preparation; never overwrite an earlier delivery')
mkdirSync(candidate,{recursive:true});mkdirSync(reference,{recursive:true});mkdirSync(evidence,{recursive:true})
const files=[...new Set(execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{encoding:'utf8'}).split('\0').filter(Boolean))].filter(f=>existsSync(f)&&!path.basename(f).startsWith('.env')&&f!=='scripts/cpu-audit/mock-fonts.cjs')
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex'),hashes={}
for(const f of files){hashes[f]=hash(f);for(const root of [reference,candidate]){const dest=path.join(root,f);mkdirSync(path.dirname(dest),{recursive:true});copyFileSync(f,dest)}}
writeFileSync(path.join(base,'before.json'),JSON.stringify({at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:hashes},null,2)+'\n')
// Defer the reduction in raw-cache invalidation; retain all F1 source fences.
const rollback=path.join(base,'rollback-c2-lf.patch')
writeFileSync(rollback,readFileSync('docs/implementation/audit-cpu-suite-2026-10-23/rollback-c2-keep-f1-s1.patch','utf8').replaceAll('\r\n','\n'))
execFileSync('git',['apply','--check','--directory=.cache/cpu-delivery/candidate',rollback])
execFileSync('git',['apply','--directory=.cache/cpu-delivery/candidate',rollback])
const sheetsFile=path.join(candidate,'lib/google/sheets.ts')
writeFileSync(sheetsFile,readFileSync(sheetsFile,'utf8').replace('// A global refresh remains available; writes fence only their workbook.','// Mutations conservatively fence all raw workbooks; fresh reads use source fences.'))
function edit(file,replacements){let s=readFileSync(path.join(candidate,file),'utf8');for(const [from,to]of replacements){assert.equal(s.split(from).length-1,1,`Expected one replacement: ${file}: ${from}`);s=s.replace(from,to)}writeFileSync(path.join(candidate,file),s)}
// Test the chosen conservative contract, rather than silently skip C2 assertions.
edit('tests/cpu/freshness-invalidation.test.mjs',[
 ["an audit append preserves warm business data and headers, invalidates its own workbook","an audit append conservatively invalidates all raw workbook caches"],
 ["assert.equal(state.calls.length, before, 'unrelated workbook must remain warm')","assert.equal(state.calls.length, before + 1, 'conservative policy refreshes the other workbook')"],
 ["assert.equal(state.calls.length, before + 1)\n})","assert.equal(state.calls.length, before + 2)\n})"],
 ['fences all ranges of its workbook only','fences all raw workbook ranges'],
 ['assert.equal(state.calls.length, before)\n    await data.getSheetRows(params(\'USERS\'))','assert.equal(state.calls.length, before + 2)\n    await data.getSheetRows(params(\'USERS\'))'],
 ['assert.equal(state.calls.length, before + 3)','assert.equal(state.calls.length, before + 5)'],
])
edit('tests/cpu/dashboard.test.mjs',[
 ['a two-workbook mutation fences each old read and preserves an independent workbook','a two-workbook mutation fences old reads and conservatively refreshes all raw workbooks'],
 ['partial failure across workbooks invalidates both attempted writes, not an independent cache','partial failure across workbooks invalidates all raw caches on either attempted write'],
 ['assert.equal(f.raw.state.calls.length, before)\n  assert.equal((await f.load())','assert.equal(f.raw.state.calls.length, before + 1)\n  assert.equal((await f.load())'],
 ['assert.equal(f.raw.state.calls.length, before)\n  await f.load()','assert.equal(f.raw.state.calls.length, before + 1)\n  await f.load()'],
 ['assert.equal(f.raw.state.calls.length - before, 2)','assert.equal(f.raw.state.calls.length - before, 3)'],
])
// A real local Git root bounds Turbopack. No root workspace Git state is changed.
execFileSync('git',['init','--quiet'],{cwd:candidate})
const donor=path.resolve('.cache/cpu-next/variant/node_modules')
assert(existsSync(donor)&&!existsSync(path.join(candidate,'node_modules')))
renameSync(donor,path.join(candidate,'node_modules'))
const modified=files.filter(f=>hash(path.join(candidate,f))!==hashes[f])
assert.deepEqual(modified.sort(),['lib/google/sheets.ts','tests/cpu/dashboard.test.mjs','tests/cpu/freshness-invalidation.test.mjs'].sort())
writeFileSync(`${evidence}/composition.json`,JSON.stringify({at:new Date().toISOString(),candidate,reference,rootHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),decision:'F1 + A1 + all parallel functional changes, raw caches globally invalidated; C2 optimization deferred',files:files.length,modifiedVsWorkspace:modified,dependencies:'Physical existing node_modules moved from stopped previous isolated validation; no install, symlink or mocked fonts',sourceHashes:Object.fromEntries(files.map(f=>[f,hash(path.join(candidate,f))]))},null,2)+'\n')
console.log(JSON.stringify({candidate,files:files.length,modifiedVsWorkspace:modified}))
