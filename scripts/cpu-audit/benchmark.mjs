import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import path from 'node:path'
import { documentsModule, documentRows, sheetsModule } from './fixtures.mjs'

const [baselineRoot, candidateRoot = process.cwd(), output] = process.argv.slice(2)
if (!baselineRoot) throw new Error('Usage: node --experimental-vm-modules scripts/cpu-audit/benchmark.mjs BASELINE_ROOT [CANDIDATE_ROOT] [OUTPUT.json]')
const results = { environment: { node: process.version, platform: process.platform, arch: process.arch, createdAt: new Date().toISOString(), baselineRoot: path.resolve(baselineRoot), candidateRoot: path.resolve(candidateRoot), network: 'mocked offline; CPU is process user+system, not Vercel Active CPU', warmup: 5, rounds: 9, minimumIterations: 20, minimumSampleElapsedMs: 200, order: 'AB/BA alternating; sequential, no other benchmark worker; normalize per operation' }, scenarios: [] }
const cpuMs = cpu => (cpu.user + cpu.system) / 1000
const median = values => [...values].sort((a,b) => a-b)[Math.floor(values.length / 2)]
async function sample(invoke) {
  const startCpu=process.cpuUsage(),start=performance.now()
  let iterations=0
  do { await invoke();iterations++ } while(iterations<20 || performance.now()-start<200)
  const elapsedMs=performance.now()-start,cpu=process.cpuUsage(startCpu)
  return {cpuMs:cpuMs(cpu)/iterations,elapsedMs:elapsedMs/iterations,iterations,totalCpuMs:cpuMs(cpu),totalElapsedMs:elapsedMs}
}
for (const count of [20, 200, 2000]) {
  for (const scenario of ['detail', 'entity', 'missing', 'list']) {
    const rows = documentRows(count)
    const modules = await Promise.all([documentsModule(baselineRoot, rows), documentsModule(candidateRoot, rows)])
    const invoke = module => scenario === 'detail' ? module.getDocument(`DOC${Math.floor(count/2)}`) : scenario === 'entity' ? module.getDocumentsForEntity('COMPETITION', 'C0') : scenario === 'missing' ? module.getDocument('missing') : module.getDocuments()
    const outputs = await Promise.all(modules.map(async ({ namespace }) => JSON.stringify(await invoke(namespace)) ?? 'undefined'))
    assert.equal(outputs[1], outputs[0], `Output differs: ${scenario}/${count}`)
    for (const module of modules) for (let n=0;n<5;n++) await invoke(module.namespace)
    const samples = [[], []]
    for (let round=0; round<9; round++) for (const index of round % 2 ? [1,0] : [0,1]) {
      const { namespace, state } = modules[index]
      state.sizeCalls.length = 0
      state.sheetCalls.length = 0
      const measurement=await sample(()=>invoke(namespace))
      samples[index].push({ ...measurement, sizeCalls: state.sizeCalls.length/measurement.iterations, sheetCalls: state.sheetCalls.length/measurement.iterations })
    }
    results.scenarios.push({ kind: 'documents', scenario, rows: count, equal: true, responseBytes: Buffer.byteLength(outputs[0]), baseline: { medianCpuMs: median(samples[0].map(s=>s.cpuMs)), medianElapsedMs: median(samples[0].map(s=>s.elapsedMs)), sizeCalls: samples[0][0].sizeCalls, sheetCalls: samples[0][0].sheetCalls }, candidate: { medianCpuMs: median(samples[1].map(s=>s.cpuMs)), medianElapsedMs: median(samples[1].map(s=>s.elapsedMs)), sizeCalls: samples[1][0].sizeCalls, sheetCalls: samples[1][0].sheetCalls }, samples })
  }
}
// A cold batch with one warm range exposes redundant transfers/conversions.
for (const count of [20, 200, 2000]) {
  for (const scenario of ['partial-cache-batch-duplicate', 'cold-batch', 'warm-batch']) {
  const modules = await Promise.all([sheetsModule(baselineRoot), sheetsModule(candidateRoot)])
  const values = [['id', 'value'], ...Array.from({length: count}, (_,i) => [String(i), `Synthetic ${i}`])]
  for (const { state } of modules) for (const name of ['A','B']) state.values.set(`S:'${name}'!A:Z`, values)
  const invoke = async ({ namespace, state }) => {
    if(scenario!=='warm-batch') namespace.clearSheetCache()
    if(scenario==='partial-cache-batch-duplicate') await namespace.getSheetRows({spreadsheetId:'S',sheetName:'A'})
    state.batchCalls.length=0
    return namespace.getSheetsRows({spreadsheetId:'S',sheetNames:scenario==='partial-cache-batch-duplicate'?['A','B','B']:['A','B']})
  }
  const outputs = await Promise.all(modules.map(async module => JSON.stringify(await invoke(module))))
  assert.equal(outputs[1],outputs[0])
  for (const module of modules) for(let i=0;i<5;i++) await invoke(module)
  const samples=[[],[]]
  for(let round=0;round<9;round++) for(const index of round%2?[1,0]:[0,1]) {
    samples[index].push(await sample(()=>invoke(modules[index])))
  }
  results.scenarios.push({kind:'sheets',scenario,rowsPerSheet:count,equal:true,responseBytes:Buffer.byteLength(outputs[0]),baseline:{medianCpuMs:median(samples[0].map(s=>s.cpuMs)),medianElapsedMs:median(samples[0].map(s=>s.elapsedMs)),ranges:modules[0].state.batchCalls[0]?.ranges.length??0},candidate:{medianCpuMs:median(samples[1].map(s=>s.cpuMs)),medianElapsedMs:median(samples[1].map(s=>s.elapsedMs)),ranges:modules[1].state.batchCalls[0]?.ranges.length??0},samples})
  }
}
const json=JSON.stringify(results,null,2)
if(output)writeFileSync(output,json+'\n')
console.log(JSON.stringify(results.scenarios.map(({samples,...summary})=>summary),null,2))
