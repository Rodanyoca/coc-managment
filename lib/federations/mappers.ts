import type { CategorieClub, Club, Entente, Entite, Federation, Ligue, Province, RelationHierarchique, Sport, TypeStructure, Ville } from "./types"

const value = (row: Record<string, unknown>, key: string) => String(row[key] ?? "").trim()
const map = <T>(row: Record<string, unknown>, keys: readonly string[]) =>
  Object.fromEntries(keys.map((key) => [key, value(row, key)])) as T

export const mapProvinceRow = (r: Record<string, unknown>): Province => ({
  id_province: value(r, "id_province") || value(r, "code_province") || value(r, "nom_province"),
  nom_province: value(r, "nom_province"),
})
export const mapVilleRow = (r: Record<string, unknown>): Ville => ({
  nom_ville: value(r, "nom_ville"),
  id_ville: value(r, "id_ville") || value(r, "nom_ville"),
  id_province: value(r, "id_province"),
})
export const mapCategorieClubRow = (r: Record<string, unknown>) => map<CategorieClub>(r, ["id_categorie", "id_sport", "nom_categorie"])
export const mapLigueRow = (r: Record<string, unknown>): Ligue => ({
  ...map<Ligue>(r, ["id_ligue_coc", "id_ligue_federation", "id_federation", "nom_ligue", "pseudo_ligue", "email_ligue", "id_province", "nom_province", "statut"]),
  id_ligue_federation: value(r, "id_ligue_federation") || value(r, "id_ligue_federal"),
})
export const mapEntenteRow = (r: Record<string, unknown>) => map<Entente>(r, ["id_entente_coc", "id_entente_federation", "id_federation", "nom_entente", "pseudo_entente", "id_ligue_coc", "nom_ligue", "id_ville", "nom_ville", "email_entente", "statut"])
export const mapClubRow = (r: Record<string, unknown>) => map<Club>(r, ["id_club_coc", "id_club_federation", "nom_club", "id_categorie", "nom_categorie", "id_entente_coc", "nom_entente", "pseudo_entente", "id_ligue_coc", "nom_ligue", "pseudo_ligue", "id_federation", "id_province", "id_ville", "nom_ville", "statut"])
export const mapHierarchieRow = (r: Record<string, unknown>): RelationHierarchique => ({
  ...map<RelationHierarchique>(r, ["id_hierarchie", "id_federation", "id_type_structure", "nom_structure", "niveau", "observations"]),
})
export const mapTypeStructureRow = (r: Record<string, unknown>) => map<TypeStructure>(r, ["id_type_structure", "nom_structure"])
export const mapEntiteRow = (r: Record<string, unknown>) => map<Entite>(r, ["id_entite", "nom_entite", "sigle_entite"])
export const mapSportRow = (r: Record<string, unknown>) => map<Sport>(r, ["id_sport", "nom_sport"])

export function mapFederationRow(r: Record<string, unknown>): Federation {
  return {
    id_federation: value(r, "id_federation"),
    id_entite: value(r, "id_entite"),
    id_sport: value(r, "id_sport"),
    nom_federation: "",
    sigle_federation: "",
    nom_sport: "",
    statut: value(r, "statut"),
    date_affiliation_coc: value(r, "date_affiliation_coc"),
  }
}
