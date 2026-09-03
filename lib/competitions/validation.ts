import type { CompetitionStatus } from "./types"

const allowedStatuses: CompetitionStatus[] = ["PLANIFIEE", "EN_COURS", "TERMINEE", "REPORTEE", "ANNULEE"]
const clean = (value: unknown) => String(value ?? "").trim()

export function validateCompetitionInput(input: Record<string, unknown>) {
  const row = {
    nom_competition: clean(input.nom_competition), id_type_competition: clean(input.id_type_competition), edition: clean(input.edition), est_multisport: clean(input.est_multisport || "NON").toUpperCase(),
    niveau_competition: clean(input.niveau_competition), date_debut: clean(input.date_debut), date_fin: clean(input.date_fin),
    pays: clean(input.pays), ville: clean(input.ville), lieu: clean(input.lieu), statut: clean(input.statut).toUpperCase(), observations: clean(input.observations),
  }
  if (!row.nom_competition || !row.id_type_competition || !row.date_debut || !row.statut) throw new Error("Le nom, le type, la date de début et le statut sont obligatoires.")
  if (row.date_fin && row.date_fin < row.date_debut) throw new Error("La date de fin doit être postérieure ou égale à la date de début.")
  if (!allowedStatuses.includes(row.statut as CompetitionStatus)) throw new Error("Statut de compétition invalide.")
  if (!["OUI", "NON"].includes(row.est_multisport)) throw new Error("Le caractère multisport doit valoir OUI ou NON.")
  return row
}

export function validateTeamParticipationInput(input: Record<string, unknown>) {
  const row = { id_equipe_nationale: clean(input.id_equipe_nationale), statut_participation: clean(input.statut_participation).toUpperCase(), date_engagement: clean(input.date_engagement), observations: clean(input.observations) }
  if (!row.id_equipe_nationale || !row.statut_participation) throw new Error("L’équipe nationale et le statut de participation sont obligatoires.")
  return row
}

export function validateProgramInput(input: Record<string, unknown>) {
  const row = { id_epreuve: clean(input.id_epreuve), id_categorie_age: clean(input.id_categorie_age), id_sexe: clean(input.id_sexe), date_debut: clean(input.date_debut), date_fin: clean(input.date_fin), observations: clean(input.observations) }
  if (!row.id_epreuve) throw new Error("L’épreuve est obligatoire.")
  if (row.date_debut && !/^\d{4}-\d{2}-\d{2}$/.test(row.date_debut)) throw new Error("Date de début du programme invalide.")
  if (row.date_fin && !/^\d{4}-\d{2}-\d{2}$/.test(row.date_fin)) throw new Error("Date de fin du programme invalide.")
  if (row.date_fin && (!row.date_debut || row.date_fin < row.date_debut)) throw new Error("La période du programme est invalide.")
  return row
}

export function validateEngagementInput(input: Record<string, unknown>) {
  const row = { id_programme_competition: clean(input.id_programme_competition), id_campagne: clean(input.id_campagne), id_statut_engagement: clean(input.id_statut_engagement).toUpperCase(), date_engagement: clean(input.date_engagement), date_debut: clean(input.date_debut), date_fin: clean(input.date_fin), id_federation_source: clean(input.id_federation_source), date_transmission: clean(input.date_transmission), reference_source: clean(input.reference_source), observation: clean(input.observation) }
  for (const field of ["id_programme_competition", "id_campagne", "id_statut_engagement", "date_engagement", "id_federation_source", "date_transmission"] as const) if (!row[field]) throw new Error(`${field} est obligatoire.`)
  for (const field of ["date_engagement", "date_debut", "date_fin", "date_transmission"] as const) if (row[field] && !/^\d{4}-\d{2}-\d{2}$/.test(row[field])) throw new Error(`${field} est invalide.`)
  if (row.date_fin && (!row.date_debut || row.date_fin < row.date_debut)) throw new Error("La période de l’engagement est invalide.")
  return row
}
export function validateAthleteParticipationInput(input: Record<string, unknown>) {
  const row={id_engagement_campagne:clean(input.id_engagement_campagne),id_selection:clean(input.id_selection),id_statut_participation:clean(input.id_statut_participation).toUpperCase(),date_statut:clean(input.date_statut),id_selection_remplacement:clean(input.id_selection_remplacement),observation:clean(input.observation)}
  if(!row.id_engagement_campagne||!row.id_selection||!row.id_statut_participation||!row.date_statut) throw new Error("L’engagement, la sélection, le statut et la date sont obligatoires.")
  if(!["INSCRIT","PARTICIPANT","ABSENT","FORFAIT","REMPLACE"].includes(row.id_statut_participation)) throw new Error("Statut de participation invalide.")
  if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date_statut)) throw new Error("Date de participation invalide.")
  if(row.id_statut_participation==="REMPLACE"&&!row.id_selection_remplacement) throw new Error("La sélection remplaçante est obligatoire.")
  if(row.id_selection_remplacement===row.id_selection) throw new Error("Une sélection ne peut pas se remplacer elle-même.")
  return row
}
export function validateCompetitionResultInput(input:Record<string,unknown>){
 const row={id_engagement_campagne:clean(input.id_engagement_campagne),date_resultat:clean(input.date_resultat),phase:clean(input.phase),adversaire:clean(input.adversaire),pays_adversaire:clean(input.pays_adversaire),id_resultat_synthetique:clean(input.id_resultat_synthetique),valeur_rdc:clean(input.valeur_rdc),valeur_adversaire:clean(input.valeur_adversaire),id_unite_mesure:clean(input.id_unite_mesure),id_decision_resultat:clean(input.id_decision_resultat),id_federation_source:clean(input.id_federation_source),date_transmission:clean(input.date_transmission),reference_source:clean(input.reference_source),id_statut_validation_resultat:clean(input.id_statut_validation_resultat).toUpperCase(),date_validation:clean(input.date_validation),id_validateur_coc:clean(input.id_validateur_coc),motif_correction:clean(input.motif_correction),observation:clean(input.observation)}
 for(const field of ["id_engagement_campagne","date_resultat","id_federation_source","date_transmission","id_statut_validation_resultat"] as const)if(!row[field])throw new Error(`${field} est obligatoire.`)
 for(const field of ["date_resultat","date_transmission","date_validation"] as const)if(row[field]&&!/^\d{4}-\d{2}-\d{2}$/.test(row[field]))throw new Error(`${field} est invalide.`)
 if(!row.id_resultat_synthetique&&!row.id_decision_resultat&&!row.valeur_rdc)throw new Error("Le résultat doit contenir une synthèse, une décision ou une valeur.")
 if(row.valeur_adversaire&&!row.adversaire)throw new Error("L’adversaire est obligatoire avec une valeur adverse.")
 if(!["BROUILLON","TRANSMIS","VALIDE_FEDERATION","VALIDE_COC","HOMOLOGUE","CORRIGE","ANNULE"].includes(row.id_statut_validation_resultat))throw new Error("Statut de validation invalide.")
 if(["VALIDE_FEDERATION","VALIDE_COC","HOMOLOGUE"].includes(row.id_statut_validation_resultat)&&!row.date_validation)throw new Error("La date de validation est obligatoire.")
 if(["VALIDE_COC","HOMOLOGUE"].includes(row.id_statut_validation_resultat)&&!row.id_validateur_coc)throw new Error("Le validateur COC est obligatoire.")
 return row
}
export function validateResultSegmentInput(input:Record<string,unknown>){const row={id_resultat:clean(input.id_resultat),id_type_segment:clean(input.id_type_segment),numero_segment:clean(input.numero_segment),valeur_rdc:clean(input.valeur_rdc),valeur_adversaire:clean(input.valeur_adversaire),observation:clean(input.observation)};if(!row.id_resultat||!row.id_type_segment||!row.numero_segment)throw new Error("Le résultat, le type et le numéro du segment sont obligatoires.");if(!/^\d+$/.test(row.numero_segment)||Number(row.numero_segment)<1)throw new Error("Le numéro du segment est invalide.");if(!row.valeur_rdc&&!row.valeur_adversaire&&!row.observation)throw new Error("Un segment sans valeur doit être justifié.");return row}
export function isSegmentTypeCompatible(type:{federationId?:string;sportId?:string;disciplineId?:string},context:{federationId?:string;sportId?:string;disciplineId?:string}){return(!type.federationId||type.federationId===context.federationId)&&(!type.sportId||type.sportId===context.sportId)&&(!type.disciplineId||type.disciplineId===context.disciplineId)}
export function assertSegmentMaximum(numero:string,maximum:number){if(maximum&&Number(numero)>maximum)throw new Error("Le numéro dépasse le maximum officiel du segment.")}
export function validateIndividualPerformanceInput(input:Record<string,unknown>){const row={id_resultat:clean(input.id_resultat),id_participation_athlete:clean(input.id_participation_athlete),id_type_resultat:clean(input.id_type_resultat),valeur:clean(input.valeur),id_unite_mesure:clean(input.id_unite_mesure),rang:clean(input.rang),est_record:clean(input.est_record||"NON").toUpperCase(),est_meilleure_performance:clean(input.est_meilleure_performance||"NON").toUpperCase(),id_distinction:clean(input.id_distinction),observation:clean(input.observation)};for(const field of ["id_resultat","id_participation_athlete","id_type_resultat"] as const)if(!row[field])throw new Error(`${field} est obligatoire.`);if(!row.valeur&&!row.rang&&!row.id_distinction)throw new Error("La performance doit contenir une valeur, un rang ou une distinction.");if(row.rang&&(!/^\d+$/.test(row.rang)||Number(row.rang)<1))throw new Error("Le rang est invalide.");if(!["OUI","NON"].includes(row.est_record)||!["OUI","NON"].includes(row.est_meilleure_performance))throw new Error("Les indicateurs de performance sont invalides.");return row}
export function isPerformanceReferenceCompatible(reference:{federationId?:string;sportId?:string;disciplineId?:string},context:{federationId?:string;sportId?:string;disciplineId?:string}){return(!reference.federationId||reference.federationId===context.federationId)&&(!reference.sportId||reference.sportId===context.sportId)&&(!reference.disciplineId||reference.disciplineId===context.disciplineId)}
