import test from "node:test"
import assert from "node:assert/strict"
import { loadServerModule } from "../../scripts/cpu-audit/module-harness.mjs"
import { isPublished, ContentInputError } from "../../lib/site-web/validation.ts"
import { CONTENT_SCHEMAS, isResource } from "../../lib/site-web/schema.ts"
const root = process.cwd()
const request = (path, body, id = "request-fixture-123") => new Request(`https://fixture.invalid${path}`, { method: "POST", headers: { "Content-Type": "application/json", "x-request-id": id }, body: JSON.stringify(body) })

test("read/write handlers authorize before source reads, uploads or audit; source failure refuses access", async () => {
  let user = null, allowed = true, unavailable = false, reads = 0, saves = 0, audits = [], processed = []
  const mod = await loadServerModule(root, "lib/site-web/http.ts", {
    "node:crypto": { randomUUID: () => "fixture-request-id" }, "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/auth": { getSession: async () => user },
    "@/lib/auth/authorization": { authorizeWithSource: async ({ user, action }) => ({ allowed: !unavailable && allowed && !(user.typeUser === "VIEWER" && action === "WRITE"), reason: unavailable ? "SOURCE_UNAVAILABLE" : "EXPLICIT_ASSIGNMENT_REQUIRED" }) },
    "@/lib/users/data": { getAuthorizationsForUser: async () => [] },
    "@/lib/users/repository": { UsersRepository: class { async getAuditLog() { return processed } } },
    "@/lib/users/google-adapter": { createGoogleUsersSheetsAdapter: () => ({}) },
    "@/lib/audit/logger": { writeAudit: async input => { audits.push(input); if (input.requestId === "request-fixture-123") processed.push({ requestId: input.requestId, resultat: "SUCCES" }) } },
    "./content": { contentId: () => "NEW-ID", contentOptions: async () => { reads++; return {} }, publicationStatuses: async () => [], readContent: async () => { reads++; return [] }, saveContent: async () => { saves++; return { id_actualite: "NEW-ID" } } },
    "./media": { managedMedia: () => null, mediaBase: () => "https://fixture.invalid" }, "./upload-tokens": { verifyUpload: () => { throw Error("forged") } },
  })
  assert.equal((await mod.contentGet(new Request("https://fixture.invalid/api/site-web/actualites"), "actualites")).status, 401)
  assert.equal((await mod.contentWrite(request("/api/site-web/actualites", { row: {} }), "actualites")).status, 401)
  user = { idUser: "V", typeUser: "VIEWER" }
  assert.equal((await mod.contentWrite(request("/api/site-web/actualites", { row: {} }), "actualites")).status, 403)
  user = { idUser: "A", typeUser: "ADMIN" }; allowed = false
  assert.equal((await mod.contentGet(new Request("https://fixture.invalid/api/site-web/actualites"), "actualites")).status, 403)
  unavailable = true
  assert.equal((await mod.contentGet(new Request("https://fixture.invalid/api/site-web/actualites"), "actualites")).status, 503)
  assert.equal(reads + saves + audits.length, 0)
  unavailable = false; allowed = true
  assert.equal((await mod.contentWrite(request("/api/site-web/actualites", { row: {} }), "actualites")).status, 201)
  assert.equal((await mod.contentWrite(request("/api/site-web/actualites", { row: {} }), "actualites")).status, 409)
  assert.equal(saves, 1); assert.equal(audits.length, 2)
  assert.equal((await mod.contentGet(new Request("https://fixture.invalid/api/site-web/jeux"), "jeux")).status, 404)
})

test("public media is inaccessible for draft/archive/future slider; no private Drive download before eligibility", async () => {
  let access = false, downloads = 0, offline = false, wrongFolder = false
  const records = { documents: [{ id_document_public: "DOC", id_statut_publication: "PUB001", fichier_url: "managed" }], galeries: [{ id_galerie: "GAL", id_statut_publication: "PUB001" }], photos: [{ id_media_galerie: "PHOTO", id_galerie: "GAL", fichier_url: "managed-photo" }], sliders: [{ id_slide: "SLD", image_url: "managed-slide", id_statut_publication: "PUB002", date_debut_publication: "2999-01-01" }] }
  let contextResource = "documents", contextId = "DOC", contextField = "fichier_url"
  const mod = await loadServerModule(root, "app/api/site-web/media/[resource]/[id]/[field]/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } }, "@/lib/auth": { canAccess: async () => access },
    "@/lib/google/drive": { downloadDriveFile: async () => { downloads++; return { buffer: Buffer.from("%PDF-synthetic"), mimeType: "application/pdf" } }, verifyPrivateDriveUpload: async () => { if (wrongFolder) throw Error("private business folder"); return { size: Buffer.byteLength("%PDF-synthetic"), mimeType: contextResource === "documents" ? "application/pdf" : "image/png" } } },
    "@/lib/site-web/schema": { CONTENT_SCHEMAS, isResource }, "@/lib/site-web/content": { readContent: async resource => { if (offline) throw Error("offline"); return records[resource] } },
    "@/lib/site-web/media": { managedMedia: () => ({ fileId: "file-fixture", path: `/api/site-web/media/${contextResource}/${contextId}/${contextField}` }), imageMime: () => "image/png", readableMediaFolders: () => ["site-private"] },
    "@/lib/site-web/validation": { isPublished }, "@/lib/documents/validation": { assertPdfSignature: buffer => { assert.equal(buffer.subarray(0, 5).toString(), "%PDF-") } },
  })
  const get = () => mod.GET(new Request(`https://fixture.invalid/api/site-web/media/${contextResource}/${contextId}/${contextField}?file=file-fixture`), { params: Promise.resolve({ resource: contextResource, id: contextId, field: contextField }) })
  assert.equal((await get()).status, 404); assert.equal(downloads, 0)
  records.documents[0].id_statut_publication = "PUB003"; assert.equal((await get()).status, 404)
  access = true; assert.equal((await get()).status, 200); assert.equal(downloads, 1)
  access = false; records.documents[0].id_statut_publication = "PUB002"
  const published = await get(); assert.equal(published.status, 200); assert.equal(published.headers.get("cache-control"), "private, no-store")
  contextResource = "sliders"; contextId = "SLD"; contextField = "image_url"; assert.equal((await get()).status, 404)
  contextResource = "communiques"; contextId = "COM"; contextField = "image_url"; access = true; const beforeLegacy = downloads; assert.equal((await get()).status, 404); assert.equal(downloads, beforeLegacy); access = false
  contextResource = "photos"; contextId = "PHOTO"; contextField = "fichier_url"; assert.equal((await get()).status, 404)
  records.galeries[0].id_statut_publication = "PUB002"; assert.equal((await get()).status, 200)
  wrongFolder = true; assert.equal((await get()).status, 503)
  offline = true; assert.equal((await get()).status, 503)
})

test("client uploads a 25 MiB PDF in bounded fragments without putting binary data in Sheets", async () => {
  const chunks = [], requests = []
  const client = await loadServerModule(root, "lib/site-web/client-upload.ts", {
    "@/lib/api/client": { apiFetch: async (url, options) => {
      requests.push({ url, method: options.method })
      if (options.method === "POST") return Response.json({ token: "fixture-session", chunkBytes: 3 * 1024 * 1024 })
      const start = Number(options.headers["x-upload-start"]), length = options.body.size
      chunks.push(length)
      return Response.json({ next: start + length, ...(start + length === 25 * 1024 * 1024 ? { asset: "signed-fixture-asset" } : {}) })
    } },
  })
  const file = new File([Buffer.alloc(25 * 1024 * 1024)], "synthetic.pdf", { type: "application/pdf" })
  assert.equal(await client.sendContentFile({ resource: "documents", field: "fichier_url", requestId: "fixture-request", file }), "signed-fixture-asset")
  assert.equal(chunks.length, 9); assert(chunks.every(length => length <= 3 * 1024 * 1024)); assert.equal(chunks.reduce((a, b) => a + b), file.size)
  assert(requests.every(request => request.url === "/api/site-web/uploads"))
})

test("fragmented upload checks limits, signatures, ownership and completed private bytes", async () => {
  let creates = 0, puts = 0, completedVerified = 0, activeClaim, declaredSize = 14
  const mod = await loadServerModule(root, "app/api/site-web/uploads/route.ts", {
    "node:crypto": { randomUUID: () => "fixture-uuid" }, "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/site-web/http": { communicationSession: async () => ({ idUser: "A" }), contentFailure: error => Response.json({ error: error.message }, { status: 400 }) },
    "@/lib/site-web/schema": { CONTENT_SCHEMAS, isResource },
    "@/lib/site-web/content": { contentId: () => "DOC", readContent: async () => [{ id_document_public: "DOC" }] },
    "@/lib/site-web/media": { mediaFolder: () => "private-site-folder", SITE_IMAGE_MAX_BYTES: 5 * 1024 * 1024, imageMime: () => null },
    "@/lib/site-web/upload-tokens": { signUpload: claim => { activeClaim = claim; return claim.kind }, verifyUpload: () => activeClaim },
    "@/lib/google/drive": { startPrivateDriveUpload: async () => { creates++; return "https://www.googleapis.com/upload/fixture" }, sendPrivateDriveChunk: async () => { puts++; return { next: declaredSize, fileId: "drive-fixture" } }, verifyPrivateDriveUpload: async () => { completedVerified++ }, downloadDriveFile: async () => ({ buffer: Buffer.from("%PDF-synthetic") }) },
    "@/lib/documents/validation": { assertPdfSignature: buffer => { if (buffer.subarray(0, 5).toString() !== "%PDF-") throw Error("signature") } },
    "@/lib/documents/limits": { DOCUMENT_PDF_MAX_SIZE_BYTES: 25 * 1024 * 1024 }, "@/lib/site-web/validation": { ContentInputError },
    "@/lib/audit/logger": { writeAudit: async () => {} }, "@/lib/users/google-adapter": { createGoogleUsersSheetsAdapter: () => ({}) },
  })
  const init = size => mod.POST(request("/api/site-web/uploads", { resource: "documents", field: "fichier_url", requestId: "fixture-request", mime: "application/pdf", size }))
  assert.equal((await init(26 * 1024 * 1024)).status, 400); assert.equal(creates, 0)
  declaredSize = Buffer.byteLength("%PDF-synthetic")
  assert.equal((await init(declaredSize)).status, 200)
  const put = buffer => mod.PUT(new Request("https://fixture.invalid/api/site-web/uploads", { method: "PUT", headers: { "x-upload-token": "session", "x-upload-start": "0" }, body: buffer }))
  assert.equal((await put(Buffer.from("not-a-pdf"))).status, 400); assert.equal(puts, 0)
  const response = await put(Buffer.from("%PDF-synthetic")); assert.equal(response.status, 200); assert.equal((await response.json()).asset, "asset"); assert.equal(completedVerified, 1);const beforeLegacy=puts;activeClaim={...activeClaim,resource:"communiques",field:"image_url"};assert.equal((await put(Buffer.from("%PDF-synthetic"))).status,400);assert.equal(puts,beforeLegacy);assert.equal((await mod.POST(request("/api/site-web/uploads",{resource:"communiques",field:"image_url",size:10,mime:"image/jpeg",requestId:"fixture-request"}))).status,400)
})

test("a permission revoked while a mutation waits in the local queue is checked again", async () => {
  let allowed = true, decisions = 0, saves = 0, release, firstStarted, secondChecked
  const started = new Promise(resolve => { firstStarted = resolve }), wait = new Promise(resolve => { release = resolve }), secondAuth = new Promise(resolve => { secondChecked = resolve })
  const mod = await loadServerModule(root, "lib/site-web/http.ts", {
    "node:crypto": { randomUUID: () => "fixture-request-id" }, "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/auth": { getSession: async () => ({ idUser: "A", typeUser: "ADMIN" }) },
    "@/lib/auth/authorization": { authorizeWithSource: async () => { const decision = { allowed, reason: "EXPLICIT_ASSIGNMENT_REQUIRED" }; if (++decisions === 3) secondChecked(); return decision } },
    "@/lib/users/data": { getAuthorizationsForUser: async () => [] },
    "@/lib/users/repository": { UsersRepository: class { async getAuditLog() { return [] } } },
    "@/lib/users/google-adapter": { createGoogleUsersSheetsAdapter: () => ({}) }, "@/lib/audit/logger": { writeAudit: async () => {} },
    "./content": { contentId: (_r, _a, request) => request, contentOptions: async () => ({}), publicationStatuses: async () => [], readContent: async () => [], saveContent: async () => { saves++; firstStarted(); await wait; return { id_actualite: "fixture" } } },
    "./media": { managedMedia: () => null, mediaBase: () => "https://fixture.invalid" }, "./upload-tokens": { verifyUpload: () => ({}) },
  })
  const first = mod.contentWrite(request("/api/site-web/actualites", { row: {} }, "request-fixture-first"), "actualites")
  await started
  const second = mod.contentWrite(request("/api/site-web/actualites", { row: {} }, "request-fixture-second"), "actualites")
  await secondAuth; allowed = false; release()
  assert.equal((await first).status, 201); assert.equal((await second).status, 403); assert.equal(saves, 1)
})
