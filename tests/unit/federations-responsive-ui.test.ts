import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const listPath = new URL("../../app/dashboard/federations/federations-client.tsx", import.meta.url)
const detailPath = new URL("../../app/dashboard/federations/[id]/page.tsx", import.meta.url)
const structurePath = new URL("../../components/dashboard/federation-structure-section.tsx", import.meta.url)

test("la liste fédérations utilise le format tableau des ligues sans colonne identifiant", async () => {
  const source = await readFile(listPath, "utf8")
  assert.match(source, /<Table>/)
  assert.match(source, /bg-muted\/70 hover:bg-muted\/70/)
  assert.doesNotMatch(source, /<TableHead[^>]*>(?:ID|Identifiant)/)
  assert.match(source, /\[10, 25, 50, 100\]/)
  assert.match(source, /break-(all|words)/)
  assert.match(source, /overflow-hidden rounded-xl border border-border\/80/)
})

test("la liste fédérations propose un filtre de catégorie combiné à la recherche", async () => {
  const source = await readFile(listPath, "utf8")
  assert.match(source, /aria-label="Filtrer par catégorie"/)
  assert.match(source, />Toutes les catégories</)
  assert.match(source, /category === "TOUTES" \|\| item\.categorie_entite === category/)
})

test("l’action de détail est une icône accessible avec infobulle", async () => {
  const source = await readFile(listPath, "utf8")
  assert.match(source, /aria-label={`Voir la fiche de/)
  assert.match(source, /<Eye className=/)
  assert.match(source, /<TooltipContent>Voir la fiche<\/TooltipContent>/)
  assert.doesNotMatch(source, />Détails<\/Link>/)
})

test("la fiche présente quatre blocs deux par deux puis les tableaux territoriaux sans onglets", async () => {
  const source = await readFile(detailPath, "utf8")
  assert.match(source, /lg:grid-cols-2/)
  assert.equal((source.match(/<FederationInfoBlock id=/g) || []).length, 4)
  assert.doesNotMatch(source, /<Tabs|components\/ui\/tabs/)
  assert.doesNotMatch(source, />Identifiant</)
  assert.ok(source.indexOf("<FederationStructureTables") > source.lastIndexOf("</FederationInfoBlock>"))
})

test("chaque tableau de structure propose recherche et pagination 10, 20 ou 50", async () => {
  const source = await readFile(structurePath, "utf8")
  assert.match(source, /function StructureTable/)
  assert.match(source, /const \[query, setQuery\]/)
  assert.match(source, /\[10, 20, 50\]/)
  assert.match(source, />Précédent</)
  assert.match(source, />Suivant</)
})
