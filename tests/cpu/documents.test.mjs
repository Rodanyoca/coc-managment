import assert from 'node:assert/strict'
import test from 'node:test'
import { documentsModule, documentRows } from '../../scripts/cpu-audit/fixtures.mjs'

const root = process.env.CPU_TEST_ROOT || process.cwd()
test('detail preserves full document output but reads size only for the selected file', async () => {
  const { namespace: data, state } = await documentsModule(root, documentRows(200))
  const result = await data.getDocument(' DOC123 ')
  assert.equal(result.id_document, 'DOC123')
  assert.equal(result.taille, '1123')
  assert.equal(result.drive_document_url, 'https://drive.google.com/file/d/FILE123/view')
  assert.deepEqual(state.sizeCalls, ['FILE123'])
  assert.equal(state.sheetCalls[0].bypassCache, true)
})
test('missing detail never enriches unrelated files', async () => {
  const { namespace: data, state } = await documentsModule(root, documentRows(200))
  assert.equal(await data.getDocument('missing'), undefined)
  assert.equal(state.sizeCalls.length, 0)
})
test('entity selection normalizes fields before enrichment and preserves order', async () => {
  const rows = documentRows(40)
  rows[0] = { ...rows[0], id_document: ' DOC0 ', type_objet_lie: ' COMPETITION ', id_objet_lie: ' C0 ' }
  const { namespace: data, state } = await documentsModule(root, rows)
  const result = await data.getDocumentsForEntity(' competition ', ' C0 ')
  assert.equal(JSON.stringify(result.map(row => row.id_document)), JSON.stringify(['DOC0', 'DOC20']))
  assert.deepEqual(state.sizeCalls, ['FILE0', 'FILE20'])
  assert.equal(state.sheetCalls[0].bypassCache, undefined)
})
test('list keeps all sizes, missing file and Drive failure semantics', async () => {
  const rows = documentRows(3)
  rows[1].drive_document_id = ''
  rows.push({ ...rows[0], id_document: '' })
  const { namespace: data, state } = await documentsModule(root, rows)
  let result = await data.getDocuments()
  assert.equal(result.length, 3)
  assert.equal(result[1].taille, '')
  assert.deepEqual(state.sizeCalls, ['FILE0', 'FILE2'])
  state.failSize = true
  result = await data.getDocument('DOC0')
  assert.equal(result.taille, '')
  state.failHeaders = true
  await assert.rejects(data.getDocument('DOC0'), /Colonnes Documents manquantes/)
  state.failSheet = true
  await assert.rejects(data.getDocuments(), /Sheets offline/)
})

test('creation scans fresh document identifiers without reading unrelated Drive sizes', async () => {
  const { namespace:data,state }=await documentsModule(root,documentRows(200))
  state.allowWrites=true
  const created=await data.createDocument({nom_document:'Synthetic new document',id_type_document:'PDF'})
  assert.equal(created.id_document,'DOC0200')
  assert.equal(state.sizeCalls.length,0)
  assert.equal(state.sheetCalls.find(call=>call.sheetName==='DOCUMENTS').bypassCache,true)
  assert.equal(state.writes.length,1)
  assert.equal(state.writes[0].row.id_document,'DOC0200')
})
