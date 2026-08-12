import { ActorsSummarySection } from "@/components/dashboard/actors-summary-section"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"
import { GeneralSummarySection } from "@/components/dashboard/general-summary-section"
import { Header } from "@/components/dashboard/header"
import { TerritorialStructureSection } from "@/components/dashboard/territorial-structure-section"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loadActorsDashboardStats } from "@/lib/acteurs/dashboard"
import { loadTerritorialDashboardStats } from "@/lib/federations/dashboard"

export default async function DashboardPage() {
  const [territorial, actors] = await Promise.allSettled([loadTerritorialDashboardStats(), loadActorsDashboardStats()])
  return <div className="min-h-screen">
    <Header title="Tableau de bord" subtitle="Vue synthétique des données du Comité Olympique Congolais" actions={<DashboardRefreshButton />} />
    <main className="space-y-6 p-4 md:p-6">
      {(territorial.status === "rejected" || actors.status === "rejected") && <Alert><AlertDescription>Certaines données de synthèse sont indisponibles. Les sections disponibles restent affichées.</AlertDescription></Alert>}
      {(territorial.status === "fulfilled" || actors.status === "fulfilled") && <GeneralSummarySection territorial={territorial.status === "fulfilled" ? territorial.value : undefined} actors={actors.status === "fulfilled" ? actors.value : undefined} />}
      {territorial.status === "fulfilled" && <TerritorialStructureSection stats={territorial.value} />}
      {actors.status === "fulfilled" && <ActorsSummarySection stats={actors.value} />}
    </main>
  </div>
}
