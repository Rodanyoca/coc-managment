import assert from "node:assert/strict"
import test from "node:test"
import { requestUserCreation } from "../../lib/users/create-user-client.ts"

const confirmation = { ok: true, user: { id_user: "USR-TEST" }, temporaryAccess: "test-only-temporary-access" }

test("attend la compilation de 36 secondes sans abandonner ni répéter la création", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] })
  let calls = 0
  const fetcher: typeof fetch = async (_input, options) => {
    calls += 1
    return new Promise<Response>((resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(options.signal?.reason), { once: true })
      setTimeout(() => resolve(Response.json(confirmation, { status: 201 })), 36_000)
    })
  }
  const request = requestUserCreation({}, fetcher)
  context.mock.timers.tick(36_000)
  assert.equal(await request, confirmation.temporaryAccess)
  assert.equal(calls, 1)
})

test("un HTTP 200 sans confirmation ne constitue pas une création réussie", async () => {
  const fetcher: typeof fetch = async () => Response.json({ ok: true }, { status: 200 })
  await assert.rejects(() => requestUserCreation({}, fetcher), /non confirmée/)
})

test("conserve le détail du doublon et refuse une fausse confirmation 201", async () => {
  const duplicate: typeof fetch = async () => Response.json({ error: "Adresse déjà utilisée.", existingUserId: "USR-EXISTING" }, { status: 409 })
  await assert.rejects(() => requestUserCreation({}, duplicate), /USR-EXISTING/)
  const incomplete: typeof fetch = async () => Response.json({ ok: true }, { status: 201 })
  await assert.rejects(() => requestUserCreation({}, incomplete), /non confirmée/)
})
