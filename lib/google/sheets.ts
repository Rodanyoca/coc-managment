import "server-only"

import { google } from "googleapis"
import { runGoogleRequest } from "./request"

// --- In-memory cache to avoid Google Sheets API quota limits ---
const CACHE_TTL_MS = Number.parseInt(process.env.GOOGLE_SHEETS_CACHE_TTL_MS ?? "300000", 10)
type SheetCache = Map<string, { data: Record<string, string>[]; ts: number }>
type HeaderCache = Map<string, { data: string[]; ts: number }>
type PendingSheetReads = Map<string, Promise<Record<string, string>[]>>
type GoogleAuthClient = InstanceType<typeof google.auth.JWT> | InstanceType<typeof google.auth.OAuth2>

// Next.js peut charger ce module dans plusieurs bundles serveur distincts.
// Un cache global garantit qu'une écriture invalide aussi les lectures des pages.
const sheetsGlobal = globalThis as typeof globalThis & {
  __cocGoogleSheetsCache?: SheetCache
  __cocGoogleSheetsHeaderCache?: HeaderCache
  __cocGoogleSheetsPendingReads?: PendingSheetReads
  __cocGoogleSheetsGeneration?: { value: number }
  __cocGoogleSheetsWorkbookGenerations?: Map<string, number>
  __cocGoogleSheetsFreshGenerations?: Map<string, number>
  __cocGoogleAuthClients?: Map<string, GoogleAuthClient>
  __cocSheetsReadGate?: { active:number; queue:Array<()=>void>; total:number; maxActive:number }
}
const cache = sheetsGlobal.__cocGoogleSheetsCache ??= new Map()
const headerCache = sheetsGlobal.__cocGoogleSheetsHeaderCache ??= new Map()
const pendingReads = sheetsGlobal.__cocGoogleSheetsPendingReads ??= new Map()
const generation = sheetsGlobal.__cocGoogleSheetsGeneration ??= { value: 0 }
const workbookGenerations = sheetsGlobal.__cocGoogleSheetsWorkbookGenerations ??= new Map()
const freshGenerations = sheetsGlobal.__cocGoogleSheetsFreshGenerations ??= new Map()
const authClients = sheetsGlobal.__cocGoogleAuthClients ??= new Map()
const readGate = sheetsGlobal.__cocSheetsReadGate ??= {active:0,queue:[],total:0,maxActive:0}
const MAX_CONCURRENT_SHEETS_READS=6
const SHEETS_TIMEOUT_MS = Number.parseInt(process.env.GOOGLE_SHEETS_TIMEOUT_MS ?? "20000", 10)

async function withSheetsReadPermit<T>(task:()=>Promise<T>):Promise<T>{
 if(readGate.active>=MAX_CONCURRENT_SHEETS_READS)await new Promise<void>(resolve=>readGate.queue.push(resolve))
 readGate.active+=1;readGate.total+=1;readGate.maxActive=Math.max(readGate.maxActive,readGate.active)
 try{return await task()}finally{readGate.active-=1;readGate.queue.shift()?.()}
}

function withSheetsTimeout<T>(task: () => Promise<T>) {
  return runGoogleRequest(task, { timeoutMs: SHEETS_TIMEOUT_MS })
}

export function getSheetsRuntimeMetrics(){return{totalReads:readGate.total,activeReads:readGate.active,maxConcurrentReads:readGate.maxActive,limit:MAX_CONCURRENT_SHEETS_READS}}

function getCached(key: string, ttlMs = CACHE_TTL_MS): Record<string, string>[] | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > ttlMs) return null
  return entry.data
}

function setCache(key: string, data: Record<string, string>[]) {
  cache.set(key, { data, ts: Date.now() })
}

// Mutations conservatively fence all raw workbooks; fresh reads use source fences.
// No derived/authorization results are stored here, only raw ranges and headers.
function cacheGeneration(spreadsheetId: string) {
  const version = workbookGenerations.get(spreadsheetId) ?? 0
  workbookGenerations.set(spreadsheetId, version)
  return `${generation.value}:${version}`
}

function freshGeneration(spreadsheetId: string, sheetNames: string[]) {
  const versions = sheetNames.map((name) => {
    const key = `${spreadsheetId}:${JSON.stringify(name)}`
    const version = freshGenerations.get(key) ?? 0
    // Register active dependencies so an explicit workbook refresh fences them.
    freshGenerations.set(key, version)
    return version
  })
  return `${generation.value}:${versions.join(",")}`
}

export function clearSheetCache(spreadsheetId?: string, sheetName?: string) {
  if (spreadsheetId === undefined) {
    generation.value += 1
    workbookGenerations.clear()
    freshGenerations.clear()
    cache.clear()
    headerCache.clear()
    pendingReads.clear()
    return
  }
  if (!spreadsheetId.trim()) throw new Error("Identifiant du classeur manquant pour invalidation.")
  workbookGenerations.set(spreadsheetId, (workbookGenerations.get(spreadsheetId) ?? 0) + 1)
  const prefix = `${spreadsheetId}:`
  if (sheetName === undefined) {
    for (const [key, version] of freshGenerations) {
      if (key.startsWith(prefix)) freshGenerations.set(key, version + 1)
    }
  } else {
    const key = `${prefix}${JSON.stringify(sheetName)}`
    freshGenerations.set(key, (freshGenerations.get(key) ?? 0) + 1)
  }
  for (const entries of [cache, headerCache, pendingReads]) {
    for (const key of entries.keys()) if (key.startsWith(prefix)) entries.delete(key)
  }
}

function assertFreshGeneration(startedGeneration: string, currentGeneration: string) {
  if (startedGeneration !== currentGeneration) {
    throw new Error("Lecture fraîche invalidée par une écriture concurrente. Réessayez.")
  }
}

// Even a rejected response can follow a committed write (lost acknowledgement).
// Fence local readers on either outcome once the mutation has been attempted.
async function runSheetMutation<T>(spreadsheetId: string, sheetName: string, task: () => Promise<T>): Promise<T> {
  try {
    return await runGoogleRequest(task, { idempotent: false })
  } finally {
    clearSheetCache(spreadsheetId, sheetName)
    // Restore global raw-cache invalidation without broadening fresh source fences.
    for (const [book, version] of workbookGenerations) {
      if (book !== spreadsheetId) workbookGenerations.set(book, version + 1)
    }
    cache.clear()
    headerCache.clear()
    pendingReads.clear()
  }
}

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY
  if (!key) return ""
  return key.replace(/\\n/g, "\n")
}

function getSheetCredentials(spreadsheetId: string) {
  if (!spreadsheetId?.trim()) throw new Error("Identifiant du classeur Google Sheets manquant.")
  return { spreadsheetId }
}

function getGoogleAuth(scopes: string[]) {
  const credentialKind = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && getPrivateKey() ? "service-account" : "oauth"
  const cacheKey = `${credentialKind}:${[...scopes].sort().join(",")}`
  const cached = authClients.get(cacheKey)
  if (cached) return cached
  // Les classeurs sont partagés avec le compte de service. Il doit être
  // prioritaire pour Sheets ; le jeton OAuth est principalement utilisé par
  // Drive et peut ne pas avoir accès aux mêmes classeurs.
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = getPrivateKey()
  if (email && key) {
    const auth = new google.auth.JWT({ email, key, scopes })
    authClients.set(cacheKey, auth)
    return auth
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  if (clientId && clientSecret && refreshToken) {
    const auth = new google.auth.OAuth2(clientId, clientSecret)
    auth.setCredentials({ refresh_token: refreshToken })
    authClients.set(cacheKey, auth)
    return auth
  }
  throw new Error("Identifiants Google Sheets manquants")
}

function valuesToRecords(values: unknown[][]): Record<string, string>[] {
  if (values.length === 0) return []
  const [headers, ...rows] = values
  return rowsToRecords(headers ?? [], rows)
}

function rowsToRecords(headers: unknown[], rows: unknown[][]): Record<string, string>[] {
  const normalizedHeaders = (headers ?? []).map((header) => String(header ?? "").trim())
  return rows.map((row) => Object.fromEntries(
    normalizedHeaders.map((header, index) => [header, row?.[index] === undefined ? "" : String(row[index])])
  ))
}

export async function getSheetRows(params: {
  sheetName: string
  range?: string
  spreadsheetId: string
  bypassCache?: boolean
  cacheTtlMs?: number
}): Promise<Record<string, string>[]> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const range = params.range ?? `'${safeSheetName}'!A:Z`

  // Check cache first
  const cacheKey = `${spreadsheetId}:${range}`
  if (!params.bypassCache) {
    const cached = getCached(cacheKey, params.cacheTtlMs)
    if (cached) return cached
    const pending = pendingReads.get(cacheKey)
    if (pending) return pending
  }

  const request = (async () => {
  const startedGeneration = cacheGeneration(spreadsheetId)
  const startedFreshGeneration = params.bypassCache && !params.range ? freshGeneration(spreadsheetId, [params.sheetName]) : startedGeneration
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"])

  const sheets = google.sheets({ version: "v4", auth })

  let res
  try {
    res = await withSheetsReadPermit(() => runGoogleRequest(
      () => sheets.spreadsheets.values.get({ spreadsheetId, range }, { timeout: SHEETS_TIMEOUT_MS }),
      { timeoutMs: SHEETS_TIMEOUT_MS },
    ))
  } catch (err) {
    // En cas de quota temporairement dépassé, une ancienne valeur vaut mieux
    // qu'une page entièrement indisponible.
    const stale = !params.bypassCache && startedGeneration === cacheGeneration(spreadsheetId) ? cache.get(cacheKey)?.data : undefined
    if (stale) return stale
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Failed to read Google Sheet (spreadsheetId=${spreadsheetId}, range=${range}): ${message}`
    )
  }

  const values: unknown[][] = (res?.data?.values ?? []) as unknown[][]
  if (params.bypassCache) assertFreshGeneration(startedFreshGeneration, params.range ? cacheGeneration(spreadsheetId) : freshGeneration(spreadsheetId, [params.sheetName]))
  const result = valuesToRecords(values)

  // Les lectures explicitement fraîches ne doivent ni lire ni alimenter le cache.
  if (!params.bypassCache && startedGeneration === cacheGeneration(spreadsheetId)) {
    setCache(cacheKey, result)
    if (!params.range) {
      const headers = (values[0] ?? []).map((header) => String(header ?? "").trim()).filter(Boolean)
      const headerCacheKey = `${spreadsheetId}:'${safeSheetName}'!1:1`
      headerCache.set(headerCacheKey, { data: headers, ts: Date.now() })
    }
  }

  return result
  })()

  if (params.bypassCache) return request
  pendingReads.set(cacheKey, request)
  try {
    return await request
  } finally {
    if (pendingReads.get(cacheKey) === request) pendingReads.delete(cacheKey)
  }
}

export async function getSheetHeaders(params: {
  sheetName: string
  spreadsheetId: string
  bypassCache?: boolean
  cacheTtlMs?: number
}): Promise<string[]> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const safeSheetName = String(params.sheetName).replace(/'/g, "''")
  const cacheKey = `${spreadsheetId}:'${safeSheetName}'!1:1`
  const cached = params.bypassCache ? undefined : headerCache.get(cacheKey)
  if (cached && Date.now() - cached.ts <= (params.cacheTtlMs ?? CACHE_TTL_MS)) return cached.data
  const startedGeneration = cacheGeneration(spreadsheetId)
  const startedFreshGeneration = params.bypassCache ? freshGeneration(spreadsheetId, [params.sheetName]) : startedGeneration
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"])
  const sheets = google.sheets({ version: "v4", auth })
  try {
    const result = await withSheetsReadPermit(() => withSheetsTimeout(() => sheets.spreadsheets.values.get({ spreadsheetId, range: `'${safeSheetName}'!1:1` })))
    if (params.bypassCache) assertFreshGeneration(startedFreshGeneration, freshGeneration(spreadsheetId, [params.sheetName]))
    const headers = (result.data.values?.[0] ?? []).map((header: unknown) => String(header ?? "").trim()).filter(Boolean)
    if (!params.bypassCache && startedGeneration === cacheGeneration(spreadsheetId)) headerCache.set(cacheKey, { data: headers, ts: Date.now() })
    return headers
  } catch (error) {
    if (cached && startedGeneration === cacheGeneration(spreadsheetId)) return cached.data
    throw error
  }
}

export async function getSheetsRows(params: {
  sheetNames: string[]
  spreadsheetId: string
  cacheTtlMs?: number
  bypassCache?: boolean
}): Promise<Record<string, Record<string, string>[]>> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const sheetNames = [...new Set(params.sheetNames)]
  const keyFor = (name: string) => `${spreadsheetId}:'${name.replace(/'/g, "''")}'!A:Z`
  const cachedResult: Record<string, Record<string, string>[]> = {}
  for (const sheetName of sheetNames) {
    const rows = params.bypassCache ? null : getCached(keyFor(sheetName), params.cacheTtlMs)
    if (rows) cachedResult[sheetName] = rows
  }
  const allCached = sheetNames.every((name) => cachedResult[name])
  if (allCached) return cachedResult

  const waiting = new Map<string, Promise<Record<string, string>[]>>()
  const missing: string[] = []
  for (const name of sheetNames) {
    if (cachedResult[name]) continue
    const pending = params.bypassCache ? undefined : pendingReads.get(keyFor(name))
    if (pending) waiting.set(name, pending)
    else missing.push(name)
  }
  if (missing.length) {
    const startedGeneration = cacheGeneration(spreadsheetId)
    const startedFreshGeneration = params.bypassCache ? freshGeneration(spreadsheetId, missing) : startedGeneration
    const request = (async () => {
      const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"])
      const sheets = google.sheets({ version: "v4", auth })
      const ranges = missing.map((name) => `'${name.replace(/'/g, "''")}'!A:Z`)
      let response
      try {
        response = await withSheetsReadPermit(() => withSheetsTimeout(() => sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges })))
      } catch (error) {
        const staleResult: Record<string, Record<string, string>[]> = {}
        const hasCompleteStaleSnapshot = !params.bypassCache && startedGeneration === cacheGeneration(spreadsheetId) && missing.every((name) => {
          const stale = cache.get(keyFor(name))?.data
          if (stale) staleResult[name] = stale
          return Boolean(stale)
        })
        if (hasCompleteStaleSnapshot) return staleResult
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to read Google Sheets batch (spreadsheetId=${spreadsheetId}): ${message}`)
      }
      if (params.bypassCache) assertFreshGeneration(startedFreshGeneration, freshGeneration(spreadsheetId, missing))
      const result: Record<string, Record<string, string>[]> = {}
      missing.forEach((name, index) => {
        const values = (response.data.valueRanges?.[index]?.values ?? []) as unknown[][]
        result[name] = valuesToRecords(values)
        if (!params.bypassCache && startedGeneration === cacheGeneration(spreadsheetId)) {
          setCache(keyFor(name), result[name])
          const headers = (values[0] ?? []).map((header) => String(header ?? "").trim()).filter(Boolean)
          headerCache.set(`${spreadsheetId}:'${name.replace(/'/g, "''")}'!1:1`, { data: headers, ts: Date.now() })
        }
      })
      return result
    })()
    for (const name of missing) {
      const read = request.then((result) => result[name])
      waiting.set(name, read)
      if (!params.bypassCache) {
        const key = keyFor(name)
        pendingReads.set(key, read)
        void read.finally(() => {
          if (pendingReads.get(key) === read) pendingReads.delete(key)
        }).catch(() => undefined)
      }
    }
  }
  const entries = await Promise.all(sheetNames.map(async (name) => {
    return [name, cachedResult[name] ?? await waiting.get(name)!] as const
  }))
  return Object.fromEntries(entries)
}

export async function getSheetsTables(params: { sheetNames: string[]; spreadsheetId: string }) {
  const startedGeneration = freshGeneration(params.spreadsheetId, params.sheetNames)
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"])
  const sheets = google.sheets({ version: "v4", auth })
  // Keep complete schema validation without reading unused columns of data or
  // fetching the header twice. Both disjoint ranges use one batch response.
  const ranges = params.sheetNames.flatMap((sheetName) => {
    const sheet = `'${sheetName.replace(/'/g, "''")}'`
    return [`${sheet}!1:1`, `${sheet}!A2:Z`]
  })
  const response = await withSheetsReadPermit(() => withSheetsTimeout(() => sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges })))
  assertFreshGeneration(startedGeneration, freshGeneration(spreadsheetId, params.sheetNames))
  return Object.fromEntries(params.sheetNames.map((sheetName, index) => {
    const values = (response.data.valueRanges?.[index * 2 + 1]?.values ?? []) as unknown[][]
    const headers = (response.data.valueRanges?.[index * 2]?.values?.[0] ?? []).map((header: unknown) => String(header ?? "").trim())
    return [sheetName, { headers, rows: rowsToRecords(headers, values) }]
  })) as Record<string, { headers: string[]; rows: Record<string, string>[] }>
}

export async function updateSheetCell(params: {
  sheetName: string
  idColumn: string
  idValue: string
  targetColumn: string
  value: string
  spreadsheetId: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])

  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const range = `'${safeSheetName}'!A:Z`

  const res = await runGoogleRequest(() => sheets.spreadsheets.values.get({ spreadsheetId, range }))
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

  await runSheetMutation(spreadsheetId, params.sheetName, () => sheets.spreadsheets.values.update({
    spreadsheetId,
    range: cellRange,
    valueInputOption: "RAW",
    requestBody: { values: [[params.value]] },
  }))
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
  spreadsheetId: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)

  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])

  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const [headers, rows] = await Promise.all([
    getSheetHeaders({ sheetName: params.sheetName, spreadsheetId }),
    getSheetRows({ sheetName: params.sheetName, spreadsheetId }),
  ])
  if (headers.length === 0) throw new Error("La feuille est vide")
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

  const recordIndex = rows.findIndex((row) => String(row[params.idColumn] ?? "").trim() === params.idValue)
  if (recordIndex === -1) throw new Error(`Ligne avec ${params.idColumn}="${params.idValue}" introuvable`)
  const rowNumber = recordIndex + 2

  const data = columnIndices.map(({ colIdx, value }) => ({
    range: `'${safeSheetName}'!${columnToLetter(colIdx)}${rowNumber}`,
    values: [[value]],
  }))

  await runSheetMutation(spreadsheetId, params.sheetName, () => sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data,
    },
  }))
}

export async function appendSheetRow(params: {
  sheetName: string
  row: Record<string, string>
  spreadsheetId: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])
  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = params.sheetName.replace(/'/g, "''")
  const headers = await getSheetHeaders({ sheetName: params.sheetName, spreadsheetId })
  if (headers.length === 0) throw new Error(`La feuille "${params.sheetName}" ne contient pas d'en-têtes`)
  await runSheetMutation(spreadsheetId, params.sheetName, () => sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${safeSheetName}'!A:Z`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [headers.map((header) => params.row[header] ?? "")] },
  }))
}

export async function appendSheetRows(params: {
  sheetName: string
  rows: Record<string, string>[]
  spreadsheetId: string
}): Promise<void> {
  if (!params.rows.length) return
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])
  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = params.sheetName.replace(/'/g, "''")
  const headers = await getSheetHeaders({ sheetName: params.sheetName, spreadsheetId })
  if (headers.length === 0) throw new Error(`La feuille "${params.sheetName}" ne contient pas d'en-têtes`)
  await runSheetMutation(spreadsheetId, params.sheetName, () => sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${safeSheetName}'!A:Z`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: params.rows.map((row) => headers.map((header) => row[header] ?? "")) },
  }))
}

export async function deleteSheetRow(params: {
  sheetName: string
  idColumn: string
  idValue: string
  spreadsheetId: string
}): Promise<void> {
  const { spreadsheetId } = getSheetCredentials(params.spreadsheetId)
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"])
  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = params.sheetName.replace(/'/g, "''")
  const metadata = await runGoogleRequest(() => sheets.spreadsheets.get({ spreadsheetId }))
  const sheet = metadata.data.sheets?.find((item) => item.properties?.title === params.sheetName)
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === undefined || sheetId === null) throw new Error(`Feuille "${params.sheetName}" introuvable`)
  const valuesResult = await runGoogleRequest(() => sheets.spreadsheets.values.get({ spreadsheetId, range: `'${safeSheetName}'!A:Z` }))
  const values = valuesResult.data.values ?? []
  const headers = (values[0] ?? []).map((header) => String(header ?? "").trim())
  const idIndex = headers.indexOf(params.idColumn)
  if (idIndex < 0) throw new Error(`Colonne "${params.idColumn}" introuvable`)
  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[idIndex] ?? "").trim() === params.idValue)
  if (rowIndex < 1) throw new Error("Enregistrement introuvable")
  await runSheetMutation(spreadsheetId, params.sheetName, () => sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 } } }] },
  }))
}
