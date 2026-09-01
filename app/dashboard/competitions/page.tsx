import { canAccess } from "@/lib/auth"
import { getCompetitionReferences, getCompetitions, getTeamParticipations } from "@/lib/competitions/data"
import CompetitionsClient from "./competitions-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CompetitionsPage() {
  const canEdit = await canAccess("AUT-SPT", "WRITE")
  let props: React.ComponentProps<typeof CompetitionsClient>
  try {
    const [competitions, references, participations] = await Promise.all([getCompetitions(), getCompetitionReferences(), getTeamParticipations()])
    const counts = Object.fromEntries(competitions.map((item) => [item.id_competition, participations.filter((row) => row.id_competition === item.id_competition).length]))
    props = { competitions, types: references.types, teamCounts: counts, canEdit }
  } catch (error) {
    console.error("Chargement page Compétitions", error)
    props = { competitions: [], types: [], teamCounts: {}, canEdit, loadError: "Impossible de charger les compétitions." }
  }
  return <CompetitionsClient {...props} />
}
