"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { DocumentEntityType, DocumentRecord, DocumentReferences } from "@/lib/documents/types"

type FormValue = Pick<DocumentRecord, "nom_document" | "id_type_document" | "type_entite_liee" | "id_entite_liee" | "note" | "observations">
const empty: FormValue = { nom_document: "", id_type_document: "", type_entite_liee: "", id_entite_liee: "", note: "", observations: "" }

export function DocumentForm({ references, initial, documentId, onSaved }: { references: DocumentReferences; initial?: FormValue; documentId?: string; onSaved?: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState<FormValue>(initial || empty)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const entityOptions = form.type_entite_liee ? references.entities[form.type_entite_liee as DocumentEntityType] || [] : []
  const linkedActivity = form.type_entite_liee === "ACTIVITE"
    ? entityOptions.find((option) => option.id.toLocaleLowerCase("fr") === form.id_entite_liee.trim().toLocaleLowerCase("fr"))
    : undefined
  const set = (key: keyof FormValue, value: string) => setForm((current) => ({ ...current, [key]: value }))

  async function save() {
    setSaving(true)
    try {
      let response: Response
      if (documentId) response = await fetch(`/api/documents/${encodeURIComponent(documentId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      else {
        const body = new FormData(); body.append("metadata", JSON.stringify(form)); if (file) body.append("file", file)
        response = await fetch("/api/documents", { method: "POST", body })
      }
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Enregistrement impossible.")
      toast.success(documentId ? "Document modifié." : "Document créé.")
      if (documentId) { onSaved?.(); router.refresh() } else router.push(`/dashboard/documents/${result.row.id_document}`)
    } catch (error) { toast.error(error instanceof Error ? error.message : String(error)) }
    finally { setSaving(false) }
  }

  return <div className="grid gap-5">
    {!references.hasDocumentTypeReferential && <Alert><AlertDescription>La feuille TYPES_DOCUMENT n’existe pas encore dans le référentiel. Saisissez provisoirement un identifiant de type cohérent.</AlertDescription></Alert>}
    <div className="space-y-2"><Label>Nom du document *</Label><Input value={form.nom_document} onChange={(event) => set("nom_document", event.target.value)} /></div>
    <div className="space-y-2"><Label>Type de document *</Label>{references.hasDocumentTypeReferential ? <Select value={form.id_type_document} onValueChange={(value) => set("id_type_document", value)}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{references.documentTypes.map((type) => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}</SelectContent></Select> : <Input value={form.id_type_document} onChange={(event) => set("id_type_document", event.target.value.toUpperCase())} placeholder="Ex. PV" />}</div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label>Type de rattachement</Label><Select value={form.type_entite_liee || "__NONE__"} onValueChange={(value) => setForm((current) => ({ ...current, type_entite_liee: value === "__NONE__" ? "" : value, id_entite_liee: "" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__NONE__">Aucun rattachement</SelectItem>{references.entityTypes.map((type) => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>{form.type_entite_liee === "ACTIVITE" ? "ID de l’activité" : "Objet lié"}</Label>{form.type_entite_liee === "ACTIVITE" ? <><Input value={form.id_entite_liee} onChange={(event) => set("id_entite_liee", event.target.value.toUpperCase())} placeholder="Ex. ACT0001" autoComplete="off" />{form.id_entite_liee && <div className={`rounded-md border px-3 py-2 text-sm ${linkedActivity ? "border-primary/30 bg-primary/5" : "border-destructive/30 text-destructive"}`}>{linkedActivity ? <><span className="text-muted-foreground">Activité trouvée :</span> <span className="font-medium">{linkedActivity.label}</span></> : "Aucune activité ne correspond à cet ID."}</div>}</> : <Select disabled={!form.type_entite_liee} value={form.id_entite_liee} onValueChange={(value) => set("id_entite_liee", value)}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{entityOptions.map((option) => <SelectItem key={option.id} value={option.id}>{option.secondary ? `${option.secondary} — ` : ""}{option.label}</SelectItem>)}</SelectContent></Select>}</div>
    </div>
    <div className="space-y-2"><Label>Note</Label><Textarea value={form.note} onChange={(event) => set("note", event.target.value)} /></div>
    <div className="space-y-2"><Label>Observations</Label><Textarea value={form.observations} onChange={(event) => set("observations", event.target.value)} /></div>
    {!documentId && <div className="space-y-2"><Label>Fichier PDF (facultatif, 5 Mo maximum)</Label><Input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /></div>}
    <div className="flex justify-end"><Button disabled={saving} onClick={save}>{saving ? "Enregistrement…" : "Enregistrer"}</Button></div>
  </div>
}
