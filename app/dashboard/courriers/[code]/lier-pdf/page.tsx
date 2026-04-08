import { getSheetRows } from "@/lib/google/sheets"
import LierPdfClient from "./lier-pdf-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LierPdfPage(props: {
  params: Promise<{ code: string }>
}) {
  const { code } = await props.params
  const requestedCode = String(code ?? "").trim()

  let rows: Record<string, string>[] = []
  try {
    rows = await getSheetRows({ sheetName: "COURRIERS" })
  } catch {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="font-semibold">Erreur Google Sheets</div>
        </div>
      </div>
    )
  }

  const row = (rows ?? []).find(
    (r) => String(r.id_courrier ?? "").trim() === requestedCode
  )

  const courrier = row
    ? {
        code: requestedCode,
        reference: String(row.ref_complete ?? "").trim(),
        objet: String(row.objet ?? "").trim(),
        expediteur: String(row.expediteur ?? "").trim(),
        dateCourrier: String(row.date_courrier ?? "").trim(),
      }
    : null

  return <LierPdfClient code={requestedCode} courrier={courrier} />
}
