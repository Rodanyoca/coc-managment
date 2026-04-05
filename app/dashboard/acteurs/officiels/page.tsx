import { getSheetRows } from "@/lib/google/sheets"
import { OfficielsClient, type OfficielListItem } from "./officiels-client"

export const runtime = "nodejs"

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

function normalizeType(entite: string) {
  return (entite || "").trim().toLowerCase() === "coc" ? "coc" : "federation"
}

export default async function OfficielsPage() {
  const rows = await getSheetRows({ sheetName: "OFFICIELS" })

  const officiels: OfficielListItem[] = rows
    .filter((r: Record<string, string>) => (r["id_officiel"] || "").trim() !== "")
    .map((r: Record<string, string>) => {
      const { prenom, nom } = splitNomComplet(r["nom_complet"])
      const statut = (r["statut"] || "actif").toLowerCase() === "inactif" ? "inactif" : "actif"

      return {
        id: r["id_officiel"],
        nom,
        prenom,
        nomComplet: r["nom_complet"] || `${prenom} ${nom}`.trim(),
        sexe: normalizeGender(r["genre"]),
        dateNaissance: r["date_de_naissance"] || "",
        fonction: r["fonction"] || "",
        organisation: r["entite"] || r["sigle_federation"] || "",
        type: normalizeType(r["entite"]),
        telephone: r["telephone"] || "",
        email: r["email"] || "",
        statut,
        avatar: r["avatar_url"] || null,
      }
    })

  return <OfficielsClient officiels={officiels} />
}
