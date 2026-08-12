"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, CheckCircle2, Pencil, Plus } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FederationData } from "@/lib/federations/types"

type Resource = "hierarchie" | "ligues" | "ententes" | "clubs"
type Editor = { resource: Resource; id?: string; row: Record<string, string> } | null
type Feedback = { type: "success" | "error"; text: string } | null
const normal = (value: string) => value.toLocaleLowerCase("fr")

export default function ParametresClient({ data, federationId }: { data: FederationData; federationId: string }) {
  const router = useRouter()
  const federation = data.federations.find((item) => item.id_federation === federationId)!
  const ligues = data.ligues.filter((item) => item.id_federation === federationId)
  const ententes = data.ententes.filter((item) => item.id_federation === federationId)
  const clubs = data.clubs.filter((item) => item.id_federation === federationId)
  const hierarchie = data.hierarchie.filter((item) => item.id_federation === federationId)
  const typeName = (id: string) => data.typesStructure.find((item) => item.id_type_structure === id)?.nom_structure || id
  const orderedHierarchy = [...hierarchie].sort((a, b) => Number(a.niveau) - Number(b.niveau))
  const clubIndex = orderedHierarchy.findIndex((item) => normal(item.nom_structure || typeName(item.id_type_structure)).includes("club"))
  const clubParentRequired = clubIndex > 0
  const usesEntentes = clubIndex > 0 && normal(orderedHierarchy[clubIndex - 1]?.nom_structure || typeName(orderedHierarchy[clubIndex - 1]?.id_type_structure ?? "")).includes("entente")
  const categories = data.categoriesClub.filter((item) => !item.id_sport || !federation.id_sport || item.id_sport === federation.id_sport)
  const [editor, setEditor] = useState<Editor>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const open = (resource: Resource, row: Record<string, string> = {}) => {
    setFeedback(null)
    setEditor({ resource, id: row[idColumn(resource)] || undefined, row: { ...row, id_federation: federationId, ...(resource === "hierarchie" ? {} : { statut: row.statut || "Actif" }) } })
  }
  const update = (key: string, value: string) => setEditor((current) => current ? ({ ...current, row: { ...current.row, [key]: value } }) : null)
  async function save() {
    if (!editor) return
    const validationError = validateEditor(editor, usesEntentes, clubParentRequired)
    if (validationError) return setFeedback({ type: "error", text: validationError })
    setSaving(true); setFeedback(null)
    try {
      const response = await fetch(`/api/federations/${editor.resource}`, { method: editor.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editor.id ? { id: editor.id, row: editor.row } : { row: editor.row }) })
      const result = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) return setFeedback({ type: "error", text: result.error || "L’enregistrement a échoué. Vérifiez les informations saisies." })
      setEditor(null); setFeedback({ type: "success", text: `${label(editor.resource)} : enregistrement effectué avec succès.` }); router.refresh()
    } catch {
      setFeedback({ type: "error", text: "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez." })
    } finally {
      setSaving(false)
    }
  }

  return <div className="min-h-screen">
    <Header title="Paramétrage territorial" subtitle={`${federation.nom_federation} · ${federation.sigle_federation || federation.id_federation}`} />
    <main className="space-y-5 p-4 md:p-6">
      <Card><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{federation.nom_federation}</h2>{federation.sigle_federation && <Badge variant="secondary">{federation.sigle_federation}</Badge>}</div><p className="text-sm text-muted-foreground">{federation.nom_sport} · ID fédération : {federation.id_federation}</p></div><Button asChild variant="outline"><Link href="/dashboard/federations"><ArrowLeft className="h-4 w-4" />Retour vers Fédérations</Link></Button></CardContent></Card>
      {feedback && !editor && <FeedbackAlert feedback={feedback} />}
      <Tabs defaultValue="hierarchie" className="space-y-4"><div className="overflow-x-auto"><TabsList className="w-max"><TabsTrigger value="hierarchie">Hiérarchie</TabsTrigger><TabsTrigger value="ligues">Ligues</TabsTrigger><TabsTrigger value="ententes">Ententes</TabsTrigger><TabsTrigger value="clubs">Clubs</TabsTrigger></TabsList></div>
        <TabsContent value="hierarchie"><ResourceCard title="Niveaux de structure" onAdd={() => open("hierarchie")} headers={["Niveau", "Structure", "Observations"]} rows={orderedHierarchy.map((row) => ({ key: row.id_hierarchie, cells: [row.niveau, row.nom_structure || typeName(row.id_type_structure), row.observations], edit: () => open("hierarchie", row as unknown as Record<string, string>) }))} /></TabsContent>
        <TabsContent value="ligues"><ResourceCard title="Ligues" onAdd={() => open("ligues")} headers={["ID COC", "Ligue", "Province", "E-mail", "Statut"]} rows={ligues.map((row) => ({ key: row.id_ligue_coc, cells: [row.id_ligue_coc, row.nom_ligue, row.nom_province, row.email_ligue, row.statut], edit: () => open("ligues", row as unknown as Record<string, string>) }))} /></TabsContent>
        <TabsContent value="ententes"><ResourceCard title="Ententes" onAdd={() => open("ententes")} headers={["ID COC", "Entente", "Ligue", "Ville"]} rows={ententes.map((row) => ({ key: row.id_entente_coc, cells: [row.id_entente_coc, row.nom_entente, row.nom_ligue, row.nom_ville], edit: () => open("ententes", row as unknown as Record<string, string>) }))} /></TabsContent>
        <TabsContent value="clubs"><ResourceCard title="Clubs" onAdd={() => open("clubs")} headers={["ID COC", "Club", usesEntentes ? "Entente" : "Ligue", "Ville"]} rows={clubs.map((row) => ({ key: row.id_club_coc, cells: [row.id_club_coc, row.nom_club, usesEntentes ? row.nom_entente : row.nom_ligue, row.nom_ville], edit: () => open("clubs", row as unknown as Record<string, string>) }))} /></TabsContent>
      </Tabs>
    </main>
    <Dialog open={Boolean(editor)} onOpenChange={(openState) => { if (!openState) { setEditor(null); setFeedback(null) } }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{editor?.id ? "Modifier" : "Ajouter"} {editor ? label(editor.resource).toLowerCase() : ""}</DialogTitle><DialogDescription>L’identifiant COC est généré automatiquement et reste immuable.</DialogDescription></DialogHeader>{editor && <EditorFields editor={editor} update={update} data={data} ligues={ligues} ententes={ententes} usesEntentes={usesEntentes} clubParentRequired={clubParentRequired} categories={categories} />}{feedback && editor && <FeedbackAlert feedback={feedback} />}<DialogFooter><Button variant="outline" onClick={() => { setEditor(null); setFeedback(null) }}>Annuler</Button><Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button></DialogFooter></DialogContent></Dialog>
  </div>
}

function ResourceCard({ title, onAdd, headers, rows }: { title: string; onAdd: () => void; headers: string[]; rows: { key: string; cells: string[]; edit: () => void }[] }) {
  return <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>{title}</CardTitle><Button size="sm" onClick={onAdd}><Plus className="h-4 w-4" />Ajouter</Button></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow>{headers.map((header) => <TableHead key={header}>{header}</TableHead>)}<TableHead className="w-20">Action</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.key}>{row.cells.map((cell, index) => <TableCell key={index}>{cell || "—"}</TableCell>)}<TableCell><Button variant="ghost" size="icon-sm" onClick={row.edit} aria-label="Modifier"><Pencil className="h-4 w-4" /></Button></TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={headers.length + 1} className="h-24 text-center text-muted-foreground">Aucun enregistrement.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card>
}

function EditorFields({ editor, update, data, ligues, ententes, usesEntentes, clubParentRequired, categories }: { editor: NonNullable<Editor>; update: (key: string, value: string) => void; data: FederationData; ligues: FederationData["ligues"]; ententes: FederationData["ententes"]; usesEntentes: boolean; clubParentRequired: boolean; categories: FederationData["categoriesClub"] }) {
  const row = editor.row
  if (editor.resource === "hierarchie") return <div className="grid gap-4 sm:grid-cols-2"><Choice label="Structure" required value={row.id_type_structure} onChange={(v) => update("id_type_structure", v)} options={data.typesStructure.map((item) => [item.id_type_structure, item.nom_structure])} /><Field label="Niveau" required type="number" value={row.niveau} onChange={(v) => update("niveau", v)} /><div className="sm:col-span-2"><Field label="Observations (facultatif)" value={row.observations} onChange={(v) => update("observations", v)} /></div></div>
  return <div className="grid gap-4 sm:grid-cols-2">{editor.id && <Field label="ID COC" value={editor.id} disabled onChange={() => {}} />}
    {editor.resource === "ligues" && <><Field label="Nom de la ligue" required value={row.nom_ligue} onChange={(v) => update("nom_ligue", v)} /><Field label="Pseudo (facultatif)" value={row.pseudo_ligue} onChange={(v) => update("pseudo_ligue", v)} /><Field label="ID fédéral (facultatif)" value={row.id_ligue_federation || row.id_ligue_federal} onChange={(v) => update("id_ligue_federal", v)} /><Choice label="Province" required value={row.id_province} onChange={(v) => update("id_province", v)} options={data.provinces.map((item) => [item.id_province, item.nom_province])} /><div className="sm:col-span-2"><Field label="E-mail de la ligue (facultatif)" type="email" value={row.email_ligue} onChange={(v) => update("email_ligue", v)} /></div></>}
    {editor.resource === "ententes" && <><RequiredHint /><Field label="Nom de l’entente" required value={row.nom_entente} onChange={(v) => update("nom_entente", v)} /><Choice label="Ligue parente" required value={row.id_ligue_coc} onChange={(v) => update("id_ligue_coc", v)} options={ligues.map((item) => [item.id_ligue_coc, item.nom_ligue])} /><Field label="Pseudo (facultatif)" value={row.pseudo_entente} onChange={(v) => update("pseudo_entente", v)} /><Field label="ID fédéral (facultatif)" value={row.id_entente_federation} onChange={(v) => update("id_entente_federation", v)} /><Choice label="Ville (facultatif)" clearable value={row.id_ville} onChange={(v) => update("id_ville", v)} options={data.villes.map((item) => [item.id_ville, item.nom_ville])} /><Field label="E-mail (facultatif)" type="email" value={row.email_entente} onChange={(v) => update("email_entente", v)} /></>}
    {editor.resource === "clubs" && <><Field label="Nom du club" required value={row.nom_club} onChange={(v) => update("nom_club", v)} /><Field label="ID fédéral (facultatif)" value={row.id_club_federation} onChange={(v) => update("id_club_federation", v)} />{usesEntentes ? <Choice label="Entente parente" required={clubParentRequired} value={row.id_entente_coc} onChange={(v) => update("id_entente_coc", v)} options={ententes.map((item) => [item.id_entente_coc, item.nom_entente])} /> : <Choice label="Ligue parente" required={clubParentRequired} value={row.id_ligue_coc} onChange={(v) => update("id_ligue_coc", v)} options={ligues.map((item) => [item.id_ligue_coc, item.nom_ligue])} />}<Choice label="Ville (facultatif)" clearable value={row.id_ville} onChange={(v) => update("id_ville", v)} options={data.villes.map((item) => [item.id_ville, item.nom_ville])} /><Choice label="Catégorie (facultatif)" clearable value={row.id_categorie} onChange={(v) => update("id_categorie", v)} options={categories.map((item) => [item.id_categorie, item.nom_categorie])} /></>}
    <Choice label="Statut" value={row.statut} onChange={(v) => update("statut", v)} options={[["Actif", "Actif"], ["Inactif", "Inactif"]]} />
  </div>
}

function Field({ label, value = "", onChange, disabled, type = "text", required = false }: { label: string; value?: string; onChange: (value: string) => void; disabled?: boolean; type?: string; required?: boolean }) { return <div className="space-y-2"><Label>{label}{required && <span className="text-destructive"> *</span>}</Label><Input type={type} value={value} disabled={disabled} required={required} onChange={(event) => onChange(event.target.value)} /></div> }
function Choice({ label, value = "", onChange, options, required = false, clearable = false }: { label: string; value?: string; onChange: (value: string) => void; options: string[][]; required?: boolean; clearable?: boolean }) { return <div className="space-y-2"><Label>{label}{required && <span className="text-destructive"> *</span>}</Label><Select value={value || (clearable ? "__none__" : "")} onValueChange={(next) => onChange(next === "__none__" ? "" : next)} required={required}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{clearable && <SelectItem value="__none__">Aucune</SelectItem>}{options.filter(([id]) => id).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select></div> }
function FeedbackAlert({ feedback }: { feedback: NonNullable<Feedback> }) { const success = feedback.type === "success"; const Icon = success ? CheckCircle2 : AlertCircle; return <Alert variant={success ? "default" : "destructive"} className={success ? "border-green-300 bg-green-50 text-green-800" : ""}><Icon className="h-4 w-4" /><AlertDescription>{feedback.text}</AlertDescription></Alert> }
function RequiredHint() { return <div className="sm:col-span-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground"><span className="font-medium text-destructive">*</span> Champs obligatoires. Les autres informations sont facultatives.</div> }
function validateEditor(editor: NonNullable<Editor>, usesEntentes: boolean, clubParentRequired: boolean) {
  const row = editor.row
  if (editor.resource === "hierarchie" && (!row.id_type_structure?.trim() || !row.niveau?.trim())) return "Renseignez la structure et son niveau."
  if (editor.resource === "ligues" && (!row.nom_ligue?.trim() || !row.id_province?.trim())) return "Renseignez le nom de la ligue et sa province."
  if (editor.resource === "ententes" && (!row.nom_entente?.trim() || !row.id_ligue_coc?.trim())) return "Renseignez le nom de l’entente et sa ligue parente. Les autres champs sont facultatifs."
  if (editor.resource === "clubs" && !row.nom_club?.trim()) return "Renseignez le nom du club."
  if (editor.resource === "clubs" && clubParentRequired && !(usesEntentes ? row.id_entente_coc : row.id_ligue_coc)?.trim()) return `Sélectionnez ${usesEntentes ? "l’entente" : "la ligue"} parente du club.`
  const email = editor.resource === "ligues" ? row.email_ligue : editor.resource === "ententes" ? row.email_entente : ""
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "L’adresse e-mail saisie n’est pas valide."
  return ""
}
function idColumn(resource: Resource) { return resource === "hierarchie" ? "id_hierarchie" : resource === "ligues" ? "id_ligue_coc" : resource === "ententes" ? "id_entente_coc" : "id_club_coc" }
function label(resource: Resource) { return resource === "hierarchie" ? "Niveau de structure" : resource === "ligues" ? "Ligue" : resource === "ententes" ? "Entente" : "Club" }
