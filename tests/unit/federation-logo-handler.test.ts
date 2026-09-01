import assert from "node:assert/strict"
import test from "node:test"
import { handleFederationLogoUpload } from "../../lib/federations/logo-handler.ts"

function request() {
  const data = new FormData()
  data.append("file", new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "logo.png", { type: "image/png" }))
  return new Request("http://localhost/api/federations/FED-1/logo", { method: "POST", body: data })
}

test("refuse un utilisateur sans droit d’écriture AUT-SPT", async () => {
  let replaced = false
  const response = await handleFederationLogoUpload(request(), "FED-1", { canWrite: async () => false, replace: async () => { replaced = true; return { fileId: "x", url: "x" } } })
  assert.equal(response.status, 403)
  assert.equal(replaced, false)
})

test("retourne le nouveau logo après un envoi autorisé", async () => {
  const response = await handleFederationLogoUpload(request(), "FED-1", { canWrite: async () => true, replace: async (input) => { assert.equal(input.federationId, "FED-1"); return { fileId: "new", url: "https://image/new" } } })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { fileId: "new", url: "https://image/new" })
})
