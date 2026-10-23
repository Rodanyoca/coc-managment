import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import { authenticationFailurePath } from "../../lib/auth/failure-navigation.ts"

test("une indisponibilité temporaire de la source ne renvoie pas vers la connexion", () => {
  assert.equal(authenticationFailurePath(503), "/service-indisponible")
  assert.equal(authenticationFailurePath(401), "/login")
  assert.equal(authenticationFailurePath(403), "/login")
})

test("le proxy utilise la navigation d’échec commune", async () => {
  const source = await readFile(new URL("../../proxy.ts", import.meta.url), "utf8")
  assert.match(source, /authenticationFailurePath\(status\)/)
})

test("les contrôles de session demandent une table fraîche sans repli sur le cache", async () => {
  const [adapter, sheets] = await Promise.all([
    readFile(new URL("../../lib/users/google-adapter.ts", import.meta.url), "utf8"),
    readFile(new URL("../../lib/google/sheets.ts", import.meta.url), "utf8"),
  ])
  assert.match(adapter, /async readTable\(sheetName\)/)
  assert.match(adapter, /getSheetsTables\(\{ sheetNames: \[sheetName\], spreadsheetId \}\)/)
  assert.match(adapter, /bypassCache:\s*options\.fresh/)
  assert.match(sheets, /cacheTtlMs\?:\s*number/)
  assert.match(sheets, /__cocGoogleAuthClients/)
  assert.match(sheets, /headerCache\.set\(headerCacheKey/)
})

test("la validation préfère un snapshot cohérent et conserve le repli des adaptateurs mémoire", async () => {
  const repository = await readFile(new URL("../../lib/users/repository.ts", import.meta.url), "utf8")
  const rowsPosition = repository.indexOf("this.adapter.readRows(sheetName")
  const headersPosition = repository.indexOf("this.adapter.readHeaders(sheetName")
  assert.ok(rowsPosition >= 0)
  assert.ok(headersPosition > rowsPosition)
  assert.match(repository, /this\.adapter\.readTable\(sheetName, \{ fresh: true \}\)/)
})
