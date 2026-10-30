import assert from 'node:assert/strict'
import test from 'node:test'
import { activityDetailFixture } from '../../scripts/cpu-audit/activities-documents-fixture.mjs'
import { documentsModule, documentRows } from '../../scripts/cpu-audit/fixtures.mjs'
const root = process.env.CPU_TEST_ROOT || process.cwd()

test('activity scoped reads retain normalized order, actor filter, missing and empty states', async () => {
  const f = await activityDetailFixture(root, 400)
  const result = await f.detail()
  assert.equal(result.activity.id_activite, 'A123')
  assert.equal(JSON.stringify(result.entities.map(x => x.id_activite_entite)), JSON.stringify(['E123', 'E323']))
  assert.equal(JSON.stringify(result.participants.map(x => x.id_participation)), JSON.stringify(['P123', 'P323']))
  assert.equal((await f.data.getParticipants('A123', 'ACT323')).length, 1)
  assert.equal(await f.data.getActivity('missing'), undefined)
  assert.equal((await f.data.getParticipants('missing')).length, 0)
  assert.equal((await f.data.getActivityEntities('missing')).length, 0)
  assert.equal(f.raw.state.calls.filter(x => x.range.endsWith('!1:1')).length, 0)
})

test('activity references batch cold reads, deduplicate concurrent requests and propagate source failure', async () => {
  const f = await activityDetailFixture(root, 20)
  const results = await Promise.all([f.data.getActivityReferences(), f.data.getActivityReferences()])
  assert.deepEqual(results[0], results[1])
  assert.equal(f.raw.state.batchCalls.length, 1)
  assert.equal(f.raw.state.calls.length, 0)
  const failed = await activityDetailFixture(root, 20)
  failed.raw.state.batchGet = async () => { throw Error('synthetic Google outage') }
  await assert.rejects(failed.data.getActivityReferences(), /synthetic Google outage/)
})

test('activity list references retain form options and omit unused relation tables', async () => {
  const f = await activityDetailFixture(root, 20)
  const narrow = await f.data.getActivityReferences({includeRelations: false})
  assert.equal(f.raw.state.batchCalls[0].ranges.length, 2)
  assert.equal(narrow.entityRoles.length, 0)
  assert.equal(narrow.actorTypes.length, 0)
  const full = await f.data.getActivityReferences()
  assert.deepEqual(narrow.types, full.types)
  assert.deepEqual(narrow.entites, full.entites)
  assert.equal(full.actorTypes.length, 20)
})

test('binary document lookup keeps fresh Sheets and skips only unused size metadata', async () => {
  const {namespace: data, state} = await documentsModule(root, documentRows(200))
  const lightweight = await data.getDocument('DOC123', {includeSize: false})
  assert.equal(lightweight.drive_document_id, 'FILE123')
  assert.equal(state.sizeCalls.length, 0)
  assert.equal(state.sheetCalls[0].bypassCache, true)
  const full = await data.getDocument('DOC123')
  assert.equal(full.taille, '1123')
  state.failSheet = true
  await assert.rejects(data.getDocument('DOC123', {includeSize: false}), /Sheets offline/)
})

test('unlinked document creation avoids all entity reference sources and confirms one write', async () => {
  const {namespace: data, state} = await documentsModule(root, documentRows(20))
  state.allowWrites = true
  const created = await data.createDocument({nom_document: 'Synthetic', id_type_document: 'PDF'})
  assert.equal(created.id_document, 'DOC0020')
  assert.equal(state.writes.length, 1)
  assert.equal(state.sizeCalls.length, 0)
  assert.equal(JSON.stringify(state.sheetCalls.map(x => x.sheetName)), JSON.stringify(['TYPES_DOCUMENT', 'DOCUMENTS']))
  assert.equal(state.referenceCalls.length, 0)
})

test('linked document validates the selected family, rejecting unknown links before writing', async () => {
  const {namespace: data, state} = await documentsModule(root, documentRows(20))
  state.allowWrites = true
  state.referenceValues = {activities: [{id_activite:'A1', nom_activite:'Synthetic activity'}]}
  const input = {nom_document:'Synthetic', id_type_document:'PDF', type_entite_liee:'ACTIVITE', id_entite_liee:'A1'}
  await data.createDocument(input)
  assert.equal(state.writes.length, 1)
  assert.equal(JSON.stringify(state.referenceCalls), JSON.stringify(['activities']))
  await assert.rejects(data.createDocument({...input, id_entite_liee:'missing'}), /introuvable/)
  assert.equal(state.writes.length, 1)
})

test('activity detail recomputes from invalidated source after a confirmed mutation', async () => {
  const f = await activityDetailFixture(root, 200)
  assert.equal((await f.data.getActivity('A123')).nom_activite, 'Activity 123')
  await f.raw.namespace.appendSheetRow({spreadsheetId:'ACTIVITIES', sheetName:'ACTIVITES', row:{id_activite:'NEW'}})
  const changed = f.activityRows.map(row => row[0] === 'A123' ? row.map((value,index) => index === 3 ? 'Changed synthetic activity' : value) : row)
  const headers = ['id_activite','id_type_activite','id_entite_organisatrice','nom_activite','titre_public','resume','date_debut','date_fin','pays','ville','lieu','id_statut_activite','observation']
  f.put('ACTIVITIES','ACTIVITES',[headers,...changed])
  assert.equal((await f.data.getActivity('A123')).nom_activite, 'Changed synthetic activity')
})

test('scoped activity readers still reject incomplete schemas and propagate required source errors', async () => {
  const f = await activityDetailFixture(root, 20)
  f.put('ACTIVITIES','ACTIVITES_ENTITES',[['id_activite_entite','id_activite'],['E1','A1']])
  await assert.rejects(f.data.getActivityEntities('A1'), /manquants/)
  const failed = await activityDetailFixture(root, 20)
  failed.raw.state.get = async () => { throw Error('synthetic required Google failure') }
  await assert.rejects(failed.data.getParticipants('A1'), /synthetic required Google failure/)
  await assert.rejects(failed.data.getActivity('A1'), /synthetic required Google failure/)
})
