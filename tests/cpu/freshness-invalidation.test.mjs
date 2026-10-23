import assert from 'node:assert/strict'
import test from 'node:test'
import { sheetsModule } from '../../scripts/cpu-audit/fixtures.mjs'
import { loadServerModule } from '../../scripts/cpu-audit/module-harness.mjs'
const root = process.env.CPU_TEST_ROOT || process.cwd()
const params = (spreadsheetId = 'BUSINESS') => ({ spreadsheetId, sheetName: 'A' })
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }

test('the fresh table preserves schema validation of headers beyond column Z', async () => {
  const { namespace: data, state } = await sheetsModule(root)
  const { USER_HEADERS } = await loadServerModule(root, 'lib/users/types.ts', {})
  const headers = [...USER_HEADERS, ...Array(26 - USER_HEADERS.length).fill(''), 'UNEXPECTED_AA']
  const row = headers.map(() => '')
  state.values.set("USERS:'USERS'!A:Z", [headers.slice(0, 26), row.slice(0, 26)])
  state.values.set("USERS:'USERS'!1:1", [headers])
  const { createGoogleUsersSheetsAdapter } = await loadServerModule(root, 'lib/users/google-adapter.ts', {
    '@/lib/google/sheets': data, './config': { getUsersSpreadsheetId: () => 'USERS' },
  })
  const adapter = createGoogleUsersSheetsAdapter()
  assert.equal((await adapter.readTable('USERS', { fresh: true })).headers.at(-1), 'UNEXPECTED_AA')
  const { UsersRepository } = await loadServerModule(root, 'lib/users/repository.ts', {})
  await assert.rejects(new UsersRepository(adapter).getUsers(), error => error.code === 'SCHEMA_INVALID')
})

test('an audit write must not reject a fresh account snapshot from another sheet', async () => {
  const { namespace: data, state } = await sheetsModule(root), gate = deferred()
  state.batchGet = async ({ ranges }) => { await gate.promise; return { data: { valueRanges: ranges.map(range => ({ values: range.endsWith('!1:1') ? [['id', 'value']] : [['1', 'current']] })) } } }
  const reading = data.getSheetsTables({ spreadsheetId: 'USERS', sheetNames: ['USERS'] })
  // Attach rejection immediately: the intended regression is asserted below.
  const observed = reading.then(value => ({ value }), error => ({ error }))
  await data.appendSheetRow({ spreadsheetId: 'USERS', sheetName: 'JOURNAL_OPERATIONS', row: { id: 'audit', value: 'trace' } })
  gate.resolve()
  const result = await observed
  assert.equal(result.error, undefined, 'unrelated audit must not invalidate account freshness')
  assert.equal(result.value.USERS.rows[0].value, 'current')
})

for (const kind of ['rows', 'headers', 'batch', 'table']) test(`fresh ${kind} rejects an old result after a write to its actual source sheet`, async () => {
  const { namespace: data, state } = await sheetsModule(root), gate = deferred()
  await data.getSheetRows(params('USERS')) // Headers for the subsequent append are warm.
  state.get = async () => { await gate.promise; return { data: { values: [['id', 'value'], ['1', 'old']] } } }
  state.batchGet = async () => { await gate.promise; return { data: { valueRanges: [{ values: [['id', 'value'], ['1', 'old']] }] } } }
  const read = kind === 'rows' ? data.getSheetRows({ ...params('USERS'), bypassCache: true })
    : kind === 'headers' ? data.getSheetHeaders({ ...params('USERS'), bypassCache: true })
      : kind === 'batch' ? data.getSheetsRows({ spreadsheetId: 'USERS', sheetNames: ['A'], bypassCache: true })
        : data.getSheetsTables({ spreadsheetId: 'USERS', sheetNames: ['A'] })
  const outcome = read.then(value => ({ value }), error => ({ error }))
  await data.appendSheetRow({ ...params('USERS'), row: { id: '2', value: 'new' } })
  gate.resolve()
  assert.match(String((await outcome).error), /invalid/)
})

test('an audit append conservatively invalidates all raw workbook caches', async () => {
  const { namespace: data, state } = await sheetsModule(root)
  await data.getSheetRows(params())
  await data.getSheetRows(params('USERS'))
  await data.appendSheetRow({ ...params('USERS'), row: { id: '2', value: 'audit' } })
  const before = state.calls.length
  await data.getSheetRows(params()); await data.getSheetHeaders(params())
  assert.equal(state.calls.length, before + 1, 'conservative policy refreshes the other workbook')
  await data.getSheetRows(params('USERS'))
  assert.equal(state.calls.length, before + 2)
})

test('fresh adapter reads cannot return a cached revoked account or stale fallback', async () => {
  const { namespace: data, state } = await sheetsModule(root)
  const adapterModule = await loadServerModule(root, 'lib/users/google-adapter.ts', {
    '@/lib/google/sheets': data, './config': { getUsersSpreadsheetId: () => 'USERS' },
  })
  const adapter = adapterModule.createGoogleUsersSheetsAdapter()
  await data.getSheetRows(params('USERS'))
  state.get = async () => ({ data: { values: [['id', 'value'], ['1', 'revoked']] } })
  assert.equal((await adapter.readRows('A', { fresh: true }))[0].value, 'revoked')
  state.get = async () => { throw new Error('source offline') }
  await assert.rejects(adapter.readRows('A', { fresh: true }), /source offline/)
  await assert.rejects(adapter.readHeaders('A', { fresh: true }), /source offline/)
})

test('targeted invalidation fences old reads without cancelling another workbook pending read', async () => {
  const { namespace: data, state } = await sheetsModule(root), gate = deferred()
  state.get = async () => { await gate.promise; return { data: { values: [['id', 'value'], ['1', 'old']] } } }
  const old = data.getSheetRows(params('USERS')), business = data.getSheetRows(params())
  data.clearSheetCache('USERS')
  const joined = data.getSheetRows(params())
  gate.resolve(); await Promise.all([old, business, joined])
  assert.equal(state.calls.length, 2)
  state.get = null
  await data.getSheetRows(params()); assert.equal(state.calls.length, 2)
  assert.equal((await data.getSheetRows(params('USERS')))[0].value, 'before')
  assert.equal(state.calls.length, 3)
})

test('fresh read interrupted by local invalidation rejects instead of returning old grants', async () => {
  const { namespace: data, state } = await sheetsModule(root), gate = deferred()
  state.get = async () => { await gate.promise; return { data: { values: [['id', 'value'], ['1', 'old']] } } }
  const read = data.getSheetRows({ ...params('USERS'), bypassCache: true })
  data.clearSheetCache('USERS'); gate.resolve()
  await assert.rejects(read, /invalid/i)
})

for (const method of ['appendSheetRow', 'appendSheetRows', 'updateSheetCell', 'updateSheetCells', 'deleteSheetRow']) {
  for (const fails of [false, true]) test(`${method}: ${fails ? 'uncertain error' : 'success'} fences all raw workbook ranges`, async () => {
    const { namespace: data, state } = await sheetsModule(root)
    await data.getSheetRows(params()); await data.getSheetRows(params('USERS'))
    await data.getSheetRows({ ...params('USERS'), range: "'A'!A:B" })
    await data.getSheetRows(params('USERS-OTHER'))
    state.write = async () => { if (fails) throw new Error('lost acknowledgement'); return {} }
    const input = { ...params('USERS'), idColumn: 'id', idValue: '1', targetColumn: 'value', value: 'new', updates: [{ column: 'value', value: 'new' }], row: { id: '2', value: 'new' }, rows: [{ id: '2', value: 'new' }] }
    if (fails) await assert.rejects(data[method](input), /lost acknowledgement/)
    else await data[method](input)
    const before = state.calls.length
    await data.getSheetRows(params()); await data.getSheetRows(params('USERS-OTHER'))
    assert.equal(state.calls.length, before + 2)
    await data.getSheetRows(params('USERS')); await data.getSheetRows({ ...params('USERS'), range: "'A'!A:B" })
    await data.getSheetHeaders({ ...params('USERS'), sheetName: 'B' })
    assert.equal(state.calls.length, before + 5)
  })
}

test('targeted invalidation fences headers and batch, preserving a different workbook', async () => {
  const { namespace: data, state } = await sheetsModule(root), gate = deferred()
  state.get = async () => { await gate.promise; return { data: { values: [['old']] } } }
  state.batchGet = async ({ ranges }) => { await gate.promise; return { data: { valueRanges: ranges.map(() => ({ values: [['id', 'value'], ['1', 'old']] })) } } }
  const header = data.getSheetHeaders(params('USERS'))
  const batch = data.getSheetsRows({ spreadsheetId: 'USERS', sheetNames: ['A', 'B'] })
  const other = data.getSheetsRows({ spreadsheetId: 'BUSINESS', sheetNames: ['A', 'B'] })
  data.clearSheetCache('USERS'); gate.resolve(); await Promise.all([header, batch, other])
  state.get = null; state.batchGet = null
  assert.equal((await data.getSheetsRows({ spreadsheetId: 'USERS', sheetNames: ['A', 'B'] })).A[0].value, 'before')
  await data.getSheetsRows({ spreadsheetId: 'BUSINESS', sheetNames: ['A', 'B'] })
  assert.equal(state.batchCalls.length, 3)
})

test('fresh table uses one response for headers and rows, never shares or falls back', async () => {
  const { namespace: data, state } = await sheetsModule(root)
  const mod = await loadServerModule(root, 'lib/users/google-adapter.ts', {
    '@/lib/google/sheets': data, './config': { getUsersSpreadsheetId: () => 'USERS' },
  })
  const adapter = mod.createGoogleUsersSheetsAdapter()
  await data.getSheetRows(params('USERS'))
  const tables = await Promise.all([adapter.readTable('A', { fresh: true }), adapter.readTable('A', { fresh: true })])
  assert.equal(state.batchCalls.length, 2); assert.equal(state.calls.length, 1)
  assert.equal(tables[0].rows[0].value, 'before'); assert.equal(tables[0].headers[0], 'id')
  state.batchGet = async () => { throw new Error('source offline') }
  await assert.rejects(adapter.readTable('A', { fresh: true }), /source offline/)
  const gate = deferred()
  state.batchGet = async () => { await gate.promise; return { data: { valueRanges: [{ values: [['id'], ['old']] }] } } }
  const read = adapter.readTable('A', { fresh: true }); data.clearSheetCache('USERS'); gate.resolve()
  await assert.rejects(read, /invalid/)
})

test('repository prefers coherent table snapshots and propagates source errors', async () => {
  const { UsersRepository } = await loadServerModule(root, 'lib/users/repository.ts', {})
  const { USER_AUTHORIZATION_HEADERS } = await loadServerModule(root, 'lib/users/types.ts', {})
  let calls = 0, offline = false, active = true
  const repository = new UsersRepository({
    readTable: async (_sheet, options) => { assert.equal(options.fresh, true); calls++; if (offline) throw new Error('source offline'); return { headers: [...USER_AUTHORIZATION_HEADERS], rows: [{ id_user_autorisation: 'A1', id_user: 'U1', id_bloc_autorisation: 'AUT-SPT', statut: active ? 'ACTIF' : 'INACTIF', date_debut: '2026-01-01', date_fin: '' }] } },
    readRows: async () => { throw new Error('legacy path forbidden') }, readHeaders: async () => { throw new Error('legacy path forbidden') },
  })
  assert.equal((await repository.getAuthorizationsForUser('U1'))[0].statut, 'ACTIF')
  active = false; assert.equal((await repository.getAuthorizationsForUser('U1'))[0].statut, 'INACTIF')
  offline = true; await assert.rejects(repository.getAuthorizationsForUser('U1'), /source|indisponible/i)
  assert.equal(calls, 3)
})

test('Google adapter through repository and policy never regrants a revoked VIEWER block on source failure', async () => {
  const { namespace: data, state } = await sheetsModule(root)
  const { createGoogleUsersSheetsAdapter } = await loadServerModule(root, 'lib/users/google-adapter.ts', {
    '@/lib/google/sheets': data, './config': { getUsersSpreadsheetId: () => 'USERS' },
  })
  const { UsersRepository } = await loadServerModule(root, 'lib/users/repository.ts', {})
  const { USER_AUTHORIZATION_HEADERS } = await loadServerModule(root, 'lib/users/types.ts', {})
  const { authorizeWithSource } = await loadServerModule(root, 'lib/auth/authorization.ts', {})
  const key = "USERS:'USER_AUTORISATIONS'!A:Z"
  state.values.set(key, [[...USER_AUTHORIZATION_HEADERS], ['A1', 'U1', 'AUT-SPT', 'ACTIF', '2026-01-01', '']])
  const repo = new UsersRepository(createGoogleUsersSheetsAdapter())
  const input = { user: { idUser: 'U1', typeUser: 'VIEWER', estSuperAdmin: false }, requirement: { scope: 'BUSINESS', blocks: ['AUT-SPT'] }, action: 'READ', date: '2026-10-23', loadAuthorizations: () => repo.getAuthorizationsForUser('U1') }
  await data.getSheetRows({ spreadsheetId: 'USERS', sheetName: 'USER_AUTORISATIONS' })
  assert.equal((await authorizeWithSource(input)).allowed, true)
  state.values.set(key, [[...USER_AUTHORIZATION_HEADERS], ['A1', 'U1', 'AUT-SPT', 'INACTIF', '2026-01-01', '']])
  assert.equal((await authorizeWithSource(input)).allowed, false)
  state.batchGet = async () => { throw new Error('source offline') }
  const denied = await authorizeWithSource(input)
  assert.equal(denied.allowed, false); assert.equal(denied.reason, 'SOURCE_UNAVAILABLE')
})
