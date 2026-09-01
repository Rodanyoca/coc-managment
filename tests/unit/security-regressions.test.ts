import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("l’administration refuse le mass assignment des champs utilisateur sensibles", async () => {
  const source = await readFile(new URL("../../app/api/users/[id]/route.ts", import.meta.url), "utf8")
  assert.match(source, /EDITABLE_FIELDS/)
  assert.doesNotMatch(source, /patch:\s*body\.patch/)
  for (const field of ["passwordHash", "sessionVersion", "idUser", "dateCreation"]) assert.doesNotMatch(source, new RegExp(`EDITABLE_FIELDS[^\n]+${field}`))
})

test("la création AUTRES ignore les références documentaires fournies par le client", async () => {
  const source = await readFile(new URL("../../app/api/autres/route.ts", import.meta.url), "utf8")
  for (const field of ["avatar_drive_id", "avatar_drive_url", "passeport_drive_id", "passeport_drive_url"]) assert.match(source, new RegExp(`row\\.${field} = ""`))
})

test("les pages d’écriture Autres et la purge du cache exigent WRITE", async () => {
  const source = await readFile(new URL("../../lib/auth/route-policy.ts", import.meta.url), "utf8")
  assert.match(source, /page-other-actor-write[\s\S]*?action: "WRITE"/)
  assert.match(source, /api-dashboard-refresh[\s\S]*?action: "WRITE"/)
})
