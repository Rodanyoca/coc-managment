import { Medal } from "lucide-react"
import type { MedalDashboardStats } from "@/lib/competitions/dashboard"

const number=new Intl.NumberFormat("fr-FR")
const items=[{key:"or",label:"Or",className:"bg-amber-400/15 text-amber-700"},{key:"argent",label:"Argent",className:"bg-slate-400/15 text-slate-700"},{key:"bronze",label:"Bronze",className:"bg-orange-700/15 text-orange-800"}] as const

export function MedalsSummarySection({stats}:{stats:MedalDashboardStats}){
 return <section aria-labelledby="medals-dashboard-title" className="space-y-4"><div><h2 id="medals-dashboard-title" className="flex items-center gap-2 text-lg font-semibold"><Medal className="h-5 w-5"/>Médailles</h2><p className="text-sm text-muted-foreground">Récompenses obtenues dans les compétitions</p></div><div className="grid overflow-hidden rounded-lg border border-border/60 sm:grid-cols-2 lg:grid-cols-4"><div className="min-h-32 p-5"><p className="text-sm text-muted-foreground">Total</p><p className="mt-3 text-4xl font-semibold tabular-nums">{number.format(stats.total)}</p></div>{items.map((item)=><div key={item.key} className="min-h-32 border-t p-5 sm:border-l sm:border-t-0"><div className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${item.className}`}>{item.label}</div><p className="mt-3 text-3xl font-semibold tabular-nums">{number.format(stats[item.key])}</p></div>)}</div></section>
}
