"use client"

import { useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type { AthleteParticipation, CampaignEngagement } from "@/lib/competitions/types"
import type { AthleteSelection } from "@/lib/equipes-nationales/types"

type Option = { id: string; label: string }
const NONE = "__NONE__"
const empty = { id_engagement_campagne: "", id_selection: "", id_statut_participation: "", date_statut: "", id_selection_remplacement: "", observation: "" }

export function AthleteParticipations({ competitionId, engagements, initialRows, references, canEdit }: {
  competitionId: string
  engagements: CampaignEngagement[]
  initialRows: AthleteParticipation[]
  references: { statuses: Option[]; selections: AthleteSelection[] }
  canEdit: boolean
}) {
  const [rows, setRows] = useState(initialRows)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState("")
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const engagement = engagements.find((item) => item.id_engagement_campagne === form.id_engagement_campagne)
  const compatible = references.selections.filter((item) => item.id_campagne === engagement?.id_campagne)

  function show(row?: AthleteParticipation) {
    setEditing(row?.id_participation_athlete || "")
    setForm(row ? { ...empty, ...row } : empty)
    setOpen(true)
  }

  function openCreate() {
    if (!engagements.length) {
      toast.error("Créez d’abord un engagement dans l’onglet « Équipes engagées » avant d’ajouter un participant.")
      return
    }
    if (!references.statuses.length) {
      toast.error("Le référentiel des statuts de participation est indisponible.")
      return
    }
    show()
  }

  async function save() {
    if (!form.id_engagement_campagne || !form.id_selection || !form.id_statut_participation || !form.date_statut) {
      toast.error("Renseignez l’engagement, la sélection, le statut et la date du constat.")
      return
    }
    if (form.id_statut_participation === "REMPLACE" && !form.id_selection_remplacement) {
      toast.error("Sélectionnez l’athlète remplaçant.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/participants`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, row: form }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setRows((current) => editing
        ? current.map((item) => item.id_participation_athlete === editing ? { ...item, ...result.row } : item)
        : [...current, result.row])
      setOpen(false)
      toast.success(editing ? "Participation modifiée." : "Participation enregistrée.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  return <>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Participants effectifs</h3>
          <p className="text-sm text-muted-foreground"><strong>PARTICIPANT</strong> est le seul statut qui prouve une présence effective.</p>
        </div>
        {canEdit && <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>}
      </div>
      {!engagements.length && canEdit && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Aucun engagement n’est disponible. Créez d’abord un engagement dans l’onglet « Équipes engagées ».
      </p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => <Card key={row.id_participation_athlete}><CardContent className="space-y-3 p-4">
          <div className="flex justify-between"><div>
            <p className="font-medium">{row.athlete_label || row.athlete_id || row.id_selection}</p>
            <p className="text-xs text-muted-foreground">{row.id_participation_athlete}</p>
          </div>{canEdit && <Button variant="ghost" size="icon" onClick={() => show(row)}><Pencil className="h-4 w-4" /></Button>}</div>
          <Badge variant={row.id_statut_participation === "PARTICIPANT" ? "default" : "outline"}>{row.id_statut_participation}</Badge>
          <p className="text-sm">État constaté le {row.date_statut}</p>
        </CardContent></Card>)}
      </div>
      {!rows.length && <p className="rounded-lg border p-6 text-center text-muted-foreground">Aucune participation effective enregistrée. Les sélections restent valides.</p>}
    </div>

    <Sheet open={open} onOpenChange={setOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>{editing ? "Modifier la participation" : "Enregistrer une participation"}</SheetTitle>
        <SheetDescription>L’engagement et la sélection deviennent immuables après création.</SheetDescription>
      </SheetHeader>
      <div className="space-y-4 px-4">
        <Field label="Engagement *"><Select disabled={!!editing} value={form.id_engagement_campagne} onValueChange={(value) => setForm({ ...form, id_engagement_campagne: value, id_selection: "", id_selection_remplacement: "" })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>
            {engagements.map((item) => <SelectItem key={item.id_engagement_campagne} value={item.id_engagement_campagne}>{item.nom_campagne} · {item.id_programme_competition}</SelectItem>)}
          </SelectContent>
        </Select></Field>
        <Field label="Sélection *"><Select disabled={!!editing || !engagement} value={form.id_selection} onValueChange={(value) => setForm({ ...form, id_selection: value })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>
            {compatible.map((item) => <SelectItem key={item.id_selection} value={item.id_selection}>{item.athlete_label || item.id_athlete}</SelectItem>)}
          </SelectContent>
        </Select>
        {engagement && !compatible.length && <p className="text-xs text-amber-700">Aucune sélection n’existe pour la campagne liée à cet engagement. Ajoutez d’abord l’athlète dans la sélection de l’équipe nationale.</p>}</Field>
        <Field label="Statut *"><Select value={form.id_statut_participation} onValueChange={(value) => setForm({ ...form, id_statut_participation: value, id_selection_remplacement: value === "REMPLACE" ? form.id_selection_remplacement : "" })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>
            {references.statuses.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select></Field>
        {form.id_statut_participation === "REMPLACE" && <Field label="Sélection remplaçante *"><Select value={form.id_selection_remplacement || NONE} onValueChange={(value) => setForm({ ...form, id_selection_remplacement: value === NONE ? "" : value })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={NONE}>Sélectionner</SelectItem>
            {compatible.filter((item) => item.id_selection !== form.id_selection && item.id_statut_selection === "REMPLACANT").map((item) => <SelectItem key={item.id_selection} value={item.id_selection}>{item.athlete_label || item.id_athlete}</SelectItem>)}
          </SelectContent>
        </Select></Field>}
        <Field label="Date du constat *"><Input type="date" value={form.date_statut} onChange={(event) => setForm({ ...form, date_statut: event.target.value })} /></Field>
        <Field label="Observation"><Textarea value={form.observation} onChange={(event) => setForm({ ...form, observation: event.target.value })} /></Field>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button disabled={saving} onClick={save}>Enregistrer</Button></div>
      </div>
    </SheetContent></Sheet>
  </>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}
