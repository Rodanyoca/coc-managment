import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getNationalTeam, getNationalTeamMembers, getNationalTeamReferences } from "@/lib/equipes-nationales/data"
import { getDocumentsForEntity } from "@/lib/documents/data"
import { getCompetitions, getTeamParticipations } from "@/lib/competitions/data"
import Client from "./team-detail-client"

export const dynamic = "force-dynamic"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let team
  try { team = await getNationalTeam(id) } catch (error) {
    console.error(error)
    return <p className="p-6 text-destructive">Impossible de charger l’équipe nationale.</p>
  }
  if (!team) notFound()
  const session = await getSession()
  const [refs, members, competitions, documents] = await Promise.allSettled([
    getNationalTeamReferences(), getNationalTeamMembers(id), Promise.all([getCompetitions(), getTeamParticipations()]),
    session?.role === "coc" ? getDocumentsForEntity("EQUIPE_NATIONALE", id) : Promise.resolve(undefined),
  ])
  return <Client team={team} references={refs.status === "fulfilled" ? refs.value : { federations: [], sports: [], disciplines: [], ageCategories: [], sexes: [], roles: [], ageCategoriesAvailable: false, rolesReferentialAvailable: false }} members={members.status === "fulfilled" ? members.value : []} membersError={members.status === "rejected"} competitions={competitions.status === "fulfilled" ? competitions.value : undefined} documents={documents.status === "fulfilled" ? documents.value : undefined} canEdit={session?.role === "coc"} />
}
