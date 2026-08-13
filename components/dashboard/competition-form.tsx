"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Competition, CompetitionOption } from "@/lib/competitions/types"

export const emptyCompetitionForm = { nom_competition: "", id_type_competition: "", edition: "", niveau_competition: "", date_debut: "", date_fin: "", pays: "", ville: "", lieu: "", statut: "PLANIFIEE", observations: "" }
export type CompetitionFormValue = typeof emptyCompetitionForm

export function competitionToForm(item: Competition): CompetitionFormValue {
  return Object.fromEntries(Object.keys(emptyCompetitionForm).map((key) => [key, item[key as keyof Competition] || ""])) as CompetitionFormValue
}

export function CompetitionForm({ value, onChange, types, saving, submitLabel = "Enregistrer", onSubmit, onCancel }: { value: CompetitionFormValue; onChange: (value: CompetitionFormValue) => void; types: CompetitionOption[]; saving: boolean; submitLabel?: string; onSubmit: () => void; onCancel?: () => void }) {
  const update = (key: keyof CompetitionFormValue, fieldValue: string) => onChange({ ...value, [key]: fieldValue })
  const input = (label: string, key: keyof CompetitionFormValue, type = "text", required = false) => <div className="space-y-2"><Label htmlFor={key}>{label}{required ? " *" : ""}</Label><Input id={key} type={type} value={value[key]} onChange={(event) => update(key, event.target.value)} required={required} /></div>
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="nom_competition">Nom de la compétition *</Label><Input id="nom_competition" value={value.nom_competition} onChange={(event) => update("nom_competition", event.target.value)} /></div>
      <div className="space-y-2"><Label>Type de compétition *</Label><Select value={value.id_type_competition} onValueChange={(fieldValue) => update("id_type_competition", fieldValue)}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{types.map((type) => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}</SelectContent></Select>{!types.length && <p className="text-xs text-destructive">Le référentiel TYPES_COMPETITION est vide.</p>}</div>
      {input("Édition", "edition")}{input("Niveau", "niveau_competition")}{input("Date de début", "date_debut", "date", true)}{input("Date de fin", "date_fin", "date")}{input("Pays", "pays")}{input("Ville", "ville")}{input("Lieu", "lieu")}
      <div className="space-y-2"><Label>Statut *</Label><Select value={value.statut} onValueChange={(fieldValue) => update("statut", fieldValue)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PLANIFIEE">Planifiée</SelectItem><SelectItem value="A_VENIR">À venir</SelectItem><SelectItem value="EN_COURS">En cours</SelectItem><SelectItem value="TERMINEE">Terminée</SelectItem><SelectItem value="REPORTEE">Reportée</SelectItem><SelectItem value="ANNULEE">Annulée</SelectItem><SelectItem value="NON_RENSEIGNE">Non renseigné</SelectItem></SelectContent></Select></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="observations">Observations</Label><Textarea id="observations" value={value.observations} onChange={(event) => update("observations", event.target.value)} rows={4} /></div>
    </div>
    <div className="flex justify-end gap-2">{onCancel && <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>}<Button type="button" disabled={saving || !types.length} onClick={onSubmit}>{saving ? "Enregistrement…" : submitLabel}</Button></div>
  </div>
}
