import assert from "node:assert/strict"
import test from "node:test"
import { loadFreshDashboardSections } from "../../lib/dashboard/fresh-load.ts"

test("vide le cache Sheets avant de charger les données d'accueil", async () => {
  const events: string[] = []
  const result = await loadFreshDashboardSections({
    clear: () => { events.push("clear") },
    loaders: [async () => { events.push("load"); return 42 }],
  })
  assert.deepEqual(events, ["clear", "load"])
  assert.equal(result[0].status, "fulfilled")
})
