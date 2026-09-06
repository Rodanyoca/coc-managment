import { Medal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MedalDashboardStats } from "@/lib/competitions/dashboard"

const number = new Intl.NumberFormat("fr-FR")
const items = [
  { key: "or", label: "Or", marker: "bg-amber-400" },
  { key: "argent", label: "Argent", marker: "bg-slate-400" },
  { key: "bronze", label: "Bronze", marker: "bg-orange-700" },
] as const

export function MedalsSummarySection({ stats }: { stats: MedalDashboardStats }) {
  return <section aria-labelledby="medals-dashboard-title" className="min-w-0 space-y-4">
    <div>
      <h2 id="medals-dashboard-title" className="flex items-center gap-2 text-lg font-semibold"><Medal className="h-5 w-5" />Médailles</h2>
      <p className="text-sm text-muted-foreground">Récompenses obtenues dans les compétitions</p>
    </div>
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/60">
      <Table>
        <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead>Distinction</TableHead><TableHead className="text-right">Effectif</TableHead><TableHead className="text-right">Part du total</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => {
            const count = stats[item.key]
            const share = stats.total ? Math.round((count / stats.total) * 100) : 0
            return <TableRow key={item.key}><TableCell className="font-medium"><span className="inline-flex items-center gap-2"><span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${item.marker}`} />{item.label}</span></TableCell><TableCell className="text-right tabular-nums">{number.format(count)}</TableCell><TableCell className="text-right tabular-nums">{share}%</TableCell></TableRow>
          })}
          <TableRow className="border-t-2 bg-muted/30 font-semibold hover:bg-muted/30"><TableCell>Total</TableCell><TableCell className="text-right tabular-nums">{number.format(stats.total)}</TableCell><TableCell className="text-right tabular-nums">100%</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  </section>
}
