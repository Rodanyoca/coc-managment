import { getSheetRows } from "@/lib/google/sheets"
import CompetitionDetailClient, {
  type CompetitionDetail,
  type CompetitionParticipant,
} from "./competition-detail-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function splitDisciplines(value: string): string[] {
  const v = (value || "").trim()
  if (!v) return []
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeCompetitionStatus(value: string) {
  const v = (value || "").trim().toLowerCase()
  if (v === "a_venir" || v === "en_cours" || v === "termine") return v
  return v
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const competitionId = (id || "").trim()

  let competitionsRows: Record<string, string>[] = []
  let participantsRows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    ;[competitionsRows, participantsRows] = await Promise.all([
      getSheetRows({ sheetName: "COMPETITIONS" }),
      getSheetRows({ sheetName: "COMPETITIONS_PARTICIPANTS" }),
    ])
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e)
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    )
  }

  const compRow = competitionsRows.find(
    (r: Record<string, string>) => (r["id_competition"] || "").trim() === competitionId
  )

  if (!compRow) {
    const sampleIds = competitionsRows
      .map((r: Record<string, string>) => (r["id_competition"] || "").trim())
      .filter(Boolean)
      .slice(0, 15)

    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-destructive">
          Competition introuvable dans l'onglet COMPETITIONS pour id_competition="{competitionId || id}".
        </p>
        {sampleIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Exemples de id_competition trouvés :</p>
            <pre className="whitespace-pre-wrap break-words rounded-md border border-border/50 bg-muted/30 p-3">
              {sampleIds.join("\n")}
            </pre>
          </div>
        )}
      </div>
    )
  }

  const competition: CompetitionDetail = {
    id: (compRow["id_competition"] || "").trim(),
    nom: compRow["nom_competition"] || "",
    pays: compRow["pays"] || "",
    ville: "",
    lieu: compRow["site"] || "",
    dateDebut: compRow["date_de_debut"] || "",
    dateFin: compRow["date_de_fin"] || "",
    statut: normalizeCompetitionStatus(compRow["statut"]),
    type: compRow["type"] || "",
    description: "",
    disciplines: splitDisciplines(compRow["discipline"]),
    contact: compRow["contact"] || "",
    budget: "",
  }

  const participants: CompetitionParticipant[] = participantsRows
    .filter(
      (r: Record<string, string>) => (r["id_competition"] || "").trim() === competition.id
    )
    .map((r: Record<string, string>) => {
      return {
        id: (r["id_competition_participant"] || "").trim() || (r["id_participant"] || "").trim(),
        nom: r["nom_participant"] || "",
        role: r["role"] || "",
        discipline: r["sport"] || "",
        dateDepart: r["date_de_depart"] || "",
        dateArrivee: r["date_d_arrive"] || "",
        statutTransport: (r["statut_transport"] || "").trim().toLowerCase() || "en_attente",
        vol: "",
        hotel: r["site_hebergement"] || "",
        chambre: "",
        statutHebergement: (r["statut_hebergement"] || "").trim().toLowerCase() || "en_attente",
      }
    })

  return <CompetitionDetailClient competition={competition} participants={participants} />
}
