import { loadServerModule } from './module-harness.mjs'

export const documentHeaders = ['id_document', 'nom_document', 'id_type_document', 'date_document', 'id_entite_origine', 'type_objet_lie', 'id_objet_lie', 'version', 'drive_document_id', 'observation']
export function documentRows(count) {
  return Array.from({ length: count }, (_, index) => ({ id_document: `DOC${index}`, nom_document: `Synthetic document ${index}`, id_type_document: 'PDF', date_document: '2026-10-01', type_objet_lie: 'COMPETITION', id_objet_lie: `C${index % 20}`, drive_document_id: `FILE${index}`, observation: 'Synthetic only' }))
}

export async function documentsModule(root, rows) {
  const state = { sizeCalls: [], sheetCalls: [], referenceCalls: [], writes: [], allowWrites: false, failSize: false, failSheet: false, failHeaders: false }
  const forbidden = () => { throw new Error('Write forbidden in this offline fixture') }
  const empty = name => async () => { state.referenceCalls.push(name); return state.referenceValues?.[name] ?? [] }
  const namespace = await loadServerModule(root, 'lib/documents/data.ts', {
    '@/lib/google/sheets': { appendSheetRow: async input => { if(!state.allowWrites) return forbidden();state.writes.push(input) }, updateSheetCells: forbidden, getSheetRows: async options => { state.sheetCalls.push(options); if (state.failSheet) throw new Error('Sheets offline'); return rows }, getSheetHeaders: async () => state.failHeaders ? [] : documentHeaders },
    '@/lib/google/drive': { deleteDriveFile: forbidden, uploadPrivateFileToDrive: forbidden, getDriveFileSize: async id => { state.sizeCalls.push(id); if (state.failSize) throw new Error('Drive offline'); return String(1000 + Number(id.replace('FILE', ''))) } },
    '@/lib/federations/config': { getReferentialSpreadsheetId: () => 'REF-SYNTHETIC' },
    '@/lib/federations/options': { getFederationOptions: empty('federations') },
    '@/lib/activites/data': { getActivities: empty('activities'), getActors: empty('actors') },
    '@/lib/competitions/data': { getCompetitions: empty('competitions') },
    '@/lib/equipes-nationales/data': { getNationalTeams: empty('nationalTeams') },
    './config': { getDocumentsSpreadsheetId: () => 'DOCS-SYNTHETIC', getDocumentsDriveFolderId: () => 'FOLDER-SYNTHETIC' },
  })
  return { namespace, state }
}

export function fixtureSheetValues(state, spreadsheetId, range) {
  const exact = state.values.get(`${spreadsheetId}:${range}`)
  if (exact) return exact
  const fallback = [['id', 'value'], ['1', 'before']]
  for (const suffix of ['!1:1', '!A2:Z']) if (range.endsWith(suffix)) {
    const sheet = range.slice(0, -suffix.length)
    const full = state.values.get(`${spreadsheetId}:${sheet}!A:Z`) || fallback
    return suffix === '!1:1' ? full.slice(0, 1) : full.slice(1)
  }
  return fallback
}

export async function sheetsModule(root) {
  const state = { calls: [], batchCalls: [], writes: [], values: new Map(), get: null, batchGet: null, write: null }
  const write = async input => { state.writes.push(input); if (state.write) return state.write(input); return {} }
  const values = {
    get: async input => { state.calls.push(input); if (state.get) return state.get(input); return { data: { values: fixtureSheetValues(state, input.spreadsheetId, input.range) } } },
    batchGet: async input => { state.batchCalls.push(input); if (state.batchGet) return state.batchGet(input); return { data: { valueRanges: input.ranges.map(range => ({ values: fixtureSheetValues(state, input.spreadsheetId, range) })) } } },
    append: write,
    batchUpdate: write,
    update: write,
  }
  const namespace = await loadServerModule(root, 'lib/google/sheets.ts', {
    googleapis: { google: { auth: { JWT: class {}, OAuth2: class { setCredentials() {} } }, sheets: () => ({ spreadsheets: { values, get: async () => ({ data: { sheets: state.metadata ?? [{ properties: { title: 'A', sheetId: 1 } }] } }), batchUpdate: write } }) } },
    './request': { runGoogleRequest: async task => task() },
  })
  return { namespace, state }
}
