import assert from 'node:assert/strict'
import test from 'node:test'
import { competitionFixture, competitionsModule } from '../../scripts/cpu-audit/competitions-fixtures.mjs'
import { loadServerModule } from '../../scripts/cpu-audit/module-harness.mjs'
import { randomUUID } from 'node:crypto'

const root = process.env.CPU_TEST_ROOT || process.cwd()
const plain = value => JSON.parse(JSON.stringify(value))

test('competition detail and programs project only selected records, preserving normalization and freshness', async () => {
  const { namespace: data, state } = await competitionsModule(root, competitionFixture(8), { probes: true })
  assert.equal((await data.getCompetition(' comp0003 ', { bypassCache: true })).id_competition, 'COMP0003')
  assert.equal(state.projected.COMPETITIONS, 1)
  assert.equal(state.reads.at(-1).bypassCache, true)
  assert.equal((await data.getCompetitionPrograms('COMP0003', { bypassCache: true })).length, 5)
  assert.equal(state.projected.PROGRAMMES_COMPETITION, 5)
  assert.equal(state.reads.at(-1).bypassCache, true)
  assert.equal(await data.getCompetition('missing'), undefined)
  assert.equal((await data.getCompetitionPrograms('missing')).length, 0)
  state.failHeaders = true
  await assert.rejects(data.getCompetition('COMP0003'), /Mapping COMPETITIONS incomplet/)
  state.failHeaders = false; state.failSheet = 'COMPETITIONS'
  await assert.rejects(data.getCompetition('COMP0003'), /Synthetic source unavailable/)
})

test('results filter competition/history before projection; missing and orphaned relations stay excluded', async () => {
  const fixture = competitionFixture(8)
  fixture.tables.RESULTATS.push({ id_resultat: 'ORPHAN', id_engagement_campagne: 'missing' })
  const { namespace: data, state } = await competitionsModule(root, fixture, { probes: true })
  const rows = await data.getCompetitionResults('COMP0003', false, { bypassCache: true })
  assert.equal(rows.length, 30)
  assert.equal(state.projected.RESULTATS, 30)
  assert(rows.every(row => row.est_version_courante === 'OUI' && row.id_resultat.startsWith('RES3-')))
  assert.equal(state.reads.find(row => row.sheetName === 'RESULTATS').bypassCache, true)
  assert.equal((await data.getCompetitionResults('missing')).length, 0)
  assert.equal((await data.getCompetitionResults('COMP0003', true)).length, 50)
  state.failSheet = 'RESULTATS'
  await assert.rejects(data.getCompetitionResults('COMP0003'), /Synthetic source unavailable/)
})

test('unit members are indexed once, preserving duplicates, source order, direct composition and label failure', async () => {
  const fixture = competitionFixture(8)
  fixture.tables.MEMBRES_UNITES_PARTICIPANTES.push({ id_unite_participante: 'UNI3-0-0-0', id_participation_acteur: ' PAR3-0-0-0 ' })
  const { namespace: data, state } = await competitionsModule(root, fixture, { probes: true })
  const units = await data.getParticipatingUnits('COMP0003')
  assert.equal(units.length, 40)
  assert.equal(state.projected.memberComparisons, fixture.tables.MEMBRES_UNITES_PARTICIPANTES.length)
  assert.deepEqual(plain(units[0].membres), ['PAR3-0-0-0', 'PAR3-0-0-1', 'PAR3-0-0-2', 'PAR3-0-0-3', 'PAR3-0-0-0'])
  assert.equal(units[0].composition.length, 6)
  assert.equal(units[0].composition[0], 'Synthetic athlete 3-0')
  assert.equal((await data.getParticipatingUnits('missing')).length, 0)
  state.failSelections = true
  assert.equal((await data.getParticipatingUnits('COMP0003'))[0].composition[0], 'ATH3-0')
  state.failSheet = 'UNITES_PARTICIPANTES'
  await assert.rejects(data.getParticipatingUnits('COMP0003'), /Synthetic source unavailable/)
})

test('form references read only the three consumed tables and preserve returned labels', async () => {
  const fixture = competitionFixture(8)
  const { namespace: data, state } = await competitionsModule(root, fixture)
  const refs = await data.getCompetitionFormReferences()
  assert.deepEqual(plain(refs), { types: [{ id: 'TYPE', label: 'Synthetic multisport', scope: 'MULTISPORTS' }], levels: [{ id: 'LEVEL', label: 'Synthetic level' }], statuses: [{ id: 'PREVUE', label: 'Prévue' }] })
  assert.equal(state.reads.length, 3)
  state.failSheet = 'TYPES_COMPETITION'
  await assert.rejects(data.getCompetitionFormReferences(), /Synthetic source unavailable/)
})

test('delegation counts scan athletes once and preserve union across campaigns and competitions', async () => {
  const { calculateCompetitionDelegationCounts: count } = await loadServerModule(root, 'lib/competitions/delegation-counts.ts', {})
  let visits = 0
  const athletes = [{ get id_engagement_campagne() { visits++; return 'E1' }, id_selection: 'S1', athlete_id: 'A', id_statut_participation: 'PARTICIPANT' }, { get id_engagement_campagne() { visits++; return 'E2' }, id_selection: 'S2', athlete_id: 'A', id_statut_participation: 'INSCRIT' }]
  const links = [{ id_competition: 'C1', id_participation_equipe: 'E1' }, { id_competition: 'C2', id_participation_equipe: 'E2' }]
  const engagements = [{ id_engagement_campagne: 'E1', id_campagne: 'CAM' }, { id_engagement_campagne: 'E2', id_campagne: 'CAM' }]
  const staff = [{ id_campagne: 'CAM', id_acteur_coc: 'O', id_type_acteur: 'OFFICIEL' }, { id_campagne: 'CAM', id_acteur_coc: 'O', id_type_acteur: 'OFFICIEL' }]
  assert.deepEqual(plain(count(['C1', 'C2', 'empty'], links, engagements, athletes, staff)), { C1: 2, C2: 2, empty: 0 })
  assert.equal(visits, athletes.length)
})

test('units route refuses absent, unassigned, expired and unavailable access before any business read', async () => {
  let user = null, unavailable = false, businessReads = 0, authorizationReads = 0
  let assignments = []
  const route = await loadServerModule(root, 'app/api/competitions/[id]/unites/route.ts', {
    'next/cache': { revalidatePath() {}, revalidateTag() {} },
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    'node:crypto': { randomUUID },
    '@/lib/auth': { getSession: async () => user },
    '@/lib/users/data': { getAuthorizationsForUser: async () => { authorizationReads++; if (unavailable) throw Error('offline'); return assignments } },
    '@/lib/competitions/data': { getParticipatingUnits: async id => { businessReads++; return [{ id_unite_participante: `UNIT-${id}` }] }, createParticipatingUnit() {}, updateParticipatingUnit() {} },
    '@/lib/competitions/mutation': { runSportMutation() { throw Error('No business writes in read fixture') } },
  })
  const get = () => route.GET(new Request('https://example.invalid/api/competitions/C/unites'), { params: Promise.resolve({ id: 'C' }) })
  assert.equal((await get()).status, 401)
  user = { idUser: 'SYNTHETIC', typeUser: 'VIEWER', estSuperAdmin: false }
  assert.equal((await get()).status, 403)
  assignments = [{ idUser: user.idUser, idBlocAutorisation: 'AUT-SPT', statut: 'ACTIF', dateDebut: '2000-01-01', dateFin: '2001-01-01' }]
  assert.equal((await get()).status, 403)
  unavailable = true
  assert.equal((await get()).status, 503)
  assert.equal(businessReads, 0)
  unavailable = false; assignments[0].dateFin = ''
  const allowed = await get()
  assert.equal(allowed.status, 200)
  assert.deepEqual(await allowed.json(), { rows: [{ id_unite_participante: 'UNIT-C' }] })
  assert.equal(businessReads, 1)
  assert.equal(authorizationReads, 4)
})

test('competition and program mutations re-read their changes without changing identity or unrelated editions', async () => {
  const fixture = competitionFixture(2)
  fixture.tables.STATUTS_COMPETITION = [{ id_statut_competition: 'PLANIFIEE', nom_statut_competition: 'Planifiée' }]
  const { namespace: data, state } = await competitionsModule(root, fixture)
  state.allowWrites = true
  const current = await data.getCompetition('COMP0000')
  const changed = await data.updateCompetition('COMP0000', { ...current, nom_competition: 'Synthetic corrected', statut: 'PLANIFIEE' })
  assert.equal(changed.id_competition, 'COMP0000')
  assert.equal((await data.getCompetition('comp0000', { bypassCache: true })).nom_competition, 'Synthetic corrected')
  assert.equal((await data.getCompetition('COMP0001')).nom_competition, 'Synthetic 1')
  await data.updateCompetitionProgram('COMP0000', 'PRG0-0', { id_epreuve: 'foreign-must-not-replace', date_debut: '2026-10-02', date_fin: '2026-10-03' })
  const program = (await data.getCompetitionPrograms('COMP0000', { bypassCache: true }))[0]
  assert.equal(program.id_epreuve, 'EVENT0-0')
  assert.equal(program.date_debut, '2026-10-02')
  await assert.rejects(data.updateCompetitionProgram('COMP0001', 'PRG0-0', {}), /Programme introuvable/)
  assert.equal(state.writes.length, 2)
})
