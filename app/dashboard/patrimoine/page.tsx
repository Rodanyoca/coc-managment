import { getSheetRows } from "@/lib/google/sheets"

import PatrimoineClient, { type PatrimoineItem } from "./patrimoine-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PatrimoinePage() {
  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "PATRIMOINE" })
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

  const items: PatrimoineItem[] = (rows ?? [])
    .map((r) => {
      const id = String(r.id ?? "").trim()
      return {
        id,
        nom: String(r.nom ?? "").trim(),
        quantite: String(r.quantite ?? "").trim(),
        dateAcquisition: String(r.date_acquisition ?? "").trim(),
        etat: String(r.etat ?? "").trim(),
      }
    })
    .filter((item) => item.id.length > 0)

  return <PatrimoineClient items={items} />
}
