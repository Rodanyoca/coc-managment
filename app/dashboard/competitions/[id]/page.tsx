import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getCompetition, getCompetitionReferences, getTeamParticipations } from "@/lib/competitions/data"
import { getDocumentsForEntity } from "@/lib/documents/data"
import CompetitionDetailClient from "./competition-detail-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let competition
  try { competition = await getCompetition(id) } catch (error) { console.error("Chargement compétition", error); return <p className="p-6 text-destructive">Impossible de charger la compétition.</p> }
  if (!competition) notFound()
  const session = await getSession()
  const [referencesResult, teamsResult, documentsResult] = await Promise.allSettled([
    getCompetitionReferences(), getTeamParticipations(id), session?.role === "coc" ? getDocumentsForEntity("COMPETITION", id) : Promise.resolve(undefined),
  ])
  return <CompetitionDetailClient competition={competition} references={referencesResult.status === "fulfilled" ? referencesResult.value : { types: [], teams: [], teamsAvailable: false }} participations={teamsResult.status === "fulfilled" ? teamsResult.value : []} teamsError={teamsResult.status === "rejected" ? "Impossible de charger les équipes nationales." : undefined} documents={documentsResult.status === "fulfilled" ? documentsResult.value : undefined} documentsError={documentsResult.status === "rejected" ? "Impossible de charger les documents." : undefined} canEdit={session?.role === "coc"} />
}
