import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { canAccess } from "@/lib/auth"
import { getReferentialSpreadsheetId, getTerritorialSpreadsheetId } from "@/lib/federations/config"
import { REFERENTIAL_SHEETS, selectSheetColumns, SHEET_COLUMNS, TERRITORIAL_RESOURCES, type TerritorialResource } from "@/lib/federations/schema"
import { appendSheetRow, deleteSheetRow, getSheetRows, getSheetsRows, updateSheetCells } from "@/lib/google/sheets"

export const runtime = "nodejs"
type Context = { params: Promise<{ resource: string }> }

const clean = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]))
const norm = (value: string) => value.trim().toLocaleLowerCase("fr")
const validEmail = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

function resourceConfig(value: string) { return TERRITORIAL_RESOURCES[value as TerritorialResource] }

function nextId(resource: TerritorialResource, federationId: string, rows: Record<string, string>[]) {
  const config = TERRITORIAL_RESOURCES[resource]
  if (resource === "hierarchie") {
    const max = rows.reduce((value, row) => Math.max(value, Number(row.id_hierarchie.match(/(\d+)$/)?.[1] ?? 0)), 0)
    return `HIE-${federationId}-${String(max + 1).padStart(3, "0")}`
  }
  const namespace = resource === "ligues" ? "" : resource === "ententes" ? "E" : resource === "cercles" ? "R" : resource === "clubs" ? "C" : "Q"
  const expression = new RegExp(`^${federationId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${namespace}(\\d{3})$`)
  const max = rows.reduce((value, row) => {
    const match = String(row[config.idColumn] ?? "").match(expression)
    return Math.max(value, match ? Number(match[1]) : 0)
  }, 0)
  if (max >= 999) throw new Error(`La séquence ${resource} est épuisée pour cette fédération`)
  return `${federationId}${namespace}${String(max + 1).padStart(3, "0")}`
}

async function validateAndEnrich(resource: TerritorialResource, input: Record<string, string>, currentId?: string) {
  const federationId = input.id_federation
  if (!federationId) throw new Error("La fédération est obligatoire")
  const [refs, territorial] = await Promise.all([
    getSheetsRows({ sheetNames: Object.values(REFERENTIAL_SHEETS), spreadsheetId: getReferentialSpreadsheetId() }),
    getSheetsRows({ sheetNames: Object.values(TERRITORIAL_RESOURCES).map((item) => item.sheet), spreadsheetId: getTerritorialSpreadsheetId() }),
  ])
  const federation = refs.FEDERATIONS.find((row) => String(row.id_federation ?? "").trim() === federationId)
  if (!federation) throw new Error("Fédération inconnue du référentiel")
  const entity = refs.ENTITES.find((item) => item.id_entite === federation.id_entite)
  if (!entity) throw new Error("L’entité de cette fédération est introuvable")
  const row: Record<string, string> = { ...input, id_federation: federationId, nom_federation: entity.nom_entite ?? "", sigle_federation: entity.sigle_entite ?? "" }

  if (resource === "hierarchie") {
    if (!row.id_type_structure) throw new Error("Le type de structure est obligatoire")
    const level = Number(row.niveau)
    if (!Number.isInteger(level) || level < 1) throw new Error("Le niveau doit être un entier supérieur ou égal à 1")
    const types = new Set(refs.TYPES_STRUCTURE.map((item) => item.id_type_structure))
    if (!types.has(row.id_type_structure)) throw new Error("Type de structure inconnu")
    const levels = territorial.HIERARCHIE.filter((item) => item.id_federation === federationId && item.id_hierarchie !== currentId)
    if (levels.some((item) => item.id_type_structure === row.id_type_structure)) throw new Error("Ce type de structure est déjà configuré")
    if (levels.some((item) => Number(item.niveau) === level)) throw new Error("Ce niveau est déjà utilisé dans cette fédération")
    const type = refs.TYPES_STRUCTURE.find((item) => item.id_type_structure === row.id_type_structure)
    row.nom_structure = type?.nom_structure ?? ""
  }
  if (resource === "ligues") {
    if (!row.nom_ligue) throw new Error("Le nom de la ligue est obligatoire")
    if (!validEmail(row.email_ligue)) throw new Error("L’adresse e-mail de la ligue n’est pas valide")
    const province = refs.PROVINCES.find((item) => item.id_province === row.id_province)
    if (!province) throw new Error("Province inconnue du référentiel")
    row.nom_province = province.nom_province ?? ""
  }
  if (resource === "ententes") {
    if (!row.nom_entente) throw new Error("Le nom de l’entente est obligatoire")
    if (!validEmail(row.email_entente)) throw new Error("L’adresse e-mail de l’entente n’est pas valide")
    const league = territorial.LIGUES.find((item) => item.id_ligue_coc === row.id_ligue_coc && item.id_federation === federationId)
    if (!league) throw new Error("La ligue parente n’existe pas dans cette fédération")
    const city = row.id_ville ? refs.VILLES.find((item) => item.id_ville === row.id_ville) : undefined
    if (row.id_ville && !city) throw new Error("Ville inconnue du référentiel")
    Object.assign(row, { id_ligue_federation: league.id_ligue_federal ?? "", nom_ligue: league.nom_ligue ?? "", nom_ville: city?.nom_ville ?? "" })
  }
  if (resource === "cercles") {
    if (!row.nom_cercle) throw new Error("Le nom du cercle est obligatoire")
    if (!validEmail(row.email_cercle)) throw new Error("L’adresse e-mail du cercle n’est pas valide")
    const hierarchy = territorial.HIERARCHIE.filter((item) => item.id_federation === federationId).sort((a, b) => Number(a.niveau_hierarchique) - Number(b.niveau_hierarchique))
    const hierarchyName = (item: Record<string, string>) => item.nom_structure || refs.TYPES_STRUCTURE.find((type) => type.id_type_structure === item.id_type_structure)?.nom_type_structure || ""
    const index = hierarchy.findIndex((item) => norm(hierarchyName(item)).includes("cercle"))
    const parent = index > 0 ? hierarchy[index - 1] : undefined
    const parentName = parent ? norm(hierarchyName(parent)) : ""
    const parentRows = parentName.includes("entente") ? territorial.ENTENTES : parentName.includes("ligue") ? territorial.LIGUES : []
    const parentId = row.id_structure_parent_coc
    const parentIdColumn = parentName.includes("entente") ? "id_entente_coc" : "id_ligue_coc"
    if (parent && !parentRows.some((item) => item.id_federation === federationId && item[parentIdColumn] === parentId)) throw new Error("Le parent sélectionné n’appartient pas à cette fédération")
    row.id_type_structure_parent = parent?.id_type_structure ?? ""
    if (row.id_ville && !refs.VILLES.some((item) => item.id_ville === row.id_ville)) throw new Error("Ville inconnue du référentiel")
  }
  if (resource === "clubs") {
    if (!row.nom_club) throw new Error("Le nom du club est obligatoire")
    const hierarchy = territorial.HIERARCHIE.filter((item) => item.id_federation === federationId).sort((a, b) => Number(a.niveau) - Number(b.niveau))
    const hierarchyName = (item: Record<string, string>) => item.nom_structure || refs.TYPES_STRUCTURE.find((type) => type.id_type_structure === item.id_type_structure)?.nom_type_structure || ""
    const clubIndex = hierarchy.findIndex((item) => norm(hierarchyName(item)).includes("club"))
    const parentName = clubIndex > 0 ? norm(hierarchyName(hierarchy[clubIndex - 1])) : ""
    const expectsEntente = parentName.includes("entente")
    const expectsCercle = parentName.includes("cercle")
    const parentRequired = clubIndex > 0
    if (expectsCercle) {
      const cercle = territorial.CERCLES.find((item) => item.id_cercle_coc === row.id_cercle_coc && item.id_federation === federationId)
      if (!cercle && parentRequired) throw new Error("Un cercle de cette fédération est obligatoire")
      if (cercle) row.id_type_structure_parent = hierarchy[clubIndex - 1].id_type_structure ?? ""
      Object.assign(row, { id_entente_coc: "", id_ligue_coc: "" })
    } else if (expectsEntente) {
      const entente = territorial.ENTENTES.find((item) => item.id_entente_coc === row.id_entente_coc && item.id_federation === federationId)
      if (!entente && parentRequired) throw new Error("Une entente de cette fédération est obligatoire")
      if (entente) Object.assign(row, { id_entente_federation: entente.id_entente_federation ?? "", nom_entente: entente.nom_entente ?? "", pseudo_entente: entente.pseudo_entente ?? "", id_ligue_coc: entente.id_ligue_coc ?? "", id_ligue_federation: entente.id_ligue_federation ?? "", nom_ligue: entente.nom_ligue ?? "" })
    } else {
      const league = territorial.LIGUES.find((item) => item.id_ligue_coc === row.id_ligue_coc && item.id_federation === federationId)
      if (!league && parentRequired) throw new Error("Une ligue de cette fédération est obligatoire")
      if (league) Object.assign(row, { id_ligue_federation: league.id_ligue_federal ?? "", nom_ligue: league.nom_ligue ?? "", id_province: league.id_province ?? "", nom_province: league.nom_province ?? "" })
      Object.assign(row, { id_entente_coc: "", id_entente_federation: "", nom_entente: "", pseudo_entente: "" })
    }
    if (row.id_ville) {
      const city = refs.VILLES.find((item) => item.id_ville === row.id_ville)
      if (!city) throw new Error("Ville inconnue du référentiel")
      row.nom_ville = city.nom_ville ?? ""
      row.id_province ||= city.id_province ?? ""
    }
    if (row.id_categorie) {
      const category = refs.CATEGORIES_CLUB.find((item) => item.id_categorie === row.id_categorie)
      if (!category) throw new Error("Catégorie de club inconnue du référentiel")
      row.nom_categorie = category.nom_categorie ?? ""
    }
  }
  if (resource === "equipes") {
    if (!row.nom_equipe) throw new Error("Le nom de l’équipe est obligatoire")
    const club = territorial.CLUBS.find((item) => item.id_club_coc === row.id_club_coc && item.id_federation === federationId)
    if (!club) throw new Error("Le club parent n’existe pas dans cette fédération")
    row.id_sport ||= federation.id_sport ?? ""
  }
  const config = TERRITORIAL_RESOURCES[resource]
  const existingRows = territorial[config.sheet]
  const nameColumn = resource === "hierarchie" ? "" : `nom_${resource === "equipes" ? "equipe" : resource.slice(0, -1)}`
  if (nameColumn && existingRows.some((item) => item[config.idColumn] !== currentId && norm(item[nameColumn] ?? "") === norm(row[nameColumn] ?? "") && item.id_federation === federationId)) throw new Error("Un élément portant ce nom existe déjà dans cette fédération")
  return { row, territorial }
}

export async function POST(request: Request, context: Context) {
  if (!(await canAccess("AUT-SPT", "WRITE"))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  const resource = (await context.params).resource as TerritorialResource
  const config = resourceConfig(resource)
  if (!config) return NextResponse.json({ error: "Ressource inconnue" }, { status: 404 })
  try {
    const { row: input = {} } = await request.json() as { row?: Record<string, unknown> }
    const validated = await validateAndEnrich(resource, clean(input))
    const rows = validated.territorial[config.sheet]
    validated.row[config.idColumn] = nextId(resource, validated.row.id_federation, rows)
    if (rows.some((item) => item[config.idColumn] === validated.row[config.idColumn])) throw new Error("Collision d’identifiant COC")
    const row = selectSheetColumns(config.sheet as keyof typeof SHEET_COLUMNS, validated.row)
    await appendSheetRow({ sheetName: config.sheet, row, spreadsheetId: getTerritorialSpreadsheetId() })
    revalidatePath(`/dashboard/federations/${validated.row.id_federation}`)
    return NextResponse.json({ ok: true, row })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) }
}

export async function PUT(request: Request, context: Context) {
  if (!(await canAccess("AUT-SPT", "WRITE"))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  const resourceName = (await context.params).resource
  if (resourceName === "identification") {
    try {
      const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
      const id = String(body.id ?? "").trim()
      if (!id) throw new Error("Identifiant obligatoire")
      const allowed = new Set(["statut_reconnaissance_ministere", "date_reconnaissance_nationale", "statut_affiliation_coc", "date_affiliation_coc", "id_entite_continentale", "date_affiliation_continentale", "id_entite_internationale", "date_affiliation_internationale", "statut", "observations"])
      const input = clean(body.row ?? {})
      const [federations, entities] = await Promise.all([getSheetRows({ sheetName: "FEDERATIONS", spreadsheetId: getReferentialSpreadsheetId(), bypassCache: true }), getSheetRows({ sheetName: "ENTITES", spreadsheetId: getReferentialSpreadsheetId() })])
      if (!federations.some((row) => row.id_federation === id)) throw new Error("Fédération introuvable")
      const entityIds = new Set(entities.map((row) => row.id_entite))
      if (input.id_entite_continentale && !entityIds.has(input.id_entite_continentale)) throw new Error("Entité continentale inconnue")
      if (input.id_entite_internationale && !entityIds.has(input.id_entite_internationale)) throw new Error("Entité internationale inconnue")
      const updates = Object.entries(input).filter(([column]) => allowed.has(column)).map(([column, value]) => ({ column, value }))
      if (!updates.length) throw new Error("Aucune information modifiable")
      await updateSheetCells({ sheetName: "FEDERATIONS", idColumn: "id_federation", idValue: id, updates, spreadsheetId: getReferentialSpreadsheetId() })
      revalidatePath(`/dashboard/federations/${id}`)
      return NextResponse.json({ ok: true })
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) }
  }
  const resource = resourceName as TerritorialResource
  const config = resourceConfig(resource)
  if (!config) return NextResponse.json({ error: "Ressource inconnue" }, { status: 404 })
  try {
    const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
    const id = String(body.id ?? "").trim()
    if (!id) throw new Error("Identifiant obligatoire")
    const existing = await getSheetRows({ sheetName: config.sheet, spreadsheetId: getTerritorialSpreadsheetId(), bypassCache: true })
    const current = existing.find((item) => item[config.idColumn] === id)
    if (!current) throw new Error("Enregistrement introuvable")
    const validated = await validateAndEnrich(resource, { ...current, ...clean(body.row ?? {}), [config.idColumn]: id }, id)
    const allowed = new Set(SHEET_COLUMNS[config.sheet as keyof typeof SHEET_COLUMNS])
    const updates = Object.entries(validated.row).filter(([column]) => column !== config.idColumn && allowed.has(column as never)).map(([column, value]) => ({ column, value }))
    await updateSheetCells({ sheetName: config.sheet, idColumn: config.idColumn, idValue: id, updates, spreadsheetId: getTerritorialSpreadsheetId() })
    revalidatePath(`/dashboard/federations/${validated.row.id_federation}`)
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) }
}

export async function DELETE(request: Request, context: Context) {
  if (!(await canAccess("AUT-SPT", "WRITE"))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  if ((await context.params).resource !== "hierarchie") return NextResponse.json({ error: "La suppression définitive des structures n’est pas autorisée" }, { status: 405 })
  try {
    const body = await request.json() as { id?: unknown; federationId?: unknown }
    const id = String(body.id ?? "").trim()
    const federationId = String(body.federationId ?? "").trim()
    if (!id || !federationId) throw new Error("Identifiants obligatoires")
    const rows = await getSheetRows({ sheetName: "HIERARCHIE", spreadsheetId: getTerritorialSpreadsheetId(), bypassCache: true })
    const current = rows.find((row) => row.id_hierarchie === id && row.id_federation === federationId)
    if (!current) throw new Error("Niveau hiérarchique introuvable")
    await deleteSheetRow({ sheetName: "HIERARCHIE", spreadsheetId: getTerritorialSpreadsheetId(), idColumn: "id_hierarchie", idValue: id })
    revalidatePath(`/dashboard/federations/${federationId}`)
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) }
}
