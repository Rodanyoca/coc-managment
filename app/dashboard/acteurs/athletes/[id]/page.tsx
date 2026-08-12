import { notFound } from "next/navigation"

import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getFederationOptions } from "@/lib/federations/options"
import { getSheetRows } from "@/lib/google/sheets"
import { AthleteDetailClient, type AthleteDetail } from "./athlete-detail-client"
import type { FederationOption } from "../athletes-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [rows, federationRows] = await Promise.all([
    getSheetRows({
      sheetName: "ATHLETE",
      spreadsheetId: getActeursSpreadsheetId(),
    }),
    getFederationOptions(),
  ])
  const row = rows.find((item) => item.id_athlete_coc === id)

  if (!row) notFound()

  const athlete: AthleteDetail = {
    id: row.id_athlete_coc,
    idFederation: row.id_federation || "",
    idNational: row.id_national || "",
    idFederal: row.id_athlete_federation || "",
    idInternational: row.id_federation_internationale || "",
    nomComplet: row.nom_complet || "",
    sexe: row.nom_sexe || row.id_sexe || "",
    dateNaissance: row.date_de_naissance || "",
    lieuNaissance: row.lieu_de_naissance || "",
    federation: row.sigle_federation || "",
    telephone: row.telephone || "",
    email: row.email || "",
    adresse: row.adresse || "",
    statut: row.statut?.toLowerCase() === "inactif"
      ? "inactif"
      : row.statut
        ? "actif"
        : undefined,
    avatarUrl: row.avatar_drive_url || null,
    urlPasseport: row.url_passeport || null,
    numeroPasseport: row.numero_passeport || "",
    dateDelivrancePasseport: row.date_de_delivrance_passeport || "",
    dateExpirationPasseport: row["date_expiration passeport"] || "",
  }

  const federations: FederationOption[] = federationRows.map(({ id, sigle, nom }) => ({
    id,
    sigle,
    nom,
  }))

  return <AthleteDetailClient athlete={athlete} federations={federations} />
}
