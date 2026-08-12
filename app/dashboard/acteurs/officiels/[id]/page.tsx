import { notFound } from "next/navigation"

import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getSheetRows } from "@/lib/google/sheets"
import { getOfficialAffiliations } from "@/lib/acteurs/official-affiliations"
import {
  OfficielDetailClient,
  type OfficielDetail,
  type OfficialFunctionOption,
  type OrganisationOption,
} from "./officiel-detail-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function OfficielDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [rows, entityRows, functionRows, affiliationsResult] = await Promise.all([
    getSheetRows({
      sheetName: "OFFICIELS",
      spreadsheetId: getActeursSpreadsheetId(),
    }),
    getSheetRows({
      sheetName: "ENTITES",
      spreadsheetId: getReferentialSpreadsheetId(),
    }),
    getSheetRows({
      sheetName: "FONCTIONS_OFFICIEL",
      spreadsheetId: getReferentialSpreadsheetId(),
    }),
    getOfficialAffiliations(id).then((rows) => ({ rows, error: false as const })).catch(() => ({ rows: [], error: true as const })),
  ])
  const row = rows.find((item) => item.id_officiel_coc === id)
  if (!row) notFound()

  const today = new Date().toISOString().slice(0, 10)
  const currentAffiliation = affiliationsResult.rows.find((item) => item.statut.toUpperCase() !== "INACTIF" && (!item.date_fin || item.date_fin >= today))
  const linkedEntity = entityRows.find((item) => item.id_entite === currentAffiliation?.id_entite)
  const officiel: OfficielDetail = {
    id: row.id_officiel_coc,
    idNational: row.id_national || "",
    idFederal: row.id_officiel_entite || "",
    idInternational: row.id_international || "",
    nomComplet: row.nom_complet || "",
    sexe: row.nom_sexe || row.id_sexe || "",
    dateNaissance: row.date_de_naissance || "",
    lieuNaissance: row.lieu_de_naissance || "",
    nationalite: row.nationalite || "",
    organisation: linkedEntity?.nom_entite || "",
    telephone: row.telephone || "",
    email: row.email || "",
    adresse: row.adresse || "",
    statut: row.statut?.toLowerCase() === "inactif" ? "inactif" : "actif",
    avatarUrl: row.avatar_drive_url || null,
    urlPasseport: row.url_passeport || null,
    numeroPasseport: row.numero_passeport || "",
    dateDelivrancePasseport: row.date_de_delivrance_passeport || "",
    dateExpirationPasseport: row["date_expiration passeport"] || "",
  }

  const organisations: OrganisationOption[] = entityRows
    .filter((item) => item.id_entite)
    .map((item) => ({
      id: item.id_entite,
      sigle: item.sigle_entite || "",
      nom: item.nom_entite || "",
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))

  const functions: OfficialFunctionOption[] = functionRows
    .filter((item) => item.id_fonction && item.nom_fonction)
    .map((item) => ({ id: item.id_fonction, nom: item.nom_fonction }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))

  return <OfficielDetailClient officiel={officiel} organisations={organisations} functions={functions} affiliations={affiliationsResult.rows} affiliationsLoadError={affiliationsResult.error} />
}
