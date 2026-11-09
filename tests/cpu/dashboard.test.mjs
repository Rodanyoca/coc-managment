import assert from 'node:assert/strict'
import test from 'node:test'
import { activityDashboardFixture } from '../../scripts/cpu-audit/dashboard-fixture.mjs'
import { fixtureSheetValues } from '../../scripts/cpu-audit/fixtures.mjs'
const root = process.env.CPU_TEST_ROOT || process.cwd()
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }

test('activity dashboard loads only the displayed reference, preserving all statuses and unknown types', async () => {
  const f = await activityDashboardFixture(root, 210)
  const stats = await f.load()
  assert.equal(stats.totalActivities, 210)
  assert.equal(stats.types.reduce((n, t) => n + t.total, 0), 210)
  assert(stats.types.some(t => t.key === 'UNKNOWN'))
  assert(stats.types.some(t => t.key === 'NON_RENSEIGNE'))
  for (const t of stats.types) assert.equal(t.planifiees + t.enCours + t.realisees + t.reportees + t.annulees + t.nonRenseignees, t.total)
  assert.deepEqual(f.logicalReads.map(x => x.sheetName).sort(), ['ACTIVITES', 'TYPES_ACTIVITE'])
})

test('independent unused reference failure does not break the activity dashboard', async () => {
  const f = await activityDashboardFixture(root)
  f.raw.state.get = async input => {
    if (input.range.includes('ENTITES')) throw Error('unused reference offline')
    return { data: { values: fixtureSheetValues(f.raw.state, input.spreadsheetId, input.range) } }
  }
  assert.equal((await f.load()).totalActivities, 200)
})

test('required activity source error propagates without an aggregate fallback', async () => {
  const f = await activityDashboardFixture(root)
  f.raw.state.get = async () => { throw Error('required source offline') }
  await assert.rejects(f.load(), /offline/)
})

test('narrow activity types retain the exact options returned to editing forms', async () => {
  const f = await activityDashboardFixture(root)
  f.setTypes([...f.typeRows, ['', 'ignored'], ['T1', 'Duplicate label']])
  assert.deepEqual(await f.data.getActivityTypes(), (await f.data.getActivityReferences()).types)
})

test('concurrent dashboards share raw reads, never memoize aggregates across mutations', async () => {
  const f = await activityDashboardFixture(root)
  const snapshots = await Promise.all(Array.from({ length: 8 }, () => f.load()))
  for (const s of snapshots) assert.deepEqual(s, snapshots[0])
  assert.equal(f.raw.state.calls.filter(c => c.range.endsWith('!A:Z')).length, 2)
  f.setTypes(f.typeRows.map(([id, label]) => [id, id === 'T1' ? 'Changed label' : label]))
  await f.raw.namespace.appendSheetRow({ spreadsheetId: 'REF', sheetName: 'TYPES_ACTIVITE', row: { id_type_activite: 'NEW', nom_type_activite: 'New' } })
  assert.equal((await f.load()).types.find(t => t.key === 'T1').label, 'Changed label')
})

test('a two-workbook mutation fences old reads and conservatively refreshes all raw workbooks', async () => {
  const f = await activityDashboardFixture(root), gate = deferred()
  const ordinary = { spreadsheetId: 'OTHER', sheetName: 'A' }
  await f.raw.namespace.getSheetRows(ordinary)
  const captured = new Map(f.raw.state.values)
  f.raw.state.get = async input => {
    if (input.range.endsWith('!A:Z')) await gate.promise
    return { data: { values: fixtureSheetValues({ values: captured }, input.spreadsheetId, input.range) } }
  }
  const old = f.load()
  await new Promise(done => setTimeout(done, 0))
  await f.raw.namespace.appendSheetRow({ spreadsheetId: 'REF', sheetName: 'TYPES_ACTIVITE', row: { id_type_activite: 'T9' } })
  await f.raw.namespace.appendSheetRow({ spreadsheetId: 'ACTIVITIES', sheetName: 'ACTIVITES', row: { id_activite: 'A999' } })
  f.setTypes(f.typeRows.map(([id, label]) => [id, id === 'T1' ? 'After mutation' : label]))
  gate.resolve(); await old
  f.raw.state.get = null
  const before = f.raw.state.calls.length
  await f.raw.namespace.getSheetRows(ordinary)
  assert.equal(f.raw.state.calls.length, before + 1)
  assert.equal((await f.load()).types.find(t => t.key === 'T1').label, 'After mutation')
})

test('partial failure across workbooks invalidates all raw caches on either attempted write', async () => {
  const f = await activityDashboardFixture(root)
  await f.load()
  await f.raw.namespace.getSheetRows({ spreadsheetId: 'OTHER', sheetName: 'A' })
  f.raw.state.write = async input => { if (input.spreadsheetId === 'ACTIVITIES') throw Error('lost acknowledgement') }
  await f.raw.namespace.appendSheetRow({ spreadsheetId: 'REF', sheetName: 'TYPES_ACTIVITE', row: { id_type_activite: 'NEW' } })
  await assert.rejects(f.raw.namespace.appendSheetRow({ spreadsheetId: 'ACTIVITIES', sheetName: 'ACTIVITES', row: { id_activite: 'NEW' } }), /lost acknowledgement/)
  const before = f.raw.state.calls.length
  await f.raw.namespace.getSheetRows({ spreadsheetId: 'OTHER', sheetName: 'A' })
  assert.equal(f.raw.state.calls.length, before + 1)
  await f.load()
  assert.equal(f.raw.state.calls.length - before, 3)
})
