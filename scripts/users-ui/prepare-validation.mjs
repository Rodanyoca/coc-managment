import { execFileSync } from 'node:child_process'
import { cpSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const target=path.resolve('.cache/users-ui/validation')
mkdirSync(target,{recursive:true})
const files=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{encoding:'utf8'}).split('\0').filter(Boolean)
for(const file of new Set(files)){
 if(path.basename(file).startsWith('.env')||file==='scripts/cpu-audit/mock-fonts.cjs'||!existsSync(file))continue
 const output=path.join(target,file);mkdirSync(path.dirname(output),{recursive:true});copyFileSync(file,output)
}
cpSync('node_modules',path.join(target,'node_modules'),{recursive:true,dereference:true,filter:source=>!source.startsWith(path.join('node_modules','.cache'))})
writeFileSync('.cache/users-ui/context.json',JSON.stringify({target,referenceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),source:'full workspace at task start plus user UI changes; no .env or build cache',previousValidation:JSON.parse(readFileSync('docs/implementation/audit-cpu-publication-2026-10-22/preuves/checks.json','utf8'))},null,2))
console.log(target)
