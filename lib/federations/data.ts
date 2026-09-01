import { getSheetsRows } from "@/lib/google/sheets"
import { getReferentialSpreadsheetId, getTerritorialSpreadsheetId } from "./config"
import { mapCategorieClubRow, mapCercleRow, mapClubRow, mapEntenteRow, mapEntiteRow, mapEquipeRow, mapFederationRow, mapHierarchieRow, mapLigueRow, mapProvinceRow, mapSportRow, mapTypeStructureRow, mapVilleRow } from "./mappers"
import { REFERENTIAL_SHEETS, TERRITORIAL_RESOURCES } from "./schema"
import type { FederationData } from "./types"

export async function loadFederations() {
  const referential = await getSheetsRows({ sheetNames: ["ENTITES", "SPORTS", "FEDERATIONS", "CATEGORIES_ENTITES"], spreadsheetId: getReferentialSpreadsheetId(), cacheTtlMs: 5000 })
  const entities = new Map(referential.ENTITES.map(mapEntiteRow).map((item) => [item.id_entite, item]))
  const sports = new Map(referential.SPORTS.map(mapSportRow).map((item) => [item.id_sport, item]))
  const entityCategories = new Map(referential.CATEGORIES_ENTITES.map((item) => [item.id_categorie_entite, item.nom_categorie_entite]))
  const federations = referential.FEDERATIONS.map(mapFederationRow).filter((item) => item.id_federation).map((item) => {
    const entity = entities.get(item.id_entite)
    return { ...item, nom_federation: entity?.nom_entite || "", sigle_federation: entity?.sigle_entite || "", nom_sport: sports.get(item.id_sport)?.nom_sport || "", categorie_entite: entityCategories.get(entity?.id_categorie_entite || "") || "", adresse_siege: entity?.adresse_siege || "", telephone: entity?.telephone || "", email: entity?.email || "", site_web: entity?.site_web || "", nom_entite_continentale: entities.get(item.id_entite_continentale)?.nom_entite || "", nom_entite_internationale: entities.get(item.id_entite_internationale)?.nom_entite || "", observations: item.observations || entity?.observations || "" }
  })
  return [...new Map(federations.map((item) => [item.id_federation, item])).values()].sort((a, b) => a.nom_federation.localeCompare(b.nom_federation, "fr"))
}

export async function loadFederationData(): Promise<FederationData> {
  const [referential, territorial] = await Promise.all([
    getSheetsRows({ sheetNames: Object.values(REFERENTIAL_SHEETS), spreadsheetId: getReferentialSpreadsheetId(), cacheTtlMs: 5000 }),
    getSheetsRows({ sheetNames: [...Object.values(TERRITORIAL_RESOURCES).map((item) => item.sheet), "CERCLES", "EQUIPES"], spreadsheetId: getTerritorialSpreadsheetId(), cacheTtlMs: 5000 }),
  ])
  const entities = new Map(referential.ENTITES.map(mapEntiteRow).map((item) => [item.id_entite, item]))
  const sports = new Map(referential.SPORTS.map(mapSportRow).map((item) => [item.id_sport, item]))
  const entityCategories = new Map(referential.CATEGORIES_ENTITES.map((item) => [item.id_categorie_entite, item.nom_categorie_entite]))
  const federations = referential.FEDERATIONS.map(mapFederationRow)
    .filter((item) => item.id_federation)
    .map((item) => {
      const entity = entities.get(item.id_entite)
      return {
        ...item,
        nom_federation: entity?.nom_entite || "",
        sigle_federation: entity?.sigle_entite || "",
        nom_sport: sports.get(item.id_sport)?.nom_sport || "",
        nom_entite_continentale: entities.get(item.id_entite_continentale)?.nom_entite || "",
        nom_entite_internationale: entities.get(item.id_entite_internationale)?.nom_entite || "",
        categorie_entite: entityCategories.get(entity?.id_categorie_entite || "") || "",
        adresse_siege: entity?.adresse_siege || "",
        telephone: entity?.telephone || "",
        email: entity?.email || "",
        site_web: entity?.site_web || "",
        observations: item.observations || entity?.observations || "",
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
    cercles: territorial.CERCLES.map(mapCercleRow).filter((item) => item.id_federation || item.nom_cercle),
    clubs: territorial.CLUBS.map(mapClubRow).filter((item) => item.id_federation || item.nom_club),
    equipes: territorial.EQUIPES.map(mapEquipeRow).filter((item) => item.id_federation || item.nom_equipe),
    hierarchie: territorial.HIERARCHIE.map(mapHierarchieRow).map((item) => ({ ...item, nom_structure: item.nom_structure || typeNames.get(item.id_type_structure) || "" })).filter((item) => item.id_federation || item.id_type_structure),
  }
}
