import "server-only"

export function getActeursSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ACTEURS_SPREADSHEET_ID
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ACTEURS_SPREADSHEET_ID est manquant.")
  return spreadsheetId
}

export function getActeursAffiliationsSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ACTEURS_AFFILIATIONS_SPREADSHEET_ID
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ACTEURS_AFFILIATIONS_SPREADSHEET_ID est manquant.")
  return spreadsheetId
}
