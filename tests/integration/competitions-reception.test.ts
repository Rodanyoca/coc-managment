import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { mapV1Row, validateEngagement, validateParticipation, validateResult, validateV1Relations } from "../../lib/competitions/v1-model.ts"
import { assertSegmentMaximum, validateCompetitionResultInput, validateIndividualPerformanceInput, validateResultSegmentInput } from "../../lib/competitions/validation.ts"

const campaign = mapV1Row("CAMPAGNES_EQUIPES_NATIONALES", { id_campagne: "CAM-RDC-2028", id_equipe_nationale: "EQ-RDC", nom_campagne: "Jeux 2028", date_debut: "2028-07-01", statut: "ACTIF" })
const programs = [
  mapV1Row("PROGRAMMES_COMPETITION", { id_programme_competition: "PRG-BASKET", id_competition: "COM-JO-2028", id_epreuve: "BASKET-5X5" }),
  mapV1Row("PROGRAMMES_COMPETITION", { id_programme_competition: "PRG-VOLLEY", id_competition: "COM-JO-2028", id_epreuve: "VOLLEY-SALLE" }),
  mapV1Row("PROGRAMMES_COMPETITION", { id_programme_competition: "PRG-ATH-100M", id_competition: "COM-JO-2028", id_epreuve: "ATH-100M" }),
]
const engagement = (id: string, program: string) => validateEngagement(mapV1Row("ENGAGEMENTS_CAMPAGNES_PROGRAMMES", { id_engagement_campagne: id, id_programme_competition: program, id_campagne: campaign.id_campagne, id_statut_engagement: "CONFIRME", date_engagement: "2028-06-01", id_federation_source: "FED-RDC", date_transmission: "2028-06-02" }))
const engagements = [engagement("ENG-BASKET", "PRG-BASKET"), engagement("ENG-VOLLEY", "PRG-VOLLEY"), engagement("ENG-ATH", "PRG-ATH-100M")]
const selected = mapV1Row("SELECTIONS_ATHLETES", { id_selection: "SEL-TIT", id_campagne: campaign.id_campagne, id_athlete: "ATH-1", date_selection: "2028-06-10", id_statut_selection: "SELECTIONNE" })
const substitute = mapV1Row("SELECTIONS_ATHLETES", { id_selection: "SEL-REM", id_campagne: campaign.id_campagne, id_athlete: "ATH-2", date_selection: "2028-06-10", id_statut_selection: "REMPLACANT" })
const participation = validateParticipation(mapV1Row("PARTICIPATIONS_ATHLETES_COMPETITION", { id_participation_athlete: "PAT-1", id_engagement_campagne: "ENG-ATH", id_selection: selected.id_selection, id_statut_participation: "REMPLACE", date_statut: "2028-07-20", id_selection_remplacement: substitute.id_selection }))
const result = (id: string, logical: string, engagementId: string, programId: string, version = "1", previous = "", status = "TRANSMIS") => validateResult(mapV1Row("RESULTATS", { id_resultat: id, id_resultat_logique: logical, numero_version: version, id_resultat_precedent: previous, est_version_courante: "OUI", id_engagement_campagne: engagementId, id_programme_competition: programId, date_resultat: "2028-07-21", id_resultat_synthetique: "SYN_VICTOIRE", id_federation_source: "FED-RDC", date_transmission: "2028-07-22", id_statut_validation_resultat: status, motif_correction: previous ? "Correction officielle" : "" }))

test("réception: parcours multisport complet équipe-campagne-programme-participant-résultat", () => {
  const results = [result("RES-BASKET", "LOG-BASKET", "ENG-BASKET", "PRG-BASKET"), result("RES-VOLLEY", "LOG-VOLLEY", "ENG-VOLLEY", "PRG-VOLLEY"), result("RES-ATH", "LOG-ATH", "ENG-ATH", "PRG-ATH-100M")]
  assert.doesNotThrow(() => validateV1Relations({ programs, campaigns: [campaign], engagements, selections: [selected, substitute], participations: [participation], results }))
  assert.equal(new Set(programs.map((row) => row.id_competition)).size, 1, "une compétition multisport reste unique")
})

test("réception: Basket et Volleyball conservent leurs segments sans recalcul", () => {
  const quarters = [1, 2, 3, 4].map((numero) => validateResultSegmentInput({ id_resultat: "RES-BASKET", id_type_segment: "SEG_QUART_TEMPS", numero_segment: String(numero), valeur_rdc: "20", valeur_adversaire: "18" }))
  const sets = [1, 2, 3, 4, 5].map((numero) => validateResultSegmentInput({ id_resultat: "RES-VOLLEY", id_type_segment: "SEG_SET", numero_segment: String(numero), valeur_rdc: "25", valeur_adversaire: "23" }))
  assert.equal(quarters.length, 4); assert.equal(sets.length, 5)
  assert.doesNotThrow(() => assertSegmentMaximum("4", 4)); assert.doesNotThrow(() => assertSegmentMaximum("5", 5))
  assert.throws(() => assertSegmentMaximum("6", 5), /maximum officiel/i)
})

test("réception: remplacement et performance mesurée restent distincts", () => {
  assert.equal(participation.id_statut_participation, "REMPLACE")
  assert.equal(participation.id_selection_remplacement, substitute.id_selection)
  const performance = validateIndividualPerformanceInput({ id_resultat: "RES-ATH", id_participation_athlete: "PAT-1", id_type_resultat: "TR_TEMPS", valeur: "10.12", id_unite_mesure: "UNIT_SECONDE", rang: "2", est_record: "NON" })
  assert.equal(performance.id_unite_mesure, "UNIT_SECONDE")
  assert.equal(performance.rang, "2")
})

test("réception: une correction homologuée exige les preuves officielles", async () => {
  const homologated = validateCompetitionResultInput({ id_engagement_campagne: "ENG-BASKET", date_resultat: "2028-07-21", id_resultat_synthetique: "SYN_VICTOIRE", id_federation_source: "FED-RDC", date_transmission: "2028-07-22", id_statut_validation_resultat: "HOMOLOGUE", date_validation: "2028-07-23", id_validateur_coc: "USR-COC" })
  assert.equal(homologated.id_statut_validation_resultat, "HOMOLOGUE")
  const data = await readFile(new URL("../../lib/competitions/data.ts", import.meta.url), "utf8")
  assert.match(data, /id_resultat_precedent:current\.id_resultat/)
  assert.match(data, /motif_correction/)
})

test("réception: le modèle refuse les relations croisées entre campagnes", () => {
  const foreign = mapV1Row("SELECTIONS_ATHLETES", { ...selected, id_selection: "SEL-X", id_campagne: "CAM-X" })
  const invalid = mapV1Row("PARTICIPATIONS_ATHLETES_COMPETITION", { ...participation, id_participation_athlete: "PAT-X", id_selection: foreign.id_selection })
  assert.throws(() => validateV1Relations({ programs, campaigns: [campaign], engagements, selections: [selected, substitute, foreign], participations: [invalid], results: [] }), /incohérente/i)
})
