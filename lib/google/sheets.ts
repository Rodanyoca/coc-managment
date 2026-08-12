import "server-only"

import { google } from "googleapis"

// --- In-memory cache to avoid Google Sheets API quota limits ---
const CACHE_TTL_MS = 60_000 // 60 seconds
type SheetCache = Map<string, { data: Record<string, string>[]; ts: number }>

// Next.js peut charger ce module dans plusieurs bundles serveur distincts.
// Un cache global garantit qu'une écriture invalide aussi les lectures des pages.
const sheetsGlobal = globalThis as typeof globalThis & {
  __cocGoogleSheetsCache?: SheetCache
}
const cache = sheetsGlobal.__cocGoogleSheetsCache ??= new Map()

function getCached(key: string): Record<string, string>[] | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: Record<string, string>[]) {
  cache.set(key, { data, ts: Date.now() })
}

export function clearSheetCache() {
  cache.clear()
}

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY
  if (!key) return ""
  return key.replace(/\\n/g, "\n")
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout: () => void
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      onTimeout()
      reject(new Error(`Google Sheets request timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return (await Promise.race([promise, timeoutPromise])) as T
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function getSheetCredentials(spreadsheetIdOverride?: string) {
  const spreadsheetId = spreadsheetIdOverride || process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID")
  return { spreadsheetId }
}

function getGoogleAuth(scopes: string[]) {
  // Les classeurs sont partagés avec le compte de service. Il doit être
  // prioritaire pour Sheets ; le jeton OAuth est principalement utilisé par
  // Drive et peut ne pas avoir accès aux mêmes classeurs.
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = getPrivateKey()
  if (email && key) {
    return new google.auth.JWT({ email, key, scopes })
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  if (clientId && clientSecret && refreshToken) {
    const auth = new google.auth.OAuth2(clientId, clientSecret)
    auth.setCredentials({ refresh_token: refreshToken })
    return auth
  }
  throw new Error("Identifiants Google Sheets manquants")
}

function valuesToRecords(values: unknown[][]): Record<string, string>[] {
  if (values.length === 0) return []
  const [headers, ...rows] = values
  const normalizedHeaders = (headers ?? []).map((header) => String(header ?? "").trim())
  return rows.map((row) => Object.fromEntries(
    normalizedHeaders.map((header, index) => [header, row?.[index] === undefined ? "" : String(row[index])])
  ))
}

export async function getSheetRows(params: {
  sheetName: string
  range?: string
  spreadsheetId?: string
  bypassCache?: boolean
}): Promise<Record<string, string>[]> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const range = params.range ?? `'${safeSheetName}'!A:Z`

  // Check cache first
  const cacheKey = `${spreadsheetId}:${range}`
  if (!params.bypassCache) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"])

  const sheets = google.sheets({ version: "v4", auth })

  const controller = new AbortController()
  const timeoutMs = Number.parseInt(process.env.GOOGLE_SHEETS_TIMEOUT_MS ?? "20000", 10)

  const res = await withTimeout(
    (sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      signal: controller.signal,
    } as any) as unknown as Promise<any>),
    timeoutMs,
    () => controller.abort()
  ).catch((err) => {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Failed to read Google Sheet (spreadsheetId=${spreadsheetId}, range=${range}): ${message}`
    )
  })

  const values: unknown[][] = (res?.data?.values ?? []) as unknown[][]
  const result = valuesToRecords(values)

  // Les lectures explicitement fraîches ne doivent ni lire ni alimenter le cache.
  if (!params.bypassCache) setCache(cacheKey, result)

  return result
}

export async function getSheetHeaders(params: { sheetName: string; spreadsheetId?: string; bypassCache?: boolean }): Promise<string[]> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const safeSheetName = String(params.sheetName).replace(/'/g, "''")
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"])
  const sheets = google.sheets({ version: "v4", auth })
  const result = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${safeSheetName}'!1:1` })
  return (result.data.values?.[0] ?? []).map((header: unknown) => String(header ?? "").trim()).filter(Boolean)
}

export async function getSheetsRows(params: {
  sheetNames: string[]
  spreadsheetId?: string
}): Promise<Record<string, Record<string, string>[]>> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"])
  const sheets = google.sheets({ version: "v4", auth })
  const ranges = params.sheetNames.map((sheetName) => `'${sheetName.replace(/'/g, "''")}'!A:Z`)
  const response = await sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges })
  const result: Record<string, Record<string, string>[]> = {}
  params.sheetNames.forEach((sheetName, index) => {
    const values = (response.data.valueRanges?.[index]?.values ?? []) as unknown[][]
    result[sheetName] = valuesToRecords(values)
  })
  return result
}

export async function updateSheetCell(params: {
  sheetName: string
  idColumn: string
  idValue: string
  targetColumn: string
  value: string
  spreadsheetId?: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])

  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const range = `'${safeSheetName}'!A:Z`

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range } as any) as any
  const values: unknown[][] = (res?.data?.values ?? []) as unknown[][]
  if (values.length === 0) throw new Error("Sheet is empty")

  const headers = (values[0] ?? []).map((h: unknown) => String(h ?? "").trim())
  const idColIdx = headers.indexOf(params.idColumn)
  const targetColIdx = headers.indexOf(params.targetColumn)

  if (idColIdx === -1) throw new Error(`Column "${params.idColumn}" not found in sheet "${params.sheetName}"`)
  if (targetColIdx === -1) throw new Error(`Column "${params.targetColumn}" not found in sheet "${params.sheetName}"`)

  let rowIndex = -1
  for (let i = 1; i < values.length; i++) {
    const cellValue = String(values[i]?.[idColIdx] ?? "").trim()
    if (cellValue === params.idValue) {
      rowIndex = i
      break
    }
  }

  if (rowIndex === -1) throw new Error(`Row with ${params.idColumn}="${params.idValue}" not found`)

  const colLetter = String.fromCharCode(65 + targetColIdx)
  const cellRange = `'${safeSheetName}'!${colLetter}${rowIndex + 1}`

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: cellRange,
    valueInputOption: "RAW",
    requestBody: { values: [[params.value]] },
  } as any)
}

function columnToLetter(colIdx: number): string {
  if (colIdx < 26) return String.fromCharCode(65 + colIdx)
  return (
    String.fromCharCode(64 + Math.floor(colIdx / 26)) +
    String.fromCharCode(65 + (colIdx % 26))
  )
}

export async function updateSheetCells(params: {
  sheetName: string
  idColumn: string
  idValue: string
  updates: { column: string; value: string }[]
  spreadsheetId?: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])

  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const range = `'${safeSheetName}'!A:Z`

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range } as any) as any
  const values: unknown[][] = (res?.data?.values ?? []) as unknown[][]
  if (values.length === 0) throw new Error("La feuille est vide")

  const headers = (values[0] ?? []).map((h: unknown) => String(h ?? "").trim())
  const idColIdx = headers.indexOf(params.idColumn)
  if (idColIdx === -1) throw new Error(`Colonne "${params.idColumn}" introuvable dans "${params.sheetName}"`)

  const columnIndices: { colIdx: number; value: string }[] = []
  for (const upd of params.updates) {
    const idx = headers.indexOf(upd.column)
    // Les modèles applicatifs peuvent encore contenir des champs historiques.
    // Une modification ne doit envoyer que les colonnes présentes dans la feuille cible.
    if (idx === -1) continue
    columnIndices.push({ colIdx: idx, value: upd.value })
  }

  let rowIndex = -1
  for (let i = 1; i < values.length; i++) {
    if (String(values[i]?.[idColIdx] ?? "").trim() === params.idValue) {
      rowIndex = i
      break
    }
  }
  if (rowIndex === -1) throw new Error(`Ligne avec ${params.idColumn}="${params.idValue}" introuvable`)

  const data = columnIndices.map(({ colIdx, value }) => ({
    range: `'${safeSheetName}'!${columnToLetter(colIdx)}${rowIndex + 1}`,
    values: [[value]],
  }))

  await (sheets.spreadsheets.values.batchUpdate as any)({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data,
    },
  })
  clearSheetCache()
}

export async function appendSheetRow(params: {
  sheetName: string
  row: Record<string, string>
  spreadsheetId?: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])
  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = params.sheetName.replace(/'/g, "''")
  const headerResult = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${safeSheetName}'!1:1` })
  const headers = (headerResult.data.values?.[0] ?? []).map((header) => String(header ?? "").trim())
  if (headers.length === 0) throw new Error(`La feuille "${params.sheetName}" ne contient pas d'en-têtes`)
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${safeSheetName}'!A:Z`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [headers.map((header) => params.row[header] ?? "")] },
  })
  clearSheetCache()
}

export async function deleteSheetRow(params: {
  sheetName: string
  idColumn: string
  idValue: string
  spreadsheetId?: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])
  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = params.sheetName.replace(/'/g, "''")
  const metadata = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = metadata.data.sheets?.find((item) => item.properties?.title === params.sheetName)
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === undefined || sheetId === null) throw new Error(`Feuille "${params.sheetName}" introuvable`)
  const valuesResult = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${safeSheetName}'!A:Z` })
  const values = valuesResult.data.values ?? []
  const headers = (values[0] ?? []).map((header) => String(header ?? "").trim())
  const idIndex = headers.indexOf(params.idColumn)
  if (idIndex < 0) throw new Error(`Colonne "${params.idColumn}" introuvable`)
  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[idIndex] ?? "").trim() === params.idValue)
  if (rowIndex < 1) throw new Error("Enregistrement introuvable")
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 } } }] },
  })
  clearSheetCache()
}
