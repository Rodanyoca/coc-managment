import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { competitionFixture, competitionsModule } from './competitions-fixtures.mjs'
import { loadServerModule } from './module-harness.mjs'

const root = process.cwd()
const reference = path.resolve(process.argv[2] || '.cache/competitions-cpu-20261030/reference')
const output = path.resolve(process.argv[3] || '.cache/competitions-cpu-20261030/benchmark.json')
const same = (a, b, label) => assert.equal(JSON.stringify(a), JSON.stringify(b), label)
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const result = { at: new Date().toISOString(), node: process.version, syntheticOnly: true, networkCalls: 0, note: 'Google adapter invocations, not observed external API requests. Timed runs use plain rows; counters are collected separately with probes. No Vercel CPU attribution.', equivalence: [], workloads: [] }

// Compare the actual services against the frozen workspace, including incomplete/dirty data.
for (const shape of ['normal', 'empty', 'incomplete']) {
  const fixture = competitionFixture(shape === 'empty' ? 0 : 4)
  if (shape === 'incomplete') {
    for (const [sheet, id] of [['COMPETITIONS', 'id_competition'], ['PROGRAMMES_COMPETITION', 'id_programme_competition'], ['RESULTATS', 'id_resultat'], ['ENGAGEMENTS_CAMPAGNES_PROGRAMMES', 'id_engagement_campagne']]) {
      fixture.tables[sheet].push({ ...fixture.tables[sheet][0], [id]: '' })
      fixture.tables[sheet].push({ ...fixture.tables[sheet][0], [id]: ` ${fixture.tables[sheet][0][id]} ` })
    }
    fixture.tables.RESULTATS.push({ id_resultat: 'orphan', id_engagement_campagne: 'unknown' })
    fixture.tables.ENGAGEMENTS_CAMPAGNES_PROGRAMMES.push({ id_engagement_campagne: 'orphan', id_programme_competition: 'unknown', id_campagne: 'unknown' })
    fixture.tables.MEMBRES_UNITES_PARTICIPANTES.push({ ...fixture.tables.MEMBRES_UNITES_PARTICIPANTES[0] })
    fixture.tables.RESULTATS[0].id_engagement_campagne = ' ENG0-0-0 '
    fixture.tables.PROGRAMMES_COMPETITION[0].id_competition = ' COMP0000 '
  }
  const before = await competitionsModule(reference, structuredClone(fixture))
  const after = await competitionsModule(root, structuredClone(fixture))
  const calls = [
    ['getCompetitions', []], ['getCompetition', [' comp0000 ', { bypassCache: true }]], ['getCompetition', ['unknown']], ['getCompetition', ['']],
    ...[undefined, '', 'COMP0000', 'unknown'].flatMap(id => [
      ['getCompetitionPrograms', [id, { bypassCache: true }]], ['getParticipatingUnits', [id]],
      ['getCampaignEngagements', [{ competitionId: id, fresh: true }]],
      ['getCompetitionResults', [id, true, { bypassCache: true }]], ['getCompetitionResults', [id, false]],
    ]),
    ['getCampaignEngagements', [{ teamId: 'TEAM0', competitionId: 'COMP0000' }]],
    ['getCampaignEngagements', [{ teamId: 'unknown' }]], ['getCompetitionMedals', ['COMP0000']],
  ]
  for (const [name, args] of calls) {
    same(await before.namespace[name](...args), await after.namespace[name](...args), `${shape}:${name}:${JSON.stringify(args)}`)
    result.equivalence.push(`${shape}:${name}:${JSON.stringify(args)}`)
  }
}

// Alternate old/new order after warm-up; no timings of setup, generation or VM compilation.
for (const population of [4, 80]) {
  const fixture = competitionFixture(population)
  const before = await competitionsModule(reference, fixture), after = await competitionsModule(root, fixture)
  const oldCounts = (await loadServerModule(reference, 'lib/competitions/delegation-counts.ts', {})).calculateCompetitionDelegationCounts
  const newCounts = (await loadServerModule(root, 'lib/competitions/delegation-counts.ts', {})).calculateCompetitionDelegationCounts
  const ids = fixture.tables.COMPETITIONS.map(row => row.id_competition)
  const links = await before.namespace.getTeamParticipations()
  const engagements = await before.namespace.getCampaignEngagements()
  const athletes = await before.namespace.getAthleteParticipations()
  const countArgs = [ids, links, engagements, athletes, fixture.tables.AFFECTATIONS_STAFF]
  const scenarios = [
    ['detail', data => data.getCompetition('COMP0000', { bypassCache: true })],
    ['programs', data => data.getCompetitionPrograms('COMP0000', { bypassCache: true })],
    ['engagements', data => data.getCampaignEngagements({ competitionId: 'COMP0000', fresh: true })],
    ['results-current', data => data.getCompetitionResults('COMP0000', false, { bypassCache: true })],
    ['units', data => data.getParticipatingUnits('COMP0000')],
    ['list-form-references', data => data.getCompetitionFormReferences ? data.getCompetitionFormReferences() : data.getCompetitionReferences().then(({ types, levels, statuses }) => ({ types, levels, statuses }))],
    ['list-delegations', (_, index) => (index ? newCounts : oldCounts)(...countArgs)],
  ]
  for (const [name, task] of scenarios) {
    const run = side => task(side ? after.namespace : before.namespace, side)
    same(await run(0), await run(1), name)
    for (let warm = 0; warm < 3; warm++) { await run(0); await run(1) }
    const samples = [[], []]
    const iterations = 128
    for (let pair = 0; pair < 10; pair++) for (const side of pair % 2 ? [1, 0] : [0, 1]) {
      const cpu = process.cpuUsage(), start = performance.now()
      let value
      for (let iteration = 0; iteration < iterations; iteration++) value = await run(side)
      const elapsedMs = performance.now() - start, usage = process.cpuUsage(cpu)
      samples[side].push({ iterations, cpuMs: (usage.user + usage.system) / 1000, elapsedMs, returned: Array.isArray(value) ? value.length : value === undefined ? 0 : 1, responseBytes: Buffer.byteLength(JSON.stringify(value) || '') })
    }
    const counters = []
    for (const scope of [reference, root]) {
      const { namespace: data, state } = await competitionsModule(scope, fixture, { probes: true })
      if (name !== 'list-delegations') await task(data, scope === root ? 1 : 0)
      counters.push({ sheetReads: state.reads.length, batchCalls: state.batches.length, rowsRead: state.reads.reduce((n, read) => n + (fixture.tables[read.sheetName]?.length || 0), 0), projections: state.projected })
    }
    result.workloads.push({ population, name, iterationsPerSample: iterations, samples, before: { medianCpuMs: median(samples[0].map(s => s.cpuMs / iterations)), medianElapsedMs: median(samples[0].map(s => s.elapsedMs / iterations)), totalCpuMs: samples[0].reduce((n, s) => n + s.cpuMs, 0), ...counters[0] }, after: { medianCpuMs: median(samples[1].map(s => s.cpuMs / iterations)), medianElapsedMs: median(samples[1].map(s => s.elapsedMs / iterations)), totalCpuMs: samples[1].reduce((n, s) => n + s.cpuMs, 0), ...counters[1] } })
  }
}

// Fuzz the identity union: duplicate links, campaigns shared across editions, unknown and blank keys.
const oldCount = (await loadServerModule(reference, 'lib/competitions/delegation-counts.ts', {})).calculateCompetitionDelegationCounts
const newCount = (await loadServerModule(root, 'lib/competitions/delegation-counts.ts', {})).calculateCompetitionDelegationCounts
let seed = 17
const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n }
for (let trial = 0; trial < 100; trial++) {
  const ids = ['C0', 'C1', 'C2', 'unknown', '']
  const links = Array.from({ length: 20 }, () => ({ id_participation_equipe: `E${random(8)}`, id_competition: ids[random(ids.length)] }))
  const campaigns = Array.from({ length: 12 }, () => ({ id_engagement_campagne: `E${random(8)}`, id_campagne: random(5) ? `CAM${random(4)}` : '' }))
  const athletes = Array.from({ length: 40 }, () => ({ id_engagement_campagne: `E${random(10)}`, id_selection: `S${random(8)}`, athlete_id: random(4) ? `A${random(8)}` : '', id_statut_participation: ['INSCRIT', 'PARTICIPANT', 'ABSENT', 'FORFAIT'][random(4)] }))
  const staff = Array.from({ length: 20 }, () => ({ id_campagne: `CAM${random(5)}`, id_acteur_coc: random(4) ? `A${random(8)}` : '', id_type_acteur: ['OFFICIEL', 'ATHLETE', ''][random(3)] }))
  same(oldCount(ids, links, campaigns, athletes, staff), newCount(ids, links, campaigns, athletes, staff), `delegation-fuzz:${trial}`)
}
result.delegationFuzzCases = 100
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(result, null, 2))
console.log(JSON.stringify({ equivalenceCases: result.equivalence.length, fuzzCases: 100, workloads: result.workloads.map(({ name, population, before, after }) => ({ name, population, before, after })) }, null, 2))
