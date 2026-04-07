import { getSheetRows } from "@/lib/google/sheets"

import DocumentsClient, { type DocumentItem } from "./documents-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DocumentsPage() {
  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "DOCUMENT" })
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err)
  }

  if (loadError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="font-semibold">Erreur Google Sheets</div>
          <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{loadError}</div>
        </div>
      </div>
    )
  }

  const items: DocumentItem[] = (rows ?? [])
    .map((r) => {
      const id = String(r.id_document ?? "").trim()
      return {
        id,
        nom: String(r.nom ?? "").trim(),
        moduleSource: String(r.module_source ?? "").trim(),
        entiteLie: String(r.entite_lie ?? "").trim(),
        taille: String(r.taille ?? "").trim(),
        type: String(r.type ?? "").trim(),
        note: String(r.note ?? "").trim(),
        urlDriveDocument: String(r.url_drive_document ?? "").trim(),
        idDriveDocument: String(r.id_drive_document ?? "").trim(),
      }
    })
    .filter((item) => item.id.length > 0)

  return <DocumentsClient items={items} />
}
