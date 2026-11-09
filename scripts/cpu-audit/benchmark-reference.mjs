import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'

// Only these benchmarked modules were identical to HEAD in the dirty baseline.
// This recreates their source, not the entire initial application/worktree.
const revision=process.argv[2] || 'c1488d33b6fcd2953d2bf0becc25a83055e13e2f'
if(!/^[a-f0-9]{40}$/.test(revision))throw new Error('Pass an exact commit SHA')
const root=mkdtempSync(path.join(tmpdir(),'coc-cpu-benchmark-reference-'))
const hashes={}
for(const file of ['lib/documents/data.ts','lib/documents/types.ts','lib/documents/validation.ts','lib/documents/limits.ts','lib/google/sheets.ts']){
  const content=execFileSync('git',['show',`${revision}:${file}`])
  const target=path.join(root,file)
  mkdirSync(path.dirname(target),{recursive:true})
  writeFileSync(target,content)
  hashes[file]=createHash('sha256').update(content).digest('hex')
}
writeFileSync(path.join(root,'benchmark-reference.json'),JSON.stringify({revision,hashes},null,2))
console.log(JSON.stringify({root,revision,hashes},null,2))
