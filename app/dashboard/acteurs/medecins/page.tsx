import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getSheetRows } from "@/lib/google/sheets"
import MedecinsClient, { type EntityOption, type MedecinListItem, type SpecialtyOption } from "./medecins-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function MedecinsPage() {
  const [rows, entityRows, specialtyRows] = await Promise.all([
    getSheetRows({ sheetName: "MEDECINS", spreadsheetId: getActeursSpreadsheetId() }),
    getSheetRows({ sheetName: "ENTITES", spreadsheetId: getReferentialSpreadsheetId() }),
    getSheetRows({ sheetName: "SPECIALITES_MEDECIN", spreadsheetId: getReferentialSpreadsheetId() }),
  ])
  const medecins: MedecinListItem[] = rows.filter((r) => r.id_medecin_coc || r.nom_complet).map((r) => ({
    id: r.id_medecin_coc,
    idNational: r.id_national || "",
    idFederal: r.id_medecin_entite || r.id_medecin_federation || "",
    nomComplet: r.nom_complet || "",
    sexe: r.nom_sexe || r.id_sexe || "",
    dateNaissance: r.date_de_naissance || "",
    federation: r.nom_entite || r.nom_federation || "",
    specialite: r.nom_specialite || "",
    statut: r.statut || "",
    avatar: r.avatar_drive_url || null,
  }))
  const organisations: EntityOption[] = entityRows.filter((r) => r.id_entite).map((r) => ({ id: r.id_entite, sigle: r.sigle_entite || "", nom: r.nom_entite || "" })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  const specialites: SpecialtyOption[] = specialtyRows.filter((r) => r.id_specialite).map((r) => ({ id: r.id_specialite, nom: r.nom_specialite || r.id_specialite })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  return <MedecinsClient medecins={medecins} organisations={organisations} specialites={specialites} />
}
