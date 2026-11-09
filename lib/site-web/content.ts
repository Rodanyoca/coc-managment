import "server-only"
import { createHash } from "node:crypto"
import { appendSheetRow, getSheetHeaders, getSheetRows, getSheetsTables, updateSheetCells } from "@/lib/google/sheets"
import { SITE_WEB_SPREADSHEET_ID } from "./config"
import { CONTENT_SCHEMAS, headersFor, type ContentRow, type PublicationStatus, type RelationOptions, type Resource } from "./schema"
import { ContentInputError, validateContent } from "./validation"
import { managedMedia, uploadContentMedia } from "./media"

export async function readContent(resource: Resource, options: { fresh?: boolean; galleryId?: string } = {}) {
  const schema = CONTENT_SCHEMAS[resource]
  let rows: ContentRow[], headers: string[]
  if (options.fresh) { const table = (await getSheetsTables({ sheetNames: [schema.sheet], spreadsheetId: SITE_WEB_SPREADSHEET_ID }))[schema.sheet]; rows = table.rows; headers = table.headers }
  else [rows, headers] = await Promise.all([getSheetRows({ sheetName: schema.sheet, spreadsheetId: SITE_WEB_SPREADSHEET_ID }), getSheetHeaders({ sheetName: schema.sheet, spreadsheetId: SITE_WEB_SPREADSHEET_ID })])
  if (headersFor(resource).some(key => !headers.includes(key))) throw new Error(`Schéma ${schema.sheet} incomplet ou indisponible.`)
  const seen = new Set<string>()
  return rows.filter(row => row[schema.id] && (!options.galleryId || row.id_galerie === options.galleryId)).map(row => {
    if (seen.has(row[schema.id])) throw new Error(`Identifiant dupliqué dans ${schema.sheet}.`)
    seen.add(row[schema.id])
    return Object.fromEntries(headersFor(resource).map(key => [key, String(row[key] ?? "").trim()]))
  }).sort((a, b) => Number(a.ordre_affichage || 0) - Number(b.ordre_affichage || 0) || (a[schema.label] || "").localeCompare(b[schema.label] || "", "fr"))
}
export async function publicationStatuses(fresh = false): Promise<PublicationStatus[]> {
  const rows = fresh ? (await getSheetsTables({ spreadsheetId: SITE_WEB_SPREADSHEET_ID, sheetNames: ["STATUTS_PUBLICATION"] })).STATUTS_PUBLICATION.rows : await getSheetRows({ sheetName: "STATUTS_PUBLICATION", spreadsheetId: SITE_WEB_SPREADSHEET_ID })
  const result = rows.filter(row => row.id_statut_publication).map(row => ({ id: row.id_statut_publication, label: row.nom_statut_publication || row.id_statut_publication }))
  if (["PUB001", "PUB002", "PUB003"].some(id => !result.some(row => row.id === id))) throw new Error("Statuts de publication incomplets ou indisponibles.")
  return result
}
export async function contentOptions(resource: Resource): Promise<RelationOptions> {
  const relations = [...new Set(CONTENT_SCHEMAS[resource].fields.flatMap(f => f.relation ? [f.relation] : []))]
  return Object.fromEntries(await Promise.all(relations.map(async relation => [relation, (await readContent(relation)).map(row => ({ id: row[CONTENT_SCHEMAS[relation].id], label: row[CONTENT_SCHEMAS[relation].label], status: row.id_statut_publication }))])))
}
const labelKey = (value: string) => value.normalize("NFKC").toLocaleLowerCase("fr").replace(/\s+/g, " ").trim()
async function assertRelations(resource: Resource, row: ContentRow) {
  for (const f of CONTENT_SCHEMAS[resource].fields) if (f.relation && row[f.key]) {
    const target = (await readContent(f.relation, { fresh: true })).find(item => item[CONTENT_SCHEMAS[f.relation!].id] === row[f.key])
    if (!target) throw new ContentInputError(`${f.label} : référence introuvable.`, f.key)
    if (row.id_statut_publication === "PUB002" && target.id_statut_publication && target.id_statut_publication !== "PUB002") throw new ContentInputError(`${f.label} : publiez d’abord le contenu lié.`, f.key)
  }
}
async function assertUnpublishAllowed(resource: Resource, id: string, row: ContentRow) {
  if (row.id_statut_publication === "PUB002") return
  const dependency = resource === "documents" ? { source: "communiques" as const, field: "id_document_public" } : resource === "galeries" ? { source: "actualites" as const, field: "id_galerie" } : null
  if (dependency && (await readContent(dependency.source, { fresh: true })).some(parent => parent[dependency.field] === id && parent.id_statut_publication === "PUB002")) throw new ContentInputError("Ce contenu est utilisé par une publication. Retirez d’abord sa publication ou son rattachement.", "id_statut_publication")
}
export function contentId(resource: Resource, actorId: string, requestId: string) { return `WEB-${resource.toUpperCase()}-${createHash("sha256").update(`${actorId}:${resource}:${requestId}`).digest("hex").slice(0, 32)}` }

export async function saveContent(resource: Resource, input: ContentRow, files: Record<string, File>, id: string, update: boolean, assets: Record<string, string> = {}) {
  if (resource === "communiques" && (files.image_url || assets.image_url)) throw new ContentInputError("Un communiqué accepte uniquement son document PDF associé.", "image_url")
  const schema = CONTENT_SCHEMAS[resource], rows = await readContent(resource, { fresh: true }), current = rows.find(row => row[schema.id] === id)
  if (update && !current) throw new ContentInputError("Contenu introuvable.")
  // Deterministic IDs protect a retry whose first Sheets response was lost.
  if (!update && current) return current
  const row = validateContent(resource, input)
  if (resource !== "categories" && resource !== "photos") await publicationStatuses(true)
  if (resource === "categories" && rows.some(other => other[schema.id] !== id && labelKey(other[schema.label]) === labelKey(row[schema.label]))) throw new ContentInputError("Cette catégorie existe déjà.", schema.label)
  if (resource === "photos" && current && current.id_galerie !== row.id_galerie) throw new ContentInputError("Une photo ne peut pas être déplacée implicitement vers une autre galerie.")
  await assertRelations(resource, row)
  if (update) await assertUnpublishAllowed(resource, id, row)
  for (const f of schema.fields) if (f.type === "image" || f.type === "pdf") {
    // A caller cannot attach an arbitrary private Drive ID through a forged media URL.
    if (row[f.key] && row[f.key] !== current?.[f.key]) throw new ContentInputError("Utilisez l’envoi de fichier pour remplacer ce média.", f.key)
    if (assets[f.key]) row[f.key] = assets[f.key]
    else if (files[f.key]) row[f.key] = await uploadContentMedia(resource, id, f.key, files[f.key])
    else row[f.key] = current?.[f.key] || ""
  }
  if ((resource === "documents" || resource === "photos") && !row.fichier_url) throw new ContentInputError(resource === "documents" ? "Sélectionnez un fichier PDF." : "Sélectionnez une photo.", "fichier_url")
  if (resource === "communiques" && row.fichier_url && row.fichier_url !== current?.fichier_url) {
    const url = new URL(row.fichier_url)
    if (managedMedia(row.fichier_url) || /(^|\.)google(?:usercontent)?\.com$/i.test(url.hostname) || url.pathname.startsWith("/api/")) throw new ContentInputError("Sélectionnez un document public ; ne collez pas un lien vers un document privé.", "fichier_url")
  }
  const saved = { ...row, [schema.id]: id }
  if (update) await updateSheetCells({ spreadsheetId: SITE_WEB_SPREADSHEET_ID, sheetName: schema.sheet, idColumn: schema.id, idValue: id, fresh: true, updates: schema.fields.map(f => ({ column: f.key, value: row[f.key] })) })
  else await appendSheetRow({ spreadsheetId: SITE_WEB_SPREADSHEET_ID, sheetName: schema.sheet, row: saved, placement: {
    idColumn: schema.id, falseColumns: schema.fields.filter(field => field.type === "boolean").map(field => field.key),
  } })
  const confirmed = (await readContent(resource, { fresh: true })).find(record => record[schema.id] === id)
  if (!confirmed || Object.entries(saved).some(([key, value]) => confirmed[key] !== value)) throw new Error("L’écriture ne peut pas être confirmée. Rechargez la liste avant une nouvelle tentative.")
  return confirmed
}
