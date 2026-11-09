import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { activityDashboardFixture } from './dashboard-fixture.mjs'

const [reference, variant, output] = process.argv.slice(2)
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const files = ['lib/activites/data.ts', 'lib/activites/dashboard.ts', 'lib/google/sheets.ts']
const result = { at: new Date().toISOString(), node: process.version, freeGiB: os.freemem()/2**30, cpus: os.availableParallelism(), reference, variant, sourceHashes: Object.fromEntries([reference, variant].map(root => [root, Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex')]))])), scope: 'Actual Activities dashboard loader, data conversion and C2 raw cache; offline dependencies; no auth, React, other dashboard sections or network latency', warmup: 5, rounds: 9, minimumIterations: 20, minimumSampleMs: 100, results: [] }
for (const rows of [20, 200, 2000]) for (const scenario of ['cold', 'warm', 'concurrent-8', 'after-reference-mutation', 'after-activity-mutation']) {
  const instances = await Promise.all([reference, variant].map(root => activityDashboardFixture(root, rows)))
  for (const f of instances) {
    f.invoke = async () => {
      if (scenario === 'cold') f.raw.namespace.clearSheetCache()
      if (scenario.endsWith('-mutation')) {
        const isRef = scenario === 'after-reference-mutation'
        await f.raw.namespace.appendSheetRow({ spreadsheetId: isRef ? 'REF' : 'ACTIVITIES', sheetName: isRef ? 'TYPES_ACTIVITE' : 'ACTIVITES', row: isRef ? { id_type_activite: 'NEW' } : { id_activite: 'NEW' } })
      }
      return scenario === 'concurrent-8' ? Promise.all(Array.from({ length: 8 }, () => f.load())) : f.load()
    }
    for (let i=0;i<5;i++) await f.invoke()
  }
  const answers = await Promise.all(instances.map(f => f.invoke()))
  assert.deepEqual(JSON.parse(JSON.stringify(answers[0])), JSON.parse(JSON.stringify(answers[1])))
  const samples = [[], []]
  for (let round=0;round<9;round++) for (const index of round%2 ? [1,0] : [0,1]) {
    const f=instances[index]; f.logicalReads.length=0; f.raw.state.calls.length=0; f.raw.state.batchCalls.length=0; f.raw.state.writes.length=0
    const cpu=process.cpuUsage(), start=performance.now(); let n=0
    do { await f.invoke(); n++ } while(n<20||performance.now()-start<100)
    const elapsedMs=(performance.now()-start)/n, used=process.cpuUsage(cpu)
    samples[index].push({ iterations:n,cpuMs:(used.user+used.system)/1000/n,elapsedMs,getCalls:f.raw.state.calls.length/n,batchCalls:f.raw.state.batchCalls.length/n,logicalRowReads:f.logicalReads.length/n,writes:f.raw.state.writes.length/n })
  }
  const summarize = samples => Object.fromEntries(['cpuMs','elapsedMs','getCalls','batchCalls','logicalRowReads','writes'].map(k=>[k,median(samples.map(x=>x[k]))]))
  result.results.push({ rows,scenario,equal:true,resultBytes:Buffer.byteLength(JSON.stringify(answers[0])),reference:summarize(samples[0]),variant:summarize(samples[1]),samples })
}
writeFileSync(output,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result.results.filter(x=>x.rows===200),null,2))
