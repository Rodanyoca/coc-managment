import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root=process.cwd()
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim()
const hash=buffer=>createHash('sha256').update(buffer).digest('hex')
const baseline=JSON.parse(readFileSync('.cache/cpu-audit/baseline.json','utf8'))
const destination=mkdtempSync(path.join(tmpdir(),'coc-validation-'))
const reference=path.join(destination,'reference'),variant=path.join(destination,'variant')
mkdirSync(reference);mkdirSync(variant)
const restored=[]
for(const [file,expected] of Object.entries(baseline.files)){
  if(path.basename(file).startsWith('.env'))throw new Error('Credentials are forbidden')
  let buffer=readFileSync(path.join(baseline.destination,file))
  if(hash(buffer)!==expected){
    const candidates=[]
    if(existsSync(path.join(root,file)))candidates.push(readFileSync(path.join(root,file)))
    try{const blob=execFileSync('git',['show',`${baseline.head}:${file}`],{cwd:root,stdio:['ignore','pipe','ignore']});candidates.push(blob,Buffer.from(blob.toString('utf8').replace(/\r?\n/g,'\r\n')))}catch{}
    buffer=candidates.find(candidate=>hash(candidate)===expected)
    if(!buffer)throw new Error(`Initial reference changed and cannot be recovered exactly: ${file}`)
    restored.push(file)
  }
  const target=path.join(reference,file);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,buffer)
}
const inputFiles=[...new Set(git('ls-files','-z','--cached','--others','--exclude-standard').split('\0'))]
const hashes={}
for(const file of inputFiles){
  if(!file||path.basename(file).startsWith('.env')||file.split('/').some(part=>['node_modules','.git','.cache','.next','.next-dev'].includes(part)))continue
  const source=path.join(root,file)
  if(!existsSync(source)||!lstatSync(source).isFile())continue
  const target=path.join(variant,file);mkdirSync(path.dirname(target),{recursive:true});copyFileSync(source,target)
  hashes[file]=hash(readFileSync(source))
}
const dependencies=path.join(root,'node_modules')
for(const context of [reference,variant]){
  console.log(`Copying physical dependencies into ${context}`)
  const started=Date.now()
  cpSync(dependencies,path.join(context,'node_modules'),{recursive:true,dereference:true,filter:source=>!source.startsWith(path.join(dependencies,'.cache'))})
  const nextPackage=realpathSync(path.join(context,'node_modules/next/package.json'))
  if(!nextPackage.startsWith(context+path.sep)||lstatSync(path.join(context,'node_modules')).isSymbolicLink())throw new Error('Compiler dependencies are not local physical files')
  console.log(JSON.stringify({context,dependencyCopyMs:Date.now()-started,nextPackage,next:JSON.parse(readFileSync(nextPackage,'utf8')).version}))
}
const result={createdAt:new Date().toISOString(),head:git('rev-parse','HEAD'),branch:git('branch','--show-current'),status:git('status','--short'),destination,reference,variant,restoredReferenceFiles:restored,dependencyMode:'physical copy, dereferenced, no external node_modules junction',variantHashes:hashes}
writeFileSync(path.join(destination,'validation-input.json'),JSON.stringify(result,null,2)+'\n')
writeFileSync('.cache/cpu-audit/validation-context.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({destination,reference,variant,restored},null,2))
