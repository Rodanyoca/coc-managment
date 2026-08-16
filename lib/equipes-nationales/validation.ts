import { ACTOR_TYPES, type ActorType } from "./types"
const clean = (value: unknown) => String(value ?? "").trim()
export const NATIONAL_TEAM_STATUSES = ["ACTIF", "INACTIF"] as const
export function validateTeamInput(input: Record<string, unknown>) {
  const row = { id_federation: clean(input.id_federation), id_sport: clean(input.id_sport), id_discipline: clean(input.id_discipline), nom_equipe_nationale: clean(input.nom_equipe_nationale), id_categorie_age: clean(input.id_categorie_age), id_sexe: clean(input.id_sexe), statut: clean(input.statut).toUpperCase(), date_debut: clean(input.date_debut), date_fin: clean(input.date_fin), observations: clean(input.observations) }
  if (!row.id_federation || !row.id_sport || !row.nom_equipe_nationale || !row.statut) throw new Error("La fédération, le sport, le nom et le statut sont obligatoires.")
  if (!NATIONAL_TEAM_STATUSES.includes(row.statut as (typeof NATIONAL_TEAM_STATUSES)[number])) throw new Error("Statut d’équipe nationale invalide.")
  if (row.date_fin && row.date_debut && row.date_fin < row.date_debut) throw new Error("La date de fin doit être postérieure ou égale à la date de début.")
  return row
}
export function validateMemberInput(input: Record<string, unknown>) {
  const row = { id_acteur_coc: clean(input.id_acteur_coc), id_type_acteur: clean(input.id_type_acteur).toUpperCase(), role_equipe: clean(input.role_equipe || input.role_selection), date_debut: clean(input.date_debut), date_fin: clean(input.date_fin), statut: clean(input.statut).toUpperCase(), observations: clean(input.observations) }
  if (!row.id_acteur_coc || !ACTOR_TYPES.includes(row.id_type_acteur as ActorType) || !row.role_equipe || !row.date_debut || !row.statut) throw new Error("Le type, l’acteur, le rôle, la date de début et le statut sont obligatoires.")
  if (!NATIONAL_TEAM_STATUSES.includes(row.statut as (typeof NATIONAL_TEAM_STATUSES)[number])) throw new Error("Statut de membre invalide.")
  if (row.date_fin && row.date_fin < row.date_debut) throw new Error("La date de fin doit être postérieure ou égale à la date de début.")
  return row
}
