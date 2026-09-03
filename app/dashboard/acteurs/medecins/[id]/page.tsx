import { notFound } from "next/navigation"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getSheetRows } from "@/lib/google/sheets"
import { MedecinDetailClient, type MedecinDetail } from "./medecin-detail-client"
import type { EntityOption, SpecialtyOption } from "../medecins-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MedecinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [rows, entityRows, specialtyRows] = await Promise.all([
    getSheetRows({ sheetName: "MEDECINS", spreadsheetId: getActeursSpreadsheetId() }),
    getSheetRows({ sheetName: "ENTITES", spreadsheetId: getReferentialSpreadsheetId(), bypassCache: true }),
    getSheetRows({ sheetName: "SPECIALITES_MEDECIN", spreadsheetId: getReferentialSpreadsheetId(), bypassCache: true }),
  ])
  const r = rows.find((row) => row.id_medecin_coc === id)
  if (!r) notFound()
  const linkedEntity = entityRows.find((row) => row.id_entite === (r.id_entite || r.id_federation))
  const linkedSpecialty = specialtyRows.find((row) => row.id_specialite_sante === (r.id_specialite_sante || r.id_specialite))
  const medecin: MedecinDetail = {
    id: r.id_medecin_coc, idFederation: r.id_entite || r.id_federation || "", idNational: r.id_national || "", idFederal: r.id_medecin_entite || r.id_medecin_federation || "", idInternational: r.id_international || "", nomComplet: r.nom_complet || "", sexe: r.nom_sexe || r.id_sexe || "", dateNaissance: r.date_de_naissance || "", lieuNaissance: r.lieu_de_naissance || "", nationalite: r.nationalite || "", federation: linkedEntity?.nom_officiel || linkedEntity?.nom_entite || linkedEntity?.sigle || r.nom_entite || r.nom_federation || "", idSpecialite: r.id_specialite_sante || r.id_specialite || "", specialite: linkedSpecialty?.nom_specialite_sante || r.nom_specialite || "", telephone: r.telephone || "", email: r.email || "", adresse: r.adresse || "", numeroPasseport: r.numero_passeport || "", dateDelivrancePasseport: r.date_de_delivrance_passeport || "", dateExpirationPasseport: r.date_expiration_passeport || "", statut: r.statut?.toLowerCase() === "inactif" ? "inactif" : "actif", avatarUrl: r.avatar_drive_url || null, urlPasseport: r.passeport_drive_url || null,
  }
  const organisations: EntityOption[] = entityRows.filter((row) => row.id_entite).map((row) => ({ id: row.id_entite, sigle: row.sigle || row.sigle_entite || "", nom: row.nom_officiel || row.nom_entite || row.id_entite })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  const specialites: SpecialtyOption[] = specialtyRows.filter((row) => row.id_specialite_sante).map((row) => ({ id: row.id_specialite_sante, nom: row.nom_specialite_sante || row.id_specialite_sante })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  return <MedecinDetailClient medecin={medecin} organisations={organisations} specialites={specialites} />
}
