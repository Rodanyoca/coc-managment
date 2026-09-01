"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OtherActorReferences } from "@/lib/acteurs/autres-model"

export type OtherActorFormValue = { id_entite: string; id_autre_acteur_entite: string; id_national: string; id_international: string; nom_complet: string; id_sexe: string; date_de_naissance: string; lieu_de_naissance: string; nationalite: string; type_autre_acteur: string; telephone: string; email: string; adresse: string; numero_passeport: string; date_de_delivrance_passeport: string; date_expiration_passeport: string; statut: string; observations: string }
export const emptyOtherActorForm: OtherActorFormValue = { id_entite: "", id_autre_acteur_entite: "", id_national: "", id_international: "", nom_complet: "", id_sexe: "", date_de_naissance: "", lieu_de_naissance: "", nationalite: "", type_autre_acteur: "", telephone: "", email: "", adresse: "", numero_passeport: "", date_de_delivrance_passeport: "", date_expiration_passeport: "", statut: "ACTIF", observations: "" }

export function OtherActorForm({ value, onChange, references }: { value: OtherActorFormValue; onChange: (value: OtherActorFormValue) => void; references: OtherActorReferences }) {
  const update = (key: keyof OtherActorFormValue, next: string) => onChange({ ...value, [key]: next })
  const federationEntities = new Set(references.federations.map((item) => item.entityId))
  return <div className="grid gap-4 px-4 sm:grid-cols-2">
    <Field label="Nom complet *"><Input value={value.nom_complet} onChange={(event) => update("nom_complet", event.target.value)} /></Field>
    <Field label="Fonction ou qualité"><Input list="other-actor-functions" value={value.type_autre_acteur} onChange={(event) => update("type_autre_acteur", event.target.value)} /><datalist id="other-actor-functions">{references.functions.map((item) => <option key={item} value={item} />)}</datalist></Field>
    <Field label="Entité ou fédération" wide><Select value={value.id_entite} onValueChange={(next) => update("id_entite", next)}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner un rattachement" /></SelectTrigger><SelectContent>{references.entities.map((entity) => <SelectItem key={entity.id} value={entity.id}>{entity.acronym ? `${entity.acronym} — ` : ""}{entity.name}{federationEntities.has(entity.id) ? " · Fédération" : ""}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Sexe"><Select value={value.id_sexe} onValueChange={(next) => update("id_sexe", next)}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{references.sexes.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Statut"><Select value={value.statut} onValueChange={(next) => update("statut", next)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{references.statuses.map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="ID dans l’entité"><Input value={value.id_autre_acteur_entite} onChange={(event) => update("id_autre_acteur_entite", event.target.value)} /></Field><Field label="ID national"><Input value={value.id_national} onChange={(event) => update("id_national", event.target.value)} /></Field><Field label="ID international"><Input value={value.id_international} onChange={(event) => update("id_international", event.target.value)} /></Field>
    <Field label="Date de naissance"><Input type="date" value={value.date_de_naissance} onChange={(event) => update("date_de_naissance", event.target.value)} /></Field><Field label="Lieu de naissance"><Input value={value.lieu_de_naissance} onChange={(event) => update("lieu_de_naissance", event.target.value)} /></Field><Field label="Nationalité"><Input value={value.nationalite} onChange={(event) => update("nationalite", event.target.value)} /></Field>
    <Field label="Téléphone"><Input type="tel" value={value.telephone} onChange={(event) => update("telephone", event.target.value)} /></Field><Field label="Adresse électronique"><Input type="email" value={value.email} onChange={(event) => update("email", event.target.value)} /></Field><Field label="Adresse" wide><Input value={value.adresse} onChange={(event) => update("adresse", event.target.value)} /></Field>
    <Field label="Numéro de passeport"><Input value={value.numero_passeport} onChange={(event) => update("numero_passeport", event.target.value)} /></Field><Field label="Délivré le"><Input type="date" value={value.date_de_delivrance_passeport} onChange={(event) => update("date_de_delivrance_passeport", event.target.value)} /></Field><Field label="Expire le"><Input type="date" value={value.date_expiration_passeport} onChange={(event) => update("date_expiration_passeport", event.target.value)} /></Field>
    <Field label="Observations" wide><Input value={value.observations} onChange={(event) => update("observations", event.target.value)} /></Field>
  </div>
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) { return <div className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div> }
