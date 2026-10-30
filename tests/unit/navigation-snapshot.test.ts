import assert from "node:assert/strict"
import test from "node:test"
import { createNavigationSnapshot, readNavigationSnapshot, unavailableReturnPath } from "../../lib/navigation/snapshot.ts"

const secret = "synthetic-navigation-secret-only"
const sessionToken = "synthetic-session"
const user = { idUser: "SYNTHETIC", typeUser: "VIEWER" as const, estSuperAdmin: false }
const authorizations = [{ idUserAutorisation: "SYNTHETIC-AUTH", idUser: user.idUser, idBlocAutorisation: "AUT-SPT" as const, statut: "ACTIF" as const, dateDebut: "2000-01-01", dateFin: "" }]

test("un menu confirmé est conservé pour l'affichage uniquement et reste lié à la session", () => {
  const value = createNavigationSnapshot({ user, authorizations, sessionToken, expires: 2000000000, secret })
  const menu = readNavigationSnapshot({ value, sessionToken, secret, nowSeconds: 1900000000 })!
  assert.equal(menu.access["AUT-SPT:READ"], true)
  assert.equal(menu.access["AUT-ADM:READ"], false)
  assert.equal(menu.access["AUT-COM:READ"], false)
  assert.equal(menu.isSuperAdmin, false)
  assert(Object.entries(menu.access).filter(([key]) => key.endsWith(":WRITE")).every(([, value]) => value === false))
  assert.equal(readNavigationSnapshot({ value, sessionToken: "other-session", secret, nowSeconds: 1900000000 }), null)
  assert.equal(readNavigationSnapshot({ value, sessionToken, secret, nowSeconds: 2000000000 }), null)
  assert.equal(readNavigationSnapshot({ value: value + "tampered", sessionToken, secret, nowSeconds: 1900000000 }), null)
  assert.equal(readNavigationSnapshot({ value, sessionToken, secret: "wrong-secret", nowSeconds: 1900000000 }), null)
  assert.equal(readNavigationSnapshot({ value, secret }), null)
})

test("un marqueur super-admin VIEWER ne rend pas les menus privilégiés visibles", () => {
  const value = createNavigationSnapshot({ user: { ...user, estSuperAdmin: true }, authorizations: [], sessionToken, expires: 2000000000, secret })
  const menu = readNavigationSnapshot({ value, sessionToken, secret, nowSeconds: 1900000000 })!
  assert.equal(menu.isSuperAdmin, false)
  assert.equal(menu.access["AUT-SPT:READ"], false)
})

test("réessayer conserve la rubrique et les paramètres, sans redirection externe", () => {
  for (const path of ["/dashboard/competitions/COMP001", "/dashboard/acteurs/athletes?statut=ACTIF", "/dashboard/federations", "/dashboard/documents", "/dashboard/site-web/actualites"]) assert.equal(unavailableReturnPath(path), path)
  for (const path of [undefined, ["/dashboard", "/dashboard/documents"], "https://example.invalid", "//example.invalid", "/login", "/dashboard-evil", "/dashboard/../../login", "/dashboard\\evil", "/dashboard\nwrong"]) assert.equal(unavailableReturnPath(path), "/dashboard")
})
