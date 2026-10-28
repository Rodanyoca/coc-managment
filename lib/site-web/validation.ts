import { kinshasaCalendarDate } from "../auth/authorization.ts"
import { CONTENT_SCHEMAS, type ContentRow, type Resource } from "./schema.ts"

export class ContentInputError extends Error { field?: string; constructor(message: string, field?: string) { super(message); this.field = field } }
export const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
export function safeLink(value: string, local = false) {
  if (local && /^\/(?!\/)/.test(value) && !/[\\\s\u0000-\u001f]/.test(value)) return true
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password && !/[\u0000-\u001f]/.test(value) } catch { return false }
}
export function validateContent(resource: Resource, input: ContentRow): ContentRow {
  if (resource === "communiques" && input.image_url) throw new ContentInputError("Un communiqué ne peut pas contenir d’image. Sélectionnez son document PDF associé.", "image_url")
  const row: ContentRow = {}
  for (const f of CONTENT_SCHEMAS[resource].fields) {
    const value = String(input[f.key] ?? "").trim()
    if (f.required && !value) throw new ContentInputError(`${f.label} : ce champ est obligatoire.`, f.key)
    if (value.length > (f.type === "long" ? 100_000 : 2000)) throw new ContentInputError(`${f.label} : texte trop long.`, f.key)
    if (f.type === "date" && value && !validDate(value)) throw new ContentInputError(`${f.label} : date invalide.`, f.key)
    if (f.type === "number" && value && (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))) throw new ContentInputError("L’ordre doit être un entier positif ou nul.", f.key)
    if (f.type === "status" && !["PUB001", "PUB002", "PUB003"].includes(value)) throw new ContentInputError("Statut de publication invalide.", f.key)
    if (f.type === "boolean" && value && !/^(true|false|vrai|faux|oui|non|0|1)$/i.test(value)) throw new ContentInputError("Valeur oui/non invalide.", f.key)
    if (f.type === "url" && value && !safeLink(value, f.key === "lien_bouton")) throw new ContentInputError("Lien HTTP/HTTPS invalide.", f.key)
    row[f.key] = f.type === "boolean" ? (/^(true|vrai|oui|1)$/i.test(value) ? "TRUE" : "FALSE") : value
  }
  for (const [start, end] of [["date_debut", "date_fin"], ["date_debut_publication", "date_fin_publication"]]) if (row[start] && row[end] && row[end] < row[start]) throw new ContentInputError("La date de fin ne peut pas précéder le début.", end)
  if (resource === "sliders" && Boolean(row.libelle_bouton) !== Boolean(row.lien_bouton)) throw new ContentInputError("Le libellé et le lien du bouton doivent être renseignés ensemble.", "lien_bouton")
  if (resource === "sliders" && (!row.description || !row.ordre_affichage || Number(row.ordre_affichage) < 1)) throw new ContentInputError("La description et un ordre d’affichage positif sont obligatoires.", !row.description ? "description" : "ordre_affichage")
  if (resource === "photos") row.type_media = "PHOTO"
  if (resource === "communiques" && row.id_document_public) row.fichier_url = ""
  return row
}

export function isPublished(resource: Resource, row: ContentRow, now = new Date()) {
  if (row.id_statut_publication !== "PUB002") return false
  const date = kinshasaCalendarDate(now)
  if (resource === "sliders") return (!row.date_debut_publication || validDate(row.date_debut_publication) && row.date_debut_publication <= date) && (!row.date_fin_publication || validDate(row.date_fin_publication) && row.date_fin_publication >= date)
  if ((resource === "actualites" || resource === "communiques") && row.date_publication) return validDate(row.date_publication) && row.date_publication <= date
  return true
}
