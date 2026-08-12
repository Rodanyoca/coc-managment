import "server-only"
import { getActeursAffiliationsSpreadsheetId, getActeursSpreadsheetId } from "./config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { appendSheetRow, getSheetHeaders, getSheetRows, updateSheetCells } from "@/lib/google/sheets"

export const OFFICIAL_AFFILIATIONS_SHEET = "OFFICIELS_AFFILIATIONS"
export const OFFICIAL_AFFILIATION_HEADERS = ["id_affiliation", "id_officiel_coc", "id_entite", "id_fonction", "date_debut", "date_fin", "statut", "observations"] as const
export type OfficialAffiliation = { id_affiliation: string; id_officiel_coc: string; id_entite: string; id_fonction: string; date_debut: string; date_fin: string; statut: string; observations: string }

const clean = (row: Record<string, unknown>) => Object.fromEntries(OFFICIAL_AFFILIATION_HEADERS.map((key) => [key, String(row[key] ?? "").trim()])) as OfficialAffiliation

async function readRows() {
  const spreadsheetId = getActeursAffiliationsSpreadsheetId()
  const headers = await getSheetHeaders({ sheetName: OFFICIAL_AFFILIATIONS_SHEET, spreadsheetId })
  const missing = OFFICIAL_AFFILIATION_HEADERS.filter((header) => !headers.includes(header))
  if (missing.length) throw new Error(`En-têtes manquants dans ${OFFICIAL_AFFILIATIONS_SHEET} : ${missing.join(", ")}`)
  return getSheetRows({ sheetName: OFFICIAL_AFFILIATIONS_SHEET, spreadsheetId, bypassCache: true })
}

export async function getOfficialAffiliations(officialId: string): Promise<OfficialAffiliation[]> {
  const rows = await readRows()
  return rows.filter((row) => row.id_officiel_coc === officialId).map(clean).sort((a, b) => b.date_debut.localeCompare(a.date_debut))
}

export async function getAllOfficialAffiliations(): Promise<OfficialAffiliation[]> {
  const rows = await readRows()
  return rows.map(clean).sort((a, b) => b.date_debut.localeCompare(a.date_debut))
}

async function validateOfficial(officialId: string) {
  const officials = await getSheetRows({ sheetName: "OFFICIELS", spreadsheetId: getActeursSpreadsheetId(), bypassCache: true })
  if (!officials.some((row) => row.id_officiel_coc === officialId)) throw new Error("Officiel introuvable.")
}

async function validateFunction(functionId: string) {
  const functions = await getSheetRows({
    sheetName: "FONCTIONS_OFFICIEL",
    spreadsheetId: getReferentialSpreadsheetId(),
    bypassCache: true,
  })
  if (!functions.some((row) => row.id_fonction === functionId)) {
    throw new Error("La fonction sélectionnée n’existe plus dans le référentiel.")
  }
}

function nextId(rows: Record<string, string>[]) {
  const highest = rows.reduce((max, row) => { const match = String(row.id_affiliation || "").match(/^AOF(\d+)$/i); return match ? Math.max(max, Number(match[1]) || 0) : max }, 0)
  return `AOF${String(highest + 1).padStart(4, "0")}`
}

export async function createOfficialAffiliation(input: Record<string, unknown>) {
  const row = clean(input)
  if (!row.id_officiel_coc || !row.id_entite || !row.id_fonction || !row.date_debut) throw new Error("Officiel, entité, fonction et date de début sont obligatoires.")
  await validateOfficial(row.id_officiel_coc)
  await validateFunction(row.id_fonction)
  const rows = await readRows()
  if (rows.some((item) => item.id_officiel_coc === row.id_officiel_coc && item.id_entite === row.id_entite && item.id_fonction.toLocaleLowerCase("fr") === row.id_fonction.toLocaleLowerCase("fr") && item.date_debut === row.date_debut)) throw new Error("Cette affiliation existe déjà.")
  const created = { ...row, id_affiliation: nextId(rows), statut: row.statut || "ACTIF" }
  await appendSheetRow({ sheetName: OFFICIAL_AFFILIATIONS_SHEET, spreadsheetId: getActeursAffiliationsSpreadsheetId(), row: created })
  return created
}

export async function updateOfficialAffiliation(id: string, input: Record<string, unknown>) {
  const row = clean({ ...input, id_affiliation: id })
  if (!row.id_entite || !row.id_fonction || !row.date_debut) throw new Error("Entité, fonction et date de début sont obligatoires.")
  const rows = await readRows()
  const existing = rows.find((item) => item.id_affiliation === id)
  if (!existing) throw new Error("Affiliation introuvable.")
  if (row.id_fonction !== existing.id_fonction) await validateFunction(row.id_fonction)
  if (rows.some((item) => item.id_affiliation !== id && item.id_officiel_coc === existing.id_officiel_coc && item.id_entite === row.id_entite && item.id_fonction.toLocaleLowerCase("fr") === row.id_fonction.toLocaleLowerCase("fr") && item.date_debut === row.date_debut)) throw new Error("Cette affiliation existe déjà.")
  const updated = { ...row, id_officiel_coc: existing.id_officiel_coc, statut: row.statut || "ACTIF" }
  await updateSheetCells({ sheetName: OFFICIAL_AFFILIATIONS_SHEET, spreadsheetId: getActeursAffiliationsSpreadsheetId(), idColumn: "id_affiliation", idValue: id, updates: OFFICIAL_AFFILIATION_HEADERS.filter((key) => key !== "id_affiliation" && key !== "id_officiel_coc").map((column) => ({ column, value: updated[column] })) })
  return updated
}
