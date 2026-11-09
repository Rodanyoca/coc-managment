import test from "node:test"
import assert from "node:assert/strict"
import { seasonContext, validateSeason, assertSeasonCompatible } from "../../lib/settings/seasons.ts"
import { routePolicy } from "../../lib/auth/route-policy.ts"
import { authorize } from "../../lib/auth/authorization.ts"
import { dashboardNavigation, visibleDashboardNavigation } from "../../lib/navigation/dashboard-navigation.ts"
import { loadServerModule } from "../../scripts/cpu-audit/module-harness.mjs"

const season = { id_saison: "SAI-2026", nom_saison: "2026", date_debut: "2026-01-01", date_fin: "2026-12-31", statut: "ACTIF", observation: "" }
test("season follows Kinshasa date including year and inclusive boundaries", () => {
  const start = seasonContext([season], new Date("2025-12-31T23:30:00Z"))
  assert.equal(start.year, 2026); assert.equal(start.currentSeason.id_saison, season.id_saison)
  assert.equal(seasonContext([season], new Date("2026-12-31T12:00:00Z")).currentSeason.id_saison, season.id_saison)
  assert.equal(seasonContext([season], new Date("2026-12-31T23:30:00Z")).currentSeason, null)
})
test("missing, inactive and overlapping periods never silently choose a season", () => {
  const now = new Date("2026-06-01T00:00:00Z")
  assert.equal(seasonContext([], now).currentSeason, null)
  assert.equal(seasonContext([{ ...season, statut: "INACTIF" }], now).currentSeason, null)
  assert.equal(seasonContext([season, { ...season, id_saison: "other" }], now).ambiguous, true)
  assert.equal(seasonContext([season, { ...season, id_saison: "other" }], now).currentSeason, null)
})
test("dates, duplicate labels and active overlaps validated; own edit allowed", () => {
  for (const input of [{ ...season, date_debut: "2026-02-30" }, { ...season, date_fin: "2025-12-31" }, { ...season, statut: "AUTRE" }, { ...season, nom_saison: " " }]) assert.throws(() => validateSeason(input))
  assert.throws(() => assertSeasonCompatible({ ...season, nom_saison: "Autre" }, [season]))
  assert.throws(() => assertSeasonCompatible({ ...season, statut: "INACTIF" }, [season]))
  assert.doesNotThrow(() => assertSeasonCompatible(season, [season], season.id_saison))
  assert.doesNotThrow(() => assertSeasonCompatible({ ...season, nom_saison: "2027", date_debut: "2027-01-01", date_fin: "2027-12-31" }, [season]))
})
test("settings routes and navigation stay super-admin only, VIEWER cannot write", () => {
  for (const path of ["/dashboard/parametres", "/api/parametres/saisons"]) for (const method of ["GET", "POST", "PUT"]) {
    const requirement = routePolicy(path, method)
    assert.equal(requirement.scope, "SUPER_ADMIN")
    for (const user of [{ idUser: "x", typeUser: "ADMIN", estSuperAdmin: false }, { idUser: "x", typeUser: "VIEWER", estSuperAdmin: true }]) assert.equal(authorize({ user, authorizations: [], requirement, action: requirement.action }).allowed, false)
  }
  assert(!visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: false, readableBlocks: ["AUT-ADM", "AUT-SPT"] }).some(item => item.href === "/dashboard/parametres"))
})
test("route checks session before reads and writes and audits successful saves", async () => {
  let session = null, reads = 0, saves = 0, logs = 0
  const route = await loadServerModule(process.cwd(), "app/api/parametres/saisons/route.ts", {
    "node:crypto": { randomUUID: () => "fixture-request" },
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "next/cache": { revalidatePath() {} },
    "@/lib/auth": { getSession: async () => session },
    "@/lib/audit/logger": { writeAudit: async () => { logs++ } },
    "@/lib/users/google-adapter": { createGoogleUsersSheetsAdapter: () => ({}) },
    "@/lib/settings/data": { getSystemSeasons: async () => { reads++; return [season] }, saveSystemSeason: async () => { saves++; return season } },
    "@/lib/settings/seasons": { seasonContext },
  })
  const request = () => new Request("https://fixture.invalid/api/parametres/saisons", { method: "POST", body: JSON.stringify(season) })
  assert.equal((await route.GET()).status, 401); assert.equal((await route.POST(request())).status, 401)
  for (const user of [{ estSuperAdmin: false, typeUser: "ADMIN" }, { estSuperAdmin: true, typeUser: "VIEWER" }, { estSuperAdmin: true, typeUser: "ADMIN", doitChangerMotDePasse: true }]) {
    session = user; assert.equal((await route.GET()).status, 403); assert.equal((await route.POST(request())).status, 403)
  }
  assert.equal(reads + saves + logs, 0)
  session = { idUser: "admin", estSuperAdmin: true, typeUser: "ADMIN", doitChangerMotDePasse: false }
  assert.equal((await route.GET()).status, 200)
  assert.equal((await route.POST(request())).status, 200)
  assert.equal(saves, 1); assert.equal(logs, 2)
})

test("season persistence validates the source schema and preserves identifiers on update", async () => {
  let offline = false, headers = Object.keys(season), appends = [], updates = [], reads = 0
  const data = await loadServerModule(process.cwd(), "lib/settings/data.ts", {
    "node:crypto": { randomUUID: () => "fixture-id" },
    "@/lib/federations/config": { getReferentialSpreadsheetId: () => "fixture-reference" },
    "@/lib/google/sheets": {
      getSheetsTables: async input => { reads++; assert.deepEqual([...input.sheetNames], ["SAISONS"]); if (offline) throw Error("offline"); return { SAISONS: { headers, rows: [season] } } },
      appendSheetRow: async input => { appends.push(input) },
      updateSheetCells: async input => { updates.push(input) },
    },
  })
  assert.equal((await data.getSystemSeasons())[0].id_saison, season.id_saison)
  const updated = await data.saveSystemSeason({ ...season, observation: "Modification locale" }, season.id_saison)
  assert.equal(updated.id_saison, season.id_saison)
  assert.equal(updates[0].idValue, season.id_saison)
  assert(!updates[0].updates.some(item => item.column === "id_saison"))
  const created = await data.saveSystemSeason({ ...season, nom_saison: "2027", date_debut: "2027-01-01", date_fin: "2027-12-31" })
  assert.equal(created.id_saison, "SAI-fixture-id"); assert.equal(appends[0].spreadsheetId, "fixture-reference")
  await assert.rejects(data.saveSystemSeason(season, "missing"))
  headers = ["id_saison"]
  await assert.rejects(data.getSystemSeasons(), /colonnes/)
  offline = true
  await assert.rejects(data.saveSystemSeason(season, season.id_saison), /offline/)
  assert.equal(updates.length, 1); assert.equal(appends.length, 1); assert.equal(reads, 6)
})
