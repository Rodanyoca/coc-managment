import test from "node:test"
import assert from "node:assert/strict"
import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { readFileSync } from "node:fs"
import { CONTENT_SCHEMAS, headersFor, isResource } from "../../lib/site-web/schema.ts"
import { validateContent, isPublished, safeLink } from "../../lib/site-web/validation.ts"
import { loadServerModule } from "../../scripts/cpu-audit/module-harness.mjs"
import { authorize } from "../../lib/auth/authorization.ts"
import { routePolicy } from "../../lib/auth/route-policy.ts"

const root = process.cwd()
const base = resource => Object.fromEntries(CONTENT_SCHEMAS[resource].fields.map(field => [field.key, field.type === "boolean" ? "FALSE" : field.type === "status" ? "PUB001" : field.type === "number" ? "1" : field.type === "date" && field.required ? "2026-10-23" : field.required ? "Exemple synthétique" : ""]))
const sourceId = "1cVIijJBdyhNhMwVIWtMzZHzWPvBqM5W73rYj0Ws8qMM"
const config = { SITE_WEB_SPREADSHEET_ID: sourceId }
function fixture(initial = {}) {
  const records = Object.fromEntries(Object.keys(CONTENT_SCHEMAS).map(resource => [CONTENT_SCHEMAS[resource].sheet, (initial[resource] || []).map(row => ({ ...row }))]))
  records.STATUTS_PUBLICATION = ["PUB001", "PUB002", "PUB003"].map((id, n) => ({ id_statut_publication: id, nom_statut_publication: ["Brouillon", "Publié", "Archivé"][n] }))
  const reads = [], writes = [], uploads = [], state = { offline: false, failWrite: false, duplicateHeaders: false }
  const sheetHeaders = sheet => sheet === "STATUTS_PUBLICATION" ? ["id_statut_publication", "nom_statut_publication", "observation"] : headersFor(Object.keys(CONTENT_SCHEMAS).find(resource => CONTENT_SCHEMAS[resource].sheet === sheet))
  const sheets = {
    getSheetsTables: async input => { assert.equal(input.spreadsheetId, sourceId); reads.push({ sheets: [...input.sheetNames], fresh: true }); if (state.offline) throw Error("source indisponible"); return Object.fromEntries(input.sheetNames.map(sheet => [sheet, { headers: sheetHeaders(sheet), rows: records[sheet].map(row => ({ ...row })) }])) },
    getSheetRows: async input => { reads.push({ sheets: [input.sheetName], fresh: false }); if (state.offline) throw Error("source indisponible"); return records[input.sheetName] },
    getSheetHeaders: async input => sheetHeaders(input.sheetName),
    appendSheetRow: async input => { if (state.failWrite) throw Error("écriture indisponible"); writes.push(input); records[input.sheetName].push({ ...input.row }) },
    updateSheetCells: async input => { if (state.failWrite) throw Error("écriture indisponible"); writes.push(input); const row = records[input.sheetName].find(row => row[input.idColumn] === input.idValue); Object.assign(row, Object.fromEntries(input.updates.map(item => [item.column, item.value]))) },
  }
  return { records, reads, writes, uploads, state, module: () => loadServerModule(root, "lib/site-web/content.ts", { "node:crypto": { createHash }, "@/lib/google/sheets": sheets, "./config": config, "./media": { managedMedia: () => null, uploadContentMedia: async (resource, id, field) => { uploads.push({ resource, id, field }); return `https://fixture.invalid/${id}/${field}` } } }) }
}

test("all nine entity schemas match the observed live headers; unique content source", () => {
  const evidence = JSON.parse(readFileSync("docs/implementation/site-web-unifie-2026-10-23/schema-observe.json", "utf8"))
  for (const resource of Object.keys(CONTENT_SCHEMAS)) assert.deepEqual([...headersFor(resource)].sort(), evidence.reads.find(read => read.range.startsWith(CONTENT_SCHEMAS[resource].sheet + "!")).values[0].sort())
  assert(isResource("documents")); assert(!isResource("__proto__")); assert(!isResource("jeux"))
  assert.match(readFileSync("lib/site-web/config.ts", "utf8"), new RegExp(sourceId))
})
test("text stays plain; URLs, calendar dates, periods, statuses and booleans validated", () => {
  for (const resource of Object.keys(CONTENT_SCHEMAS)) assert.doesNotThrow(() => validateContent(resource, base(resource)))
  assert.equal(validateContent("actualites", { ...base("actualites"), contenu: "<script>alert(1)</script>" }).contenu, "<script>alert(1)</script>")
  for (const value of ["javascript:alert(1)", "//bad.example/x", "/\\evil", "https://user:pass@host.example"]) assert(!safeLink(value, true))
  for (const patch of [{ date_debut: "2026-02-30" }, { date_fin: "2025-01-01" }, { id_statut_publication: "PUB999" }, { ordre_affichage: "1.5" }, { est_mis_en_avant: "perhaps" }]) assert.throws(() => validateContent("evenements", { ...base("evenements"), ...patch }))
  assert.throws(() => validateContent("sliders", { ...base("sliders"), libelle_bouton: "Voir", lien_bouton: "" }))
  assert.throws(() => validateContent("sliders", { ...base("sliders"), date_debut_publication: "2026-10-24", date_fin_publication: "2026-10-23" }))
  assert.equal(validateContent("communiques", { ...base("communiques"), fichier_url: "https://example.invalid/old.pdf", id_document_public: "DOC-LOCAL" }).fichier_url, "")
})
test("only PUB002 is eligible; highlighted is not published and dates use Kinshasa", () => {
  const now = new Date("2026-10-22T23:30:00Z")
  assert(!isPublished("actualites", { id_statut_publication: "PUB001", est_mis_en_avant: "TRUE" }, now))
  assert(isPublished("sliders", { id_statut_publication: "PUB002", date_debut_publication: "2026-10-23", date_fin_publication: "2026-10-23" }, now))
  assert(!isPublished("sliders", { id_statut_publication: "PUB002", date_debut_publication: "2026-10-24" }, now))
  assert(!isPublished("sliders", { id_statut_publication: "PUB002", date_fin_publication: "not-date" }, now))
  assert(!isPublished("actualites", { id_statut_publication: "PUB002", date_publication: "2026-10-24" }, now))
})
test("each block creates and updates only its source; IDs survive retries and deletions", async () => {
  for (const resource of Object.keys(CONTENT_SCHEMAS)) {
    const f = fixture({ categories: [{ ...base("categories"), id_categorie_actualite: "CAT" }], galeries: [{ ...base("galeries"), id_galerie: "GAL" }] }), mod = await f.module()
    const row = base(resource); if (resource === "actualites") row.id_categorie_actualite = "CAT"; if (resource === "photos") row.id_galerie = "GAL"; if (resource === "categories") row.nom_categorie_actualite = "Nouvelle catégorie synthétique"
    const id = mod.contentId(resource, "actor", "stable-request")
    const files = ["photos", "documents"].includes(resource) ? { fichier_url: {} } : {}
    const saved = await mod.saveContent(resource, row, files, id, false)
    assert.equal(saved[CONTENT_SCHEMAS[resource].id], id)
    assert.equal(f.writes.length, 1)
    await mod.saveContent(resource, row, files, id, false); assert.equal(f.writes.length, 1)
    const next = { ...saved, [CONTENT_SCHEMAS[resource].label]: "Modification locale" }
    await mod.saveContent(resource, next, {}, id, true); assert.equal(f.writes.length, 2)
    assert(f.writes.every(write => write.spreadsheetId === sourceId))
    assert.notEqual(mod.contentId(resource, "actor", "new-request"), id)
  }
})
test("publication validates related gallery and PDF; unpublish dependency is protected", async () => {
  const f = fixture({ documents: [{ ...base("documents"), id_document_public: "DOC", fichier_url: "https://legacy.invalid/pdf" }], categories: [{ ...base("categories"), id_categorie_actualite: "CAT" }], galeries: [{ ...base("galeries"), id_galerie: "GAL" }] }), mod = await f.module()
  await assert.rejects(mod.saveContent("communiques", { ...base("communiques"), id_document_public: "DOC", id_statut_publication: "PUB002" }, {}, "COM", false), /publiez/)
  await assert.rejects(mod.saveContent("actualites", { ...base("actualites"), id_categorie_actualite: "missing" }, {}, "NEWS", false), /introuvable/)
  f.records.DOCUMENTS_PUBLICS[0].id_statut_publication = "PUB002"
  await mod.saveContent("communiques", { ...base("communiques"), id_document_public: "DOC", id_statut_publication: "PUB002" }, {}, "COM", false)
  await assert.rejects(mod.saveContent("documents", { ...f.records.DOCUMENTS_PUBLICS[0], id_statut_publication: "PUB003" }, {}, "DOC", true), /publication/)
  await assert.rejects(mod.saveContent("actualites", { ...base("actualites"), id_categorie_actualite: "CAT", id_galerie: "GAL", id_statut_publication: "PUB002" }, {}, "NEWS", false), /publiez/)
})
test("categories prevent normalized duplicates; duplicate IDs and outages fail closed", async () => {
  const f = fixture({ categories: [{ ...base("categories"), nom_categorie_actualite: "Sport COC", id_categorie_actualite: "CAT" }] }), mod = await f.module()
  await assert.rejects(mod.saveContent("categories", { ...base("categories"), nom_categorie_actualite: "  SPORT   COC " }, {}, "OTHER", false), /existe/)
  f.state.offline = true
  await assert.rejects(mod.readContent("categories", { fresh: true }), /indisponible/)
  await assert.rejects(mod.saveContent("categories", base("categories"), {}, "OTHER", false), /indisponible/)
  assert.equal(f.writes.length, 0)
  f.state.offline = false; f.records.CATEGORIES_ACTUALITES.push({ ...f.records.CATEGORIES_ACTUALITES[0] })
  await assert.rejects(mod.readContent("categories"), /dupliqué/)
})
test("gallery photos are projected after filtering; no private actor or document enrichment", async () => {
  const f = fixture({ photos: [{ ...base("photos"), id_media_galerie: "P1", id_galerie: "G1", legende: "Photo A" }, { ...base("photos"), id_media_galerie: "P2", id_galerie: "G2", legende: "Photo B" }] }), mod = await f.module()
  assert.equal((await mod.readContent("photos", { galleryId: "G1" })).length, 1)
  assert.deepEqual(f.reads.flatMap(read => read.sheets), ["MEDIAS_GALERIE_SITE"])
  const before = f.reads.length
  await mod.readContent("galeries")
  assert.deepEqual(f.reads.slice(before).flatMap(read => read.sheets), ["GALERIES_SITE"])
})
test("arbitrary private file URL cannot be attached; failed writes preserve data", async () => {
  const f = fixture(), mod = await f.module()
  await assert.rejects(mod.saveContent("documents", { ...base("documents"), fichier_url: "https://drive.google.com/file/d/PRIVATE/view" }, {}, "D", false), /envoi de fichier/)
  assert.equal(f.uploads.length, 0)
  f.state.failWrite = true
  await assert.rejects(mod.saveContent("documents", base("documents"), { fichier_url: {} }, "D", false), /indisponible/)
  assert.equal(f.records.DOCUMENTS_PUBLICS.length, 0)
})
test("Communication permissions cover every new resource and reject VIEWER writes", () => {
  for (const resource of [...Object.keys(CONTENT_SCHEMAS), "uploads"]) for (const method of ["GET", "POST", "PUT"]) {
    const policy = routePolicy(`/api/site-web/${resource}`, method)
    assert.deepEqual(policy.blocks, ["AUT-COM"])
    assert(!authorize({ user: { idUser: "VIEW", typeUser: "VIEWER", estSuperAdmin: false }, authorizations: [], requirement: policy, action: policy.action }).allowed)
  }
})
test("signed upload claims bind actor, resource, record, field, kind and expiry", async () => {
  const mod = await loadServerModule(root, "lib/site-web/upload-tokens.ts", { "node:crypto": { createHmac, timingSafeEqual } })
  const claim = { kind: "asset", actor: "A", resource: "documents", id: "D", field: "fichier_url", mime: "application/pdf", size: 10, expires: Date.now() + 10000, fileId: "fixture" }
  const token = mod.signUpload(claim)
  assert.equal(mod.verifyUpload(token, "A", "asset").fileId, "fixture")
  assert.throws(() => mod.verifyUpload(token, "B", "asset"))
  assert.throws(() => mod.verifyUpload(token, "A", "session"))
  assert.throws(() => mod.verifyUpload(token + "x", "A", "asset"))
  assert.throws(() => mod.verifyUpload(mod.signUpload({ ...claim, expires: 0 }), "A", "asset"))
})
