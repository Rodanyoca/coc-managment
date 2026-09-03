import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getSheetRows } from "@/lib/google/sheets"
import { getAllOfficialAffiliations } from "@/lib/acteurs/official-affiliations"
import { getPrimaryOfficialEntities } from "@/lib/acteurs/official-affiliation-model"
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
  const currentEntityByOfficial = getPrimaryOfficialEntities(affiliations)
  const officiels: OfficielListItem[] = rows
    .filter((row) => Boolean(row.id_officiel_coc || row.id_national || row.nom_complet))
    .map((row) => ({
      id: row.id_officiel_coc || row.id_national,
      idNational: row.id_national || "",
      idFederal: row.id_officiel_entite || "",
      nomComplet: row.nom_complet || "",
      sexe: row.nom_sexe || row.id_sexe || "",
      dateNaissance: row.date_de_naissance || "",
      organisation: (() => {
        const entity = entityById.get(currentEntityByOfficial.get(row.id_officiel_coc) || "")
        return entity?.sigle || entity?.sigle_entite || ""
      })(),
      statut: row.statut || "",
      avatar: row.avatar_drive_url || null,
    }))

  return <OfficielsClient officiels={officiels} />
}
