import { getSheetRows } from "@/lib/google/sheets"

import GanttClient, { type GanttActivite } from "./gantt-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function normalizeStatut(value: string): GanttActivite["statut"] {
  const v = (value ?? "").trim().toUpperCase()
  if (v === "PLANIFIE" || v === "PLANIFIEE") return "planifie"
  if (v === "EN COURS" || v === "EN_COURS") return "en_cours"
  if (v === "TERMINE" || v === "TERMINEE") return "termine"
  if (v === "ANNULE" || v === "ANNULEE") return "annule"
  return "planifie"
}

function colorForStatut(statut: GanttActivite["statut"]): string {
  if (statut === "planifie") return "bg-chart-1"
  if (statut === "en_cours") return "bg-chart-2"
  if (statut === "termine") return "bg-coc-green"
  if (statut === "annule") return "bg-destructive"
  return "bg-chart-1"
}

function fallbackYearFromDate(value: string): string {
  const v = String(value ?? "").trim()
  if (!v) return ""

  const m = v.match(/(\d{4})/)
  return m?.[1] ?? ""
}

export default async function GanttPage() {
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

  const activites: GanttActivite[] = (rows ?? [])
    .map((r) => {
      const id = String(r.id_activite ?? "").trim()
      const statut = normalizeStatut(String(r.statut ?? ""))
      const dateDebut = String(r.date_debut ?? "").trim()
      const dateFin = String(r.date_fin ?? "").trim() || dateDebut
      const annee = String((r as any).annee ?? "").trim() || fallbackYearFromDate(dateDebut)
      return {
        id,
        titre: String(r.nom_activite ?? "").trim(),
        annee,
        dateDebut,
        dateFin,
        statut,
        responsable: String(r.responsable ?? "").trim(),
        couleur: colorForStatut(statut),
      }
    })
    .filter((a) => a.id.length > 0)

  return <GanttClient activites={activites} />
}
