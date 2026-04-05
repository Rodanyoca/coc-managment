import { getSheetRows } from "@/lib/google/sheets"
import MedecinsClient, { type MedecinListItem } from "./medecins-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function splitNomComplet(nomComplet: string) {
  const trimmed = (nomComplet || "").trim()
  if (!trimmed) return { prenom: "", nom: "" }

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { prenom: parts[0], nom: "" }

  return {
    prenom: parts.slice(0, -1).join(" "),
    nom: parts[parts.length - 1],
  }
}

function normalizeGender(value: string): "M" | "F" | null {
  const v = (value || "").trim().toLowerCase()
  if (!v) return null
  if (v === "m" || v === "h" || v === "homme" || v === "masculin") return "M"
  if (v === "f" || v === "femme" || v === "feminin" || v === "féminin") return "F"
  return null
}

function normalizeStatus(value: string): "actif" | "inactif" {
  const v = (value || "").trim().toLowerCase()
  if (v === "inactif" || v === "inactive" || v === "0" || v === "non") return "inactif"
  return "actif"
}

export default async function MedecinsPage() {
  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "MEDECINS" })
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

  const medecins: MedecinListItem[] = rows
    .filter((r: Record<string, string>) => (r["id_medecin"] || "").trim() !== "")
    .map((r: Record<string, string>) => {
      const { prenom, nom } = splitNomComplet(r["nom_complet"])
      const id = (r["id_medecin"] || "").trim()

      return {
        id,
        nom,
        prenom,
        sexe: normalizeGender(r["genre"]),
        specialite: r["specialite"] || "",
        etablissement: r["etablissement"] || "",
        grade: r["grade"] || "",
        telephone: r["telephone"] || "",
        statut: normalizeStatus(r["statut"]),
      }
    })

  return <MedecinsClient medecins={medecins} />
}
