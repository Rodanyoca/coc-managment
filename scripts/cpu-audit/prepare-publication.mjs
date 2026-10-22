import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root=process.cwd(),target=path.join(root,'.cache/cpu-publication/checkout')
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'})
const prior=JSON.parse(readFileSync('.cache/cpu-audit/validation-context.json','utf8'))
const hash=buffer=>createHash('sha256').update(buffer).digest('hex')
const files=[...new Set(git('ls-files','-z','--cached','--others','--exclude-standard').split('\0').filter(Boolean))]
const included={},excluded=[],drift=[]
for(const file of files){
  if(file.split('/').some(part=>['.git','.cache','.next','.next-dev','node_modules'].includes(part))||path.basename(file).startsWith('.env')||file==='scripts/cpu-audit/mock-fonts.cjs'){
    excluded.push(file)
    // Preserve the preexisting deletion of the tracked environment template.
    if(file==='.env.example'&&!existsSync(file)&&existsSync(path.join(target,file)))unlinkSync(path.join(target,file))
    continue
  }
  const output=path.join(target,file)
  if(!existsSync(file)){if(existsSync(output))unlinkSync(output);included[file]=null;continue}
  const buffer=readFileSync(file)
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(buffer.toString('utf8')))throw new Error(`Private key in source: ${file}`)
  included[file]=hash(buffer)
  if(prior.variantHashes[file]&&prior.variantHashes[file]!==included[file])drift.push(file)
  mkdirSync(path.dirname(output),{recursive:true});copyFileSync(file,output)
}
assert(drift.every(file=>file.startsWith('docs/')||file.startsWith('scripts/cpu-audit/')||file.startsWith('tests/cpu/')),'Unexpected application drift since validated freeze')
const started=Date.now()
cpSync('node_modules',path.join(target,'node_modules'),{recursive:true,dereference:true,filter:source=>!source.startsWith(path.join('node_modules','.cache'))})
const context={createdAt:new Date().toISOString(),root,target,base:prior.head,previousDeployment:'dpl_ENVvMe52hN8h5PerjuwZ2p34woTw',previousProductionSha:prior.head,remoteMain:'748f6fe1f20720987c72904e0ad903a519783e1a',included,excluded,drift,dependencyCopyMs:Date.now()-started}
writeFileSync('.cache/cpu-publication/context.json',JSON.stringify(context,null,2)+'\n')
console.log(JSON.stringify({target,files:Object.keys(included).length,excluded,drift,dependencyCopyMs:context.dependencyCopyMs}))
