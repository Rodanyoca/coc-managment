import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FederationStructure } from "@/lib/federations/structure-model"

const number = new Intl.NumberFormat("fr-FR")
const labels = ["Ligues", "Ententes", "Cercles", "Clubs", "Équipes"]
const emptySections = () => labels.map((label, index) => ({ key: ["ligues", "ententes", "cercles", "clubs", "equipes"][index], label, configured: false, items: [] })) as FederationStructure["sections"]
const shown = (value: string) => value || "—"

export function FederationHierarchySummary({ structure, loadError }: { structure?: FederationStructure; loadError?: boolean }) {
  return <section className="min-w-0 rounded-lg border border-border/60 bg-muted/20 p-4" aria-labelledby="hierarchy-title">
    <h3 id="hierarchy-title" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Hiérarchie appliquée</h3>
    {loadError ? <p className="text-sm text-destructive">La hiérarchie territoriale est temporairement indisponible.</p>
      : structure && structure.hierarchy.length > 1 ? <div className="flex flex-wrap items-center gap-1.5">{structure.hierarchy.map((level, index) => <span key={`${level}-${index}`} className="contents"><Badge variant={index === 0 ? "secondary" : "outline"} className="whitespace-normal text-center">{level}</Badge>{index < structure.hierarchy.length - 1 && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}</span>)}</div>
      : <p className="text-sm text-muted-foreground">Aucune hiérarchie territoriale n’est paramétrée pour cette fédération.</p>}
    {structure && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{structure.sections.map((section) => <div key={section.key} className="rounded-md border bg-background px-3 py-2"><p className="text-xs text-muted-foreground">{section.label}</p><p className="text-lg font-semibold tabular-nums">{number.format(section.items.length)}</p></div>)}</div>}
  </section>
}

export function FederationStructureTables({ structure, loadError }: { structure?: FederationStructure; loadError?: boolean }) {
  const sections = structure?.sections ?? emptySections()
  return <div className="space-y-6">{sections.map((section) => <Card key={section.key} className="min-w-0 border-border/50"><CardHeader className="flex flex-row items-center justify-between gap-3 pb-3"><CardTitle className="text-base">{section.label}</CardTitle><Badge variant="secondary">{number.format(section.items.length)}</Badge></CardHeader><CardContent>
    {loadError ? <p className="text-sm text-destructive">Impossible de déterminer la configuration de ce niveau.</p>
      : !section.configured ? <p className="text-sm text-muted-foreground">Ce niveau territorial n’est pas paramétré pour cette fédération.</p>
      : section.items.length === 0 ? <p className="text-sm text-muted-foreground">Ce niveau est paramétré, mais aucun élément n’est encore enregistré.</p>
      : <><div className="hidden md:block"><Table><TableHeader><TableRow><TableHead>ID COC</TableHead><TableHead>ID fédéral</TableHead><TableHead>Nom</TableHead><TableHead>Sigle / pseudo</TableHead><TableHead>Localisation / parent</TableHead><TableHead>Téléphone</TableHead><TableHead>E-mail</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{section.items.map((item) => <TableRow key={item.id || item.name}><TableCell className="font-mono text-xs">{shown(item.id)}</TableCell><TableCell className="font-mono text-xs">{shown(item.federalId)}</TableCell><TableCell className="max-w-56 whitespace-normal font-medium">{shown(item.name)}</TableCell><TableCell>{shown(item.alias)}</TableCell><TableCell className="max-w-48 whitespace-normal">{shown(item.secondary)}</TableCell><TableCell>{item.phone ? <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a> : "—"}</TableCell><TableCell>{item.email ? <a href={`mailto:${item.email}`} className="break-all hover:underline">{item.email}</a> : "—"}</TableCell><TableCell><Badge variant="outline">{shown(item.status).replaceAll("_", " ")}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
        <div className="grid gap-3 md:hidden">{section.items.map((item) => <article key={`mobile-${item.id || item.name}`} className="min-w-0 rounded-lg border border-border/60 p-4"><div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{shown(item.name)}</p>{item.alias && <p className="text-sm text-muted-foreground">{item.alias}</p>}</div><Badge variant="outline" className="shrink-0">{shown(item.status).replaceAll("_", " ")}</Badge></div><dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">ID COC</dt><dd className="break-all font-mono text-xs">{shown(item.id)}</dd></div><div><dt className="text-muted-foreground">ID fédéral</dt><dd className="break-all font-mono text-xs">{shown(item.federalId)}</dd></div>{item.secondary && <div><dt className="text-muted-foreground">Localisation / parent</dt><dd className="break-words">{item.secondary}</dd></div>}{item.phone && <div><dt className="text-muted-foreground">Téléphone</dt><dd className="break-all">{item.phone}</dd></div>}{item.email && <div><dt className="text-muted-foreground">E-mail</dt><dd className="break-all">{item.email}</dd></div>}</dl></article>)}</div></>}
  </CardContent></Card>)}</div>
}

export function FederationStructureSection(props: { structure?: FederationStructure; loadError?: boolean }) {
  return <div className="space-y-6"><FederationHierarchySummary {...props} /><FederationStructureTables {...props} /></div>
}
