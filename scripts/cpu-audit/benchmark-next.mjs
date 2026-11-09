import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fixtureSheetValues, sheetsModule } from './fixtures.mjs'
import { loadServerModule } from './module-harness.mjs'
const [reference, variant = process.cwd(), output] = process.argv.slice(2)
if (!reference || !output) throw new Error('Usage: node --experimental-vm-modules scripts/cpu-audit/benchmark-next.mjs REFERENCE VARIANT OUTPUT')
const files = ['lib/google/sheets.ts', 'lib/users/google-adapter.ts', 'lib/users/repository.ts', 'lib/users/types.ts']
const sourceHashes = root => Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex')]))
const { USER_HEADERS } = await loadServerModule(variant, 'lib/users/types.ts', {})
const result = { at: new Date().toISOString(), node: process.version, reference, variant, sourceHashes: { reference: sourceHashes(reference), variant: sourceHashes(variant) }, availableCpus: os.availableParallelism(), freeGiB: os.freemem() / 2 ** 30, network: 'offline fixtures, no Google or Vercel measurements; invocations are local helper invocations', warmup: 5, rounds: 9, minimumIterations: 20, minimumElapsedMs: 150, order: 'AB/BA alternating', scenarios: [] }
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
for (const rows of [20, 200, 2000]) for (const scenario of ['cold', 'warm', 'audit-then-consult', 'audit-then-8-consults', 'same-workbook-write', 'fresh-security']) {
  const modules = []
  for (const root of [reference, variant]) {
    const fixture = await sheetsModule(root)
    const adapterModule = await loadServerModule(root, 'lib/users/google-adapter.ts', { '@/lib/google/sheets': fixture.namespace, './config': { getUsersSpreadsheetId: () => 'USERS' } })
    const adapter = adapterModule.createGoogleUsersSheetsAdapter()
    const userRows = Array.from({ length: rows }, (_, index) => ({ id_user: `U${index}`, nom_complet: `Synthetic user ${index}`, email: `u${index}@example.invalid`, password_hash: 'synthetic-not-a-real-credential', type_user: 'VIEWER', est_super_admin: 'FALSE', doit_changer_mot_de_passe: 'FALSE', statut: 'ACTIF', date_creation: '2026-01-01T00:00:00.000Z', date_modification_mot_de_passe: '', derniere_connexion: '', session_version: '1', date_expiration_acces_temporaire: '' }))
    const values = scenario === 'fresh-security' ? [[...USER_HEADERS], ...userRows.map(row => USER_HEADERS.map(header => row[header]))] : [['id', 'value'], ...Array.from({ length: rows }, (_, index) => [String(index), `Synthetic ${index}`])]
    const sheet = scenario === 'fresh-security' ? 'USERS' : 'A'
    fixture.state.values.set(`BUSINESS:'${sheet}'!A:Z`, values)
    fixture.state.values.set(`USERS:'${sheet}'!A:Z`, values)
    for (const book of ['BUSINESS', 'USERS']) {
      fixture.state.values.set(`${book}:'${sheet}'!1:1`, [values[0]])
      fixture.state.values.set(`${book}:'${sheet}'!A2:Z`, values.slice(1))
    }
    const repository = scenario === 'fresh-security' ? new (await loadServerModule(root, 'lib/users/repository.ts', {})).UsersRepository(adapter) : null
    const input = { spreadsheetId: 'BUSINESS', sheetName: 'A' }
    const invoke = async () => {
      if (scenario === 'cold') fixture.namespace.clearSheetCache()
      if (scenario.startsWith('audit-') || scenario === 'same-workbook-write') {
        await fixture.namespace.appendSheetRow({ spreadsheetId: scenario === 'same-workbook-write' ? 'BUSINESS' : 'USERS', sheetName: 'A', row: { id: 'audit', value: 'synthetic' } })
      }
      if (scenario === 'fresh-security') {
        return repository.getUserById(`U${Math.floor(rows / 2)}`)
      }
      if (scenario === 'audit-then-8-consults') return Promise.all(Array.from({ length: 8 }, () => fixture.namespace.getSheetRows(input)))
      return fixture.namespace.getSheetRows(input)
    }
    for (let index = 0; index < 5; index++) await invoke()
    modules.push({ ...fixture, invoke })
  }
  // Compare actual structured results, independent of object property insertion order.
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value
  const actual = await Promise.all(modules.map(async item => JSON.stringify(canonical(await item.invoke()))))
  assert.equal(actual[0], actual[1], scenario)
  const samples = [[], []]
  for (let round = 0; round < 9; round++) for (const index of round % 2 ? [1, 0] : [0, 1]) {
    const item = modules[index]
    item.state.calls.length = 0; item.state.batchCalls.length = 0; item.state.writes.length = 0
    const cpuStart = process.cpuUsage(), start = performance.now()
    let iterations = 0
    do { await item.invoke(); iterations++ } while (iterations < 20 || performance.now() - start < 150)
    const elapsedMs = (performance.now() - start) / iterations, cpu = process.cpuUsage(cpuStart)
    const readResponsesBytes = item.state.calls.reduce((sum, call) => sum + Buffer.byteLength(JSON.stringify(fixtureSheetValues(item.state, call.spreadsheetId, call.range))), 0)
      + item.state.batchCalls.reduce((sum, call) => sum + call.ranges.reduce((n, range) => n + Buffer.byteLength(JSON.stringify(fixtureSheetValues(item.state, call.spreadsheetId, range))), 0), 0)
    samples[index].push({ iterations, cpuMs: (cpu.user + cpu.system) / 1000 / iterations, elapsedMs, getCalls: item.state.calls.length / iterations, batchCalls: item.state.batchCalls.length / iterations, readRanges: (item.state.calls.length + item.state.batchCalls.reduce((sum, call) => sum + call.ranges.length, 0)) / iterations, writes: item.state.writes.length / iterations, dependencyCellJsonBytes: readResponsesBytes / iterations })
  }
  const summarize = data => Object.fromEntries(['cpuMs', 'elapsedMs', 'getCalls', 'batchCalls', 'readRanges', 'writes', 'dependencyCellJsonBytes'].map(key => [key, median(data.map(sample => sample[key]))]))
  result.scenarios.push({ scenario, rows, columns: scenario === 'fresh-security' ? USER_HEADERS.length : 2, operation: scenario === 'fresh-security' ? 'UsersRepository.getUserById, including full validation and uniqueness checks' : 'raw Sheets reads and recorded synthetic append; no domain aggregation', equal: true, responseBytes: Buffer.byteLength(actual[0]), reference: summarize(samples[0]), variant: summarize(samples[1]), samples })
}
writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result.scenarios.map(item => ({ scenario: item.scenario, rows: item.rows, reference: item.reference, variant: item.variant })), null, 2))
