import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FederationsDashboardStats } from "@/lib/federations/dashboard"

const number = new Intl.NumberFormat("fr-FR")

export function FederationsSummarySection({ stats }: { stats: FederationsDashboardStats }) {
  const rows = stats.dimensions.flatMap((dimension) => dimension.statuses.map((status) => ({
    dimensionKey: dimension.key,
    dimension: dimension.label,
    status,
    part: stats.totalFederations ? Math.round((status.total / stats.totalFederations) * 100) : 0,
  })))

  return <section aria-labelledby="federations-summary-title" className="space-y-4">
    <div>
      <h2 id="federations-summary-title" className="text-lg font-semibold">Fédérations</h2>
      <p className="text-sm text-muted-foreground">Répartition des {number.format(stats.totalFederations)} fédération{stats.totalFederations > 1 ? "s" : ""} enregistrée{stats.totalFederations > 1 ? "s" : ""} par statut</p>
    </div>
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <Table>
        <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead>Indicateur</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Effectif</TableHead><TableHead className="text-right">Part</TableHead></TableRow></TableHeader>
        <TableBody>
          {rows.map((row, index) => <TableRow key={`${row.dimensionKey}-${row.status.label}`}>
            <TableCell className="font-medium">{index === 0 || rows[index - 1].dimensionKey !== row.dimensionKey ? row.dimension : <span className="sr-only">{row.dimension}</span>}</TableCell>
            <TableCell className={row.status.missing ? "text-muted-foreground" : ""}>{row.status.label}</TableCell>
            <TableCell className="text-right tabular-nums">{number.format(row.status.total)}</TableCell>
            <TableCell className="text-right tabular-nums">{row.part} %</TableCell>
          </TableRow>)}
          {!rows.length && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Aucune fédération enregistrée.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  </section>
}
