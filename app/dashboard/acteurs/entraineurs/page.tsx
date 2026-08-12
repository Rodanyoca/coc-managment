import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getFederationOptions } from "@/lib/federations/options"
import { getSheetRows } from "@/lib/google/sheets"
import EntraineursClient, { type CoachListItem, type FederationOption } from "./entraineurs-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function EntraineursPage() {
  const [rows, federationRows] = await Promise.all([
    getSheetRows({ sheetName: "COACHS", spreadsheetId: getActeursSpreadsheetId() }),
    getFederationOptions(),
  ])
  const coachs: CoachListItem[] = rows.filter((r) => r.id_coach_coc || r.nom_complet).map((r) => ({
    id: r.id_coach_coc,
    idNational: r.id_national || "",
    idFederal: r.id_coach_federation || "",
    nomComplet: r.nom_complet || "",
    sexe: r.nom_sexe || r.id_sexe || "",
    dateNaissance: r.date_de_naissance || "",
    federation: r.nom_federation || "",
    statut: r.statut || "",
    avatar: r.avatar_drive_url || null,
  }))
  const federations: FederationOption[] = federationRows.map(({ id, sigle, nom }) => ({ id, sigle, nom }))
  return <EntraineursClient coachs={coachs} federations={federations} />
}
