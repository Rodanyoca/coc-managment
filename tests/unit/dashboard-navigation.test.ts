import assert from "node:assert/strict"
import test from "node:test"
import { dashboardNavigation, visibleDashboardNavigation } from "../../lib/navigation/dashboard-navigation.ts"

test("le super-administrateur voit immédiatement toutes les sections disponibles", () => {
  const visible = visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: true, readableBlocks: [] })
  assert.deepEqual(visible.map((item) => item.href), [
    "/dashboard", "/dashboard/federations", "/dashboard/acteurs", "/dashboard/competitions",
    "/dashboard/equipes-nationales", "/dashboard/activites", "/dashboard/documents", undefined, "/dashboard/utilisateurs",
  ])
})

test("la section Site web expose les entrées attendues dans l’ordre et sur des routes dédiées", () => {
  const siteWeb = dashboardNavigation.find((item) => item.name === "Site web")
  assert.deepEqual(siteWeb?.blocks, ["AUT-COM"])
  assert.deepEqual(siteWeb?.children, [
    { name: "Sliders", href: "/dashboard/site-web/sliders" },
    { name: "Communiqués", href: "/dashboard/site-web/communiques" },
    { name: "Actualités", href: "/dashboard/site-web/actualites" },
    { name: "Galeries", href: "/dashboard/site-web/galeries" },
    { name: "Historique", href: "/dashboard/site-web/historique" },
    { name: "Gouvernance", href: "/dashboard/site-web/gouvernance" },
    { name: "Jeux", href: "/dashboard/site-web/jeux" },
    { name: "Athlètes", href: "/dashboard/site-web/athletes" },
    { name: "Entités", href: "/dashboard/site-web/entites" },
    { name: "Événements", href: "/dashboard/site-web/evenements" },
    { name: "Documents site web", href: "/dashboard/site-web/documents" },
  ])
})

test("AUT-COM contrôle la visibilité de Site web pour les comptes ordinaires", () => {
  const withoutCommunication = visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: false, readableBlocks: ["AUT-ADM"] })
  const withCommunication = visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: false, readableBlocks: ["AUT-COM"] })
  assert.equal(withoutCommunication.some((item) => item.name === "Site web"), false)
  assert.equal(withCommunication.some((item) => item.name === "Site web"), true)
})

test("chaque section principale, y compris Acteurs, possède une destination cliquable", () => {
  for (const item of dashboardNavigation.filter((entry) => entry.name !== "Site web")) assert.match(item.href!, /^\/dashboard(?:\/|$)/)
  assert.equal(dashboardNavigation.find((item) => item.name === "Acteurs")?.href, "/dashboard/acteurs")
  assert.equal(dashboardNavigation.find((item) => item.name === "Site web")?.href, undefined)
})
