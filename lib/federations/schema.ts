export const REFERENTIAL_SHEETS = {
  entites: "ENTITES",
  sports: "SPORTS",
  federations: "FEDERATIONS",
  provinces: "PROVINCES",
  villes: "VILLES",
  typesStructure: "TYPES_STRUCTURE",
  categoriesClub: "CATEGORIES_CLUB",
} as const

export const TERRITORIAL_RESOURCES = {
  hierarchie: { sheet: "HIERARCHIE", idColumn: "id_hierarchie" },
  ligues: { sheet: "LIGUES", idColumn: "id_ligue_coc" },
  ententes: { sheet: "ENTENTES", idColumn: "id_entente_coc" },
  clubs: { sheet: "CLUBS", idColumn: "id_club_coc" },
} as const

export type TerritorialResource = keyof typeof TERRITORIAL_RESOURCES

export const SHEET_COLUMNS = {
  HIERARCHIE: ["id_hierarchie", "id_federation", "id_type_structure", "nom_structure", "niveau", "observations"],
  LIGUES: ["id_ligue_coc", "id_ligue_federal", "id_federation", "nom_federation", "sigle_federation", "id_province", "nom_province", "nom_ligue", "pseudo_ligue", "email_ligue", "statut", "observations"],
  ENTENTES: ["id_entente_coc", "id_entente_federation", "id_federation", "nom_federation", "id_ligue_coc", "id_ligue_federation", "nom_ligue", "nom_entente", "pseudo_entente", "id_ville", "nom_ville", "email_entente", "statut", "observations"],
  CLUBS: ["id_club_coc", "id_club_federation", "nom_club", "id_categorie", "nom_categorie", "id_entente_coc", "id_entente_federation", "nom_entente", "pseudo_entente", "id_ligue_coc", "id_ligue_federation", "nom_ligue", "pseudo_ligue", "id_federation", "nom_federation", "id_province", "id_ville", "nom_ville", "statut", "observation"],
} as const

export function selectSheetColumns(sheet: keyof typeof SHEET_COLUMNS, row: Record<string, string>) {
  return Object.fromEntries(SHEET_COLUMNS[sheet].map((column) => [column, row[column] ?? ""]))
}
