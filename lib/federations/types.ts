export interface Federation {
  id_federation: string
  id_entite: string
  id_sport: string
  nom_federation: string
  sigle_federation: string
  nom_sport: string
  statut: string
  date_affiliation_coc: string
}

export interface Entite { id_entite: string; nom_entite: string; sigle_entite: string }
export interface Sport { id_sport: string; nom_sport: string }

export interface TypeStructure {
  id_type_structure: string
  nom_structure: string
}

export interface Province { id_province: string; nom_province: string }
export interface Ville { id_ville: string; id_province: string; nom_ville: string }
export interface CategorieClub { id_categorie: string; id_sport: string; nom_categorie: string }

export interface Ligue {
  id_ligue_coc: string; id_ligue_federation: string; id_federation: string
  nom_ligue: string; email_ligue: string; pseudo_ligue: string
  id_province: string; nom_province: string
  statut: string
}

export interface Entente {
  id_entente_coc: string; id_entente_federation: string; id_federation: string
  nom_entente: string; pseudo_entente: string
  id_ligue_coc: string; nom_ligue: string
  id_ville: string; nom_ville: string; email_entente: string; statut: string
}

export interface Club {
  id_club_coc: string; id_club_federation: string; nom_club: string
  id_categorie: string; nom_categorie: string
  id_entente_coc: string; nom_entente: string; pseudo_entente: string
  id_ligue_coc: string; nom_ligue: string; pseudo_ligue: string
  id_federation: string; id_province: string; id_ville: string; nom_ville: string; statut: string
}

export interface RelationHierarchique {
  id_hierarchie: string; id_federation: string
  id_type_structure: string; nom_structure: string
  niveau: string; observations: string
}

export interface FederationData {
  federations: Federation[]; typesStructure: TypeStructure[]
  provinces: Province[]; villes: Ville[]; ligues: Ligue[]
  categoriesClub: CategorieClub[]; ententes: Entente[]; clubs: Club[]; hierarchie: RelationHierarchique[]
}
