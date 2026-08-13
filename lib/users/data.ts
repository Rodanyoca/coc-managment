import "server-only"

import { getSheetHeaders, getSheetRows } from "@/lib/google/sheets"
import { getUsersSpreadsheetId } from "./config"

const USERS_SHEET = "USERS"
const USER_HEADERS = ["id_user", "nom_complet", "email", "password", "role", "statut"] as const

export async function getUsers() {
  const spreadsheetId = getUsersSpreadsheetId()
  const headers = await getSheetHeaders({ sheetName: USERS_SHEET, spreadsheetId })
  const missing = USER_HEADERS.filter((header) => !headers.includes(header))
  if (missing.length) throw new Error(`Mapping USERS incomplet : ${missing.join(", ")}`)

  return getSheetRows({
    sheetName: USERS_SHEET,
    spreadsheetId,
    bypassCache: true,
  })
}
