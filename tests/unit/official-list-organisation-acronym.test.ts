import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("la liste des officiels affiche le sigle de l’organisation", async () => {
  const page = await readFile(
    new URL("../../app/dashboard/acteurs/officiels/page.tsx", import.meta.url),
    "utf8",
  )
  const list = await readFile(
    new URL("../../app/dashboard/acteurs/officiels/officiels-client.tsx", import.meta.url),
    "utf8",
  )

  assert.match(page, /entity\?\.sigle \|\| entity\?\.sigle_entite/)
  assert.doesNotMatch(page, /entity\?\.nom_officiel \|\| entity\?\.nom_entite/)
  assert.match(list, /<TableHead>Organisation<\/TableHead>/)
})
