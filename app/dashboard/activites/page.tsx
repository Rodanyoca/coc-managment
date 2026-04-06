import { getSheetRows } from "@/lib/google/sheets"

import ActivitesClient, { type ActiviteListItem } from "./activites-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function normalizeStatut(value: string): ActiviteListItem["statut"] {
  const v = (value ?? "").trim().toUpperCase()
  if (v === "PLANIFIE" || v === "PLANIFIEE") return "planifie"
  if (v === "EN COURS" || v === "EN_COURS") return "en_cours"
  if (v === "TERMINE" || v === "TERMINEE") return "termine"
  if (v === "ANNULE" || v === "ANNULEE") return "annule"
  return "planifie"
}

function normalizePriorite(value: string): ActiviteListItem["priorite"] {
  const v = (value ?? "").trim().toUpperCase()
  if (v === "HAUTE") return "haute"
  if (v === "MOYENNE") return "moyenne"
  if (v === "NORMALE") return "normale"
  return "normale"
}

export default async function ActivitesPage() {
  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "ACTIVITES" })
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

  const activites: ActiviteListItem[] = (rows ?? [])
    .map((r) => {
      const id = String(r.id_activite ?? "").trim()
      return {
        id,
        titre: String(r.nom_activite ?? "").trim(),
        dateDebut: String(r.date_debut ?? "").trim(),
        dateFin: String(r.date_fin ?? "").trim(),
        responsable: String(r.responsable ?? "").trim(),
        priorite: normalizePriorite(String(r.priorite ?? "")),
        lieu: String(r.lieu ?? "").trim(),
        statut: normalizeStatut(String(r.statut ?? "")),
      }
    })
    .filter((a) => a.id.length > 0)

  return <ActivitesClient activites={activites} />
}
