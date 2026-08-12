import { getSheetsRows } from "@/lib/google/sheets"
import { getReferentialSpreadsheetId, getTerritorialSpreadsheetId } from "./config"
import { mapCategorieClubRow, mapClubRow, mapEntenteRow, mapEntiteRow, mapFederationRow, mapHierarchieRow, mapLigueRow, mapProvinceRow, mapSportRow, mapTypeStructureRow, mapVilleRow } from "./mappers"
import { REFERENTIAL_SHEETS, TERRITORIAL_RESOURCES } from "./schema"
import type { FederationData } from "./types"

export async function loadFederationData(): Promise<FederationData> {
  const [referential, territorial] = await Promise.all([
    getSheetsRows({ sheetNames: Object.values(REFERENTIAL_SHEETS), spreadsheetId: getReferentialSpreadsheetId() }),
    getSheetsRows({ sheetNames: Object.values(TERRITORIAL_RESOURCES).map((item) => item.sheet), spreadsheetId: getTerritorialSpreadsheetId() }),
  ])
  const entities = new Map(referential.ENTITES.map(mapEntiteRow).map((item) => [item.id_entite, item]))
  const sports = new Map(referential.SPORTS.map(mapSportRow).map((item) => [item.id_sport, item]))
  const federations = referential.FEDERATIONS.map(mapFederationRow)
    .filter((item) => item.id_federation)
    .map((item) => {
      const entity = entities.get(item.id_entite)
      return {
        ...item,
        nom_federation: entity?.nom_entite || "",
        sigle_federation: entity?.sigle_entite || "",
        nom_sport: sports.get(item.id_sport)?.nom_sport || "",
      }
    })
  const typesStructure = referential.TYPES_STRUCTURE.map(mapTypeStructureRow).filter((item) => item.id_type_structure)
  const typeNames = new Map(typesStructure.map((item) => [item.id_type_structure, item.nom_structure]))
  return {
    federations: [...new Map(federations.map((item) => [item.id_federation, item])).values()].sort((a, b) => a.nom_federation.localeCompare(b.nom_federation, "fr")),
    typesStructure,
    provinces: referential.PROVINCES.map(mapProvinceRow).filter((item) => item.id_province),
    villes: referential.VILLES.map(mapVilleRow).filter((item) => item.id_ville),
    categoriesClub: referential.CATEGORIES_CLUB.map(mapCategorieClubRow).filter((item) => item.id_categorie),
    ligues: territorial.LIGUES.map(mapLigueRow).filter((item) => item.id_federation || item.nom_ligue),
    ententes: territorial.ENTENTES.map(mapEntenteRow).filter((item) => item.id_federation || item.nom_entente),
    clubs: territorial.CLUBS.map(mapClubRow).filter((item) => item.id_federation || item.nom_club),
    hierarchie: territorial.HIERARCHIE.map(mapHierarchieRow).map((item) => ({ ...item, nom_structure: item.nom_structure || typeNames.get(item.id_type_structure) || "" })).filter((item) => item.id_federation || item.id_type_structure),
  }
}
