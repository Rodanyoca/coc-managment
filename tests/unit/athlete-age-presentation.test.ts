import assert from "node:assert/strict"
import test from "node:test"
import { getAthleteAge } from "../../lib/athletes/presentation.ts"

test("l'âge tient compte de l'anniversaire pour les formats ISO et français", () => {
  const today = new Date(2026, 9, 19)
  assert.equal(getAthleteAge("2000-10-19", today), 26)
  assert.equal(getAthleteAge("20/10/2000", today), 25)
  assert.equal(getAthleteAge("18/10/2000", today), 26)
})

test("une naissance absente, impossible ou future ne produit pas un âge inventé", () => {
  const today = new Date(2026, 9, 19)
  for (const value of ["", "inconnue", "2025-02-29", "31/04/2000", "2026-10-20"])
    assert.equal(getAthleteAge(value, today), null)
  assert.equal(getAthleteAge("2024-02-29", today), 2)
  assert.equal(getAthleteAge("2026-10-19", today), 0)
})
