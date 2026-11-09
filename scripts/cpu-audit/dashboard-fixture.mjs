import { sheetsModule } from './fixtures.mjs'
import { loadServerModule } from './module-harness.mjs'

export async function activityDashboardFixture(root, count = 200) {
  const raw = await sheetsModule(root)
  const logicalReads = []
  const sheets = { ...raw.namespace, getSheetRows: async input => { logicalReads.push(input); return raw.namespace.getSheetRows(input) } }
  const put = (book, sheet, values) => raw.state.values.set(`${book}:'${sheet}'!A:Z`, values)
  const headers = ['id_activite', 'id_type_activite', 'id_entite_organisatrice', 'nom_activite', 'titre_public', 'resume', 'date_debut', 'date_fin', 'pays', 'ville', 'lieu', 'id_statut_activite', 'observation']
  const statuses = ['PLANIFIE', 'EN_COURS', 'REALISE', 'TERMINE', 'REPORTE', 'ANNULE', 'UNKNOWN']
  const activityRows = Array.from({ length: count }, (_, i) => [`A${i}`, i % 11 === 0 ? '' : i % 9 === 0 ? 'UNKNOWN' : `T${i % 8}`, 'E1', `Activity ${i}`, '', '', '2026-01-01', '', '', '', '', statuses[i % statuses.length], ''])
  const typeRows = Array.from({ length: 8 }, (_, i) => [`T${i}`, i ? `Type ${i}` : ''])
  put('ACTIVITIES', 'ACTIVITES', [headers, ...activityRows])
  const setTypes = rows => put('REF', 'TYPES_ACTIVITE', [['id_type_activite', 'nom_type_activite'], ...rows])
  setTypes(typeRows)
  put('REF', 'ENTITES', [['id_entite', 'nom_officiel', 'sigle'], ...Array.from({ length: count }, (_, i) => [`E${i}`, `Entity ${i}`, `E${i}`])])
  put('REF', 'ROLES_ENTITE_ACTIVITE', [['id_role_entite_activite', 'nom_role_entite_activite'], ...Array.from({ length: count }, (_, i) => [`R${i}`, `Role ${i}`])])
  put('REF', 'TYPES_ACTEURS', [['id_type_acteur', 'nom_type_acteur', 'statut'], ...Array.from({ length: count }, (_, i) => [`P${i}`, `Actor ${i}`, 'ACTIF'])])
  const mocks = {
    '@/lib/google/sheets': sheets,
    '@/lib/federations/config': { getReferentialSpreadsheetId: () => 'REF' },
    '@/lib/acteurs/config': { getActeursSpreadsheetId: () => 'ACTORS' },
    './config': { getActivitesSpreadsheetId: () => 'ACTIVITIES' },
  }
  const dashboard = await loadServerModule(root, 'lib/activites/dashboard.ts', mocks)
  return { raw, logicalReads, put, setTypes, typeRows, activityRows, load: () => dashboard.loadActivitiesDashboardStats(), data: await loadServerModule(root, 'lib/activites/data.ts', mocks) }
}
