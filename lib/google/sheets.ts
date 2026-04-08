import "server-only"

import { google } from "googleapis"

// --- In-memory cache to avoid Google Sheets API quota limits ---
const CACHE_TTL_MS = 60_000 // 60 seconds
const cache = new Map<string, { data: Record<string, string>[]; ts: number }>()

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

function getSheetCredentials() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = getPrivateKey()

  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID")
  if (!clientEmail) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL")
  if (!privateKey) throw new Error("Missing GOOGLE_PRIVATE_KEY")

  return { spreadsheetId, clientEmail, privateKey }
}

export async function getSheetRows(params: {
  sheetName: string
  range?: string
}): Promise<Record<string, string>[]> {
  const { spreadsheetId, clientEmail, privateKey } = getSheetCredentials()
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const range = params.range ?? `'${safeSheetName}'!A:Z`

  // Check cache first
  const cacheKey = `${spreadsheetId}:${range}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })

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
  if (values.length === 0) return []

  const [headers, ...rows] = values as unknown[][]
  const headerIndex = new Map<string, number>()
  ;(headers ?? []).forEach((h: unknown, idx: number) => {
    headerIndex.set(String(h ?? "").trim(), idx)
  })

  const result = (rows ?? []).map((row: unknown[]) => {
    const record: Record<string, string> = {}
    for (const [key, idx] of headerIndex.entries()) {
      record[key] = row?.[idx] === undefined ? "" : String(row[idx])
    }
    return record
  })

  // Store in cache
  setCache(cacheKey, result)

  return result
}

export async function updateSheetCell(params: {
  sheetName: string
  idColumn: string
  idValue: string
  targetColumn: string
  value: string
}): Promise<void> {
  const { spreadsheetId, clientEmail, privateKey } = getSheetCredentials()

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

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
}): Promise<void> {
  const { spreadsheetId, clientEmail, privateKey } = getSheetCredentials()

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

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
    if (idx === -1) throw new Error(`Colonne "${upd.column}" introuvable dans "${params.sheetName}"`)
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
}
