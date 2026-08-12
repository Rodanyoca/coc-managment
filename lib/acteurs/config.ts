import "server-only"

export function getActeursSpreadsheetId(): string {
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_ACTEURS_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_ACTEURS_SPREADSHEET_ID or GOOGLE_SHEETS_SPREADSHEET_ID")
  }
  return spreadsheetId
}

export function getActeursAffiliationsSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ACTEURS_AFFILIATIONS_SPREADSHEET_ID
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_ACTEURS_AFFILIATIONS_SPREADSHEET_ID")
  return spreadsheetId
}
