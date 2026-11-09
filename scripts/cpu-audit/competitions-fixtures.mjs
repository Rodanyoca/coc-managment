import fs from 'node:fs'
import path from 'node:path'
import { loadServerModule } from './module-harness.mjs'

// All identities and values are generated. No credentials or production source.
export function competitionFixture(count = 80) {
  const tables = Object.fromEntries(['COMPETITIONS', 'PROGRAMMES_COMPETITION', 'ENGAGEMENTS_CAMPAGNES_PROGRAMMES', 'CAMPAGNES_EQUIPES_NATIONALES', 'EQUIPES_NATIONALES', 'PARTICIPATIONS_ACTEURS_COMPETITION', 'UNITES_PARTICIPANTES', 'MEMBRES_UNITES_PARTICIPANTES', 'RESULTATS', 'MEDAILLES', 'SPORTS', 'EPREUVES', 'CATEGORIES_AGE', 'SEXES', 'DISCIPLINES', 'AFFECTATIONS_STAFF', 'ROLES_STAFF_EQUIPE_NATIONALE'].map(name => [name, []]))
  const selections = []
  tables.TYPES_COMPETITION = [{ id_type_competition: 'TYPE', nom_type_competition: 'Synthetic multisport', portee_sportive: 'MULTISPORTS' }]
  tables.NIVEAUX_COMPETITION = [{ id_niveau_competition: 'LEVEL', nom_niveau_competition: 'Synthetic level' }]
  tables.STATUTS_COMPETITION = [{ id_statut_competition: 'PREVUE', nom_statut_competition: 'Prévue' }]
  for (let i = 0; i < count; i++) {
    const cid = `COMP${String(i).padStart(4, '0')}`, campaign = `CAM${i}`, team = `TEAM${i}`
    tables.COMPETITIONS.push({ id_competition: cid, nom_competition: `Synthetic ${i}`, id_type_competition: 'TYPE', id_niveau_competition: 'LEVEL', edition: '2026', est_multisport: 'OUI', date_debut: '2026-10-01', date_fin: '2026-10-31', pays: 'Synthetic', ville: '', lieu: '', id_statut_competition: 'PREVUE', observation: '' })
    tables.CAMPAGNES_EQUIPES_NATIONALES.push({ id_campagne: campaign, id_equipe_nationale: team, nom_campagne: `Campaign ${i}` })
    tables.EQUIPES_NATIONALES.push({ id_equipe_nationale: team, nom_equipe_nationale: `Team ${i}`, id_federation: 'FED', id_sport: `SPORT${i}` })
    tables.SPORTS.push({ id_sport: `SPORT${i}`, nom_sport: `Sport ${i}` })
    tables.AFFECTATIONS_STAFF.push({ id_affectation_staff: `STAFF${i}`, id_campagne: campaign, id_acteur_coc: `OFF${i}`, id_type_acteur: 'OFFICIEL' })
    for (let j = 0; j < 5; j++) {
      const program = `PRG${i}-${j}`, event = `EVENT${i}-${j}`
      tables.PROGRAMMES_COMPETITION.push({ id_programme_competition: program, id_competition: cid, id_epreuve: event, id_categorie_age: '', id_sexe: '', date_debut: '2026-10-01', date_fin: '2026-10-31', observation: '' })
      tables.EPREUVES.push({ id_epreuve: event, nom_epreuve: event, id_sport: `SPORT${i}`, id_format_participation: 'INDIVIDUEL' })
      for (let k = 0; k < 2; k++) {
        const eid = `ENG${i}-${j}-${k}`
        tables.ENGAGEMENTS_CAMPAGNES_PROGRAMMES.push({ id_engagement_campagne: eid, id_programme_competition: program, id_campagne: campaign, id_statut_engagement: 'CONFIRME', date_engagement: '2026-10-01', observation: '' })
        for (let a = 0; a < 10; a++) {
          const pid = `PAR${i}-${j}-${k}-${a}`, sid = `SEL${i}-${j}-${k}-${a}`
          selections.push({ id_selection: sid, id_campagne: campaign, id_athlete: `ATH${i}-${a}`, athlete_label: `Synthetic athlete ${i}-${a}` })
          tables.PARTICIPATIONS_ACTEURS_COMPETITION.push({ id_participation_acteur: pid, id_engagement_campagne: eid, id_acteur_coc: `ATH${i}-${a}`, id_type_acteur: 'ATHLETE', id_selection: sid, id_statut_participation: 'PARTICIPANT', date_statut: '2026-10-02', observation: '' })
        }
        for (let u = 0; u < 4; u++) {
          const uid = `UNI${i}-${j}-${k}-${u}`
          tables.UNITES_PARTICIPANTES.push({ id_unite_participante: uid, id_engagement_campagne: eid, type_unite: u % 2 ? 'EQUIPE' : 'INDIVIDUEL', id_participation_acteur: u % 2 ? '' : `PAR${i}-${j}-${k}-${u}`, nom_unite: u % 2 ? `Unit ${u}` : '', observation: '' })
          for (let m = 0; m < 4; m++) tables.MEMBRES_UNITES_PARTICIPANTES.push({ id_membre_unite: `M${uid}-${m}`, id_unite_participante: uid, id_participation_acteur: `PAR${i}-${j}-${k}-${m}` })
        }
        for (let v = 0; v < 5; v++) tables.RESULTATS.push({ id_resultat: `RES${i}-${j}-${k}-${v}`, id_resultat_logique: `LOG${i}-${j}-${k}-${v % 3}`, numero_version: String(v + 1), est_version_courante: v < 2 ? 'NON' : 'OUI', id_engagement_campagne: eid, id_programme_competition: program, id_unite_participante: `UNI${i}-${j}-${k}-0`, date_resultat: '2026-10-03', motif_correction: '', observation: '' })
      }
    }
  }
  return { tables, selections }
}

export async function competitionsModule(root, fixture, { probes = false } = {}) {
  const state = { reads: [], batches: [], writes: [], projected: {}, failSheet: '', failHeaders: false, failSelections: false, allowWrites: false }
  const rowFields = { COMPETITIONS: 'nom_competition', PROGRAMMES_COMPETITION: 'id_sexe', RESULTATS: 'motif_correction', ENGAGEMENTS_CAMPAGNES_PROGRAMMES: 'observation' }
  const tables = Object.fromEntries(Object.entries(fixture.tables).map(([name, rows]) => [name, probes ? rows.map(row => new Proxy(row, { get(target, key) { if (key === rowFields[name]) state.projected[name] = (state.projected[name] || 0) + 1; if (name === 'MEMBRES_UNITES_PARTICIPANTES' && key === 'id_unite_participante') state.projected.memberComparisons = (state.projected.memberComparisons || 0) + 1; return target[key] } })) : rows]))
  const source = fs.readFileSync(path.join(root, 'lib/competitions/data.ts'), 'utf8')
  const headers = [...source.matchAll(/const (?:COMPETITION_SHEET_HEADERS|TEAM_SHEET_HEADERS|PROGRAM_SHEET_HEADERS) = (\[[^\n]+?\]) as const/g)].flatMap(match => JSON.parse(match[1]))
  const read = async options => { state.reads.push(options); if (state.failSheet === options.sheetName) throw Error('Synthetic source unavailable'); return tables[options.sheetName] || [] }
  const write = async input => { if (!state.allowWrites) throw Error('Offline fixture: write forbidden'); state.writes.push(input); if (input.row) (tables[input.sheetName] ??= []).push(input.row); else { const row = tables[input.sheetName]?.find(row => row[input.idColumn] === input.idValue); if (row) for (const item of input.updates || []) row[item.column] = item.value } }
  const namespace = await loadServerModule(root, 'lib/competitions/data.ts', {
    '@/lib/google/sheets': { getSheetRows: read, getSheetHeaders: async () => { if (state.failHeaders) return []; return headers }, getSheetsRows: async input => { state.batches.push(input); return Object.fromEntries(await Promise.all(input.sheetNames.map(async sheetName => [sheetName, await read({ ...input, sheetName })]))) }, appendSheetRow: write, appendSheetRows: write, updateSheetCells: write, deleteSheetRow: write },
    '@/lib/federations/config': { getReferentialSpreadsheetId: () => 'SYNTHETIC-REF' },
    '@/lib/equipes-nationales/config': { getNationalTeamsSpreadsheetId: () => 'SYNTHETIC-TEAMS' },
    './config': { getCompetitionsSpreadsheetId: () => 'SYNTHETIC-COMP' },
    '@/lib/equipes-nationales/data': { getNationalTeams: async () => { await read({ sheetName: 'EQUIPES_NATIONALES' }); return tables.EQUIPES_NATIONALES }, getNationalTeamReferences: async () => ({ federations: [], sports: [], disciplines: [] }), getCampaignSelections: async () => { if (state.failSelections) throw Error('Synthetic selections unavailable'); return fixture.selections } },
    '@/lib/activites/data': { getActors: async () => [] },
    '@/lib/federations/options': { getFederationOptions: async () => [] },
  })
  return { namespace, state, tables }
}
