import "server-only"

export function getTerritorialSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEETS_STRUCTURE_TERRITORIALE_SPREADSHEET_ID
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_STRUCTURE_TERRITORIALE_SPREADSHEET_ID est manquant.")
  return spreadsheetId
}

export function getReferentialSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEETS_REFERENTIEL_SPREADSHEET_ID
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_REFERENTIEL_SPREADSHEET_ID est manquant.")
  return spreadsheetId
}

export function getFederationLogosFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FEDERATION_LOGOS_FOLDER_ID
  if (!folderId) throw new Error("GOOGLE_DRIVE_FEDERATION_LOGOS_FOLDER_ID est manquant.")
  return folderId
}
