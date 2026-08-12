import { notFound } from "next/navigation"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getFederationOptions } from "@/lib/federations/options"
import { getSheetRows } from "@/lib/google/sheets"
import { ArbitreDetailClient, type ArbitreDetail } from "./arbitre-detail-client"
import type { GradeOption } from "../arbitres-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ArbitreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [rows, federations, gradeRows] = await Promise.all([
    getSheetRows({ sheetName: "ARBITRES", spreadsheetId: getActeursSpreadsheetId() }),
    getFederationOptions(),
    getSheetRows({ sheetName: "GRADES_ARBITRE", spreadsheetId: getReferentialSpreadsheetId() }),
  ])
  const r = rows.find((row) => row.id_arbitre_coc === id)
  if (!r) notFound()
  const arbitre: ArbitreDetail = { id: r.id_arbitre_coc, idFederation: r.id_federation || "", idFederal: r.id_arbitre_federation || "", idNational: r.id_national || "", idInternational: r.id_international || "", nomComplet: r.nom_complet || "", sexe: r.id_sexe || r.nom_sexe || "", dateNaissance: r.date_de_naissance || "", lieuNaissance: r.lieu_de_naissance || "", nationalite: r.nationalite || "", federation: r.nom_federation || "", idGrade: r.id_grade || "", grade: r.nom_grade || "", dateAffiliation: r.date_affiliation || "", telephone: r.telephone || "", email: r.email || "", adresse: r.adresse || "", numeroPasseport: r.numero_passeport || "", dateDelivrancePasseport: r.date_de_delivrance_passeport || "", dateExpirationPasseport: r.date_expiration_passeport || "", statut: r.statut?.toLowerCase() === "inactif" ? "inactif" : "actif", avatarUrl: r.avatar_drive_url || null, urlPasseport: r.passeport_drive_url || null }
  const grades: GradeOption[] = gradeRows.filter((row) => row.id_grade).map((row) => ({ id: row.id_grade, nom: row.nom_grade || row.id_grade, idSport: row.id_sport || "", idDiscipline: row.id_discipline || "" })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  return <ArbitreDetailClient arbitre={arbitre} federations={federations} grades={grades} />
}
