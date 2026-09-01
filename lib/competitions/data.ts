import "server-only"

import { appendSheetRow, getSheetHeaders, getSheetRows, updateSheetCells } from "@/lib/google/sheets"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getNationalTeamReferences, getNationalTeams as getCentralNationalTeams } from "@/lib/equipes-nationales/data"
import { getCompetitionsSpreadsheetId } from "./config"
import { normalizeCompetitionStatus } from "./format"
import { COMPETITION_HEADERS, TEAM_PARTICIPATION_HEADERS, type Competition, type CompetitionReferences, type NationalTeamOption, type TeamParticipation } from "./types"
import { validateCompetitionInput, validateTeamParticipationInput } from "./validation"

const clean = (value: unknown) => String(value ?? "").trim()
const COMPETITIONS_SHEET = "COMPETITIONS"
const TEAMS_SHEET = "COMPETITIONS_EQUIPES_NATIONALES"
const COMPETITION_SHEET_HEADERS = ["id_competition", "nom_competition", "id_type_competition", "id_niveau_competition", "edition", "est_multisport", "date_debut", "date_fin", "pays", "ville", "lieu", "id_statut_competition", "observation"] as const
const TEAM_SHEET_HEADERS = ["id_participation_equipe", "id_competition", "id_equipe_nationale", "statut_participation", "date_engagement", "observation"] as const

async function assertHeaders(sheetName: string, expected: readonly string[]) {
  const headers = await getSheetHeaders({ sheetName, spreadsheetId: getCompetitionsSpreadsheetId() })
  const missing = expected.filter((header) => !headers.includes(header))
  if (missing.length) throw new Error(`Mapping ${sheetName} incomplet : ${missing.join(", ")}`)
}

function mapCompetition(row: Record<string, string>): Competition {
  const mapped = Object.fromEntries(COMPETITION_HEADERS.map((header) => [header, clean(row[header])])) as Record<(typeof COMPETITION_HEADERS)[number], string>
  mapped.niveau_competition = clean(row.id_niveau_competition)
  mapped.statut = clean(row.id_statut_competition)
  mapped.observations = clean(row.observation)
  return { ...mapped, statut_normalise: normalizeCompetitionStatus(mapped.statut) }
}

function mapParticipation(row: Record<string, string>): TeamParticipation {
  return { ...Object.fromEntries(TEAM_PARTICIPATION_HEADERS.map((header) => [header, clean(row[header])])), observations: clean(row.observation) } as TeamParticipation
}

function nextId(values: string[], prefix: string) {
  const max = values.reduce((current, value) => {
    const match = value.match(new RegExp(`^${prefix}(\\d+)$`, "i"))
    return match ? Math.max(current, Number(match[1])) : current
  }, 0)
  return `${prefix}${String(max + 1).padStart(4, "0")}`
}
const competitionSheetRow = (row: Record<string, string>) => ({ ...row, id_niveau_competition: row.niveau_competition, id_statut_competition: row.statut, observation: row.observations })

export async function getCompetitions() {
  await assertHeaders(COMPETITIONS_SHEET, COMPETITION_SHEET_HEADERS)
  return (await getSheetRows({ sheetName: COMPETITIONS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId() })).map(mapCompetition).filter((row) => row.id_competition)
}

export async function getCompetition(id: string) {
  return (await getCompetitions()).find((row) => row.id_competition === clean(id))
}

export async function getTeamParticipations(competitionId?: string) {
  await assertHeaders(TEAMS_SHEET, TEAM_SHEET_HEADERS)
  return (await getSheetRows({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId() })).map(mapParticipation).filter((row) => row.id_participation_equipe && (!competitionId || row.id_competition === competitionId))
}

async function getCompetitionTypes() {
  const rows = await getSheetRows({ sheetName: "TYPES_COMPETITION", spreadsheetId: getReferentialSpreadsheetId() })
  return rows.filter((row) => row.id_type_competition).map((row) => ({ id: clean(row.id_type_competition), label: clean(row.nom_type_competition) || clean(row.id_type_competition) }))
}

export async function getNationalTeams(): Promise<{ teams: NationalTeamOption[]; available: boolean }> {
  const [rows, references] = await Promise.all([getCentralNationalTeams(), getNationalTeamReferences()])
  const teams = rows.map((row) => ({
    id: row.id_equipe_nationale,
    label: row.nom_equipe_nationale || row.id_equipe_nationale,
    federationId: row.id_federation,
    federation: references.federations.find((item) => item.id === row.id_federation)?.label || row.id_federation,
    sportId: row.id_sport,
    sport: references.sports.find((item) => item.id === row.id_sport)?.label || row.id_sport,
    discipline: references.disciplines.find((item) => item.id === row.id_discipline)?.label || row.id_discipline,
  }))
  return { teams: teams.sort((a, b) => a.label.localeCompare(b.label, "fr")), available: true }
}

export async function getCompetitionReferences(): Promise<CompetitionReferences> {
  const [types, nationalTeams] = await Promise.all([getCompetitionTypes(), getNationalTeams().catch(() => ({ teams: [], available: false }))])
  return { types, teams: nationalTeams.teams, teamsAvailable: nationalTeams.available }
}

export async function createCompetition(input: Record<string, unknown>) {
  const row = validateCompetitionInput(input)
  const references = await getCompetitionReferences()
  if (!references.types.some((type) => type.id === row.id_type_competition)) throw new Error("Type de compétition inconnu.")
  const existing = await getCompetitions()
  const id = nextId(existing.map((item) => item.id_competition), "COMP")
  if (existing.some((item) => item.id_competition === id)) throw new Error("Impossible de générer un identifiant unique.")
  const created = { id_competition: id, ...row }
  await appendSheetRow({ sheetName: COMPETITIONS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), row: competitionSheetRow(created) })
  return mapCompetition(created)
}

export async function updateCompetition(id: string, input: Record<string, unknown>) {
  const current = await getCompetition(id)
  if (!current) throw new Error("Compétition introuvable.")
  const row = validateCompetitionInput(input)
  const references = await getCompetitionReferences()
  if (!references.types.some((type) => type.id === row.id_type_competition)) throw new Error("Type de compétition inconnu.")
  const physical: Record<string, string> = competitionSheetRow(row)
  await updateSheetCells({ sheetName: COMPETITIONS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), idColumn: "id_competition", idValue: current.id_competition, updates: ["nom_competition","id_type_competition","edition","id_niveau_competition","date_debut","date_fin","pays","ville","lieu","id_statut_competition","observation"].map((column) => ({ column, value: physical[column] })) })
  return mapCompetition({ id_competition: current.id_competition, ...row })
}

export async function createTeamParticipation(competitionId: string, input: Record<string, unknown>) {
  if (!(await getCompetition(competitionId))) throw new Error("Compétition introuvable.")
  const row = validateTeamParticipationInput(input)
  const references = await getCompetitionReferences()
  if (!references.teamsAvailable) throw new Error("Le catalogue des équipes nationales n’est pas encore configuré.")
  if (!references.teams.some((team) => team.id === row.id_equipe_nationale)) throw new Error("Équipe nationale inconnue ou identifiant ambigu.")
  const existing = await getTeamParticipations()
  if (existing.some((item) => item.id_competition === competitionId && item.id_equipe_nationale === row.id_equipe_nationale)) throw new Error("Cette équipe nationale est déjà rattachée à la compétition.")
  const created = { id_participation_equipe: nextId(existing.map((item) => item.id_participation_equipe), "PEN"), id_competition: competitionId, ...row }
  await appendSheetRow({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), row: { ...created, observation: created.observations } })
  return created
}

export async function updateTeamParticipation(competitionId: string, id: string, input: Record<string, unknown>) {
  const current = (await getTeamParticipations(competitionId)).find((item) => item.id_participation_equipe === id)
  if (!current) throw new Error("Participation d’équipe introuvable.")
  const row = validateTeamParticipationInput({ ...input, id_equipe_nationale: current.id_equipe_nationale })
  const updates = ["statut_participation", "date_engagement"].map((column) => ({ column, value: row[column as keyof typeof row] })).concat([{ column: "observation", value: row.observations }])
  await updateSheetCells({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), idColumn: "id_participation_equipe", idValue: id, updates })
  return { ...current, ...row, id_equipe_nationale: current.id_equipe_nationale }
}
