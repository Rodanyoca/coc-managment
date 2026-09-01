import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const listPath = new URL("../../app/dashboard/federations/federations-client.tsx", import.meta.url)
const detailPath = new URL("../../app/dashboard/federations/[id]/page.tsx", import.meta.url)

test("la liste fédérations utilise une grille responsive sans conteneur horizontal", async () => {
  const source = await readFile(listPath, "utf8")
  assert.doesNotMatch(source, /overflow-x-auto/)
  assert.match(source, /lg:grid-cols-/)
  assert.match(source, /break-(all|words)/)
  assert.match(source, /className="overflow-hidden"/)
})

test("l’action de détail est une icône accessible avec infobulle", async () => {
  const source = await readFile(listPath, "utf8")
  assert.match(source, /aria-label={`Voir la fiche de/)
  assert.match(source, /<Eye className=/)
  assert.match(source, /<TooltipContent>Voir la fiche<\/TooltipContent>/)
  assert.doesNotMatch(source, />Détails<\/Link>/)
})

test("la fiche reprend la grille Acteurs avec les deux onglets demandés", async () => {
  const source = await readFile(detailPath, "utf8")
  assert.match(source, /lg:grid-cols-3/)
  assert.match(source, /lg:col-span-1/)
  assert.match(source, /lg:col-span-2/)
  assert.equal((source.match(/<TabsTrigger/g) || []).length, 2)
  assert.match(source, /value="identification">Identification/)
  assert.match(source, /value="structure">Structure/)
  assert.doesNotMatch(source, /id_entite_continentale.*<Field/)
})
