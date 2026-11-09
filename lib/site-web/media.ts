import "server-only"
import { randomUUID } from "node:crypto"
import { assertPrivateDriveFolder, uploadPrivateFileToDrive } from "@/lib/google/drive"
import { assertPdfSignature, validatePdf } from "@/lib/documents/validation"
import { CONTENT_SCHEMAS, type Resource } from "./schema"
import { getSiteWebSlidersFolderId } from "./config"
import { ContentInputError } from "./validation"

export const SITE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export function mediaBase() {
  const url = new URL(process.env.SITE_WEB_MEDIA_BASE_URL || "https://database.coc-rdc.net")
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("SITE_WEB_MEDIA_BASE_URL doit être une origine HTTPS.")
  return url.origin
}
export function managedMedia(url: string) {
  try { const parsed = new URL(url); if (parsed.origin !== mediaBase() || !/^\/api\/site-web\/media\/[a-z]+\/[^/]+\/[a-z_]+$/.test(parsed.pathname)) return null; const fileId = parsed.searchParams.get("file"); return fileId && /^[\w-]{5,200}$/.test(fileId) ? { fileId, path: parsed.pathname, url: parsed } : null } catch { return null }
}
export function mediaFolder(pdf: boolean) {
  const folder = pdf ? process.env.GOOGLE_DRIVE_SITE_WEB_DOCUMENTS_FOLDER_ID : process.env.GOOGLE_DRIVE_SITE_WEB_IMAGES_FOLDER_ID || getSiteWebSlidersFolderId()
  if (!folder) throw new Error("Configuration manquante : GOOGLE_DRIVE_SITE_WEB_DOCUMENTS_FOLDER_ID (dossier PDF propre au Site Web).")
  const privateFolders = [process.env.GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID, process.env.GOOGLE_DRIVE_ACTEURS_PASSEPORTS_FOLDER_ID, process.env.GOOGLE_DRIVE_ACTEURS_AVATARS_FOLDER_ID].filter(Boolean)
  if (privateFolders.includes(folder)) throw new Error("Le dossier Site Web doit être distinct des dossiers métier privés.")
  return folder
}
export function readableMediaFolders(pdf: boolean) {
  const primary = mediaFolder(pdf)
  if (pdf) return [primary]
  const forbidden = [process.env.GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID, process.env.GOOGLE_DRIVE_ACTEURS_PASSEPORTS_FOLDER_ID, process.env.GOOGLE_DRIVE_ACTEURS_AVATARS_FOLDER_ID].filter(Boolean)
  return [...new Set([primary, process.env.GOOGLE_DRIVE_SITE_WEB_SLIDERS_FOLDER_ID].filter((id): id is string => Boolean(id) && !forbidden.includes(id)))]
}
export function imageMime(buffer: Buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png"
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return "image/jpeg"
  if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp"
  if (/^GIF8[79]a$/.test(buffer.subarray(0, 6).toString())) return "image/gif"
  return null
}
export async function uploadContentMedia(resource: Resource, id: string, field: string, file: File) {
  const definition = CONTENT_SCHEMAS[resource].fields.find(f => f.key === field)
  if (!definition || !["image", "pdf"].includes(definition.type)) throw new ContentInputError("Champ de fichier invalide.", field)
  const pdf = definition.type === "pdf"
  if (!file.size) throw new ContentInputError("Le fichier est vide.", field)
  if (pdf) validatePdf(file)
  else if (file.size > SITE_IMAGE_MAX_BYTES) throw new ContentInputError("L’image dépasse 5 Mo.", field)
  const buffer = Buffer.from(await file.arrayBuffer())
  const mime = pdf ? "application/pdf" : imageMime(buffer)
  if (pdf) assertPdfSignature(buffer)
  else if (!mime || file.type && file.type !== mime) throw new ContentInputError("Image invalide : utilisez JPEG, PNG, WebP ou GIF (sans SVG).", field)
  const folderId = mediaFolder(pdf)
  await assertPrivateDriveFolder(folderId)
  const uploaded = await uploadPrivateFileToDrive({ fileName: `site-${resource}-${randomUUID()}.${pdf ? "pdf" : mime!.split("/")[1]}`, mimeType: mime!, buffer, folderId })
  return `${mediaBase()}/api/site-web/media/${resource}/${encodeURIComponent(id)}/${field}?file=${encodeURIComponent(uploaded.fileId)}`
}
