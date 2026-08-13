"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Calendar, Eye, Plus, Search, Trophy, type LucideIcon } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { competitionStatusLabels, formatCompetitionPeriod } from "@/lib/competitions/format"
import type { Competition, CompetitionOption } from "@/lib/competitions/types"

export default function CompetitionsClient({ competitions, types, teamCounts, canEdit, loadError }: { competitions: Competition[]; types: CompetitionOption[]; teamCounts: Record<string, number>; canEdit: boolean; loadError?: string }) {
  const [query, setQuery] = useState(""); const [type, setType] = useState("tous"); const [status, setStatus] = useState("tous"); const [level, setLevel] = useState("tous")
  const typeNames = useMemo(() => new Map(types.map((item) => [item.id, item.label])), [types])
  const levels = useMemo(() => [...new Set(competitions.map((item) => item.niveau_competition).filter(Boolean))].sort(), [competitions])
  const rows = useMemo(() => { const needle = query.trim().toLocaleLowerCase("fr"); return competitions.filter((item) => {
    const haystack = [item.id_competition, item.nom_competition, typeNames.get(item.id_type_competition), item.edition, item.pays, item.ville, item.statut, competitionStatusLabels[item.statut_normalise]].join(" ").toLocaleLowerCase("fr")
    return (!needle || haystack.includes(needle)) && (type === "tous" || item.id_type_competition === type) && (status === "tous" || item.statut_normalise === status) && (level === "tous" || item.niveau_competition === level)
  }) }, [competitions, level, query, status, type, typeNames])
  const stats = { total: competitions.length, planned: competitions.filter((item) => ["PLANIFIEE", "A_VENIR"].includes(item.statut_normalise)).length, current: competitions.filter((item) => item.statut_normalise === "EN_COURS").length, finished: competitions.filter((item) => item.statut_normalise === "TERMINEE").length }
  const cards: Array<{ label: string; value: number; icon: LucideIcon }> = [{ label: "Total", value: stats.total, icon: Trophy }, { label: "À venir / planifiées", value: stats.planned, icon: Calendar }, { label: "En cours", value: stats.current, icon: Calendar }, { label: "Terminées", value: stats.finished, icon: Trophy }]
  return <div className="min-h-screen"><Header title="Compétitions" subtitle="Événements sportifs suivis par le COC" /><main className="space-y-6 p-4 md:p-6">
    {loadError ? <p className="rounded-lg border border-destructive/30 p-4 text-destructive">{loadError}</p> : <>
      <div className="flex justify-end">{canEdit && <Button asChild><Link href="/dashboard/competitions/nouveau"><Plus className="mr-2 h-4 w-4" />Nouvelle compétition</Link></Button>}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center gap-3 p-4"><Icon className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div></CardContent></Card>)}</div>
      <div className="flex flex-wrap gap-3"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="ID, compétition, type, édition, lieu ou statut…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select value={type} onValueChange={setType}><SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="tous">Tous les types</SelectItem>{types.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-44"><SelectValue placeholder="Statut" /></SelectTrigger><SelectContent><SelectItem value="tous">Tous les statuts</SelectItem>{Object.entries(competitionStatusLabels).map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select><Select value={level} onValueChange={setLevel}><SelectTrigger className="w-44"><SelectValue placeholder="Niveau" /></SelectTrigger><SelectContent><SelectItem value="tous">Tous les niveaux</SelectItem>{levels.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
      <Card><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Compétition</TableHead><TableHead>Type</TableHead><TableHead>Édition</TableHead><TableHead>Période</TableHead><TableHead>Lieu</TableHead><TableHead className="text-right">Équipes nationales</TableHead><TableHead>Statut</TableHead><TableHead /></TableRow></TableHeader><TableBody>{rows.map((item) => <TableRow key={item.id_competition}><TableCell className="font-mono text-xs">{item.id_competition}</TableCell><TableCell className="font-medium">{item.nom_competition}</TableCell><TableCell>{typeNames.get(item.id_type_competition) || item.id_type_competition || "—"}</TableCell><TableCell>{item.edition || "—"}</TableCell><TableCell>{formatCompetitionPeriod(item.date_debut, item.date_fin)}</TableCell><TableCell>{[item.ville, item.pays].filter(Boolean).join(", ") || "—"}</TableCell><TableCell className="text-right tabular-nums">{teamCounts[item.id_competition] || 0}</TableCell><TableCell><Badge variant="outline">{competitionStatusLabels[item.statut_normalise]}</Badge></TableCell><TableCell><Button asChild variant="ghost" size="icon"><Link href={`/dashboard/competitions/${encodeURIComponent(item.id_competition)}`} aria-label="Voir la compétition"><Eye className="h-4 w-4" /></Link></Button></TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">Aucune compétition trouvée.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
    </>}</main></div>
}
