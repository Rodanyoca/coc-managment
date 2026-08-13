import { ActorsSummarySection } from "@/components/dashboard/actors-summary-section"
import { ActivitiesSummarySection } from "@/components/dashboard/activities-summary-section"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"
import { GeneralSummarySection } from "@/components/dashboard/general-summary-section"
import { Header } from "@/components/dashboard/header"
import { TerritorialStructureSection } from "@/components/dashboard/territorial-structure-section"
import { DocumentsSummarySection } from "@/components/dashboard/documents-summary-section"
import { CompetitionsSummarySection } from "@/components/dashboard/competitions-summary-section"
import { NationalTeamsSummarySection } from "@/components/dashboard/national-teams-summary-section"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loadActorsDashboardStats } from "@/lib/acteurs/dashboard"
import { loadActivitiesDashboardStats } from "@/lib/activites/dashboard"
import { loadTerritorialDashboardStats } from "@/lib/federations/dashboard"
import { loadDocumentsDashboardStats } from "@/lib/documents/dashboard"
import { loadCompetitionsDashboardStats } from "@/lib/competitions/dashboard"
import { loadNationalTeamsDashboardStats } from "@/lib/equipes-nationales/dashboard"
import { getSession } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getSession()
  const [territorial, actors, activities, competitions, nationalTeams, documents] = await Promise.allSettled([loadTerritorialDashboardStats(), loadActorsDashboardStats(), loadActivitiesDashboardStats(), loadCompetitionsDashboardStats(), loadNationalTeamsDashboardStats(), session?.role === "coc" ? loadDocumentsDashboardStats() : Promise.resolve(undefined)])
  return <div className="min-h-screen">
    <Header title="Tableau de bord" subtitle="Vue synthétique des données du Comité Olympique Congolais" actions={<DashboardRefreshButton />} />
    <main className="space-y-6 p-4 md:p-6">
      {(territorial.status === "rejected" || actors.status === "rejected" || activities.status === "rejected" || competitions.status === "rejected" || nationalTeams.status === "rejected" || documents.status === "rejected") && <Alert><AlertDescription>Certaines données de synthèse sont indisponibles. Les sections disponibles restent affichées.</AlertDescription></Alert>}
      {(territorial.status === "fulfilled" || actors.status === "fulfilled" || activities.status === "fulfilled" || competitions.status === "fulfilled" || nationalTeams.status === "fulfilled" || documents.status === "fulfilled") && <GeneralSummarySection territorial={territorial.status === "fulfilled" ? territorial.value : undefined} actors={actors.status === "fulfilled" ? actors.value : undefined} activities={activities.status === "fulfilled" ? activities.value : undefined} competitions={competitions.status === "fulfilled" ? competitions.value : undefined} nationalTeams={nationalTeams.status === "fulfilled" ? nationalTeams.value : undefined} documents={documents.status === "fulfilled" ? documents.value : undefined} />}
      {territorial.status === "fulfilled" && <TerritorialStructureSection stats={territorial.value} />}
      {actors.status === "fulfilled" && <ActorsSummarySection stats={actors.value} />}
      {activities.status === "fulfilled" && <ActivitiesSummarySection stats={activities.value} />}
      {competitions.status === "fulfilled" && <CompetitionsSummarySection stats={competitions.value} />}
      {nationalTeams.status === "fulfilled" && <NationalTeamsSummarySection stats={nationalTeams.value} />}
      {documents.status === "fulfilled" && documents.value && <DocumentsSummarySection stats={documents.value} />}
    </main>
  </div>
}
