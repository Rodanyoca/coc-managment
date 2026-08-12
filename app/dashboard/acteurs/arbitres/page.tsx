import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getFederationOptions } from "@/lib/federations/options"
import { getSheetRows } from "@/lib/google/sheets"
import ArbitresClient, { type ArbitreListItem, type GradeOption } from "./arbitres-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ArbitresPage() {
  const [rows, federations, gradeRows] = await Promise.all([
    getSheetRows({ sheetName: "ARBITRES", spreadsheetId: getActeursSpreadsheetId() }),
    getFederationOptions(),
    getSheetRows({ sheetName: "GRADES_ARBITRE", spreadsheetId: getReferentialSpreadsheetId() }),
  ])
  const arbitres: ArbitreListItem[] = rows.filter((r) => r.id_arbitre_coc || r.nom_complet).map((r) => ({ id: r.id_arbitre_coc, nomComplet: r.nom_complet || "", sexe: r.id_sexe || r.nom_sexe || "", federation: r.nom_federation || "", grade: r.nom_grade || "", statut: r.statut || "", avatar: r.avatar_drive_url || null }))
  const grades: GradeOption[] = gradeRows.filter((r) => r.id_grade).map((r) => ({ id: r.id_grade, nom: r.nom_grade || r.id_grade, idSport: r.id_sport || "", idDiscipline: r.id_discipline || "" })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  return <ArbitresClient arbitres={arbitres} federations={federations} grades={grades} />
}
