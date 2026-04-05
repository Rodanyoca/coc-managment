import { getSheetRows } from "@/lib/google/sheets"
import { AthletesClient, type AthleteListItem } from "./athletes-client"

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

function normalizeGender(value: string): "M" | "F" {
  const v = (value || "").trim().toLowerCase()
  if (v === "m" || v === "h" || v === "homme" || v === "masculin") return "M"
  return "F"
}

export default async function AthletesPage() {
  const rows = await getSheetRows({ sheetName: "ATHLETES" })

  const athletes: AthleteListItem[] = rows
    .filter((r: Record<string, string>) => (r["id_athlete"] || "").trim() !== "")
    .map((r: Record<string, string>) => {
      const { prenom, nom } = splitNomComplet(r["nom_complet"])

      return {
        id: r["id_athlete"],
        nom,
        prenom,
        sexe: normalizeGender(r["genre"]),
        discipline: r["nom_sport"] || r["discipline"] || "",
        specialite: r["discipline"] || "",
        dateNaissance: r["date_de_naissance"] || "",
        federation: r["sigle_federation"] || "",
        statut: (r["statut"] || "").toLowerCase() || "actif",
        avatar: r["avatar_url"] || null,
      }
    })

  return <AthletesClient athletes={athletes} />
}
