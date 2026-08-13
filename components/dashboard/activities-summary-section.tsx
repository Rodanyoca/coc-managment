import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ActivitiesDashboardStats } from "@/lib/activites/dashboard"

const number = new Intl.NumberFormat("fr-FR")

export function ActivitiesSummarySection({ stats }: { stats: ActivitiesDashboardStats }) {
  const total = stats.types.reduce((sum, item) => ({
    total: sum.total + item.total,
    planifiees: sum.planifiees + item.planifiees,
    enCours: sum.enCours + item.enCours,
    realisees: sum.realisees + item.realisees,
    reportees: sum.reportees + item.reportees,
    annulees: sum.annulees + item.annulees,
    nonRenseignees: sum.nonRenseignees + item.nonRenseignees,
  }), { total: 0, planifiees: 0, enCours: 0, realisees: 0, reportees: 0, annulees: 0, nonRenseignees: 0 })

  const cells = (item: typeof total) => <>
    <TableCell className="text-right tabular-nums">{number.format(item.total)}</TableCell>
    <TableCell className="text-right tabular-nums">{number.format(item.planifiees)}</TableCell>
    <TableCell className="text-right tabular-nums">{number.format(item.enCours)}</TableCell>
    <TableCell className="text-right tabular-nums">{number.format(item.realisees)}</TableCell>
    <TableCell className="text-right tabular-nums">{number.format(item.reportees)}</TableCell>
    <TableCell className="text-right tabular-nums">{number.format(item.annulees)}</TableCell>
    <TableCell className="text-right tabular-nums">{number.format(item.nonRenseignees)}</TableCell>
  </>

  return <section aria-labelledby="activities-title" className="space-y-4">
    <div><h2 id="activities-title" className="text-lg font-semibold">Activités</h2><p className="text-sm text-muted-foreground">Répartition des activités par type et par statut</p></div>
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <Table>
        <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead>Type d’activité</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Planifiées</TableHead><TableHead className="text-right">En cours</TableHead><TableHead className="text-right">Réalisées</TableHead><TableHead className="text-right">Reportées</TableHead><TableHead className="text-right">Annulées</TableHead><TableHead className="text-right">Non renseignées</TableHead></TableRow></TableHeader>
        <TableBody>
          {stats.types.map((item) => <TableRow key={item.key}><TableCell className="font-medium">{item.label}</TableCell>{cells(item)}</TableRow>)}
          {!stats.types.length && <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Aucune activité enregistrée.</TableCell></TableRow>}
          <TableRow className="border-t-2 bg-muted/30 font-semibold hover:bg-muted/30"><TableCell>Total</TableCell>{cells(total)}</TableRow>
        </TableBody>
      </Table>
    </div>
  </section>
}
