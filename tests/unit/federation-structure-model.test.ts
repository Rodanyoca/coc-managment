import assert from "node:assert/strict"
import test from "node:test"
import { buildFederationStructure } from "../../lib/federations/structure-model.ts"
import type { FederationData } from "../../lib/federations/types.ts"

test("construit uniquement la hiérarchie réellement configurée et distingue un niveau vide", () => {
  const data = {
    hierarchie: [
      { id_hierarchie: "H1", id_federation: "FED-1", id_type_structure: "T1", nom_structure: "Ligues", niveau: "1", observations: "" },
      { id_hierarchie: "H2", id_federation: "FED-1", id_type_structure: "T2", nom_structure: "Clubs", niveau: "2", observations: "" },
    ],
    ligues: [{ id_ligue_coc: "L1", id_federation: "FED-1", nom_ligue: "Ligue Kinshasa", nom_province: "Kinshasa", statut: "ACTIF" }],
    ententes: [], cercles: [], clubs: [], equipes: [],
  } as unknown as FederationData
  const result = buildFederationStructure(data, "FED-1")
  assert.deepEqual(result.hierarchy, ["Fédération", "Ligues", "Clubs"])
  assert.equal(result.sections.find((section) => section.key === "ligues")?.items.length, 1)
  assert.equal(result.sections.find((section) => section.key === "clubs")?.configured, true)
  assert.equal(result.sections.find((section) => section.key === "clubs")?.items.length, 0)
  assert.equal(result.sections.find((section) => section.key === "ententes")?.configured, false)
})
