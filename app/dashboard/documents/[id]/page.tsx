import { notFound } from "next/navigation"
import { getSheetRows } from "@/lib/google/sheets"
import DocumentDetailClient from "./document-detail-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const docId = (id || "").trim()

  let rows: Record<string, string>[] = []
  try {
    rows = await getSheetRows({ sheetName: "DOCUMENT" })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="font-semibold">Erreur Google Sheets</div>
          <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{message}</div>
        </div>
      </div>
    )
  }

  const row = rows.find((r) => (r["id_document"] || "").trim() === docId)

  if (!row) {
    notFound()
  }

  const driveUrl = (row["url_drive_document"] || "").trim()

  const doc = {
    id: docId,
    nom: (row["nom"] || "").trim(),
    type: (row["type"] || row["type "] || "").trim(),
    module: (row["module_source"] || "").trim(),
    entite: (row["entite_lie"] || "").trim(),
    taille: (row["taille"] || "").trim(),
    note: (row["note"] || "").trim(),
    driveUrl: driveUrl.length > 0 ? driveUrl : null,
  }

  return <DocumentDetailClient doc={doc} />
}
