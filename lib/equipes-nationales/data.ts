import "server-only"

import { appendSheetRow, getSheetHeaders, getSheetRows, getSheetsRows, updateSheetCells } from "@/lib/google/sheets"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getFederationOptions } from "@/lib/federations/options"
import { getActors } from "@/lib/activites/data"
import { getNationalTeamsSpreadsheetId } from "./config"
import { NATIONAL_TEAM_HEADERS, NATIONAL_TEAM_ROLES, type ActorType, type NationalTeam, type NationalTeamMember, type NationalTeamReferences } from "./types"
import { validateMemberInput, validateTeamInput } from "./validation"

const TEAM_SHEET = "EQUIPES_NATIONALES"
const CAMPAIGN_SHEET = "CAMPAGNES_EQUIPES_NATIONALES"
const ATHLETE_SELECTION_SHEET = "SELECTIONS_ATHLETES"
const STAFF_ASSIGNMENT_SHEET = "AFFECTATIONS_STAFF"
// CompatibilitÃ© temporaire des mutations; les lectures utilisent le modÃ¨le campagne/sÃ©lections.
const MEMBER_SHEET = "EQUIPES_NATIONALES_MEMBRES"
const TEAM_SHEET_HEADERS = ["id_equipe_nationale", "id_federation", "id_sport", "id_discipline", "nom_equipe_nationale", "id_categorie_age", "id_sexe", "date_debut", "date_fin", "statut", "observation"] as const
const clean = (value: unknown) => String(value ?? "").trim()
const normalized = (value: string) => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
const nextId = (values: string[], prefix: string, padding = 3) => `${prefix}${String(values.reduce((max, value) => { const match = value.match(new RegExp(`^${prefix}(\\d+)$`, "i")); return match ? Math.max(max, Number(match[1])) : max }, 0) + 1).padStart(padding, "0")}`

async function assertHeaders(sheetName: string, expected: readonly string[]) {
  const headers = await getSheetHeaders({ sheetName, spreadsheetId: getNationalTeamsSpreadsheetId() })
  const missing = expected.filter((header) => !headers.includes(header))
  if (missing.length) throw new Error(`Mapping ${sheetName} incomplet : ${missing.join(", ")}`)
}

const mapTeam = (row: Record<string, string>) => ({ ...Object.fromEntries(NATIONAL_TEAM_HEADERS.map((key) => [key, clean(row[key])])), observations: clean(row.observation) }) as NationalTeam

export async function getNationalTeams(options: { fresh?: boolean } = {}) {
  await assertHeaders(TEAM_SHEET, TEAM_SHEET_HEADERS)
  return (await getSheetRows({ sheetName: TEAM_SHEET, spreadsheetId: getNationalTeamsSpreadsheetId(), bypassCache: options.fresh })).map(mapTeam).filter((team) => team.id_equipe_nationale)
}

export async function getNationalTeam(id: string, options: { fresh?: boolean } = {}) {
  return (await getNationalTeams(options)).find((team) => team.id_equipe_nationale === clean(id))
}

export async function getNationalTeamMembers(teamId?: string, actorId?: string, actorType?: string, options: { fresh?: boolean } = {}) {
  const spreadsheetId = getNationalTeamsSpreadsheetId()
  const sheetNames = [CAMPAIGN_SHEET, ATHLETE_SELECTION_SHEET, STAFF_ASSIGNMENT_SHEET]
  const rows: Record<string, Record<string, string>[]> = options.fresh
    ? Object.fromEntries(await Promise.all(sheetNames.map(async (sheetName) => [sheetName, await getSheetRows({ sheetName, spreadsheetId, bypassCache: true })])))
    : await getSheetsRows({ sheetNames, spreadsheetId })
  const campaigns = new Map(rows[CAMPAIGN_SHEET].map((row) => [row.id_campagne, row]))
  const athletes = rows[ATHLETE_SELECTION_SHEET].map((row) => { const campaign=campaigns.get(row.id_campagne); return { id_membre_equipe_nationale:`ATH:${row.id_selection}`, id_equipe_nationale:clean(campaign?.id_equipe_nationale), id_acteur_coc:clean(row.id_athlete), id_type_acteur:"ATHLETE", role_equipe:"ATHLETE", date_debut:clean(row.date_selection || campaign?.date_debut), date_fin:clean(campaign?.date_fin), statut:clean(row.statut_selection || campaign?.statut), observations:clean(row.observation) } as NationalTeamMember })
  const staff = rows[STAFF_ASSIGNMENT_SHEET].map((row) => { const campaign=campaigns.get(row.id_campagne); return { id_membre_equipe_nationale:`STAFF:${row.id_affectation_staff}`, id_equipe_nationale:clean(campaign?.id_equipe_nationale), id_acteur_coc:clean(row.id_acteur_coc), id_type_acteur:clean(row.id_type_acteur), role_equipe:clean(row.id_role_staff), date_debut:clean(row.date_debut), date_fin:clean(row.date_fin), statut:row.date_fin && row.date_fin < new Date().toISOString().slice(0,10) ? "INACTIF" : "ACTIF", observations:clean(row.observation) } as NationalTeamMember })
  return [...athletes,...staff].filter((member) => member.id_equipe_nationale && (!teamId || member.id_equipe_nationale === teamId) && (!actorId || member.id_acteur_coc === actorId) && (!actorType || member.id_type_acteur === actorType))
}

export async function getNationalTeamReferences(): Promise<NationalTeamReferences> {
  const spreadsheetId = getReferentialSpreadsheetId()
  const [federations, refs] = await Promise.all([getFederationOptions(), getSheetsRows({ sheetNames: ["SPORTS", "DISCIPLINES", "CATEGORIES_AGE", "SEXES"], spreadsheetId })])
  let roles: { id: string; label: string }[] = NATIONAL_TEAM_ROLES.map((id) => ({ id, label: ({ ATHLETE: "Athlète", COACH_PRINCIPAL: "Coach principal", ASSISTANT_COACH: "Assistant coach", MEDECIN: "Médecin", PREPARATEUR: "Préparateur", SPARRING_PARTNER: "Sparring-partner", OFFICIEL: "Officiel", AUTRE: "Autre" } as Record<string, string>)[id] }))
  let rolesReferentialAvailable = false
  try { const found = (await getSheetRows({ sheetName: "ROLES_EQUIPE_NATIONALE", spreadsheetId })).filter((row) => row.id_role_equipe_nationale).map((row) => ({ id: row.id_role_equipe_nationale, label: row.nom_role_equipe_nationale || row.id_role_equipe_nationale })); if (found.length) { roles = found; rolesReferentialAvailable = true } } catch {}
  const ageCategories = refs.CATEGORIES_AGE.filter((row) => row.id_categorie_age).map((row) => ({ id: row.id_categorie_age, label: row.nom_categorie_age || row.id_categorie_age, parentId: row.id_discipline || row.id_sport }))
  return {
    federations: federations.map((item) => ({ id: item.id, label: item.sigle || item.nom, secondary: item.nom, parentId: item.idSport })),
    sports: refs.SPORTS.filter((row) => row.id_sport).map((row) => ({ id: row.id_sport, label: row.nom_sport })),
    disciplines: refs.DISCIPLINES.filter((row) => row.id_discipline).map((row) => ({ id: row.id_discipline, label: row.nom_discipline, parentId: row.id_sport })),
    ageCategories,
    sexes: refs.SEXES.filter((row) => row.id_sexe).map((row) => ({ id: row.id_sexe, label: row.nom_sexe || row.id_sexe })),
    roles,
    ageCategoriesAvailable: ageCategories.length > 0,
    rolesReferentialAvailable,
  }
}

function assertTeamReferences(row: ReturnType<typeof validateTeamInput>, refs: NationalTeamReferences) {
  const federation = refs.federations.find((item) => item.id === row.id_federation)
  if (!federation) throw new Error("Fédération inconnue.")
  if (!refs.sports.some((item) => item.id === row.id_sport)) throw new Error("Sport inconnu.")
  if (federation.parentId && federation.parentId !== row.id_sport) throw new Error("Le sport ne correspond pas à la fédération.")
  if (row.id_discipline && !refs.disciplines.some((item) => item.id === row.id_discipline && item.parentId === row.id_sport)) throw new Error("Discipline incohérente avec le sport.")
  if (row.id_categorie_age) { const expectedParent = row.id_discipline || row.id_sport; if (!refs.ageCategories.some((item) => item.id === row.id_categorie_age && item.parentId === expectedParent)) throw new Error("Catégorie d’âge incohérente avec le sport ou la discipline.") }
  if (row.id_sexe && !refs.sexes.some((item) => item.id === row.id_sexe)) throw new Error("Sexe inconnu.")
}

const sameTeamIdentity = (left: NationalTeam, right: ReturnType<typeof validateTeamInput>) => left.id_federation === right.id_federation && left.id_sport === right.id_sport && left.id_discipline === right.id_discipline && left.id_categorie_age === right.id_categorie_age && left.id_sexe === right.id_sexe && normalized(left.nom_equipe_nationale) === normalized(right.nom_equipe_nationale)

export async function createNationalTeam(input: Record<string, unknown>) {
  const row = validateTeamInput(input)
  const refs = await getNationalTeamReferences(); assertTeamReferences(row, refs)
  const existing = await getNationalTeams({ fresh: true })
  if (existing.some((team) => sameTeamIdentity(team, row))) throw new Error("Une équipe nationale identique existe déjà.")
  const id = nextId(existing.map((team) => team.id_equipe_nationale), "EQN")
  if ((await getNationalTeams({ fresh: true })).some((team) => team.id_equipe_nationale === id)) throw new Error("Collision d’identifiant détectée. Réessayez.")
  const created = { id_equipe_nationale: id, ...row } as NationalTeam
  await appendSheetRow({ sheetName: TEAM_SHEET, spreadsheetId: getNationalTeamsSpreadsheetId(), row: { ...created, observation: created.observations } })
  return created
}

export async function updateNationalTeam(id: string, input: Record<string, unknown>) {
  const current = await getNationalTeam(id, { fresh: true }); if (!current) throw new Error("Équipe nationale introuvable.")
  const row = validateTeamInput({ ...input, id_federation: current.id_federation, id_sport: current.id_sport })
  const refs = await getNationalTeamReferences(); assertTeamReferences(row, refs)
  const existing = await getNationalTeams({ fresh: true }); if (existing.some((team) => team.id_equipe_nationale !== id && sameTeamIdentity(team, row))) throw new Error("Une équipe nationale identique existe déjà.")
  await updateSheetCells({ sheetName: TEAM_SHEET, spreadsheetId: getNationalTeamsSpreadsheetId(), idColumn: "id_equipe_nationale", idValue: id, updates: Object.entries(row).filter(([column])=>column!=="observations").map(([column, value]) => ({ column, value })).concat([{column:"observation",value:row.observations}]) })
  return { ...current, ...row }
}

export async function getActorOptions(type: ActorType) { return getActors(type) }

export async function getMemberActorLabels(members: NationalTeamMember[]) {
  const types = [...new Set(members.map((member) => member.id_type_acteur))] as ActorType[]
  const groups = await Promise.all(types.map(async (type) => [type, await getActorOptions(type)] as const))
  return Object.fromEntries(groups.flatMap(([type, actors]) => actors.map((actor) => [`${type}:${actor.id}`, actor.label])))
}

async function currentCampaign(teamId:string){const rows=await getSheetRows({sheetName:CAMPAIGN_SHEET,spreadsheetId:getNationalTeamsSpreadsheetId(),bypassCache:true});const matches=rows.filter(row=>row.id_equipe_nationale===teamId).sort((a,b)=>b.date_debut.localeCompare(a.date_debut));return matches.find(row=>row.statut==="ACTIF")||matches[0]}
async function createCampaignMember(teamId:string,row:ReturnType<typeof validateMemberInput>):Promise<NationalTeamMember>{const campaign=await currentCampaign(teamId);if(!campaign)throw new Error("CrÃ©ez d'abord une campagne pour cette Ã©quipe nationale.");const spreadsheetId=getNationalTeamsSpreadsheetId(),athlete=row.id_type_acteur==="ATHLETE",sheetName=athlete?ATHLETE_SELECTION_SHEET:STAFF_ASSIGNMENT_SHEET,idColumn=athlete?"id_selection":"id_affectation_staff",prefix=athlete?"SEL":"AFF",raw=await getSheetRows({sheetName,spreadsheetId,bypassCache:true}),rawId=nextId(raw.map(item=>item[idColumn]),prefix),id=`${athlete?"ATH":"STAFF"}:${rawId}`;const physical:Record<string,string>=athlete?{id_selection:rawId,id_campagne:campaign.id_campagne,id_athlete:row.id_acteur_coc,date_selection:row.date_debut,statut_selection:row.statut,observation:row.observations}:{id_affectation_staff:rawId,id_campagne:campaign.id_campagne,id_acteur_coc:row.id_acteur_coc,id_type_acteur:row.id_type_acteur,id_role_staff:row.role_equipe,date_debut:row.date_debut,date_fin:row.date_fin,observation:row.observations};await appendSheetRow({sheetName,spreadsheetId,row:physical});return{id_membre_equipe_nationale:id,id_equipe_nationale:teamId,...row}}
async function updateCampaignMember(id:string,row:ReturnType<typeof validateMemberInput>){const athlete=id.startsWith("ATH:"),rawId=id.slice(id.indexOf(":")+1);await updateSheetCells({sheetName:athlete?ATHLETE_SELECTION_SHEET:STAFF_ASSIGNMENT_SHEET,spreadsheetId:getNationalTeamsSpreadsheetId(),idColumn:athlete?"id_selection":"id_affectation_staff",idValue:rawId,updates:athlete?[{column:"date_selection",value:row.date_debut},{column:"statut_selection",value:row.statut},{column:"observation",value:row.observations}]:[{column:"id_role_staff",value:row.role_equipe},{column:"date_debut",value:row.date_debut},{column:"date_fin",value:row.date_fin},{column:"observation",value:row.observations}]})}

export async function createNationalTeamMember(teamId: string, input: Record<string, unknown>) {
  if (!(await getNationalTeam(teamId, { fresh: true }))) throw new Error("Équipe nationale introuvable.")
  const row = validateMemberInput(input)
  const refs = await getNationalTeamReferences(); if (!refs.roles.some((role) => role.id === row.role_equipe)) throw new Error("Rôle d’équipe nationale invalide.")
  if (!(await getActorOptions(row.id_type_acteur as ActorType)).some((actor) => actor.id === row.id_acteur_coc)) throw new Error("Acteur introuvable ou type incohérent.")
  return createCampaignMember(teamId,row)
  const existing = await getNationalTeamMembers(undefined, undefined, undefined, { fresh: true })
  if (existing.some((member) => member.id_equipe_nationale === teamId && member.id_acteur_coc === row.id_acteur_coc && member.role_equipe === row.role_equipe && member.date_debut === row.date_debut)) throw new Error("Cette appartenance existe déjà pour la même période.")
  const id = nextId(existing.map((member) => member.id_membre_equipe_nationale), "MEN")
  if ((await getNationalTeamMembers(undefined, undefined, undefined, { fresh: true })).some((member) => member.id_membre_equipe_nationale === id)) throw new Error("Collision d’identifiant détectée. Réessayez.")
  const created = { id_membre_equipe_nationale: id, id_equipe_nationale: teamId, ...row } as NationalTeamMember
  await appendSheetRow({ sheetName: MEMBER_SHEET, spreadsheetId: getNationalTeamsSpreadsheetId(), row: created })
  return created
}

export async function updateNationalTeamMember(teamId: string, id: string, input: Record<string, unknown>) {
  const current = (await getNationalTeamMembers(teamId, undefined, undefined, { fresh: true })).find((member) => member.id_membre_equipe_nationale === id); if (!current) throw new Error("Membre introuvable.")
  const row = validateMemberInput({ ...input, id_acteur_coc: current.id_acteur_coc, id_type_acteur: current.id_type_acteur })
  const refs = await getNationalTeamReferences(); if (!refs.roles.some((role) => role.id === row.role_equipe)) throw new Error("Rôle d’équipe nationale invalide.")
  await updateCampaignMember(id,row)
  return { ...current, ...row, id_acteur_coc: current.id_acteur_coc, id_type_acteur: current.id_type_acteur }
}
