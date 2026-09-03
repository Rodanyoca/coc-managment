import "server-only"

import { appendSheetRow, getSheetHeaders, getSheetRows, getSheetsRows, updateSheetCells } from "@/lib/google/sheets"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getNationalTeamReferences, getNationalTeams as getCentralNationalTeams } from "@/lib/equipes-nationales/data"
import { getCampaignSelections } from "@/lib/equipes-nationales/data"
import { getFederationOptions } from "@/lib/federations/options"
import { getNationalTeamsSpreadsheetId } from "@/lib/equipes-nationales/config"
import { getCompetitionsSpreadsheetId } from "./config"
import { normalizeCompetitionStatus } from "./format"
import { COMPETITION_HEADERS, PROGRAM_HEADERS, type AthleteParticipation, type CampaignEngagement, type Competition, type CompetitionProgram, type CompetitionReferences, type CompetitionResult, type IndividualPerformance, type NationalTeamOption, type ResultSegment, type TeamParticipation } from "./types"
import { assertSegmentMaximum, isPerformanceReferenceCompatible, isSegmentTypeCompatible, validateAthleteParticipationInput, validateCompetitionInput, validateCompetitionResultInput, validateEngagementInput, validateIndividualPerformanceInput, validateProgramInput, validateResultSegmentInput } from "./validation"
import { ENGAGEMENT_STATUSES } from "./v1-model"

const clean = (value: unknown) => String(value ?? "").trim()
const COMPETITIONS_SHEET = "COMPETITIONS"
const TEAMS_SHEET = "ENGAGEMENTS_CAMPAGNES_PROGRAMMES"
const PROGRAMS_SHEET = "PROGRAMMES_COMPETITION"
const COMPETITION_SHEET_HEADERS = ["id_competition", "nom_competition", "id_type_competition", "id_niveau_competition", "edition", "est_multisport", "date_debut", "date_fin", "pays", "ville", "lieu", "id_statut_competition", "observation"] as const
const TEAM_SHEET_HEADERS = ["id_engagement_campagne", "id_programme_competition", "id_campagne", "id_statut_engagement", "date_engagement", "date_debut", "date_fin", "id_federation_source", "date_transmission", "reference_source", "observation"] as const
const PROGRAM_SHEET_HEADERS = ["id_programme_competition", "id_competition", "id_epreuve", "id_categorie_age", "id_sexe", "date_debut", "date_fin", "observation"] as const
const RESULT_HEADERS = ["id_resultat","id_resultat_logique","numero_version","id_resultat_precedent","est_version_courante","id_engagement_campagne","id_programme_competition","date_resultat","phase","adversaire","pays_adversaire","id_resultat_synthetique","valeur_rdc","valeur_adversaire","id_unite_mesure","id_decision_resultat","id_federation_source","date_transmission","reference_source","id_statut_validation_resultat","date_validation","id_validateur_coc","motif_correction","observation"] as const

async function assertHeaders(sheetName: string, expected: readonly string[]) {
  const headers = await getSheetHeaders({ sheetName, spreadsheetId: getCompetitionsSpreadsheetId() })
  const missing = expected.filter((header) => !headers.includes(header))
  if (missing.length) throw new Error(`Mapping ${sheetName} incomplet : ${missing.join(", ")}`)
}

function mapCompetition(row: Record<string, string>): Competition {
  const mapped = Object.fromEntries(COMPETITION_HEADERS.map((header) => [header, clean(row[header])])) as Record<(typeof COMPETITION_HEADERS)[number], string>
  mapped.niveau_competition = clean(row.id_niveau_competition)
  mapped.est_multisport = clean(row.est_multisport)
  mapped.statut = clean(row.id_statut_competition)
  mapped.observations = clean(row.observation)
  return { ...mapped, statut_normalise: normalizeCompetitionStatus(mapped.statut) }
}

function nextId(values: string[], prefix: string) {
  const max = values.reduce((current, value) => {
    const match = value.match(new RegExp(`^${prefix}(\\d+)$`, "i"))
    return match ? Math.max(current, Number(match[1])) : current
  }, 0)
  return `${prefix}${String(max + 1).padStart(4, "0")}`
}
const competitionSheetRow = (row: Record<string, string>) => ({ ...row, id_niveau_competition: row.niveau_competition, id_statut_competition: row.statut, observation: row.observations })

export async function getCompetitions(options?: { bypassCache?: boolean }) {
  await assertHeaders(COMPETITIONS_SHEET, COMPETITION_SHEET_HEADERS)
  return (await getSheetRows({
    sheetName: COMPETITIONS_SHEET,
    spreadsheetId: getCompetitionsSpreadsheetId(),
    bypassCache: options?.bypassCache,
  })).map(mapCompetition).filter((row) => row.id_competition)
}

export async function getCompetition(id: string) {
  return (await getCompetitions()).find((row) => row.id_competition === clean(id))
}

export async function getTeamParticipations(competitionId?: string) {
  await assertHeaders(TEAMS_SHEET, TEAM_SHEET_HEADERS)
  const [engagements, programs, campaigns, teams] = await Promise.all([
    getSheetRows({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId() }),
    getSheetRows({ sheetName: "PROGRAMMES_COMPETITION", spreadsheetId: getCompetitionsSpreadsheetId() }),
    getSheetRows({ sheetName: "CAMPAGNES_EQUIPES_NATIONALES", spreadsheetId: getNationalTeamsSpreadsheetId() }),
    getSheetRows({ sheetName: "EQUIPES_NATIONALES", spreadsheetId: getNationalTeamsSpreadsheetId() }),
  ])
  const programMap = new Map(programs.map((row) => [row.id_programme_competition, row]))
  const campaignMap = new Map(campaigns.map((row) => [row.id_campagne, row]))
  const teamMap = new Map(teams.map((row) => [row.id_equipe_nationale, row]))
  return engagements.map((row) => {
    const program = programMap.get(row.id_programme_competition)
    const campaign = campaignMap.get(row.id_campagne)
    const team = teamMap.get(campaign?.id_equipe_nationale || "")
    return { id_participation_equipe: clean(row.id_engagement_campagne), id_competition: clean(program?.id_competition), id_equipe_nationale: clean(team?.id_equipe_nationale), statut_participation: clean(row.id_statut_engagement), date_engagement: clean(row.date_engagement), observations: clean(row.observation) } as TeamParticipation
  }).filter((row) => row.id_participation_equipe && (!competitionId || row.id_competition === competitionId))
}

async function getCompetitionTypes() {
  const rows = await getSheetRows({ sheetName: "TYPES_COMPETITION", spreadsheetId: getReferentialSpreadsheetId() })
  return rows.filter((row) => row.id_type_competition).map((row) => ({ id: clean(row.id_type_competition), label: clean(row.nom_type_competition) || clean(row.id_type_competition), scope: clean(row.portee_sportive) }))
}

async function getOptions(sheetName: string, idColumn: string, labelColumn: string) {
  return (await getSheetRows({ sheetName, spreadsheetId: getReferentialSpreadsheetId() })).filter((row) => row[idColumn]).map((row) => ({ id: clean(row[idColumn]), label: clean(row[labelColumn]) || clean(row[idColumn]) }))
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
  const spreadsheetId = getReferentialSpreadsheetId()
  const [types, levels, statuses, refs, nationalTeams] = await Promise.all([getCompetitionTypes(), getOptions("NIVEAUX_COMPETITION", "id_niveau_competition", "nom_niveau_competition"), getOptions("STATUTS_COMPETITION", "id_statut_competition", "nom_statut_competition"), getSheetsRows({ sheetNames: ["EPREUVES", "CATEGORIES_AGE", "SEXES"], spreadsheetId }), getNationalTeams().catch(() => ({ teams: [], available: false }))])
  const events = refs.EPREUVES.filter((row) => row.id_epreuve).map((row) => ({ id: row.id_epreuve, label: row.nom_epreuve || row.id_epreuve, federationId: row.id_federation, sportId: row.id_sport, disciplineId: row.id_discipline, formatId: row.id_format_participation, resultTypeId: row.id_type_resultat }))
  const ageCategories = refs.CATEGORIES_AGE.filter((row) => row.id_categorie_age).map((row) => ({ id: row.id_categorie_age, label: row.nom_categorie_age || row.id_categorie_age, federationId: row.id_federation, sportId: row.id_sport, disciplineId: row.id_discipline }))
  const sexes = refs.SEXES.filter((row) => row.id_sexe).map((row) => ({ id: row.id_sexe, label: row.nom_sexe || row.id_sexe }))
  return { types, levels, statuses, events, ageCategories, sexes, teams: nationalTeams.teams, teamsAvailable: nationalTeams.available }
}

export async function createCompetition(input: Record<string, unknown>) {
  const row = validateCompetitionInput(input)
  const references = await getCompetitionReferences()
  if (!references.types.some((type) => type.id === row.id_type_competition)) throw new Error("Type de compétition inconnu.")
  const type = references.types.find((item) => item.id === row.id_type_competition)
  if (type?.scope === "MULTISPORTS" && row.est_multisport !== "OUI") throw new Error("Ce type de compétition doit être multisport.")
  if (type?.scope === "MONOSPORT" && row.est_multisport !== "NON") throw new Error("Ce type de compétition doit être monosport.")
  if (!references.levels?.some((level) => level.id === row.niveau_competition)) throw new Error("Niveau de compétition inconnu.")
  if (!references.statuses?.some((status) => status.id === row.statut)) throw new Error("Statut de compétition inconnu.")
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
  const type = references.types.find((item) => item.id === row.id_type_competition)
  if (type?.scope === "MULTISPORTS" && row.est_multisport !== "OUI") throw new Error("Ce type de compétition doit être multisport.")
  if (type?.scope === "MONOSPORT" && row.est_multisport !== "NON") throw new Error("Ce type de compétition doit être monosport.")
  if (!references.levels?.some((level) => level.id === row.niveau_competition)) throw new Error("Niveau de compétition inconnu.")
  if (!references.statuses?.some((status) => status.id === row.statut)) throw new Error("Statut de compétition inconnu.")
  const physical: Record<string, string> = competitionSheetRow(row)
  await updateSheetCells({ sheetName: COMPETITIONS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), idColumn: "id_competition", idValue: current.id_competition, updates: ["nom_competition","id_type_competition","edition","est_multisport","id_niveau_competition","date_debut","date_fin","pays","ville","lieu","id_statut_competition","observation"].map((column) => ({ column, value: physical[column] })) })
  return mapCompetition({ id_competition: current.id_competition, ...row })
}

function mapProgram(row: Record<string, string>): CompetitionProgram {
  const mapped = Object.fromEntries(PROGRAM_HEADERS.map((header) => [header, clean(row[header])])) as Record<(typeof PROGRAM_HEADERS)[number], string>
  mapped.observations = clean(row.observation)
  return mapped
}

export async function getCompetitionPrograms(competitionId?: string, options: { bypassCache?: boolean } = {}) {
  await assertHeaders(PROGRAMS_SHEET, PROGRAM_SHEET_HEADERS)
  return (await getSheetRows({ sheetName: PROGRAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), bypassCache: options.bypassCache })).map(mapProgram).filter((row) => row.id_programme_competition && (!competitionId || row.id_competition === competitionId))
}

function assertProgramReferences(row: ReturnType<typeof validateProgramInput>, references: CompetitionReferences) {
  const event = references.events?.find((item) => item.id === row.id_epreuve)
  if (!event) throw new Error("Épreuve inconnue.")
  if (row.id_sexe && !references.sexes?.some((item) => item.id === row.id_sexe)) throw new Error("Sexe inconnu.")
  if (row.id_categorie_age && !references.ageCategories?.some((item) => item.id === row.id_categorie_age && (!item.sportId || item.sportId === event.sportId) && (!item.disciplineId || item.disciplineId === event.disciplineId))) throw new Error("Catégorie d’âge incompatible avec l’épreuve.")
  return event
}

function assertProgramPeriod(row: ReturnType<typeof validateProgramInput>, competition: Competition) {
  if (row.date_debut && row.date_debut < competition.date_debut) throw new Error("Le programme commence avant la compétition.")
  if (row.date_fin && competition.date_fin && row.date_fin > competition.date_fin) throw new Error("Le programme se termine après la compétition.")
}

export async function createCompetitionProgram(competitionId: string, input: Record<string, unknown>) {
  const competition = await getCompetition(competitionId)
  if (!competition) throw new Error("Compétition introuvable.")
  const row = validateProgramInput(input)
  const references = await getCompetitionReferences()
  const event = assertProgramReferences(row, references); assertProgramPeriod(row, competition)
  const existing = await getCompetitionPrograms()
  if (existing.some((item) => item.id_competition === competitionId && item.id_epreuve === row.id_epreuve && item.id_categorie_age === row.id_categorie_age && item.id_sexe === row.id_sexe)) throw new Error("Ce programme existe déjà.")
  if (competition.est_multisport === "NON") {
    const sports = new Set(existing.filter((item) => item.id_competition === competitionId).map((item) => references.events?.find((option) => option.id === item.id_epreuve)?.sportId).filter(Boolean))
    if (sports.size && !sports.has(event.sportId)) throw new Error("Une compétition monosport ne peut pas contenir plusieurs sports.")
  }
  const id = nextId(existing.map((item) => item.id_programme_competition), "PRG")
  const created = { id_programme_competition: id, id_competition: competitionId, ...row }
  await appendSheetRow({ sheetName: PROGRAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), row: { ...created, observation: created.observations } })
  const confirmed = (await getCompetitionPrograms()).find((item) => item.id_programme_competition === id)
  if (!confirmed) throw new Error("Création du programme non confirmée.")
  return confirmed
}

export async function updateCompetitionProgram(competitionId: string, id: string, input: Record<string, unknown>) {
  const competition = await getCompetition(competitionId)
  const current = (await getCompetitionPrograms(competitionId)).find((item) => item.id_programme_competition === id)
  if (!competition || !current) throw new Error("Programme introuvable.")
  const row = validateProgramInput({ ...input, id_epreuve: current.id_epreuve })
  const references = await getCompetitionReferences(); assertProgramReferences(row, references); assertProgramPeriod(row, competition)
  const existing = await getCompetitionPrograms()
  if (existing.some((item) => item.id_programme_competition !== id && item.id_competition === competitionId && item.id_epreuve === row.id_epreuve && item.id_categorie_age === row.id_categorie_age && item.id_sexe === row.id_sexe)) throw new Error("Ce programme existe déjà.")
  const physical = { ...row, observation: row.observations }
  await updateSheetCells({ sheetName: PROGRAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), idColumn: "id_programme_competition", idValue: id, updates: ["id_categorie_age", "id_sexe", "date_debut", "date_fin", "observation"].map((column) => ({ column, value: physical[column as keyof typeof physical] })) })
  return mapProgram({ ...current, ...row, observation: row.observations })
}

export async function getCampaignEngagements(filters: { competitionId?: string; teamId?: string } = {}): Promise<CampaignEngagement[]> {
  const [engagements, programs, campaigns, teams] = await Promise.all([
    getSheetRows({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId() }), getCompetitionPrograms(),
    getSheetRows({ sheetName: "CAMPAGNES_EQUIPES_NATIONALES", spreadsheetId: getNationalTeamsSpreadsheetId() }), getCentralNationalTeams(),
  ])
  const programMap = new Map(programs.map((row) => [row.id_programme_competition, row])), campaignMap = new Map(campaigns.map((row) => [row.id_campagne, row])), teamMap = new Map(teams.map((row) => [row.id_equipe_nationale, row]))
  return engagements.map((row) => { const campaign = campaignMap.get(row.id_campagne), team = teamMap.get(campaign?.id_equipe_nationale || ""); return { ...Object.fromEntries(TEAM_SHEET_HEADERS.map((header) => [header, clean(row[header])])), id_equipe_nationale: clean(campaign?.id_equipe_nationale), nom_equipe_nationale: clean(team?.nom_equipe_nationale), nom_campagne: clean(campaign?.nom_campagne), id_federation_responsable: clean(team?.id_federation) } as CampaignEngagement }).filter((row) => row.id_engagement_campagne && (!filters.competitionId || programMap.get(row.id_programme_competition)?.id_competition === filters.competitionId) && (!filters.teamId || row.id_equipe_nationale === filters.teamId))
}

export async function getEngagementReferences() {
  const [campaigns, statuses, federations, teams] = await Promise.all([
    getSheetRows({ sheetName: "CAMPAGNES_EQUIPES_NATIONALES", spreadsheetId: getNationalTeamsSpreadsheetId() }),
    getSheetRows({ sheetName: "STATUTS_ENGAGEMENT_PROGRAMME", spreadsheetId: getReferentialSpreadsheetId() }), getFederationOptions(), getCentralNationalTeams(),
  ])
  const teamMap = new Map(teams.map((row) => [row.id_equipe_nationale, row]))
  return { campaigns: campaigns.filter((row) => row.id_campagne).map((row) => ({ id: row.id_campagne, label: row.nom_campagne || row.id_campagne, teamId: row.id_equipe_nationale, federationId: teamMap.get(row.id_equipe_nationale)?.id_federation || "", dateStart: row.date_debut, dateEnd: row.date_fin, status: row.statut })), statuses: statuses.filter((row) => row.id_statut_engagement).map((row) => ({ id: row.id_statut_engagement, label: row.nom_statut_engagement || row.id_statut_engagement })), federations: federations.map((row) => ({ id: row.id, label: row.sigle || row.nom })) }
}

async function prepareEngagement(competitionId: string, input: Record<string, unknown>, immutable?: { id_programme_competition: string; id_campagne: string }) {
  const row = validateEngagementInput({ ...input, ...immutable })
  const [competition, programs, references, teams] = await Promise.all([getCompetition(competitionId), getCompetitionPrograms(competitionId), getEngagementReferences(), getCentralNationalTeams()])
  if (!competition) throw new Error("Compétition introuvable.")
  const program = programs.find((item) => item.id_programme_competition === row.id_programme_competition); if (!program) throw new Error("Programme étranger à la compétition.")
  const campaign = references.campaigns.find((item) => item.id === row.id_campagne); if (!campaign) throw new Error("Campagne introuvable.")
  const team = teams.find((item) => item.id_equipe_nationale === campaign.teamId); if (!team) throw new Error("Équipe nationale de la campagne introuvable.")
  if (!references.statuses.some((item) => item.id === row.id_statut_engagement) || !ENGAGEMENT_STATUSES.includes(row.id_statut_engagement as (typeof ENGAGEMENT_STATUSES)[number])) throw new Error("Statut d’engagement inconnu.")
  if (!references.federations.some((item) => item.id === row.id_federation_source)) throw new Error("Fédération source inconnue.")
  const start = program.date_debut || competition.date_debut, end = program.date_fin || competition.date_fin
  if ((campaign.dateEnd && campaign.dateEnd < start) || (end && campaign.dateStart > end)) throw new Error("La campagne est hors de la période du programme.")
  if ((row.date_debut && row.date_debut < start) || (row.date_fin && end && row.date_fin > end)) throw new Error("L’engagement est hors de la période du programme.")
  if (row.id_federation_source !== team.id_federation && !row.observation) throw new Error("Une fédération source différente doit être justifiée dans l’observation.")
  return row
}

export async function createCampaignEngagement(competitionId: string, input: Record<string, unknown>) {
  const row = await prepareEngagement(competitionId, input), existing = await getCampaignEngagements()
  const overlaps = (item: CampaignEngagement) => { const leftStart = item.date_debut || item.date_engagement, rightStart = row.date_debut || row.date_engagement, leftEnd = item.date_fin || "9999-12-31", rightEnd = row.date_fin || "9999-12-31"; return leftStart <= rightEnd && rightStart <= leftEnd }
  if (row.id_statut_engagement !== "ANNULE" && existing.some((item) => item.id_programme_competition === row.id_programme_competition && item.id_campagne === row.id_campagne && item.id_statut_engagement !== "ANNULE" && overlaps(item))) throw new Error("Cette campagne possède déjà un engagement actif sur cette période.")
  const created = { id_engagement_campagne: nextId(existing.map((item) => item.id_engagement_campagne), "ENG"), ...row }
  await appendSheetRow({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), row: created })
  return (await getCampaignEngagements({ competitionId })).find((item) => item.id_engagement_campagne === created.id_engagement_campagne) || created
}

export async function updateCampaignEngagement(competitionId: string, id: string, input: Record<string, unknown>) {
  const current = (await getCampaignEngagements({ competitionId })).find((item) => item.id_engagement_campagne === id); if (!current) throw new Error("Engagement introuvable.")
  const row = await prepareEngagement(competitionId, input, { id_programme_competition: current.id_programme_competition, id_campagne: current.id_campagne })
  const siblings = (await getCampaignEngagements()).filter((item) => item.id_engagement_campagne !== id && item.id_programme_competition === current.id_programme_competition && item.id_campagne === current.id_campagne && item.id_statut_engagement !== "ANNULE")
  const start = row.date_debut || row.date_engagement, end = row.date_fin || "9999-12-31"
  if (row.id_statut_engagement !== "ANNULE" && siblings.some((item) => (item.date_debut || item.date_engagement) <= end && start <= (item.date_fin || "9999-12-31"))) throw new Error("Cette campagne possède déjà un engagement actif sur cette période.")
  await updateSheetCells({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), idColumn: "id_engagement_campagne", idValue: id, updates: TEAM_SHEET_HEADERS.slice(3).map((column) => ({ column, value: row[column as keyof typeof row] })) })
  return { ...current, ...row }
}

export async function getAthleteParticipations(filters:{competitionId?:string;engagementId?:string}={}):Promise<AthleteParticipation[]>{
  const [rows,engagements,selections]=await Promise.all([getSheetRows({sheetName:"PARTICIPATIONS_ATHLETES_COMPETITION",spreadsheetId:getCompetitionsSpreadsheetId()}),getCampaignEngagements(filters.competitionId?{competitionId:filters.competitionId}:{}),getCampaignSelections()])
  const engagementIds=new Set(engagements.map((row)=>row.id_engagement_campagne)),selectionMap=new Map(selections.map((row)=>[row.id_selection,row]))
  return rows.filter((row)=>engagementIds.has(row.id_engagement_campagne)&&(!filters.engagementId||row.id_engagement_campagne===filters.engagementId)).map((row)=>{const selection=selectionMap.get(row.id_selection);return{id_participation_athlete:clean(row.id_participation_athlete),id_engagement_campagne:clean(row.id_engagement_campagne),id_selection:clean(row.id_selection),id_statut_participation:clean(row.id_statut_participation),date_statut:clean(row.date_statut),id_selection_remplacement:clean(row.id_selection_remplacement),observation:clean(row.observation),athlete_id:selection?.id_athlete,athlete_label:selection?.athlete_label,campaign_id:selection?.id_campagne}}).filter((row)=>row.id_participation_athlete)
}

export async function getParticipationReferences(){const [statuses,selections]=await Promise.all([getSheetRows({sheetName:"STATUTS_PARTICIPATION_ATHLETE",spreadsheetId:getReferentialSpreadsheetId()}),getCampaignSelections()]);return{statuses:statuses.filter((row)=>row.id_statut_participation).map((row)=>({id:row.id_statut_participation,label:row.nom_statut_participation||row.id_statut_participation})),selections}}

async function prepareParticipation(competitionId:string,input:Record<string,unknown>,immutable?:{id_engagement_campagne:string;id_selection:string}){
  const row=validateAthleteParticipationInput({...input,...immutable}),[engagements,refs]=await Promise.all([getCampaignEngagements({competitionId}),getParticipationReferences()]),engagement=engagements.find((item)=>item.id_engagement_campagne===row.id_engagement_campagne);if(!engagement)throw new Error("Engagement étranger à la compétition.")
  const selection=refs.selections.find((item)=>item.id_selection===row.id_selection);if(!selection||selection.id_campagne!==engagement.id_campagne)throw new Error("La sélection n’appartient pas à la campagne engagée.")
  if(!refs.statuses.some((item)=>item.id===row.id_statut_participation))throw new Error("Statut de participation absent du référentiel.")
  if(row.id_selection_remplacement){const replacement=refs.selections.find((item)=>item.id_selection===row.id_selection_remplacement);if(!replacement||replacement.id_campagne!==selection.id_campagne||replacement.id_statut_selection!=="REMPLACANT")throw new Error("La sélection remplaçante est invalide.")}
  const start=engagement.date_debut||engagement.date_engagement,end=engagement.date_fin;if(row.date_statut<start||(end&&row.date_statut>end))throw new Error("La date de participation est hors de la période d’engagement.")
  return row
}

export async function createAthleteParticipation(competitionId:string,input:Record<string,unknown>){const row=await prepareParticipation(competitionId,input),existing=await getAthleteParticipations();if(existing.some((item)=>item.id_engagement_campagne===row.id_engagement_campagne&&item.id_selection===row.id_selection))throw new Error("Une participation existe déjà pour cette sélection et cet engagement.");const created={id_participation_athlete:nextId(existing.map((item)=>item.id_participation_athlete),"PAT"),...row};await appendSheetRow({sheetName:"PARTICIPATIONS_ATHLETES_COMPETITION",spreadsheetId:getCompetitionsSpreadsheetId(),row:created});return created}

export async function updateAthleteParticipation(competitionId:string,id:string,input:Record<string,unknown>){const current=(await getAthleteParticipations({competitionId})).find((item)=>item.id_participation_athlete===id);if(!current)throw new Error("Participation introuvable.");const row=await prepareParticipation(competitionId,input,{id_engagement_campagne:current.id_engagement_campagne,id_selection:current.id_selection});await updateSheetCells({sheetName:"PARTICIPATIONS_ATHLETES_COMPETITION",spreadsheetId:getCompetitionsSpreadsheetId(),idColumn:"id_participation_athlete",idValue:id,updates:["id_statut_participation","date_statut","id_selection_remplacement","observation"].map((column)=>({column,value:row[column as keyof typeof row]}))});return{...current,...row}}

export async function getCompetitionResults(competitionId?:string,includeHistory=true):Promise<CompetitionResult[]>{
 const [rows,engagements]=await Promise.all([getSheetRows({sheetName:"RESULTATS",spreadsheetId:getCompetitionsSpreadsheetId()}),getCampaignEngagements(competitionId?{competitionId}:{})]),engagementMap=new Map(engagements.map((row)=>[row.id_engagement_campagne,row]))
 return rows.map((row)=>{const engagement=engagementMap.get(row.id_engagement_campagne);return{...Object.fromEntries(RESULT_HEADERS.map((header)=>[header,clean(row[header])])),nom_equipe_nationale:engagement?.nom_equipe_nationale,nom_campagne:engagement?.nom_campagne} as CompetitionResult}).filter((row)=>row.id_resultat&&engagementMap.has(row.id_engagement_campagne)&&(includeHistory||row.est_version_courante==="OUI")).sort((a,b)=>a.id_resultat_logique===b.id_resultat_logique?Number(b.numero_version)-Number(a.numero_version):b.date_resultat.localeCompare(a.date_resultat))
}

export async function getResultReferences(){const spreadsheetId=getReferentialSpreadsheetId(),[refs,federations]=await Promise.all([getSheetsRows({sheetNames:["RESULTATS_SYNTHETIQUES","UNITES_MESURE","DECISIONS_RESULTATS","STATUTS_VALIDATION_RESULTAT"],spreadsheetId}),getFederationOptions()]);return{synthetics:refs.RESULTATS_SYNTHETIQUES.filter((row)=>row.id_resultat_synthetique).map((row)=>({id:row.id_resultat_synthetique,label:row.nom_resultat_synthetique||row.id_resultat_synthetique})),units:refs.UNITES_MESURE.filter((row)=>row.id_unite_mesure).map((row)=>({id:row.id_unite_mesure,label:row.nom_unite_mesure||row.id_unite_mesure,type:row.type_mesure})),decisions:refs.DECISIONS_RESULTATS.filter((row)=>row.id_decision_resultat&&row.statut!=="INACTIF").map((row)=>({id:row.id_decision_resultat,label:row.nom_decision||row.id_decision_resultat,federationId:row.id_federation,sportId:row.id_sport,disciplineId:row.id_discipline})),statuses:refs.STATUTS_VALIDATION_RESULTAT.filter((row)=>row.id_statut_validation_resultat).map((row)=>({id:row.id_statut_validation_resultat,label:row.nom_statut_validation_resultat||row.id_statut_validation_resultat})),federations:federations.map((row)=>({id:row.id,label:row.sigle||row.nom}))}}

async function prepareResult(competitionId:string,input:Record<string,unknown>,engagementId?:string){const row=validateCompetitionResultInput({...input,id_engagement_campagne:engagementId||input.id_engagement_campagne}),[engagements,refs,programs,competitionRefs]=await Promise.all([getCampaignEngagements({competitionId}),getResultReferences(),getCompetitionPrograms(competitionId),getCompetitionReferences()]),engagement=engagements.find((item)=>item.id_engagement_campagne===row.id_engagement_campagne);if(!engagement)throw new Error("Engagement étranger à la compétition.");const program=programs.find((item)=>item.id_programme_competition===engagement.id_programme_competition);if(!program)throw new Error("Programme de l’engagement introuvable.");const event=competitionRefs.events?.find((item)=>item.id===program.id_epreuve)
 if(!refs.statuses.some((item)=>item.id===row.id_statut_validation_resultat))throw new Error("Statut de validation absent du référentiel.");if(row.id_resultat_synthetique&&!refs.synthetics.some((item)=>item.id===row.id_resultat_synthetique))throw new Error("Résultat synthétique inconnu.");if((row.valeur_rdc||row.valeur_adversaire)&&!row.id_unite_mesure&&event?.resultTypeId!=="TR_RANG")throw new Error("L’unité de mesure est obligatoire pour ce type de valeur.");if(row.id_unite_mesure&&!refs.units.some((item)=>item.id===row.id_unite_mesure))throw new Error("Unité de mesure inconnue.");if(row.id_decision_resultat&&!refs.decisions.some((item)=>item.id===row.id_decision_resultat&&(!item.federationId||item.federationId===engagement.id_federation_responsable)&&(!item.sportId||item.sportId===event?.sportId)&&(!item.disciplineId||item.disciplineId===event?.disciplineId)))throw new Error("Décision incompatible avec le contexte sportif.")
 const start=engagement.date_debut||engagement.date_engagement,end=engagement.date_fin;if(row.date_resultat<start||(end&&row.date_resultat>end))throw new Error("La date du résultat est hors de la période d’engagement.");return{row,program,engagement}}

export async function createCompetitionResult(competitionId:string,input:Record<string,unknown>){const{row,program}=await prepareResult(competitionId,input),existing=await getCompetitionResults();const created={...row,id_resultat:nextId(existing.map((item)=>item.id_resultat),"RES"),id_resultat_logique:nextId(existing.map((item)=>item.id_resultat_logique),"RSL"),numero_version:"1",id_resultat_precedent:"",est_version_courante:"OUI",id_programme_competition:program.id_programme_competition,motif_correction:""};await appendSheetRow({sheetName:"RESULTATS",spreadsheetId:getCompetitionsSpreadsheetId(),row:created});return created}

export async function correctCompetitionResult(competitionId:string,id:string,input:Record<string,unknown>){const current=(await getCompetitionResults(competitionId)).find((item)=>item.id_resultat===id&&item.est_version_courante==="OUI");if(!current)throw new Error("Version courante du résultat introuvable.");const{row}=await prepareResult(competitionId,input,current.id_engagement_campagne);if(!row.motif_correction)throw new Error("Le motif de correction est obligatoire.");const all=await getCompetitionResults(),created={...current,...row,id_resultat:nextId(all.map((item)=>item.id_resultat),"RES"),numero_version:String(Number(current.numero_version)+1),id_resultat_precedent:current.id_resultat,est_version_courante:"OUI"};await appendSheetRow({sheetName:"RESULTATS",spreadsheetId:getCompetitionsSpreadsheetId(),row:created});await updateSheetCells({sheetName:"RESULTATS",spreadsheetId:getCompetitionsSpreadsheetId(),idColumn:"id_resultat",idValue:current.id_resultat,updates:[{column:"est_version_courante",value:"NON"},{column:"id_statut_validation_resultat",value:"CORRIGE"}]});return created}

export async function getResultSegments(competitionId?:string):Promise<ResultSegment[]>{const [rows,results]=await Promise.all([getSheetRows({sheetName:"RESULTATS_SEGMENTS",spreadsheetId:getCompetitionsSpreadsheetId()}),getCompetitionResults(competitionId)]),resultIds=new Set(results.map((row)=>row.id_resultat));return rows.filter((row)=>resultIds.has(row.id_resultat)).map((row)=>({id_segment_resultat:clean(row.id_segment_resultat),id_resultat:clean(row.id_resultat),id_type_segment:clean(row.id_type_segment),numero_segment:clean(row.numero_segment),valeur_rdc:clean(row.valeur_rdc),valeur_adversaire:clean(row.valeur_adversaire),observation:clean(row.observation)})).filter((row)=>row.id_segment_resultat).sort((a,b)=>a.id_resultat.localeCompare(b.id_resultat)||Number(a.numero_segment)-Number(b.numero_segment))}

export async function getSegmentReferences(){const rows=await getSheetRows({sheetName:"TYPES_SEGMENTS_RESULTATS",spreadsheetId:getReferentialSpreadsheetId()});return rows.filter((row)=>row.id_type_segment&&row.statut!=="INACTIF").map((row)=>({id:row.id_type_segment,label:row.nom_type_segment||row.id_type_segment,federationId:row.id_federation,sportId:row.id_sport,disciplineId:row.id_discipline,max:Number(row.ordre_maximal)||0}))}

async function prepareSegment(competitionId:string,input:Record<string,unknown>,immutable?:{id_resultat:string;id_type_segment:string;numero_segment:string}){const row=validateResultSegmentInput({...input,...immutable}),[results,programs,competitionRefs,types]=await Promise.all([getCompetitionResults(competitionId),getCompetitionPrograms(competitionId),getCompetitionReferences(),getSegmentReferences()]),result=results.find((item)=>item.id_resultat===row.id_resultat&&item.est_version_courante==="OUI");if(!result)throw new Error("Le segment doit appartenir à une version courante du résultat.");const program=programs.find((item)=>item.id_programme_competition===result.id_programme_competition),event=competitionRefs.events?.find((item)=>item.id===program?.id_epreuve),type=types.find((item)=>item.id===row.id_type_segment&&isSegmentTypeCompatible(item,event||{}));if(!type)throw new Error("Type de segment incompatible avec le contexte sportif.");assertSegmentMaximum(row.numero_segment,type.max);return row}

export async function createResultSegment(competitionId:string,input:Record<string,unknown>){const row=await prepareSegment(competitionId,input),existing=await getResultSegments();if(existing.some((item)=>item.id_resultat===row.id_resultat&&item.id_type_segment===row.id_type_segment&&item.numero_segment===row.numero_segment))throw new Error("Ce segment existe déjà.");const created={id_segment_resultat:nextId(existing.map((item)=>item.id_segment_resultat),"SEG"),...row};await appendSheetRow({sheetName:"RESULTATS_SEGMENTS",spreadsheetId:getCompetitionsSpreadsheetId(),row:created});return created}

export async function updateResultSegment(competitionId:string,id:string,input:Record<string,unknown>){const current=(await getResultSegments(competitionId)).find((item)=>item.id_segment_resultat===id);if(!current)throw new Error("Segment introuvable.");const row=await prepareSegment(competitionId,input,{id_resultat:current.id_resultat,id_type_segment:current.id_type_segment,numero_segment:current.numero_segment});await updateSheetCells({sheetName:"RESULTATS_SEGMENTS",spreadsheetId:getCompetitionsSpreadsheetId(),idColumn:"id_segment_resultat",idValue:id,updates:["valeur_rdc","valeur_adversaire","observation"].map((column)=>({column,value:row[column as keyof typeof row]}))});return{...current,...row}}

export async function getIndividualPerformances(competitionId?:string):Promise<IndividualPerformance[]>{const [rows,results,participations]=await Promise.all([getSheetRows({sheetName:"PERFORMANCES_INDIVIDUELLES",spreadsheetId:getCompetitionsSpreadsheetId()}),getCompetitionResults(competitionId),getAthleteParticipations(competitionId?{competitionId}:{})]),resultMap=new Map(results.map((row)=>[row.id_resultat,row])),participationMap=new Map(participations.map((row)=>[row.id_participation_athlete,row]));return rows.filter((row)=>resultMap.has(row.id_resultat)).map((row)=>{const participant=participationMap.get(row.id_participation_athlete),result=resultMap.get(row.id_resultat);return{id_performance:clean(row.id_performance),id_resultat:clean(row.id_resultat),id_participation_athlete:clean(row.id_participation_athlete),id_type_resultat:clean(row.id_type_resultat),valeur:clean(row.valeur),id_unite_mesure:clean(row.id_unite_mesure),rang:clean(row.rang),est_record:clean(row.est_record),est_meilleure_performance:clean(row.est_meilleure_performance),id_distinction:clean(row.id_distinction),observation:clean(row.observation),athlete_id:participant?.athlete_id,athlete_label:participant?.athlete_label,id_federation_source:result?.id_federation_source,reference_source:result?.reference_source}}).filter((row)=>row.id_performance)}

export async function getPerformanceReferences(){const spreadsheetId=getReferentialSpreadsheetId(),refs=await getSheetsRows({sheetNames:["TYPES_RESULTAT","UNITES_MESURE","DISTINCTIONS_SPORTIVES"],spreadsheetId});return{types:refs.TYPES_RESULTAT.filter((row)=>row.id_type_resultat&&row.statut!=="INACTIF").map((row)=>({id:row.id_type_resultat,label:row.nom_type_resultat||row.id_type_resultat,federationId:row.id_federation,sportId:row.id_sport,disciplineId:row.id_discipline,unitId:row.id_unite_mesure,direction:row.sens_performance})),units:refs.UNITES_MESURE.filter((row)=>row.id_unite_mesure).map((row)=>({id:row.id_unite_mesure,label:row.nom_unite_mesure||row.id_unite_mesure})),distinctions:refs.DISTINCTIONS_SPORTIVES.filter((row)=>row.id_distinction&&row.statut!=="INACTIF").map((row)=>({id:row.id_distinction,label:row.nom_distinction||row.id_distinction,federationId:row.id_federation,sportId:row.id_sport,disciplineId:row.id_discipline}))}}

async function preparePerformance(competitionId:string,input:Record<string,unknown>,immutable?:{id_resultat:string;id_participation_athlete:string;id_type_resultat:string}){const row=validateIndividualPerformanceInput({...input,...immutable}),[results,participations,programs,competitionRefs,refs]=await Promise.all([getCompetitionResults(competitionId),getAthleteParticipations({competitionId}),getCompetitionPrograms(competitionId),getCompetitionReferences(),getPerformanceReferences()]),result=results.find((item)=>item.id_resultat===row.id_resultat&&item.est_version_courante==="OUI");if(!result)throw new Error("La performance doit appartenir à une version courante du résultat.");const participation=participations.find((item)=>item.id_participation_athlete===row.id_participation_athlete&&item.id_statut_participation==="PARTICIPANT"&&item.id_engagement_campagne===result.id_engagement_campagne);if(!participation)throw new Error("Un participant effectif du même engagement est obligatoire.");const program=programs.find((item)=>item.id_programme_competition===result.id_programme_competition),event=competitionRefs.events?.find((item)=>item.id===program?.id_epreuve),context={federationId:event?.federationId,sportId:event?.sportId,disciplineId:event?.disciplineId},type=refs.types.find((item)=>item.id===row.id_type_resultat&&isPerformanceReferenceCompatible(item,context));if(!type)throw new Error("Type de résultat incompatible avec l’épreuve.");if(row.valeur&&type.id!=="TR_RANG"&&!row.id_unite_mesure)throw new Error("L’unité est obligatoire pour cette performance.");if(type.unitId&&row.id_unite_mesure!==type.unitId)throw new Error("L’unité ne correspond pas au type de résultat.");if(row.id_unite_mesure&&!refs.units.some((item)=>item.id===row.id_unite_mesure))throw new Error("Unité inconnue.");if(row.id_distinction&&!refs.distinctions.some((item)=>item.id===row.id_distinction&&isPerformanceReferenceCompatible(item,context)))throw new Error("Distinction incompatible avec l’épreuve.");return row}

export async function createIndividualPerformance(competitionId:string,input:Record<string,unknown>){const row=await preparePerformance(competitionId,input),existing=await getIndividualPerformances();if(existing.some((item)=>item.id_resultat===row.id_resultat&&item.id_participation_athlete===row.id_participation_athlete&&item.id_type_resultat===row.id_type_resultat))throw new Error("Cette performance existe déjà.");const created={id_performance:nextId(existing.map((item)=>item.id_performance),"PERF"),...row};await appendSheetRow({sheetName:"PERFORMANCES_INDIVIDUELLES",spreadsheetId:getCompetitionsSpreadsheetId(),row:created});return created}

export async function updateIndividualPerformance(competitionId:string,id:string,input:Record<string,unknown>){const current=(await getIndividualPerformances(competitionId)).find((item)=>item.id_performance===id);if(!current)throw new Error("Performance introuvable.");const row=await preparePerformance(competitionId,input,{id_resultat:current.id_resultat,id_participation_athlete:current.id_participation_athlete,id_type_resultat:current.id_type_resultat});await updateSheetCells({sheetName:"PERFORMANCES_INDIVIDUELLES",spreadsheetId:getCompetitionsSpreadsheetId(),idColumn:"id_performance",idValue:id,updates:["valeur","id_unite_mesure","rang","est_record","est_meilleure_performance","id_distinction","observation"].map((column)=>({column,value:row[column as keyof typeof row]}))});return{...current,...row}}

export async function createTeamParticipation(competitionId: string, input: Record<string, unknown>) {
  void competitionId
  void input
  throw new Error("Le rattachement direct d’une équipe est supprimé. Utilisez un engagement campagne-programme.")
  /* compatibilité supprimée après migration T03
  if (!(await getCompetition(competitionId))) throw new Error("Compétition introuvable.")
  const row = validateTeamParticipationInput(input)
  const references = await getCompetitionReferences()
  if (!references.teamsAvailable) throw new Error("Le catalogue des équipes nationales n’est pas encore configuré.")
  if (!references.teams.some((team) => team.id === row.id_equipe_nationale)) throw new Error("Équipe nationale inconnue ou identifiant ambigu.")
  const existing = await getTeamParticipations()
  if (existing.some((item) => item.id_competition === competitionId && item.id_equipe_nationale === row.id_equipe_nationale)) throw new Error("Cette équipe nationale est déjà rattachée à la compétition.")
  const created = { id_participation_equipe: nextId(existing.map((item) => item.id_participation_equipe), "PEN"), id_competition: competitionId, ...row }
  await appendSheetRow({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), row: { ...created, observation: created.observations } })
  return created */
}

export async function updateTeamParticipation(competitionId: string, id: string, input: Record<string, unknown>) {
  void competitionId
  void id
  void input
  throw new Error("Le rattachement direct d’une équipe est supprimé. Modifiez l’engagement campagne-programme.")
  /* compatibilité supprimée après migration T03
  const current = (await getTeamParticipations(competitionId)).find((item) => item.id_participation_equipe === id)
  if (!current) throw new Error("Participation d’équipe introuvable.")
  const row = validateTeamParticipationInput({ ...input, id_equipe_nationale: current.id_equipe_nationale })
  const updates = ["statut_participation", "date_engagement"].map((column) => ({ column, value: row[column as keyof typeof row] })).concat([{ column: "observation", value: row.observations }])
  await updateSheetCells({ sheetName: TEAMS_SHEET, spreadsheetId: getCompetitionsSpreadsheetId(), idColumn: "id_participation_equipe", idValue: id, updates })
  return { ...current, ...row, id_equipe_nationale: current.id_equipe_nationale } */
}
