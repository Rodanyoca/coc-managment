import "server-only"
import { getActeursAffiliationsSpreadsheetId, getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { appendSheetRow, getSheetRows, getSheetsRows, updateSheetCells } from "@/lib/google/sheets"
import { getReferentialSpreadsheetId, getTerritorialSpreadsheetId } from "./config"
import { CONTACT_ACTOR_TYPES, ENTITY_CONTACT_SHEET, normalizeContactInput, validateContactRules, type ContactActorTypeId, type EntityContact } from "./entity-contacts-model"

const actorSheets = Object.values(CONTACT_ACTOR_TYPES).map((item) => item.sheet)

async function sources() {
  const [contacts, refs, actors, affiliations] = await Promise.all([
    getSheetRows({ sheetName: ENTITY_CONTACT_SHEET, spreadsheetId: getTerritorialSpreadsheetId(), bypassCache: true }),
    getSheetsRows({ sheetNames: ["ENTITES", "FEDERATIONS", "TYPES_ACTEURS"], spreadsheetId: getReferentialSpreadsheetId() }),
    getSheetsRows({ sheetNames: actorSheets, spreadsheetId: getActeursSpreadsheetId() }),
    getSheetRows({ sheetName: "OFFICIELS_AFFILIATIONS", spreadsheetId: getActeursAffiliationsSpreadsheetId(), bypassCache: true }),
  ])
  return { contacts, refs, actors, affiliations }
}

function attached(row: Record<string, string>, type: ContactActorTypeId, entityId: string, refs: Record<string, Record<string, string>[]>, affiliations: Record<string, string>[]) {
  if (type === "TYPACT002" || type === "TYPACT004") return refs.FEDERATIONS.some((fed) => fed.id_federation === row.id_federation && fed.id_entite === entityId)
  if (type === "TYPACT003" || type === "TYPACT006") return row.id_entite === entityId
  return row.id_entite === entityId || affiliations.some((item) => (item.id_officiel || item.id_officiel_coc) === row.id_officiel_coc && item.id_entite === entityId)
}

function actorFor(id: string, type: ContactActorTypeId, actors: Record<string, Record<string, string>[]>) {
  const config = CONTACT_ACTOR_TYPES[type]
  return actors[config.sheet].find((row) => row[config.idColumn] === id)
}

export async function getEntityContactData(entityId: string) {
  const data = await sources()
  if (!data.refs.ENTITES.some((row) => row.id_entite === entityId)) throw new Error("Entité introuvable.")
  const options = Object.entries(CONTACT_ACTOR_TYPES).flatMap(([typeId, config]) => data.actors[config.sheet]
    .filter((row) => attached(row, typeId as ContactActorTypeId, entityId, data.refs, data.affiliations))
    .map((row) => ({ id: row[config.idColumn], typeId, nom: row.nom_complet || "Non renseigné" })).filter((row) => row.id))
  const contacts: EntityContact[] = data.contacts.filter((row) => row.id_entite === entityId).map((row) => {
    const type = row.id_type_acteur as ContactActorTypeId
    const actor = type in CONTACT_ACTOR_TYPES ? actorFor(row.id_acteur_coc, type, data.actors) : undefined
    return { ...row, est_contact_principal: row.est_contact_principal === "TRUE", statut: row.statut === "INACTIF" ? "INACTIF" : "ACTIF", nom_complet: actor?.nom_complet || "", telephone: actor?.telephone || "", email: actor?.email || "", type_acteur: CONTACT_ACTOR_TYPES[type]?.label || row.id_type_acteur } as EntityContact
  })
  return { contacts, options, types: Object.entries(CONTACT_ACTOR_TYPES).map(([id, item]) => ({ id, label: item.label })) }
}

async function validate(input: Record<string, unknown>, currentId = "") {
  const row = normalizeContactInput(input), data = await sources()
  validateContactRules(row, data.contacts, currentId)
  if (!data.refs.ENTITES.some((item) => item.id_entite === row.id_entite)) throw new Error("Entité introuvable.")
  const type = row.id_type_acteur as ContactActorTypeId
  const actor = actorFor(row.id_acteur_coc, type, data.actors)
  if (!actor) throw new Error("L’acteur n’existe pas ou son identifiant est incompatible avec le type sélectionné.")
  if (!attached(actor, type, row.id_entite, data.refs, data.affiliations)) throw new Error("Cet acteur n’est pas rattaché à l’entité.")
  return { row, data }
}

function nextId(rows: Record<string, string>[]) {
  const max = rows.reduce((n, row) => Math.max(n, Number(row.id_contact_entite?.match(/(\d+)$/)?.[1] || 0)), 0)
  return `PCE${String(max + 1).padStart(6, "0")}`
}

export async function createEntityContact(input: Record<string, unknown>) {
  const { row, data } = await validate(input)
  const created = { id_contact_entite: nextId(data.contacts), ...row, est_contact_principal: row.est_contact_principal ? "TRUE" : "FALSE" }
  await appendSheetRow({ sheetName: ENTITY_CONTACT_SHEET, spreadsheetId: getTerritorialSpreadsheetId(), row: created })
  return getEntityContactData(row.id_entite)
}

export async function updateEntityContact(id: string, input: Record<string, unknown>) {
  const currentRows = await getSheetRows({ sheetName: ENTITY_CONTACT_SHEET, spreadsheetId: getTerritorialSpreadsheetId(), bypassCache: true })
  const current = currentRows.find((row) => row.id_contact_entite === id)
  if (!current) throw new Error("Relation de contact introuvable.")
  const { row } = await validate({ ...current, ...input, id_entite: current.id_entite }, id)
  await updateSheetCells({ sheetName: ENTITY_CONTACT_SHEET, spreadsheetId: getTerritorialSpreadsheetId(), idColumn: "id_contact_entite", idValue: id, updates: Object.entries({ ...row, est_contact_principal: row.est_contact_principal ? "TRUE" : "FALSE" }).map(([column, value]) => ({ column, value: String(value) })) })
  return getEntityContactData(row.id_entite)
}
