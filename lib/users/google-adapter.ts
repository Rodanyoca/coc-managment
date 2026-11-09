import "server-only"

import { appendSheetRow, deleteSheetRow, getSheetHeaders, getSheetRows, getSheetsTables, updateSheetCells } from "@/lib/google/sheets"
import { getUsersSpreadsheetId } from "./config"
import type { SheetRow, UsersSheetsAdapter } from "./types"

export function createGoogleUsersSheetsAdapter(): UsersSheetsAdapter {
  const spreadsheetId = getUsersSpreadsheetId()
  return {
    async readTable(sheetName) {
      // One fresh source response for rows and headers; never a cached snapshot.
      return (await getSheetsTables({ sheetNames: [sheetName], spreadsheetId }))[sheetName]
    },
    readHeaders(sheetName, options) {
      return getSheetHeaders({ sheetName, spreadsheetId, cacheTtlMs: 60_000, bypassCache: options.fresh })
    },
    readRows(sheetName, options) {
      return getSheetRows({ sheetName, spreadsheetId, cacheTtlMs: 60_000, bypassCache: options.fresh })
    },
    appendRow(sheetName: string, row: SheetRow) {
      return appendSheetRow({ sheetName, row, spreadsheetId })
    },
    updateRow(sheetName, idColumn, idValue, row) {
      return updateSheetCells({ sheetName, spreadsheetId, idColumn, idValue, updates: Object.entries(row).filter(([column]) => column !== idColumn).map(([column, value]) => ({ column, value })) })
    },
    deleteRow(sheetName, idColumn, idValue) {
      return deleteSheetRow({ sheetName, spreadsheetId, idColumn, idValue })
    },
  }
}
