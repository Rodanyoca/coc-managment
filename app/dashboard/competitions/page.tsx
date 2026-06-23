import { getSheetRows } from "@/lib/google/sheets"
import CompetitionsClient, { type CompetitionListItem } from "./competitions-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function normalizeCompetitionStatus(value: string): CompetitionListItem["statut"] {
  const v = (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_")

  if (v === "a_venir" || v === "avenir" || v.includes("programme") || v.includes("planifi")) {
    return "a_venir"
  }
  if (v === "en_cours" || v.includes("cours") || v.includes("progress")) {
    return "en_cours"
  }
  if (v === "termine" || v.includes("realis") || v.includes("clotur") || v.includes("achev")) {
    return "termine"
  }

  return v
}

function splitSites(value: string): string[] {
  const v = (value || "").trim()
  if (!v) return []
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export default async function CompetitionsPage() {
  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "COMPETITIONS" })
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

  const competitions: CompetitionListItem[] = rows
    .filter((r: Record<string, string>) => (r["id_competition"] || "").trim() !== "")
    .map((r: Record<string, string>) => {
      const id = (r["id_competition"] || "").trim()
      return {
        id,
        nom: r["nom_competition"] || "",
        pays: r["pays"] || "",
        ville: "",
        sites: splitSites(r["site"]),
        dateDebut: r["date_de_debut"] || "",
        dateFin: r["date_de_fin"] || "",
        statut: normalizeCompetitionStatus(r["statut"]),
        type: r["type"] || "",
        participants: 0,
      }
    })

  return <CompetitionsClient competitions={competitions} />
}
