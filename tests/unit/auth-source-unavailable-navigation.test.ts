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
