import "server-only"

import { deleteDriveFile, uploadFileToDrive } from "@/lib/google/drive"
import { getSheetHeaders, getSheetRows, updateSheetCells } from "@/lib/google/sheets"
import { getFederationLogosFolderId, getReferentialSpreadsheetId } from "./config"
import { replaceFederationLogo, type FederationLogoUploadInput } from "./logo"

const SHEET = "FEDERATIONS"
const REQUIRED_LOGO_COLUMNS = ["logo_drive_id", "logo_drive_url"] as const

function extensionFor(mimeType: string) {
  if (mimeType === "image/png") return "png"
  if (mimeType === "image/webp") return "webp"
  return "jpg"
}

export async function replaceFederationLogoInGoogle(input: Omit<FederationLogoUploadInput, "folderId">) {
  const spreadsheetId = getReferentialSpreadsheetId()
  const folderId = getFederationLogosFolderId()
  const safeFederationId = input.federationId.replace(/[^a-zA-Z0-9_-]/g, "_")
  return replaceFederationLogo({ ...input, folderId, fileName: `LOGO_FEDERATION_${safeFederationId}.${extensionFor(input.mimeType)}` }, {
    find: async (federationId) => {
      const [headers, rows] = await Promise.all([
        getSheetHeaders({ sheetName: SHEET, spreadsheetId, bypassCache: true }),
        getSheetRows({ sheetName: SHEET, spreadsheetId, bypassCache: true }),
      ])
      const missing = REQUIRED_LOGO_COLUMNS.filter((column) => !headers.includes(column))
      if (missing.length) throw new Error(`Colonnes logo manquantes dans FEDERATIONS : ${missing.join(", ")}.`)
      const row = rows.find((candidate) => candidate.id_federation === federationId)
      return row ? { logoDriveId: row.logo_drive_id || "" } : undefined
    },
    upload: uploadFileToDrive,
    update: async (federationId, file) => updateSheetCells({
      sheetName: SHEET,
      spreadsheetId,
      idColumn: "id_federation",
      idValue: federationId,
      updates: [{ column: "logo_drive_id", value: file.fileId }, { column: "logo_drive_url", value: file.url }],
    }),
    remove: deleteDriveFile,
  })
}
