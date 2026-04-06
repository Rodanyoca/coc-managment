import { getSheetRows } from "@/lib/google/sheets"

import ActiviteDetailClient, {
  type ActiviteDetail,
  type ActiviteParticipant,
} from "./activite-detail-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function normalizeStatut(value: string): ActiviteDetail["statut"] {
  const v = (value ?? "").trim().toUpperCase()
  if (v === "PLANIFIE" || v === "PLANIFIEE") return "planifie"
  if (v === "EN COURS" || v === "EN_COURS") return "en_cours"
  if (v === "TERMINE" || v === "TERMINEE") return "termine"
  if (v === "ANNULE" || v === "ANNULEE") return "annule"
  return "planifie"
}

function normalizePriorite(value: string): ActiviteDetail["priorite"] {
  const v = (value ?? "").trim().toUpperCase()
  if (v === "HAUTE") return "haute"
  if (v === "MOYENNE") return "moyenne"
  if (v === "NORMALE") return "normale"
  return "normale"
}

export default async function ActiviteDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const requestedId = String(id ?? "").trim()

  let activitesRows: Record<string, string>[] = []
  let participantsRows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    ;[activitesRows, participantsRows] = await Promise.all([
      getSheetRows({ sheetName: "ACTIVITES" }),
      getSheetRows({ sheetName: "ACTIVITES8PARTICIPANTS" }),
    ])
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

  const activiteRow = (activitesRows ?? []).find((r) => String(r.id_activite ?? "").trim() === requestedId)

  if (!activiteRow) {
    const sampleIds = (activitesRows ?? [])
      .slice(0, 12)
      .map((r) => String(r.id_activite ?? "").trim())
      .filter((x) => x.length > 0)

    return (
      <div className="p-6">
        <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
          <div className="font-semibold">Activité introuvable</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Aucun enregistrement trouvé pour <span className="font-mono">{requestedId || "(vide)"}</span> dans la feuille
            <span className="font-mono"> ACTIVITES</span>.
          </div>
          {sampleIds.length > 0 && (
            <div className="mt-3 text-sm text-muted-foreground">
              Exemples de <span className="font-mono">id_activite</span>:
              <div className="mt-1 font-mono whitespace-pre-wrap">{sampleIds.join(", ")}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const activite: ActiviteDetail = {
    id: String(activiteRow.id_activite ?? "").trim(),
    titre: String(activiteRow.nom_activite ?? "").trim(),
    description: String(activiteRow.description ?? "").trim(),
    lieu: String(activiteRow.lieu ?? "").trim(),
    dateDebut: String(activiteRow.date_debut ?? "").trim(),
    dateFin: String(activiteRow.date_fin ?? "").trim(),
    responsable: String(activiteRow.responsable ?? "").trim(),
    priorite: normalizePriorite(String(activiteRow.priorite ?? "")),
    statut: normalizeStatut(String(activiteRow.statut ?? "")),
  }

  const participants: ActiviteParticipant[] = (participantsRows ?? [])
    .filter((r) => String(r.id_activite ?? "").trim() === activite.id)
    .map((r) => {
      const federation =
        String(r.sigle_federation ?? "").trim() || String(r.id_federation ?? "").trim()
      return {
        id: String(r.id_activite_participant ?? "").trim(),
        idActivite: String(r.id_activite ?? "").trim(),
        idParticipant: String(r.id_participant ?? "").trim(),
        nom: String(r.nom_participant ?? "").trim(),
        sexe: String(r.sexe ?? "").trim(),
        age: String(r.age ?? "").trim(),
        categorie: String(r.categorie ?? "").trim(),
        federation,
      }
    })
    .filter((p) => p.id.length > 0)

  return <ActiviteDetailClient activite={activite} participants={participants} />
}
