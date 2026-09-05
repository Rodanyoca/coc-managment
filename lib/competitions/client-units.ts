import type { ParticipatingUnit } from "./types"

const pendingUnitRequests = new Map<string, Promise<ParticipatingUnit[]>>()

export function loadCompetitionUnits(competitionId: string, refresh = false) {
  const key = competitionId.trim()
  const pending = pendingUnitRequests.get(key)
  if (!refresh && pending) return pending

  const request = fetch(`/api/competitions/${encodeURIComponent(key)}/unites`)
    .then(async (response) => {
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Impossible de charger les unités participantes.")
      return (payload.rows || []) as ParticipatingUnit[]
    })
    .catch((error) => {
      if (pendingUnitRequests.get(key) === request) pendingUnitRequests.delete(key)
      throw error
    })

  pendingUnitRequests.set(key, request)
  return request
}
