import assert from "node:assert/strict"
import test from "node:test"
import { dashboardNavigation, visibleDashboardNavigation } from "../../lib/navigation/dashboard-navigation.ts"

test("le super-administrateur voit immédiatement toutes les sections disponibles", () => {
  const visible = visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: true, readableBlocks: [] })
  assert.deepEqual(visible.map((item) => item.href), [
    "/dashboard", "/dashboard/federations", "/dashboard/acteurs", "/dashboard/competitions",
    "/dashboard/equipes-nationales", "/dashboard/activites", "/dashboard/documents", "/dashboard/utilisateurs",
  ])
})

test("chaque section principale, y compris Acteurs, possède une destination cliquable", () => {
  for (const item of dashboardNavigation) assert.match(item.href, /^\/dashboard(?:\/|$)/)
  assert.equal(dashboardNavigation.find((item) => item.name === "Acteurs")?.href, "/dashboard/acteurs")
})
