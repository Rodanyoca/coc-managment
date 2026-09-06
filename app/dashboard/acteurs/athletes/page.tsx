import { getSheetRows } from "@/lib/google/sheets"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { ACTOR_SHEETS } from "@/lib/acteurs/sheets"
import { getFederationOptions } from "@/lib/federations/options"
import { AthletesClient, type AthleteListItem, type FederationOption } from "./athletes-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function AthletesPage() {
  const [rows, federationRows] = await Promise.all([
    getSheetRows({
      sheetName: ACTOR_SHEETS.ATHLETE,
      spreadsheetId: getActeursSpreadsheetId(),
    }),
    getFederationOptions(),
  ])
  const federationById = new Map(federationRows.map((item) => [item.id, item.sigle || item.nom || item.id]))

  const athletes: AthleteListItem[] = rows
    .filter((row) => Boolean(row.id_athlete_coc || row.id_national || row.nom_complet))
    .map((row) => ({
      id: row.id_athlete_coc || row.id_national,
      idNational: row.id_national || "",
      idFederal: row.id_athlete_federation || "",
      nomComplet: row.nom_complet || "",
      sexe: row.nom_sexe || row.id_sexe || "",
      dateNaissance: row.date_de_naissance || "",
      federation: federationById.get(row.id_federation) || row.sigle_federation || "",
      federationId: row.id_federation || "",
      statut: row.statut || "",
      avatar: row.avatar_drive_url || null,
    }))

  const federations: FederationOption[] = federationRows.map(({ id, sigle, nom }) => ({
    id,
    sigle,
    nom,
  }))

  return <AthletesClient athletes={athletes} federations={federations} />
}
