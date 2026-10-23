import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Header } from "@/components/dashboard/header"
import { getSystemSeasons } from "@/lib/settings/data"
import { seasonContext } from "@/lib/settings/seasons"
import SeasonsClient from "./seasons-client"

export const dynamic = "force-dynamic"
export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.estSuperAdmin || session.typeUser === "VIEWER" || session.doitChangerMotDePasse) redirect("/dashboard")
  const seasons = await getSystemSeasons()
  return <div className="min-h-screen"><Header title="Paramètres du système" subtitle="Saisons et période de référence du COC" /><main className="space-y-6 p-4 md:p-6"><SeasonsClient initialSeasons={seasons} context={seasonContext(seasons)} /></main></div>
}
