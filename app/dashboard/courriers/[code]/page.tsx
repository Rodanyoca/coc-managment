import { getSheetRows } from "@/lib/google/sheets"

import CourrierDetailClient, { type CourrierDetail } from "./courrier-detail-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function normalizeSens(value: string): "entrant" | "sortant" {
  const v = (value ?? "").trim().toUpperCase()
  if (v === "RECU" || v === "ENTRANT") return "entrant"
  if (v === "EXPEDIER" || v === "SORTANT") return "sortant"
  return "entrant"
}

function normalizeStatut(value: string): "traite" | "en_attente" | "non_traite" {
  const v = (value ?? "").trim().toUpperCase()
  if (v === "TRAITE") return "traite"
  if (v === "EN ATTENTE" || v === "EN_ATTENTE") return "en_attente"
  if (v === "NON TRAITE" || v === "NON_TRAITE") return "non_traite"
  return "non_traite"
}

export default async function CourrierDetailPage(props: {
  params: Promise<{ code: string }>
}) {
  const { code } = await props.params
  const requestedCode = String(code ?? "").trim()

  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "COURRIERS" })
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

  const courrierRow = (rows ?? []).find((r) => {
    const id = String(r.id_courrier ?? "").trim()
    return id === requestedCode
  })

  if (!courrierRow) {
    const sampleIds = (rows ?? [])
      .map((r) => String(r.id_courrier ?? "").trim())
      .filter(Boolean)
      .slice(0, 10)

    return (
      <div className="p-6">
        <div className="rounded-lg border border-border/50 p-6">
          <div className="text-lg font-semibold">Courrier introuvable</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Code demandé: <span className="font-mono">{requestedCode}</span>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Exemples de <span className="font-mono">id_courrier</span> disponibles:
          </div>
          <pre className="mt-2 rounded bg-muted/30 p-3 text-xs overflow-auto">
            {JSON.stringify(sampleIds, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  const pdfUrl = String(courrierRow.url_pdf ?? courrierRow.pdf_lier ?? "").trim()

  const courrier: CourrierDetail = {
    id: String(courrierRow.id_courrier ?? requestedCode).trim(),
    code: String(courrierRow.id_courrier ?? requestedCode).trim(),
    reference: String(courrierRow.ref_complete ?? "").trim(),
    objet: String(courrierRow.objet ?? "").trim(),
    sens: normalizeSens(String(courrierRow.sens ?? "")),
    expediteur: String(courrierRow.expediteur ?? "").trim(),
    destinataire: String(courrierRow.destinataire ?? "").trim(),
    dateReception: String(courrierRow.date_courrier ?? "").trim(),
    dateCreation: "",
    categorie: String(courrierRow.categorie ?? "").trim(),
    statut: normalizeStatut(String(courrierRow.statut ?? "")),
    pdfUrl: pdfUrl.length ? pdfUrl : null,
    contenu: String(courrierRow.contenu ?? "").trim(),
    responsable: "",
    notes: String(courrierRow.note ?? "").trim(),
  }

  return <CourrierDetailClient courrier={courrier} />
}
