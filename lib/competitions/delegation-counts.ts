type EngagementLink = {
  id_participation_equipe: string
  id_competition: string
}

type CampaignEngagementLink = {
  id_engagement_campagne: string
  id_campagne: string
}

type AthleteDelegate = {
  id_engagement_campagne: string
  id_selection: string
  athlete_id?: string
  id_statut_participation: string
}

type StaffDelegate = {
  id_campagne: string
  id_acteur_coc: string
  id_type_acteur: string
}

const DELEGATION_ATHLETE_STATUSES = new Set(["INSCRIT", "PARTICIPANT"])

export function calculateCompetitionDelegationCounts(
  competitionIds: string[],
  engagementLinks: EngagementLink[],
  campaignEngagements: CampaignEngagementLink[],
  athleteParticipations: AthleteDelegate[],
  staffAssignments: StaffDelegate[],
) {
  const campaignByEngagement = new Map(
    campaignEngagements.map((row) => [row.id_engagement_campagne, row.id_campagne]),
  )
  const delegates = new Map(competitionIds.map((id) => [id, new Set<string>()]))
  const competitionsByEngagement = new Map<string, Set<string>>()
  const competitionsByCampaign = new Map<string, Set<string>>()
  for (const row of engagementLinks) {
    if (!delegates.has(row.id_competition)) continue
    const competitions = competitionsByEngagement.get(row.id_participation_equipe) ?? new Set<string>()
    competitions.add(row.id_competition)
    competitionsByEngagement.set(row.id_participation_equipe, competitions)
    const campaignId = campaignByEngagement.get(row.id_participation_equipe)
    if (campaignId) {
      const campaigns = competitionsByCampaign.get(campaignId) ?? new Set<string>()
      campaigns.add(row.id_competition)
      competitionsByCampaign.set(campaignId, campaigns)
    }
  }
  for (const row of athleteParticipations) {
    const competitions = competitionsByEngagement.get(row.id_engagement_campagne)
    if (!competitions || !DELEGATION_ATHLETE_STATUSES.has(row.id_statut_participation)) continue
    for (const id of competitions) delegates.get(id)!.add(`ATHLETE:${row.athlete_id || row.id_selection}`)
  }
  for (const row of staffAssignments) {
    const competitions = competitionsByCampaign.get(row.id_campagne)
    if (!competitions || !row.id_acteur_coc) continue
    for (const id of competitions) delegates.get(id)!.add(`${row.id_type_acteur || "STAFF"}:${row.id_acteur_coc}`)
  }
  return Object.fromEntries(competitionIds.map((id) => [id, delegates.get(id)!.size]))
}
