"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { NationalTeam, NationalTeamReferences } from "@/lib/equipes-nationales/types"

export const emptyNationalTeamForm = { id_federation: "", id_sport: "", id_discipline: "", nom_equipe_nationale: "", id_categorie_age: "", id_sexe: "", statut: "ACTIF", date_debut: "", date_fin: "", observations: "" }
export type NationalTeamFormValue = typeof emptyNationalTeamForm
export const nationalTeamToForm = (team: NationalTeam) => Object.fromEntries(Object.keys(emptyNationalTeamForm).map((key) => [key, team[key as keyof NationalTeam] || ""])) as NationalTeamFormValue

export function NationalTeamForm({ value, onChange, references, saving, onSubmit, onCancel, editing = false }: { value: NationalTeamFormValue; onChange: (value: NationalTeamFormValue) => void; references: NationalTeamReferences; saving: boolean; onSubmit: () => void; onCancel?: () => void; editing?: boolean }) {
  const federation = references.federations.find((item) => item.id === value.id_federation)
  const disciplineOptions = references.disciplines.filter((item) => item.parentId === value.id_sport)
  const categoryParent = value.id_discipline || value.id_sport
  const categoryOptions = references.ageCategories.filter((item) => item.parentId === categoryParent)
  const update = (key: keyof NationalTeamFormValue, next: string) => {
    if (key === "id_federation") {
      const selected = references.federations.find((item) => item.id === next)
      onChange({ ...value, id_federation: next, id_sport: selected?.parentId || "", id_discipline: "", id_categorie_age: "" })
      return
    }
    if (key === "id_sport") { onChange({ ...value, id_sport: next, id_discipline: "", id_categorie_age: "" }); return }
    if (key === "id_discipline") { onChange({ ...value, id_discipline: next, id_categorie_age: "" }); return }
    onChange({ ...value, [key]: next })
  }
  const field = (label: string, key: keyof NationalTeamFormValue, type = "text") => <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value[key]} onChange={(event) => update(key, event.target.value)} /></div>

  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label>Fédération *</Label><Select disabled={editing} value={value.id_federation} onValueChange={(next) => update("id_federation", next)}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{references.federations.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}{item.secondary ? ` — ${item.secondary}` : ""}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Sport *</Label>{federation?.parentId || editing ? <Input value={references.sports.find((item) => item.id === value.id_sport)?.label || value.id_sport} readOnly className="bg-muted" /> : <><Select value={value.id_sport} onValueChange={(next) => update("id_sport", next)}><SelectTrigger><SelectValue placeholder="Sélectionner le sport" /></SelectTrigger><SelectContent>{references.sports.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>{federation && <p className="text-xs text-amber-700">Le sport n’est pas renseigné sur cette fédération dans le référentiel. Sélection manuelle requise.</p>}</>}</div>
      <div className="space-y-2"><Label>Discipline</Label><Select disabled={!value.id_sport || disciplineOptions.length === 0} value={value.id_discipline || "aucune"} onValueChange={(next) => update("id_discipline", next === "aucune" ? "" : next)}><SelectTrigger><SelectValue placeholder="Non renseignée" /></SelectTrigger><SelectContent><SelectItem value="aucune">Non renseignée</SelectItem>{disciplineOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>{value.id_sport && disciplineOptions.length === 0 && <p className="text-xs text-muted-foreground">Aucune discipline n’est configurée pour ce sport.</p>}</div>
      <div className="space-y-2"><Label>Catégorie d’âge</Label><Select disabled={!categoryParent || categoryOptions.length === 0} value={value.id_categorie_age || "aucune"} onValueChange={(next) => update("id_categorie_age", next === "aucune" ? "" : next)}><SelectTrigger><SelectValue placeholder="Non renseignée" /></SelectTrigger><SelectContent><SelectItem value="aucune">Non renseignée</SelectItem>{categoryOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>{categoryParent && categoryOptions.length === 0 && <p className="text-xs text-muted-foreground">Aucune catégorie n’est configurée pour ce sport ou cette discipline.</p>}</div>
      <div className="space-y-2 sm:col-span-2"><Label>Nom de l’équipe nationale *</Label><Input value={value.nom_equipe_nationale} onChange={(event) => update("nom_equipe_nationale", event.target.value)} /></div>
      <div className="space-y-2"><Label>Sexe</Label><Select value={value.id_sexe || "aucun"} onValueChange={(next) => update("id_sexe", next === "aucun" ? "" : next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="aucun">Non renseigné</SelectItem>{references.sexes.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Statut *</Label><Select value={value.statut} onValueChange={(next) => update("statut", next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div>
      {field("Date de début", "date_debut", "date")}{field("Date de fin", "date_fin", "date")}
      <div className="space-y-2 sm:col-span-2"><Label>Observations</Label><Textarea value={value.observations} onChange={(event) => update("observations", event.target.value)} /></div>
    </div>
    <div className="flex justify-end gap-2">{onCancel && <Button variant="outline" onClick={onCancel}>Annuler</Button>}<Button disabled={saving} onClick={onSubmit}>{saving ? "Enregistrement…" : "Enregistrer"}</Button></div>
  </div>
}
