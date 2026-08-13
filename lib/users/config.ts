import "server-only"

// Source dédiée à l'authentification pendant la migration de USERS.
// Les autres modules ne réutilisent pas ce classeur historique.
const LEGACY_USERS_SPREADSHEET_ID = "1iAnk6wE_shDxtBzctb7_pFLdimYIuBTsnrcffyNa5G4"

export function getUsersSpreadsheetId() {
  return process.env.GOOGLE_SHEETS_USERS_SPREADSHEET_ID?.trim() || LEGACY_USERS_SPREADSHEET_ID
}
