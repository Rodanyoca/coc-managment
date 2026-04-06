import "server-only"

import { google } from "googleapis"

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

export async function getSheetRows(params: {
  sheetName: string
  range?: string
}): Promise<Record<string, string>[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = getPrivateKey()

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID")
  }
  if (!clientEmail) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL")
  }
  if (!privateKey) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY")
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })

  const sheets = google.sheets({ version: "v4", auth })
  const safeSheetName = String(params.sheetName ?? "").replace(/'/g, "''")
  const range = params.range ?? `'${safeSheetName}'!A:Z`

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

  return (rows ?? []).map((row: unknown[]) => {
    const record: Record<string, string> = {}
    for (const [key, idx] of headerIndex.entries()) {
      record[key] = row?.[idx] === undefined ? "" : String(row[idx])
    }
    return record
  })
}
