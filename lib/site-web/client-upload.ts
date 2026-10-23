import { apiFetch } from "@/lib/api/client"
import type { ContentRow, Resource } from "./schema"
export async function sendContentFile(input: { resource: Resource; rowId?: string; field: string; requestId: string; file: File; progress?: (value: number) => void }) {
  const init = await apiFetch("/api/site-web/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, timeoutMs: 60_000, body: JSON.stringify({ resource: input.resource, id: input.rowId, field: input.field, requestId: input.requestId, size: input.file.size, mime: input.file.type }) })
  const upload = await init.json()
  if (!init.ok) throw new Error(upload.error || "Préparation de l’envoi impossible.")
  for (let offset = 0; offset < input.file.size;) {
    const end = Math.min(offset + upload.chunkBytes, input.file.size)
    const response = await apiFetch("/api/site-web/uploads", { method: "PUT", timeoutMs: 60_000, headers: { "Content-Type": "application/octet-stream", "x-upload-token": upload.token, "x-upload-start": String(offset) }, body: input.file.slice(offset, end) })
    const chunk = await response.json()
    if (!response.ok) throw new Error(chunk.error || "Envoi du fichier interrompu. Réessayez sans fermer le formulaire.")
    if (chunk.next !== end) throw new Error("L’envoi du fichier ne peut pas être confirmé.")
    offset = chunk.next; input.progress?.(Math.round(offset / input.file.size * 100))
    if (offset === input.file.size && chunk.asset) return String(chunk.asset)
  }
  throw new Error("L’envoi du fichier est incomplet.")
}
export async function persistContent(input: { resource: Resource; row: ContentRow; id?: string; requestId: string; assets: Record<string, string> }) {
  const response = await apiFetch(`/api/site-web/${input.resource}${input.id ? `/${encodeURIComponent(input.id)}` : ""}`, { method: input.id ? "PUT" : "POST", timeoutMs: 60_000, headers: { "Content-Type": "application/json", "x-request-id": input.requestId }, body: JSON.stringify({ row: input.row, assets: input.assets }) })
  const result = await response.json()
  if (!response.ok) throw Object.assign(new Error(result.error || "Enregistrement impossible."), { status: response.status })
  return result.row as ContentRow
}
