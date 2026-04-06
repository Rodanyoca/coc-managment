import { getSheetRows } from "@/lib/google/sheets"
import CourriersClient, { type CourrierListItem } from "./courriers-client"

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

export default async function CourriersPage() {
  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "COURRIERS" })
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err)
  }

  const courriers: CourrierListItem[] = rows
    .map((r) => {
      const code = (r.code ?? r.id_courrier ?? "").trim()
      const pdfUrl = (r.url_pdf ?? r.pdf_lier ?? "").trim()

      return {
        id: (r.id_courrier ?? code).trim(),
        code,
        reference: (r.ref_complete ?? "").trim(),
        objet: (r.objet ?? "").trim(),
        sens: normalizeSens(r.sens ?? ""),
        expediteur: (r.expediteur ?? "").trim(),
        destinataire: (r.destinataire ?? "").trim(),
        date: (r.date_courrier ?? "").trim(),
        categorie: (r.categorie ?? "").trim(),
        statut: normalizeStatut(r.statut ?? ""),
        pdfUrl: pdfUrl.length ? pdfUrl : null,
      }
    })
    .filter((c) => c.code.length > 0)

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

  return <CourriersClient courriers={courriers} />
}
