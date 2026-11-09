import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const [baseline,candidate,output]=process.argv.slice(2)
if(!output)throw new Error('Usage: node scripts/cpu-audit/summarize-validation.mjs BASELINE CANDIDATE OUTPUT.json')
const read=file=>{const buffer=readFileSync(file);return buffer.subarray(0,2).equals(Buffer.from([255,254]))?buffer.toString('utf16le'):buffer.toString('utf8')}
const tests=(root,name)=>{
  const text=read(path.join(root,name))
  return {tests:Number(text.match(/ℹ tests (\d+)/)?.[1]),pass:Number(text.match(/ℹ pass (\d+)/)?.[1]),fail:Number(text.match(/ℹ fail (\d+)/)?.[1]),failures:[...new Set([...text.matchAll(/^✖ (.+) \([\d.]+ms\)\r?$/gm)].map(match=>match[1]))].sort()}
}
const baselineTests=tests(baseline,'baseline-tests.log'),candidateTests=tests(candidate,'candidate-tests.log')
const targetedCpuTests=tests(process.cwd(),'.cache/cpu-audit/cpu-tests-final.log')
assert.deepEqual(candidateTests.failures,baselineTests.failures,'The final suite has different failures')
assert.equal(candidateTests.tests,baselineTests.tests)
assert.equal(candidateTests.pass,baselineTests.pass)
assert.equal(read(path.join(baseline,'baseline-typescript.log')).trim(),'')
assert.equal(read(path.join(candidate,'candidate-typescript.log')).trim(),'')
const result={createdAt:new Date().toISOString(),baseline,candidate,baselineTests,candidateTests,targetedCpuTests,lint:'exit 0; targeted five application modules and two TypeScript tests; no output',typescript:{baseline:'exit 0; empty log',candidate:'exit 0; empty log'},build:{baselineDefault:'failed: Turbopack external node_modules junction',baselineWebpack:'failed: Google Fonts network EACCES',baselineOfflineWebpack:'exit 0; synthetic font fixture; never deploy',candidateDefault:'failed: same Turbopack junction restriction',candidateOfflineWebpack:'NOT VALIDATED: earlier attempts interrupted without completed compilation; final retry using baseline compilation cache exceeded 180 seconds (exit 124), own build process explicitly stopped; no application compiler error established'},browser:'Inventory returned no browser or app sessions; no connected journey executed',deployment:'Not pushed, not deployed, production SHA and usage unavailable (403)'}
writeFileSync(output,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2))
