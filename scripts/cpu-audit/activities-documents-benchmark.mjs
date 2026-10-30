import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { activityDetailFixture } from './activities-documents-fixture.mjs'
import { documentsModule, documentRows } from './fixtures.mjs'

const root = process.cwd(), proof = path.join(root, '.cache/activities-documents-cpu-20261030')
const roots = [path.join(proof, 'reference'), root]
const result = {syntheticOnly: true, repetitions: 15, warmup: 5, count: 10000, scenarios: {}}
const median = values => [...values].sort((a,b) => a-b)[Math.floor(values.length / 2)]
for (const scenario of ['detail', 'references', 'listReferences', 'binaryLookup', 'unlinkedValidation']) {
  const contexts = await Promise.all(roots.map(async source => {
    if (scenario === 'detail' || scenario === 'references' || scenario === 'listReferences') {
      const f = await activityDetailFixture(source, 10000)
      return {run: () => scenario === 'detail' ? f.detail() : f.data.getActivityReferences(scenario === 'listReferences' ? {includeRelations:false} : {}), calls: () => ({sheets: f.raw.state.calls.length + f.raw.state.batchCalls.length, drive: 0, ranges: f.raw.state.calls.filter(x=>x.range.endsWith('!A:Z')).length + f.raw.state.batchCalls.reduce((n,x)=>n+x.ranges.length,0)})}
    }
    const f = await documentsModule(source, documentRows(200))
    f.state.allowWrites = true
    return {run: () => scenario === 'binaryLookup' ? f.namespace.getDocument('DOC123', {includeSize: false}) : f.namespace.createDocument({nom_document: 'Synthetic', id_type_document: 'PDF'}), calls: () => ({sheets: f.state.sheetCalls.length, drive: f.state.sizeCalls.length, referenceLoaders: f.state.referenceCalls.length})}
  }))
  const cold = []
  for (const f of contexts) { const output = await f.run(); cold.push({calls: f.calls(), returnedBytes: Buffer.byteLength(JSON.stringify(output))}) }
  for (let i=0;i<5;i++) for (const f of contexts) await f.run()
  const measures = [[],[]]
  const batchSize = scenario === 'detail' ? 10 : 100
  for (let i=0;i<15;i++) for (const index of i % 2 ? [1,0] : [0,1]) {
    const cpu = process.cpuUsage(), started = performance.now()
    let output
    for (let j=0;j<batchSize;j++) output = await contexts[index].run()
    const elapsedMs = performance.now()-started, used = process.cpuUsage(cpu)
    measures[index].push({cpuMs:(used.user+used.system)/1000/batchSize, elapsedMs:elapsedMs/batchSize, bytes:Buffer.byteLength(JSON.stringify(output))})
  }
  if (scenario === 'detail' || scenario === 'references') assert.equal(JSON.stringify(await contexts[0].run()), JSON.stringify(await contexts[1].run()))
  result.scenarios[scenario] = {batchSize, before: {...cold[0], cpuMedianMs:median(measures[0].map(x=>x.cpuMs)), elapsedMedianMs:median(measures[0].map(x=>x.elapsedMs))}, after: {...cold[1], cpuMedianMs:median(measures[1].map(x=>x.cpuMs)), elapsedMedianMs:median(measures[1].map(x=>x.elapsedMs))}, samples:measures}
}
fs.writeFileSync(path.join(proof, 'benchmark.json'), JSON.stringify(result,null,2))
console.log(JSON.stringify(Object.fromEntries(Object.entries(result.scenarios).map(([key,value])=>[key,{before:value.before,after:value.after}]))))
