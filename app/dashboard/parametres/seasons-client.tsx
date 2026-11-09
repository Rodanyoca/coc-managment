"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Season, seasonContext } from "@/lib/settings/seasons"

export default function SeasonsClient({ initialSeasons, context }: { initialSeasons: Season[]; context: ReturnType<typeof seasonContext> }) {
  const router = useRouter()
  const empty = (): Season => ({ id_saison: "", nom_saison: String(context.year), date_debut: `${context.year}-01-01`, date_fin: `${context.year}-12-31`, statut: "ACTIF", observation: "" })
  const [draft, setDraft] = useState<Season | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const change = (key: keyof Season, value: string) => setDraft(current => current ? { ...current, [key]: value } : current)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft || busy) return
    setBusy(true); setError(""); setMessage("")
    try {
      const response = await apiFetch("/api/parametres/saisons", { method: draft.id_saison ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Enregistrement impossible.")
      setDraft(null); setMessage("La saison a été enregistrée."); router.refresh()
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enregistrement impossible.") }
    finally { setBusy(false) }
  }
  const dateLabel = (date: string) => date ? date.split("-").reverse().join("/") : "—"
  return <>
    <Card><CardHeader><CardTitle>Période courante</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-2xl font-semibold">Année {context.year}</p><p className="text-sm text-muted-foreground">Date du système : {dateLabel(context.date)} · Africa/Kinshasa</p><p>Saison en cours : <strong>{context.currentSeason?.nom_saison ?? (context.ambiguous ? "Plusieurs saisons se chevauchent" : "Aucune saison définie pour cette date")}</strong></p><p className="text-sm text-muted-foreground">La saison courante est reconnue automatiquement par ses dates et son statut actif. L’année civile reste celle de la date du système.</p></CardContent></Card>
    {context.ambiguous && <Alert variant="destructive"><AlertDescription>Corrigez les périodes ou désactivez les saisons qui se chevauchent. Aucune saison courante n’est sélectionnée arbitrairement.</AlertDescription></Alert>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {error && <Alert variant="destructive"><AlertDescription role="alert">{error}</AlertDescription></Alert>}
    <Card><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><CardTitle>Saisons du référentiel</CardTitle><Button disabled={busy} onClick={() => { setDraft(empty()); setError(""); setMessage("") }}><Plus className="mr-2 h-4 w-4" />Ajouter une saison</Button></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Saison</TableHead><TableHead>Début</TableHead><TableHead>Fin</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{[...initialSeasons].sort((a, b) => b.date_debut.localeCompare(a.date_debut)).map(season => <TableRow key={season.id_saison}><TableCell className="font-medium">{season.nom_saison}{season.id_saison === context.currentSeason?.id_saison && <Badge className="ml-2">En cours</Badge>}</TableCell><TableCell className="whitespace-nowrap">{dateLabel(season.date_debut)}</TableCell><TableCell className="whitespace-nowrap">{dateLabel(season.date_fin)}</TableCell><TableCell><Badge variant="secondary">{season.statut === "ACTIF" ? "Actif" : "Inactif"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" disabled={busy} title={`Modifier ${season.nom_saison}`} aria-label={`Modifier ${season.nom_saison}`} onClick={() => { setDraft({ ...season }); setError("") }}><Pencil className="h-4 w-4" /></Button></TableCell></TableRow>)}{!initialSeasons.length && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucune saison enregistrée. Ajoutez la première saison.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
    {draft && <Card><CardHeader><CardTitle>{draft.id_saison ? "Modifier la saison" : "Nouvelle saison"}</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4">{draft.id_saison && <p className="text-sm text-muted-foreground">Les dates sont également utilisées par les équipes nationales rattachées à cette saison. Leur modification ne réaffecte aucune équipe.</p>}<fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="season-name">Nom de la saison</Label><Input id="season-name" required maxLength={100} value={draft.nom_saison} onChange={e => change("nom_saison", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="season-status">Statut</Label><select id="season-status" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={draft.statut} onChange={e => change("statut", e.target.value)}><option value="ACTIF">Actif</option><option value="INACTIF">Inactif</option></select></div><div className="space-y-2"><Label htmlFor="season-start">Date de début</Label><Input id="season-start" type="date" required value={draft.date_debut} onChange={e => change("date_debut", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="season-end">Date de fin</Label><Input id="season-end" type="date" required min={draft.date_debut} value={draft.date_fin} onChange={e => change("date_fin", e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="season-observation">Observation</Label><Input id="season-observation" maxLength={2000} value={draft.observation} onChange={e => change("observation", e.target.value)} /></div></fieldset><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setDraft(null)}>Annuler</Button><Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</Button></div></form></CardContent></Card>}
  </>
}
