/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import { Archive, ArrowLeft, ChevronLeft, ChevronRight, Eye, ImageOff, Images, LoaderCircle, Pencil, Plus, RotateCw, Search } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { apiFetch } from "@/lib/api/client"
import { CONTENT_SCHEMAS, isTrue, type ContentRow, type PublicationStatus, type RelationOptions, type Resource } from "@/lib/site-web/schema"
import { safeLink } from "@/lib/site-web/validation"
import { persistContent, sendContentFile } from "@/lib/site-web/client-upload"
import { GalleryPhotos } from "./gallery-photos"

const dateLabel = (value: string) => value ? value.split("-").reverse().join("/") : "—"
export function mediaPreview(value: string) {
  if (!value || !safeLink(value)) return ""
  const url = new URL(value)
  return url.pathname.startsWith("/api/site-web/media/") ? url.pathname + url.search : value
}
function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) { return <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title={label} aria-label={label} onClick={onClick}>{children}</Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip> }

export default function ContentManager({ resource, initialRows, initialStatuses, canEdit, initialError = false, embedded = false, galleryId, onRowsChanged }: { resource: Resource; initialRows: ContentRow[]; initialStatuses: PublicationStatus[]; canEdit: boolean; initialError?: boolean; embedded?: boolean; galleryId?: string; onRowsChanged?: (rows: ContentRow[]) => void }) {
  const schema = CONTENT_SCHEMAS[resource]
  const [rows, setRows] = useState(initialRows), [statuses, setStatuses] = useState(initialStatuses)
  const [failed, setFailed] = useState(initialError), [loading, setLoading] = useState(false), [query, setQuery] = useState(""), [filter, setFilter] = useState("all"), [featuredFilter, setFeaturedFilter] = useState(false), [page, setPage] = useState(1)
  const [open, setOpen] = useState(false), [view, setView] = useState(false), [selected, setSelected] = useState<ContentRow | null>(null), [draft, setDraft] = useState<ContentRow>({}), [original, setOriginal] = useState(""), [options, setOptions] = useState<RelationOptions>({})
  const [files, setFiles] = useState<Record<string, File>>({}), [previews, setPreviews] = useState<Record<string, string>>({}), [assets, setAssets] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState(""), [discard, setDiscard] = useState(false), [optionError, setOptionError] = useState(false), [optionLoading, setOptionLoading] = useState(false), [progress, setProgress] = useState("")
  const submission = useRef(false), requestId = useRef(""), previewUrls = useRef<string[]>([]), panelGeneration = useRef(0)
  const dirty = open && !view && (JSON.stringify(draft) !== original || Object.keys(files).length > 0)
  useEffect(() => () => { for (const url of previewUrls.current) URL.revokeObjectURL(url) }, [])
  useEffect(() => { if (!dirty) return; const leave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }; window.addEventListener("beforeunload", leave); return () => window.removeEventListener("beforeunload", leave) }, [dirty])
  async function loadOptions() {
    const generation = ++panelGeneration.current
    setOptionLoading(true); setOptionError(false)
    try { const response = await apiFetch(`/api/site-web/${resource}?options=1`); const data = await response.json(); if (!response.ok) throw new Error(); if (generation === panelGeneration.current) setOptions(data.options) }
    catch { if (generation === panelGeneration.current) setOptionError(true) }
    finally { if (generation === panelGeneration.current) setOptionLoading(false) }
  }
  function start(row: ContentRow | null, readonly = false) {
    const next = row ? { ...row } : Object.fromEntries(schema.fields.map(field => [field.key, field.key === "id_galerie" ? galleryId || "" : field.type === "boolean" ? "FALSE" : field.type === "status" ? "PUB001" : field.type === "number" ? resource === "sliders" ? "1" : "0" : field.key === "type_media" ? "PHOTO" : ""]))
    requestId.current = crypto.randomUUID(); setDraft(next); setOriginal(JSON.stringify(next)); setSelected(row); setView(readonly); setFiles({}); setAssets({}); setPreviews({}); setError(""); setOptionError(false); setOpen(true)
    if (schema.fields.some(f => f.relation && !(resource === "photos" && f.key === "id_galerie"))) void loadOptions()
  }
  function close() { if (saving) return; if (dirty) setDiscard(true); else { panelGeneration.current++; setOpen(false) } }
  function change(key: string, value: string) { setDraft(current => ({ ...current, [key]: value, ...(key === "id_document_public" && value ? { fichier_url: "" } : {}) })); setError("") }
  function chooseFile(key: string, file?: File) {
    if (!file) return
    const definition = schema.fields.find(f => f.key === key)!, max = definition.type === "pdf" ? 25 : 5
    if (file.size > max * 1024 * 1024 || !file.size) { setError(`Le fichier doit être non vide et ne pas dépasser ${max} Mo.`); return }
    const url = URL.createObjectURL(file); previewUrls.current.push(url)
    setFiles(current => ({ ...current, [key]: file })); setPreviews(current => ({ ...current, [key]: url })); setAssets(current => { const next = { ...current }; delete next[key]; return next }); setError("")
  }
  function updateRows(next: ContentRow[]) { setRows(next); onRowsChanged?.(next) }
  async function retry() {
    setLoading(true)
    try { const response = await apiFetch(`/api/site-web/${resource}${galleryId ? `?galerie=${encodeURIComponent(galleryId)}` : ""}`); const result = await response.json(); if (!response.ok) throw new Error(result.error); updateRows(result.rows); setStatuses(result.statuses); setFailed(false); setError("") }
    catch { setFailed(true); setError("La rubrique ne peut pas être chargée. Réessayez.") }
    finally { setLoading(false) }
  }
  async function save() {
    if (submission.current || view || !canEdit) return
    submission.current = true; setSaving(true); setError(""); setMessage("")
    const prepared = { ...assets }
    try {
      for (const [field, file] of Object.entries(files)) if (!prepared[field]) { prepared[field] = await sendContentFile({ resource, rowId: selected?.[schema.id], field, requestId: requestId.current, file, progress: percentage => setProgress(`${file.name} : ${percentage} %`) }); setAssets({ ...prepared }) }
      setProgress("Enregistrement de la fiche…")
      const row = await persistContent({ resource, row: draft, id: selected?.[schema.id], requestId: requestId.current, assets: prepared })
      updateRows(selected ? rows.map(current => current[schema.id] === row[schema.id] ? row : current) : [...rows, row]); setOpen(false); setMessage("Le contenu a été enregistré."); setFailed(false)
    } catch (cause) { if (cause instanceof Error && /autorisation.*expir/i.test(cause.message)) setAssets({}); setError(cause instanceof Error ? cause.message : "Enregistrement impossible.") }
    finally { submission.current = false; setSaving(false); setProgress("") }
  }
  const imageField = resource === "evenements" ? "logo_url" : schema.fields.find(f => f.type === "image")?.key
  const dateFields = schema.fields.filter(f => f.type === "date")
  const hasStatus = schema.fields.some(f => f.type === "status"), hasOrder = schema.fields.some(f => f.type === "number"), hasFeatured = schema.fields.some(f => f.key === "est_mis_en_avant")
  const filtered = rows.filter(row => (!query || [row[schema.label], row.description, row.extrait, row.sport, row.type_document, row.nom_categorie_actualite].join(" ").toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr"))) && (filter === "all" || row.id_statut_publication === filter) && (!featuredFilter || isTrue(row.est_mis_en_avant || ""))).sort((a, b) => Number(a.ordre_affichage || 0) - Number(b.ordre_affichage || 0) || (b.date_publication || b.date_document || "").localeCompare(a.date_publication || a.date_document || ""))
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10)), currentPage = Math.min(page, pageCount), visible = filtered.slice((currentPage - 1) * 10, currentPage * 10)
  const statusLabel = (id: string) => statuses.find(status => status.id === id)?.label || id
  const columnCount = 2 + Number(Boolean(imageField)) + Number(resource === "documents") + (resource === "athletes" ? 2 : 0) + Number(dateFields.length > 0) + Number(hasStatus) + Number(hasFeatured) + Number(hasOrder)
  const hasFilters = Boolean(query || filter !== "all" || featuredFilter)
  const content = <>
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={`Rechercher dans ${schema.title}`} placeholder="Rechercher un contenu…" className="pl-9" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /></div>
        {hasStatus && <Select value={filter} onValueChange={value => { setFilter(value); setPage(1) }}><SelectTrigger aria-label="Filtrer par publication" className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{statuses.map(status => <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>)}</SelectContent></Select>}
        {hasFeatured && <div className="flex min-h-9 items-center gap-2"><Checkbox id={`featured-${resource}`} checked={featuredFilter} onCheckedChange={value => { setFeaturedFilter(value === true); setPage(1) }} /><Label htmlFor={`featured-${resource}`} className="text-sm font-normal">À la une uniquement</Label></div>}
      </div>
      <div className="flex shrink-0 items-center gap-2"><Button variant="outline" size="icon" disabled={loading || saving} aria-label="Actualiser cette rubrique" title="Actualiser cette rubrique" onClick={() => void retry()}><RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>{canEdit && <Button className="flex-1 sm:flex-none" disabled={failed || loading} onClick={() => start(null)}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>}</div>
    </div>
    {message && <p role="status" className="rounded-md border bg-muted/50 p-3 text-sm">{message}</p>}
    {error && !open && <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
    {failed ? <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p role="alert" className="text-sm text-muted-foreground">Impossible de charger cette rubrique pour le moment.</p><Button variant="outline" disabled={loading} onClick={() => void retry()}>Réessayer</Button></CardContent></Card> : <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <CardContent className="p-0"><Table aria-label={schema.title} aria-busy={loading} className={resource === "categories" ? "min-w-[28rem]" : "min-w-[48rem]"}>
        <TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70">
          {imageField && <TableHead className="w-20">Visuel</TableHead>}<TableHead>{resource === "athletes" ? "Athlète" : resource === "categories" ? "Catégorie" : "Titre"}</TableHead>
          {resource === "documents" && <TableHead>Type</TableHead>}{resource === "athletes" && <><TableHead>Sport</TableHead><TableHead>Distinction</TableHead></>}
          {dateFields.length > 0 && <TableHead>Date / période</TableHead>}{hasStatus && <TableHead>Statut</TableHead>}{hasFeatured && <TableHead className="text-center">À la une</TableHead>}{hasOrder && <TableHead className="text-right">Ordre</TableHead>}<TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>{visible.map(row => <TableRow key={row[schema.id]}>
          {imageField && <TableCell className="w-20">{mediaPreview(row[imageField]) ? <img src={mediaPreview(row[imageField])} alt="" loading="lazy" className="h-10 w-14 rounded-md border border-border/60 object-cover" /> : <span className="flex h-10 w-14 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground" title="Sans visuel"><ImageOff aria-hidden="true" className="h-4 w-4" /><span className="sr-only">Sans visuel</span></span>}</TableCell>}
          <TableCell className="min-w-48 max-w-80 whitespace-normal"><button type="button" className="text-left text-sm font-medium leading-5 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => start(row, true)}>{row[schema.label]}</button></TableCell>
          {resource === "documents" && <TableCell className="text-muted-foreground">{row.type_document || "—"}</TableCell>}{resource === "athletes" && <><TableCell>{row.sport || "—"}</TableCell><TableCell className="max-w-60 whitespace-normal text-muted-foreground">{row.distinction || "—"}</TableCell></>}
          {dateFields.length > 0 && <TableCell className="text-sm tabular-nums text-muted-foreground">{dateFields.some(f => row[f.key]) ? dateFields.map(f => row[f.key] ? <div key={f.key}>{dateLabel(row[f.key])}</div> : null) : "—"}</TableCell>}
          {hasStatus && <TableCell><Badge variant={row.id_statut_publication === "PUB002" ? "secondary" : "outline"}>{statusLabel(row.id_statut_publication)}</Badge></TableCell>}
          {hasFeatured && <TableCell className="text-center"><span className={isTrue(row.est_mis_en_avant) ? "text-sm font-medium" : "text-sm text-muted-foreground"}>{isTrue(row.est_mis_en_avant) ? "Oui" : "Non"}</span></TableCell>}{hasOrder && <TableCell className="text-right tabular-nums text-muted-foreground">{row.ordre_affichage || "0"}</TableCell>}
          <TableCell><div className="flex items-center justify-end gap-1"><IconAction label={`Consulter ${row[schema.label]}`} onClick={() => start(row, true)}><Eye className="h-4 w-4" /></IconAction>{canEdit && <IconAction label={`Modifier ${row[schema.label]}`} onClick={() => start(row)}><Pencil className="h-4 w-4" /></IconAction>}{canEdit && hasStatus && row.id_statut_publication !== "PUB003" && <IconAction label={`Archiver ${row[schema.label]}`} onClick={() => { start(row); setDraft({ ...row, id_statut_publication: "PUB003" }) }}><Archive className="h-4 w-4" /></IconAction>}</div></TableCell>
        </TableRow>)}{!visible.length && <TableRow><TableCell colSpan={columnCount} className="h-32 text-center text-muted-foreground">{hasFilters ? "Aucun résultat pour ces filtres." : "Aucun contenu enregistré."}</TableCell></TableRow>}</TableBody>
      </Table></CardContent>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"><p role="status" className="text-xs text-muted-foreground">{filtered.length ? `${(currentPage - 1) * 10 + 1}–${Math.min(currentPage * 10, filtered.length)} sur ${filtered.length}` : "0 résultat"}</p><div className="flex items-center gap-2"><span className="mr-1 text-xs text-muted-foreground">Page {currentPage} / {pageCount}</span><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Page précédente" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Page suivante" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>
    </Card>}
  </>
  return <div className={embedded ? "min-w-0" : "min-h-screen min-w-0"}>{!embedded && <Header title={schema.title} subtitle="Administration des contenus publics du COC" />}<div className={embedded ? "min-w-0 space-y-4" : "min-w-0 space-y-6 p-4 sm:p-6"}>{!embedded && <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground"><Link href="/dashboard/site-web"><ArrowLeft className="mr-2 h-4 w-4" />Site Web</Link></Button>}{content}</div>
    <Sheet open={open} onOpenChange={value => { if (!value) close() }}><SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl"><SheetHeader className="shrink-0 border-b pr-12"><SheetTitle>{view ? "Consulter" : selected ? "Modifier" : "Ajouter"} {schema.singular}</SheetTitle><SheetDescription>{view ? "Contenu intégral et publication." : "Les champs marqués * sont obligatoires. Les fichiers restent privés jusqu’à publication."}</SheetDescription></SheetHeader><div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
      {optionLoading && <p role="status" className="text-sm text-muted-foreground">Chargement des sélecteurs…</p>}{optionError && <div role="alert" className="space-y-2 text-sm text-destructive"><p>Les sélecteurs liés sont indisponibles.</p><Button variant="outline" size="sm" onClick={() => void loadOptions()}>Réessayer</Button></div>}
      {[{ name: "Contenu", fields: schema.fields.filter(f => !["status", "boolean", "number", "date"].includes(f.type)) }, { name: "Dates et publication", fields: schema.fields.filter(f => ["status", "boolean", "number", "date"].includes(f.type)) }].filter(group => group.fields.length).map(group => <section key={group.name} className="space-y-4"><h2 className="border-b pb-2 text-sm font-semibold">{group.name}</h2><div className="grid gap-4 sm:grid-cols-2">{group.fields.filter(f => f.key !== "type_media" && !(resource === "photos" && f.key === "id_galerie")).map(f => <div key={f.key} className={`min-w-0 space-y-2 ${f.type === "long" || f.type === "image" || f.type === "pdf" ? "sm:col-span-2" : ""}`}><Label htmlFor={`content-${resource}-${f.key}`}>{f.label}{f.required ? " *" : ""}</Label>
        {view && !["image", "pdf", "relation", "status"].includes(f.type) ? <p className="whitespace-pre-wrap break-words text-sm">{f.type === "boolean" ? isTrue(draft[f.key]) ? "Oui" : "Non" : f.type === "date" ? dateLabel(draft[f.key]) : draft[f.key] || "—"}</p> : f.type === "image" || f.type === "pdf" ? <>{(previews[f.key] || mediaPreview(draft[f.key])) && (f.type === "image" ? <img src={previews[f.key] || mediaPreview(draft[f.key])} alt={draft[schema.label] || "Aperçu"} className="max-h-60 rounded border object-contain" /> : <div className="flex flex-wrap gap-4"><a className="text-sm text-primary underline" href={previews[f.key] || mediaPreview(draft[f.key])} target="_blank" rel="noopener noreferrer">Ouvrir le PDF</a><a className="text-sm text-primary underline" href={(previews[f.key] || mediaPreview(draft[f.key])) + (mediaPreview(draft[f.key]).startsWith("/api/site-web/media/") && !previews[f.key] ? "&download=1" : "")} download={previews[f.key] ? "document.pdf" : undefined} target="_blank" rel="noopener noreferrer">Télécharger le PDF</a></div>)}{!view && <><Input id={`content-${resource}-${f.key}`} disabled={saving} type="file" accept={f.type === "pdf" ? "application/pdf" : "image/png,image/jpeg,image/webp,image/gif"} onChange={event => chooseFile(f.key, event.target.files?.[0])} /><p className="text-xs text-muted-foreground">{f.type === "pdf" ? "PDF · 25 Mo maximum." : "JPEG, PNG, WebP ou GIF · 5 Mo maximum."} Un nouvel envoi remplace le lien sans supprimer l’ancien fichier.</p></>}</> : f.type === "relation" ? view ? <p className="text-sm">{options[f.relation!]?.find(item => item.id === draft[f.key])?.label || (draft[f.key] ? "Contenu lié (sélecteur en cours de chargement)" : "—")}</p> : <select id={`content-${resource}-${f.key}`} className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={saving || optionLoading || optionError} value={draft[f.key] || ""} onChange={event => change(f.key, event.target.value)}><option value="">{f.required ? "Sélectionner…" : "Aucun"}</option>{options[f.relation!]?.map(item => <option key={item.id} value={item.id}>{item.label}{item.status && item.status !== "PUB002" ? " (non publié)" : ""}</option>)}</select> : f.type === "status" ? view ? <Badge variant="secondary">{statusLabel(draft[f.key])}</Badge> : <select id={`content-${resource}-${f.key}`} className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={saving} value={draft[f.key]} onChange={event => change(f.key, event.target.value)}>{statuses.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select> : f.type === "boolean" ? <label className="flex items-center gap-2 text-sm"><input id={`content-${resource}-${f.key}`} disabled={saving} type="checkbox" checked={isTrue(draft[f.key])} onChange={event => change(f.key, event.target.checked ? "TRUE" : "FALSE")} />Oui</label> : f.type === "long" ? <Textarea id={`content-${resource}-${f.key}`} disabled={saving} rows={f.key === "contenu" ? 12 : 4} value={draft[f.key] || ""} onChange={event => change(f.key, event.target.value)} /> : <Input id={`content-${resource}-${f.key}`} disabled={saving || f.key === "fichier_url" && Boolean(draft.id_document_public)} type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"} min={f.type === "number" ? 0 : undefined} value={draft[f.key] || ""} onChange={event => change(f.key, event.target.value)} />}
      </div>)}</div></section>)}
      {view && resource === "galeries" && selected && <section className="space-y-4 border-t pt-4"><h2 className="flex items-center gap-2 font-semibold"><Images className="h-4 w-4" />Photos et descriptions</h2><GalleryPhotos galleryId={selected.id_galerie} canEdit={canEdit} /></section>}
      {error && <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">{error} La saisie est conservée. En cas d’incertitude, rechargez la rubrique avant de recommencer.</p>}{progress && <p role="status" className="text-sm text-muted-foreground">{progress}</p>}
    </div><SheetFooter className="shrink-0 border-t bg-background p-4"><Button variant="outline" disabled={saving} onClick={close}>{view ? "Fermer" : "Annuler"}</Button>{!view && <Button disabled={saving || optionLoading || optionError} onClick={() => void save()}>{saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}{saving ? "Enregistrement…" : "Enregistrer"}</Button>}</SheetFooter></SheetContent></Sheet>
    <AlertDialog open={discard} onOpenChange={setDiscard}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Abandonner les modifications ?</AlertDialogTitle><AlertDialogDescription>La saisie non enregistrée sera perdue. Les fichiers déjà envoyés ne seront pas supprimés automatiquement.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuer la saisie</AlertDialogCancel><AlertDialogAction onClick={() => { panelGeneration.current++; setOpen(false); setDiscard(false) }}>Abandonner</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}
