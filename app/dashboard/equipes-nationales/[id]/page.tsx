import { notFound } from "next/navigation"
import { canAccess } from "@/lib/auth"
import { getMemberActorLabels, getNationalTeam, getNationalTeamMembers, getNationalTeamReferences } from "@/lib/equipes-nationales/data"
import { getDocumentsForEntity } from "@/lib/documents/data"
import { getCompetitions, getTeamParticipations } from "@/lib/competitions/data"
import Client from "./team-detail-client"

export const dynamic = "force-dynamic"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let team
  try { team = await getNationalTeam(id, { fresh: true }) } catch (error) {
    console.error(error)
    return <p className="p-6 text-destructive">Impossible de charger l’équipe nationale.</p>
  }
  if (!team) notFound()
  const [canEdit, canReadDocuments] = await Promise.all([canAccess("AUT-SPT", "WRITE"), canAccess("AUT-ADM", "READ")])
  const [refs, members, competitions, documents] = await Promise.allSettled([
    getNationalTeamReferences(), getNationalTeamMembers(id), Promise.all([getCompetitions(), getTeamParticipations()]),
    canReadDocuments ? getDocumentsForEntity("EQUIPE_NATIONALE", id) : Promise.resolve(undefined),
  ])
  const memberRows = members.status === "fulfilled" ? members.value : []
  const actorLabels = await getMemberActorLabels(memberRows).catch(() => ({}))
  return <Client team={team} references={refs.status === "fulfilled" ? refs.value : { federations: [], sports: [], disciplines: [], ageCategories: [], sexes: [], roles: [], ageCategoriesAvailable: false, rolesReferentialAvailable: false }} members={memberRows} actorLabels={actorLabels} membersError={members.status === "rejected"} competitions={competitions.status === "fulfilled" ? competitions.value : undefined} documents={documents.status === "fulfilled" ? documents.value : undefined} canEdit={canEdit} />
}
