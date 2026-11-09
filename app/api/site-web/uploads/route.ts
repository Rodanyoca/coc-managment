import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { communicationSession, contentFailure } from "@/lib/site-web/http"
import { CONTENT_SCHEMAS, isResource } from "@/lib/site-web/schema"
import { contentId, readContent } from "@/lib/site-web/content"
import { imageMime, mediaFolder, SITE_IMAGE_MAX_BYTES } from "@/lib/site-web/media"
import { signUpload, verifyUpload, type UploadClaim } from "@/lib/site-web/upload-tokens"
import { downloadDriveFile, sendPrivateDriveChunk, startPrivateDriveUpload, verifyPrivateDriveUpload } from "@/lib/google/drive"
import { assertPdfSignature } from "@/lib/documents/validation"
import { DOCUMENT_PDF_MAX_SIZE_BYTES } from "@/lib/documents/limits"
import { ContentInputError } from "@/lib/site-web/validation"
import { writeAudit } from "@/lib/audit/logger"
import { createGoogleUsersSheetsAdapter } from "@/lib/users/google-adapter"

export const runtime = "nodejs"
export const maxDuration = 60
const CHUNK_BYTES = 3 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const session = await communicationSession("WRITE"), body = await request.json()
    if (!isResource(String(body.resource))) throw new ContentInputError("Rubrique de fichier invalide.")
    const resource = body.resource as keyof typeof CONTENT_SCHEMAS
    const definition = CONTENT_SCHEMAS[resource].fields.find(f => f.key === body.field && ["image", "pdf"].includes(f.type))
    if (!definition || !/^[a-zA-Z0-9_-]{8,100}$/.test(String(body.requestId))) throw new ContentInputError("Demande de fichier invalide.")
    const pdf = definition.type === "pdf", size = Number(body.size)
    if (!Number.isSafeInteger(size) || size < 5 || size > (pdf ? DOCUMENT_PDF_MAX_SIZE_BYTES : SITE_IMAGE_MAX_BYTES)) throw new ContentInputError(pdf ? "PDF : 25 Mo maximum." : "Image : 5 Mo maximum.")
    const mime = String(body.mime)
    if (pdf ? mime !== "application/pdf" : !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mime)) throw new ContentInputError("Type de fichier non accepté.")
    const id = body.id ? String(body.id) : contentId(resource, session.idUser, body.requestId)
    if (body.id && !(await readContent(resource, { fresh: true })).some(row => row[CONTENT_SCHEMAS[resource].id] === id)) throw new ContentInputError("Fiche introuvable.")
    const uploadId = randomUUID(), folder = mediaFolder(pdf)
    await writeAudit({ adapter: createGoogleUsersSheetsAdapter(), actorId: session.idUser, action: "SITE_WEB_ENVOI_DEMANDE", typeObjet: CONTENT_SCHEMAS[resource].sheet, objectId: id, result: "SUCCES", requestId: `SITE-UPLOAD-${uploadId}:begin`, details: { field: definition.key, mime, size } })
    const url = await startPrivateDriveUpload({ folderId: folder, name: `site-${resource}-${uploadId}`, mimeType: mime, size })
    const claim: UploadClaim = { kind: "session", actor: session.idUser, resource, id, field: definition.key, mime, size, expires: Date.now() + 60 * 60 * 1000, folder, url, uploadId }
    return NextResponse.json({ token: signUpload(claim), chunkBytes: CHUNK_BYTES }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) { return contentFailure(error) }
}

async function limitedBody(request: Request) {
  const reader = request.body?.getReader(), parts: Buffer[] = []
  let total = 0
  if (!reader) throw new ContentInputError("Fragment vide.")
  try { while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > CHUNK_BYTES) { await reader.cancel(); throw new ContentInputError("Fragment trop volumineux.") }; parts.push(Buffer.from(value)) } } finally { reader.releaseLock() }
  return Buffer.concat(parts)
}
export async function PUT(request: Request) {
  try {
    const session = await communicationSession("WRITE"), claim = verifyUpload(request.headers.get("x-upload-token") || "", session.idUser, "session")
    if (!CONTENT_SCHEMAS[claim.resource]?.fields.some(field => field.key === claim.field && ["image", "pdf"].includes(field.type))) throw new ContentInputError("Ce champ de fichier n’est plus autorisé.")
    const start = Number(request.headers.get("x-upload-start")), buffer = await limitedBody(request)
    if (!claim.url || !claim.folder || !Number.isSafeInteger(start) || start < 0 || start % (256 * 1024) !== 0 || !buffer.length || start + buffer.length > claim.size || (start + buffer.length < claim.size && buffer.length % (256 * 1024) !== 0)) throw new ContentInputError("Fragment d’envoi invalide.")
    if (start === 0) { if (claim.mime === "application/pdf") assertPdfSignature(buffer); else if (imageMime(buffer) !== claim.mime) throw new ContentInputError("Signature d’image invalide.") }
    const result = await sendPrivateDriveChunk({ url: claim.url, buffer, start, total: claim.size, mimeType: claim.mime })
    if (result.next !== start + buffer.length) throw new ContentInputError("Position d’envoi inattendue. Recommencez l’envoi du fichier.")
    if (result.fileId) {
      await verifyPrivateDriveUpload(result.fileId, claim.folder, claim.size, claim.mime)
      // Verify completed bytes too: a session URL is a capability and must not bypass validation.
      const completed = await downloadDriveFile(result.fileId, { mimeType: claim.mime, name: "site-upload" })
      if (completed.buffer.length !== claim.size) throw new ContentInputError("Taille de fichier incohérente.")
      if (claim.mime === "application/pdf") assertPdfSignature(completed.buffer)
      else if (imageMime(completed.buffer) !== claim.mime) throw new ContentInputError("Image invalide.")
      await writeAudit({ adapter: createGoogleUsersSheetsAdapter(), actorId: session.idUser, action: "SITE_WEB_ENVOI_TERMINE", typeObjet: CONTENT_SCHEMAS[claim.resource].sheet, objectId: claim.id, result: "SUCCES", requestId: `SITE-UPLOAD-${claim.uploadId}:complete`, details: { field: claim.field, fileId: result.fileId, size: claim.size } })
      return NextResponse.json({ next: result.next, asset: signUpload({ ...claim, kind: "asset", url: undefined, folder: undefined, fileId: result.fileId, expires: Date.now() + 60 * 60 * 1000 }) }, { headers: { "Cache-Control": "no-store" } })
    }
    return NextResponse.json({ next: result.next }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) { return contentFailure(error) }
}
