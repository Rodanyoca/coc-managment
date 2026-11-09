import "server-only"
import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { authorizeWithSource } from "@/lib/auth/authorization"
import { getAuthorizationsForUser } from "@/lib/users/data"
import { UsersRepository } from "@/lib/users/repository"
import { createGoogleUsersSheetsAdapter } from "@/lib/users/google-adapter"
import { writeAudit } from "@/lib/audit/logger"
import { apiErrorPayload } from "@/lib/api/errors"
import { CONTENT_SCHEMAS, isResource, type ContentRow, type Resource } from "./schema"
import { contentId, contentOptions, publicationStatuses, readContent, saveContent } from "./content"
import { managedMedia, mediaBase } from "./media"
import { verifyUpload } from "./upload-tokens"
import { ContentInputError } from "./validation"

export async function communicationSession(action: "READ" | "WRITE") {
  const session = await getSession()
  if (!session) throw Object.assign(new Error("Authentification requise."), { httpStatus: 401 })
  if (session.doitChangerMotDePasse) throw Object.assign(new Error("Activation requise."), { httpStatus: 403 })
  const decision = await authorizeWithSource({ user: session, requirement: { scope: "BUSINESS", blocks: ["AUT-COM"] }, action, loadAuthorizations: () => getAuthorizationsForUser(session.idUser) })
  if (!decision.allowed) throw Object.assign(new Error(decision.reason === "SOURCE_UNAVAILABLE" ? "Service d’autorisation indisponible." : "Accès refusé."), { httpStatus: decision.reason === "SOURCE_UNAVAILABLE" ? 503 : 403 })
  return session
}
export function contentFailure(error: unknown, requestId: string = randomUUID()) {
  const hint = error instanceof ContentInputError ? 400 : typeof error === "object" && error && "httpStatus" in error ? Number(error.httpStatus) : undefined
  const failure = apiErrorPayload(error, requestId, hint, { field: error instanceof ContentInputError ? error.field : undefined })
  return NextResponse.json(failure.payload, { status: failure.status, headers: { "Cache-Control": "no-store" } })
}
function resourceOf(value: string): Resource { if (!isResource(value)) throw Object.assign(new Error("Rubrique introuvable."), { httpStatus: 404 }); return value }

export async function contentGet(request: Request, name: string) {
  try {
    await communicationSession("READ")
    const resource = resourceOf(name), url = new URL(request.url)
    if (url.searchParams.get("options") === "1") return NextResponse.json({ options: await contentOptions(resource) }, { headers: { "Cache-Control": "no-store" } })
    const galleryId = resource === "photos" ? url.searchParams.get("galerie") || "" : undefined
    if (resource === "photos" && !galleryId) throw new ContentInputError("Sélectionnez une galerie.")
    const [rows, statuses] = await Promise.all([readContent(resource, { fresh: true, galleryId }), ["photos", "categories"].includes(resource) ? Promise.resolve([]) : publicationStatuses(true)])
    return NextResponse.json({ rows, statuses, ...(resource === "sliders" ? { sliders: rows } : {}) }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) { return contentFailure(error) }
}

// Local serialization only. Sheets does not provide a cross-instance unique constraint.
const siteMutationState = (globalThis as typeof globalThis & { __cocSiteWebMutationState?: { tail: Promise<unknown> } }).__cocSiteWebMutationState ??= { tail: Promise.resolve() }
export async function contentWrite(request: Request, name: string, updateId?: string) {
  let session: Awaited<ReturnType<typeof communicationSession>>, resource: Resource
  const requestId = request.headers.get("x-request-id") || ""
  try { session = await communicationSession("WRITE"); resource = resourceOf(name); if (!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId)) throw new ContentInputError("Identifiant de requête obligatoire ou invalide.") }
  catch (error) { return contentFailure(error, requestId || randomUUID()) }
  const operation = async () => {
    const adapter = createGoogleUsersSheetsAdapter()
    try {
      // A queued request must not retain rights revoked while waiting for another write.
      const currentSession = await communicationSession("WRITE")
      if (currentSession.idUser !== session.idUser) throw Object.assign(new Error("Session invalide."), { httpStatus: 401 })
      const id = updateId ?? contentId(resource, session.idUser, requestId)
      const processed = (await new UsersRepository(adapter).getAuditLog()).find(entry => entry.requestId === requestId && entry.resultat === "SUCCES")
      if (processed) return NextResponse.json({ error: "Cette requête a déjà été traitée. Rechargez la rubrique.", alreadyProcessed: true, request_id: requestId }, { status: 409 })
      const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data")
      let input: ContentRow, assetTokens: Record<string, string> = {}
      const files: Record<string, File> = {}
      if (Number(request.headers.get("content-length")) > 4 * 1024 * 1024) throw new ContentInputError("Utilisez l’envoi de fichiers par fragments.")
      if (isMultipart) {
        const form = await request.formData()
        input = JSON.parse(String(form.get("data") || "{}"))
        for (const f of CONTENT_SCHEMAS[resource].fields) { const file = form.get(f.key) ?? (resource === "sliders" && f.key === "image_url" ? form.get("image") : null); if (file instanceof File && file.size) files[f.key] = file }
      } else { const body = await request.json(); input = body.row; assetTokens = body.assets || {} }
      if (!input || typeof input !== "object" || Array.isArray(input) || !assetTokens || typeof assetTokens !== "object" || Array.isArray(assetTokens)) throw new ContentInputError("Données de contenu invalides.")
      const assets: Record<string, string> = {}
      for (const [field, token] of Object.entries(assetTokens)) {
        const claim = verifyUpload(String(token), session.idUser, "asset")
        if (claim.resource !== resource || claim.id !== id || claim.field !== field || !claim.fileId) throw new ContentInputError("Le fichier envoyé ne correspond pas à cette fiche.")
        assets[field] = `${mediaBase()}/api/site-web/media/${resource}/${encodeURIComponent(id)}/${field}?file=${encodeURIComponent(claim.fileId)}`
        if (!managedMedia(assets[field])) throw new ContentInputError("Fichier invalide.")
      }
      await writeAudit({ adapter, actorId: session.idUser, action: "SITE_WEB_DEMANDE", typeObjet: CONTENT_SCHEMAS[resource].sheet, objectId: id, result: "SUCCES", requestId: `${requestId}:begin` })
      const row = await saveContent(resource, input, files, id, Boolean(updateId), assets)
      await writeAudit({ adapter, actorId: session.idUser, action: updateId ? "SITE_WEB_MODIFICATION" : "SITE_WEB_CREATION", typeObjet: CONTENT_SCHEMAS[resource].sheet, objectId: id, result: "SUCCES", requestId })
      return NextResponse.json({ ok: true, row, ...(resource === "sliders" ? { slider: row } : {}), request_id: requestId }, { status: updateId ? 200 : 201 })
    } catch (error) {
      await writeAudit({ adapter, actorId: session.idUser, action: "SITE_WEB_ECHEC", typeObjet: CONTENT_SCHEMAS[resource].sheet, result: "ECHEC", requestId: `${requestId}:error` }).catch(() => undefined)
      return contentFailure(error, requestId)
    }
  }
  const result = siteMutationState.tail.then(operation, operation)
  siteMutationState.tail = result.catch(() => undefined)
  return result
}
