import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TerritorialDashboardStats } from "@/lib/federations/dashboard"

const number = new Intl.NumberFormat("fr-FR")

export function TerritorialStructureSection({ stats }: { stats: TerritorialDashboardStats }) {
  return <section aria-labelledby="territorial-title" className="space-y-4 border-t border-border pt-6">
    <div className="space-y-2"><h2 id="territorial-title" className="text-lg font-semibold">Structure territoriale</h2><p className="text-sm text-muted-foreground">État des structures enregistrées</p></div>
    <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Niveau territorial</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Actif</TableHead><TableHead className="text-right">Inactif</TableHead><TableHead className="text-right">Non renseigné</TableHead><TableHead className="text-right">Part du total</TableHead></TableRow></TableHeader><TableBody>
      {stats.levels.map((level) => <TableRow key={level.key}><TableCell className="font-medium text-foreground">{level.label}</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(level.total)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(level.actif)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(level.inactif)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(level.nonRenseigne)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{level.part} %</TableCell></TableRow>)}
      <TableRow className="border-t-2 bg-secondary/40 font-semibold hover:bg-secondary/40"><TableCell className="text-foreground">Total</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(stats.totalStructures)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(stats.actif)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(stats.inactif)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{number.format(stats.nonRenseigne)}</TableCell><TableCell className="text-right tabular-nums text-foreground">{stats.totalStructures ? "100 %" : "0 %"}</TableCell></TableRow>
    </TableBody></Table></div>
  </section>
}
