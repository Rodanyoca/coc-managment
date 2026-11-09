import "server-only"
import { randomUUID } from "node:crypto"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { appendSheetRow, getSheetsTables, updateSheetCells } from "@/lib/google/sheets"
import { assertSeasonCompatible, SEASON_HEADERS, validateSeason, type Season } from "./seasons"

export async function getSystemSeasons(): Promise<Season[]> {
  // Fresh table: no stale fallback for the setting shown or validated before a write.
  const table = (await getSheetsTables({ spreadsheetId: getReferentialSpreadsheetId(), sheetNames: ["SAISONS"] })).SAISONS
  if (SEASON_HEADERS.some(header => !table.headers.includes(header))) throw new Error("Le référentiel SAISONS ne possède pas les colonnes attendues.")
  return table.rows.filter(row => row.id_saison).map(row => Object.fromEntries(SEASON_HEADERS.map(key => [key, String(row[key] ?? "").trim()])) as Season)
}

export async function saveSystemSeason(input: Record<string, unknown>, id?: string) {
  const row = validateSeason(input)
  const seasons = await getSystemSeasons()
  if (id && !seasons.some(season => season.id_saison === id)) throw new Error("Saison introuvable.")
  assertSeasonCompatible(row, seasons, id)
  const saved: Season = { ...row, id_saison: id ?? `SAI-${randomUUID()}` }
  const params = { spreadsheetId: getReferentialSpreadsheetId(), sheetName: "SAISONS" }
  if (id) await updateSheetCells({ ...params, idColumn: "id_saison", idValue: id, updates: Object.entries(row).map(([column, value]) => ({ column, value })) })
  else await appendSheetRow({ ...params, row: saved })
  return saved
}
