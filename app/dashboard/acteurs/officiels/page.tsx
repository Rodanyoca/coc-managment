import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getSheetRows } from "@/lib/google/sheets"
import { getAllOfficialAffiliations } from "@/lib/acteurs/official-affiliations"
import { OfficielsClient, type OfficielListItem } from "./officiels-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function OfficielsPage() {
  const [rows, entityRows, affiliations] = await Promise.all([
    getSheetRows({
      sheetName: "OFFICIELS",
      spreadsheetId: getActeursSpreadsheetId(),
    }),
    getSheetRows({
      sheetName: "ENTITES",
      spreadsheetId: getReferentialSpreadsheetId(),
    }),
    getAllOfficialAffiliations(),
  ])

  const entityById = new Map(entityRows.map((row) => [row.id_entite, row]))
  const today = new Date().toISOString().slice(0, 10)
  const currentEntityByOfficial = new Map<string, string>()
  for (const affiliation of affiliations) {
    const isCurrent = affiliation.statut.toUpperCase() !== "INACTIF" && (!affiliation.date_fin || affiliation.date_fin >= today)
    if (isCurrent && !currentEntityByOfficial.has(affiliation.id_officiel_coc)) {
      currentEntityByOfficial.set(affiliation.id_officiel_coc, affiliation.id_entite)
    }
  }
  const officiels: OfficielListItem[] = rows
    .filter((row) => Boolean(row.id_officiel_coc || row.id_national || row.nom_complet))
    .map((row) => ({
      id: row.id_officiel_coc || row.id_national,
      idNational: row.id_national || "",
      idFederal: row.id_officiel_entite || "",
      nomComplet: row.nom_complet || "",
      sexe: row.nom_sexe || row.id_sexe || "",
      dateNaissance: row.date_de_naissance || "",
      organisation: entityById.get(currentEntityByOfficial.get(row.id_officiel_coc) || "")?.nom_entite || "",
      statut: row.statut || "",
      avatar: row.avatar_drive_url || null,
    }))

  return <OfficielsClient officiels={officiels} />
}
