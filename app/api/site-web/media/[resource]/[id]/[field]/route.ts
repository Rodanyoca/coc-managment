import { NextResponse } from "next/server"
import { canAccess } from "@/lib/auth"
import { downloadDriveFile, verifyPrivateDriveUpload } from "@/lib/google/drive"
import { CONTENT_SCHEMAS, isResource } from "@/lib/site-web/schema"
import { readContent } from "@/lib/site-web/content"
import { imageMime, managedMedia, readableMediaFolders } from "@/lib/site-web/media"
import { isPublished } from "@/lib/site-web/validation"
import { assertPdfSignature } from "@/lib/documents/validation"

export const runtime = "nodejs"
export const maxDuration = 60
export async function GET(request: Request, context: { params: Promise<{ resource: string; id: string; field: string }> }) {
  try {
    const { resource, id, field } = await context.params
    if (!isResource(resource)) return new Response(null, { status: 404 })
    const definition = CONTENT_SCHEMAS[resource].fields.find(f => f.key === field && ["image", "pdf"].includes(f.type))
    if (!definition) return new Response(null, { status: 404 })
    const row = (await readContent(resource, { fresh: true })).find(record => record[CONTENT_SCHEMAS[resource].id] === id)
    const media = row && managedMedia(row[field]), url = new URL(request.url)
    if (!row || !media || media.path !== url.pathname || media.fileId !== url.searchParams.get("file")) return new Response(null, { status: 404 })
    let published = isPublished(resource, row)
    if (resource === "photos") { const gallery = (await readContent("galeries", { fresh: true })).find(item => item.id_galerie === row.id_galerie); published = Boolean(gallery && isPublished("galeries", gallery)) }
    if (!published && !(await canAccess("AUT-COM", "READ"))) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } })
    // Check folder, sharing, MIME and size before reading any file bytes.
    const metadata = await verifyPrivateDriveUpload(media.fileId, readableMediaFolders(definition.type === "pdf"), null, definition.type === "pdf" ? "application/pdf" : "image/", (definition.type === "pdf" ? 25 : 5) * 1024 * 1024)
    const file = await downloadDriveFile(media.fileId, { mimeType: metadata.mimeType, name: id })
    const mime = definition.type === "pdf" ? "application/pdf" : imageMime(file.buffer)
    if (definition.type === "pdf") assertPdfSignature(file.buffer)
    if (!mime || mime !== metadata.mimeType || file.buffer.length !== metadata.size) return new Response(null, { status: 404 })
    const name = `${id}.${definition.type === "pdf" ? "pdf" : mime.split("/")[1]}`.replace(/[^a-zA-Z0-9._-]/g, "_")
    return new Response(new Uint8Array(file.buffer), { headers: { "Content-Type": mime, "Content-Disposition": `${url.searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="${name}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox; default-src 'none'", ...(published ? { "Access-Control-Allow-Origin": "*" } : {}) } })
  } catch { return NextResponse.json({ error: "Média temporairement indisponible." }, { status: 503, headers: { "Cache-Control": "no-store" } }) }
}
