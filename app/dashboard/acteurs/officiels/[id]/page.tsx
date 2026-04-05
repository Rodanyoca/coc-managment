import { notFound } from "next/navigation"

import { getSheetRows } from "@/lib/google/sheets"
import { OfficielDetailClient, type OfficielDetail } from "./officiel-detail-client"

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

function parseBoolean(value: string): boolean | undefined {
  const v = (value || "").trim().toLowerCase()
  if (!v) return undefined
  if (v === "1" || v === "true" || v === "oui" || v === "yes") return true
  if (v === "0" || v === "false" || v === "non" || v === "no") return false
  return undefined
}

export default async function OfficielDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const rows = await getSheetRows({ sheetName: "OFFICIELS" })
  const row = rows.find((r) => (r["id_officiel"] || "").trim() === id)

  if (!row) {
    notFound()
  }

  const { prenom, nom } = splitNomComplet(row["nom_complet"])
  const statut = (row["statut"] || "actif").toLowerCase() === "inactif" ? "inactif" : "actif"

  const officiel: OfficielDetail = {
    id: row["id_officiel"],
    nomComplet: row["nom_complet"] || `${prenom} ${nom}`.trim(),
    prenom,
    nom,
    sexe: normalizeGender(row["genre"]),
    dateNaissance: row["date_de_naissance"] || "",
    fonction: row["fonction"] || "",
    entite: row["entite"] || "",
    sport: row["nom_sport"] || "",
    federation: row["sigle_federation"] || "",
    telephone: row["telephone"] || "",
    email: row["email"] || "",
    bureau: row["adresse_bureau"] || "",
    dateNomination: row["date_de_nomination"] || "",
    membreCoc: parseBoolean(row["membre_coc"]),
    mandatFin: row["date_de_fin_de_mandat"] || "",
    urlPasseport: row["url_passeport"] || null,
    statut,
    avatarUrl: row["avatar_url"] || null,
  }

  return <OfficielDetailClient officiel={officiel} />
}
