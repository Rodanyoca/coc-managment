import { Header } from "@/components/dashboard/header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { CourriersWidget } from "@/components/dashboard/courriers-widget"
import { ActorsChart } from "@/components/dashboard/actors-chart"
import { CompetitionsWidget } from "@/components/dashboard/competitions-widget"
import { PatrimoineWidget } from "@/components/dashboard/patrimoine-widget"
import { DocumentsWidget } from "@/components/dashboard/documents-widget"
import { Users, Mail, Trophy, FileText, Calendar, Building2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Tableau de bord" 
        subtitle="Vue d'ensemble du Comité Olympique Congolais"
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            title="Total Acteurs"
            value={368}
            change="+12 ce mois"
            changeType="positive"
            icon={Users}
            iconColor="bg-chart-1/10 text-chart-1"
          />
          <KpiCard
            title="Courriers"
            value={156}
            change="20 non traités"
            changeType="neutral"
            icon={Mail}
            iconColor="bg-chart-2/10 text-chart-2"
          />
          <KpiCard
            title="Compétitions"
            value={8}
            change="2 à venir"
            changeType="positive"
            icon={Trophy}
            iconColor="bg-chart-3/10 text-chart-3"
          />
          <KpiCard
            title="Documents"
            value={452}
            change="+24 ce mois"
            changeType="positive"
            icon={FileText}
            iconColor="bg-chart-4/10 text-chart-4"
          />
          <KpiCard
            title="Activités"
            value={34}
            change="5 en cours"
            changeType="neutral"
            icon={Calendar}
            iconColor="bg-primary/10 text-primary"
          />
          <KpiCard
            title="Patrimoine"
            value="695K$"
            change="187 biens"
            changeType="neutral"
            icon={Building2}
            iconColor="bg-chart-5/10 text-chart-5"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <CourriersWidget />
            <div className="grid gap-6 md:grid-cols-2">
              <CompetitionsWidget />
              <PatrimoineWidget />
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <ActorsChart />
            <RecentActivity />
          </div>
        </div>

        {/* Documents Widget - Full Width */}
        <DocumentsWidget />
      </div>
    </div>
  )
}
