import type { ActorsDashboardStats } from "@/lib/acteurs/dashboard"
import type { TerritorialDashboardStats } from "@/lib/federations/dashboard"

const number = new Intl.NumberFormat("fr-FR")

export function GeneralSummarySection({ territorial, actors }: { territorial?: TerritorialDashboardStats; actors?: ActorsDashboardStats }) {
  return <section aria-labelledby="summary-title" className="space-y-4">
    <h2 id="summary-title" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Synthèse générale</h2>
    <div className="grid overflow-hidden rounded-lg border border-border/60 sm:grid-cols-2">
      {territorial && <div className="min-h-40 space-y-3 p-6"><p className="text-sm font-medium text-muted-foreground">Structures territoriales</p><p className="text-4xl font-semibold tracking-tight tabular-nums">{number.format(territorial.totalStructures)}</p><p className="max-w-xs text-sm text-muted-foreground">Ligues, ententes et clubs enregistrés</p></div>}
      {actors && <div className="min-h-40 space-y-3 border-t p-6 sm:border-l sm:border-t-0"><p className="text-sm font-medium text-muted-foreground">Acteurs</p><p className="text-4xl font-semibold tracking-tight tabular-nums">{number.format(actors.totalActors)}</p><p className="max-w-xs text-sm text-muted-foreground">Athlètes, coachs, officiels, médecins et arbitres</p></div>}
    </div>
  </section>
}
