import type { CompetitionStatus } from "./types"

const allowedStatuses: CompetitionStatus[] = ["PLANIFIEE", "A_VENIR", "EN_COURS", "TERMINEE", "REPORTEE", "ANNULEE", "NON_RENSEIGNE"]
const clean = (value: unknown) => String(value ?? "").trim()

export function validateCompetitionInput(input: Record<string, unknown>) {
  const row = {
    nom_competition: clean(input.nom_competition), id_type_competition: clean(input.id_type_competition), edition: clean(input.edition),
    niveau_competition: clean(input.niveau_competition), date_debut: clean(input.date_debut), date_fin: clean(input.date_fin),
    pays: clean(input.pays), ville: clean(input.ville), lieu: clean(input.lieu), statut: clean(input.statut).toUpperCase(), observations: clean(input.observations),
  }
  if (!row.nom_competition || !row.id_type_competition || !row.date_debut || !row.statut) throw new Error("Le nom, le type, la date de début et le statut sont obligatoires.")
  if (row.date_fin && row.date_fin < row.date_debut) throw new Error("La date de fin doit être postérieure ou égale à la date de début.")
  if (!allowedStatuses.includes(row.statut as CompetitionStatus)) throw new Error("Statut de compétition invalide.")
  return row
}

export function validateTeamParticipationInput(input: Record<string, unknown>) {
  const row = { id_equipe_nationale: clean(input.id_equipe_nationale), statut_participation: clean(input.statut_participation).toUpperCase(), date_engagement: clean(input.date_engagement), observations: clean(input.observations) }
  if (!row.id_equipe_nationale || !row.statut_participation) throw new Error("L’équipe nationale et le statut de participation sont obligatoires.")
  return row
}
