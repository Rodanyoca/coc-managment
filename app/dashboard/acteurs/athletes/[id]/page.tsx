import { notFound } from "next/navigation"

import { getSheetRows } from "@/lib/google/sheets"
import { AthleteDetailClient, type AthleteDetail } from "./athlete-detail-client"

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

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const rows = await getSheetRows({ sheetName: "ATHLETES" })
  const row = rows.find((r) => (r["id_athlete"] || "").trim() === id)

  if (!row) {
    notFound()
  }

  const { prenom, nom } = splitNomComplet(row["nom_complet"])

  const athlete: AthleteDetail = {
    id: row["id_athlete"],
    nomComplet: row["nom_complet"] || `${prenom} ${nom}`.trim(),
    prenom,
    nom,
    sexe: normalizeGender(row["genre"]),
    dateNaissance: row["date_de_naissance"] || "",
    lieuNaissance: row["lieu_de_naissance"] || "",
    sport: row["nom_sport"] || "",
    discipline: row["discipline"] || "",
    federation: row["sigle_federation"] || "",
    taille: row["taille"] || "",
    poids: row["poids"] || "",
    telephone: row["telephone"] || "",
    email: row["adresse_mail"] || "",
    adresse: row["adresse_athlete"] || "",
    statut: (row["statut"] || "actif").toLowerCase() === "inactif" ? "inactif" : "actif",
    avatarUrl: row["avatar_url"] || null,
    urlPasseport: row["url_passeport"] || null,
  }

  return <AthleteDetailClient athlete={athlete} />
}
