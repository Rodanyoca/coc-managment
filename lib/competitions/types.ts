export const COMPETITION_HEADERS = ["id_competition", "nom_competition", "id_type_competition", "edition", "niveau_competition", "date_debut", "date_fin", "pays", "ville", "lieu", "statut", "observations"] as const
export const TEAM_PARTICIPATION_HEADERS = ["id_participation_equipe", "id_competition", "id_equipe_nationale", "statut_participation", "date_engagement", "observations"] as const

export type CompetitionStatus = "PLANIFIEE" | "A_VENIR" | "EN_COURS" | "TERMINEE" | "REPORTEE" | "ANNULEE" | "NON_RENSEIGNE"
export type Competition = Record<(typeof COMPETITION_HEADERS)[number], string> & { statut_normalise: CompetitionStatus }
export type TeamParticipation = Record<(typeof TEAM_PARTICIPATION_HEADERS)[number], string>
export type CompetitionOption = { id: string; label: string }
export type NationalTeamOption = { id: string; label: string; federationId: string; federation: string; sportId: string; sport: string; discipline: string }
export type CompetitionReferences = { types: CompetitionOption[]; teams: NationalTeamOption[]; teamsAvailable: boolean }
