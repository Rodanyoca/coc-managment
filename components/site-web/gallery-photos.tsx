/* eslint-disable @next/next/no-img-element */
"use client"
import { useEffect, useRef, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { persistContent, sendContentFile } from "@/lib/site-web/client-upload"
import type { ContentRow } from "@/lib/site-web/schema"
import ContentManager from "./content-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type PendingPhoto = { key: string; file: File; preview: string; title: string; caption: string; credit: string; order: string; state: "pending" | "success" | "error"; error?: string; asset?: string }
export function GalleryPhotos({ galleryId, canEdit }: { galleryId: string; canEdit: boolean }) {
  const [result, setResult] = useState<{ rows: ContentRow[]; error: boolean } | null>(null), [revision, setRevision] = useState(0), [batch, setBatch] = useState(false), [photosVersion, setPhotosVersion] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    apiFetch(`/api/site-web/photos?galerie=${encodeURIComponent(galleryId)}`, { signal: controller.signal, deduplicate: false }).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(); return body.rows as ContentRow[] }).then(rows => { if (!controller.signal.aborted) setResult({ rows, error: false }) }).catch(() => { if (!controller.signal.aborted) setResult({ rows: [], error: true }) })
    return () => controller.abort()
  }, [galleryId, revision])
  const retry = () => { setResult(null); setRevision(value => value + 1) }
  return <div className="space-y-4">{canEdit && <div className="flex justify-end"><Button variant="outline" onClick={() => setBatch(true)}>Ajouter plusieurs photos</Button></div>}{!result ? <p role="status">Chargement des photos…</p> : result.error ? <div role="alert"><p>Photos indisponibles.</p><Button variant="outline" onClick={retry}>Réessayer</Button></div> : <ContentManager key={`${galleryId}:${revision}:${photosVersion}`} resource="photos" embedded galleryId={galleryId} initialRows={result.rows} initialStatuses={[]} canEdit={canEdit} onRowsChanged={rows => setResult({ rows, error: false })} />}
    {batch && <PhotoBatch galleryId={galleryId} onClose={() => setBatch(false)} onSaved={row => { setResult(current => ({ rows: [...(current?.rows ?? []).filter(item => item.id_media_galerie !== row.id_media_galerie), row], error: false })); setPhotosVersion(value => value + 1) }} />}
  </div>
}
function PhotoBatch({ galleryId, onClose, onSaved }: { galleryId: string; onClose: () => void; onSaved: (row: ContentRow) => void }) {
  const [items, setItems] = useState<PendingPhoto[]>([]), [busy, setBusy] = useState(false), [discard, setDiscard] = useState(false), [notice, setNotice] = useState("")
  const lock = useRef(false), urls = useRef<string[]>([])
  useEffect(() => () => { for (const url of urls.current) URL.revokeObjectURL(url) }, [])
  const unsaved = items.some(item => item.state !== "success")
  useEffect(() => { if (!unsaved) return; const leave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }; window.addEventListener("beforeunload", leave); return () => window.removeEventListener("beforeunload", leave) }, [unsaved])
  function add(files: FileList | null) {
    const accepted: PendingPhoto[] = [], rejected: string[] = []
    for (const file of Array.from(files ?? [])) {
      if (!file.size || file.size > 5 * 1024 * 1024 || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) { rejected.push(file.name); continue }
      const preview = URL.createObjectURL(file); urls.current.push(preview)
      accepted.push({ key: crypto.randomUUID(), file, preview, title: file.name.replace(/\.[^.]+$/, ""), caption: "", credit: "", order: String(items.length + accepted.length + 1), state: "pending" })
    }
    setItems(current => [...current, ...accepted]); setNotice(rejected.length ? `Fichiers refusés (format ou taille) : ${rejected.join(", ")}` : "")
  }
  function update(key: string, values: Partial<PendingPhoto>) { setItems(current => current.map(item => item.key === key ? { ...item, ...values } : item)) }
  function close() { if (!busy) { if (unsaved) setDiscard(true); else onClose() } }
  async function save() {
    if (lock.current) return
    lock.current = true; setBusy(true); setNotice("")
    let successes = 0, errors = 0
    for (const item of items.filter(row => row.state !== "success")) {
      try {
        const asset = item.asset || await sendContentFile({ resource: "photos", field: "fichier_url", requestId: item.key, file: item.file })
        update(item.key, { asset })
        const row = await persistContent({ resource: "photos", requestId: item.key, assets: { fichier_url: asset }, row: { id_galerie: galleryId, type_media: "PHOTO", titre_media: item.title, fichier_url: "", legende: item.caption, credit: item.credit, ordre_affichage: item.order } })
        update(item.key, { state: "success", error: "" }); onSaved(row); successes++
      } catch (cause) { update(item.key, { state: "error", error: cause instanceof Error ? cause.message : "Échec de l’envoi.", ...(cause instanceof Error && /autorisation.*expir/i.test(cause.message) ? { asset: undefined } : {}) }); errors++ }
    }
    setNotice(`${successes} photo(s) enregistrée(s), ${errors} échec(s). Les photos réussies sont conservées.`); lock.current = false; setBusy(false)
  }
  return <><Sheet open onOpenChange={value => { if (!value) close() }}><SheetContent className="w-full gap-0 p-0 sm:max-w-3xl"><SheetHeader className="shrink-0 border-b pr-12"><SheetTitle>Ajouter plusieurs photos</SheetTitle><SheetDescription>Une description et un ordre par photo. JPEG, PNG, WebP ou GIF · 5 Mo par fichier.</SheetDescription></SheetHeader><div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"><Label htmlFor="gallery-multiple">Photos</Label><Input id="gallery-multiple" type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={event => add(event.target.files)} />{items.map(item => <fieldset key={item.key} disabled={busy || item.state === "success"} className="space-y-3 rounded-lg border p-3"><div className="flex items-start gap-3"><img src={item.preview} alt="" className="h-16 w-20 rounded object-cover" /><div className="min-w-0"><p className="break-words text-sm font-medium">{item.file.name}</p><p className="text-xs text-muted-foreground">{item.state === "success" ? "Enregistrée" : item.state === "error" ? "À réessayer" : "En attente"}</p></div></div><Label htmlFor={`${item.key}-title`}>Titre</Label><Input id={`${item.key}-title`} value={item.title} onChange={event => update(item.key, { title: event.target.value })} /><Label htmlFor={`${item.key}-caption`}>Description de cette photo</Label><Textarea id={`${item.key}-caption`} value={item.caption} onChange={event => update(item.key, { caption: event.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`${item.key}-credit`}>Crédit</Label><Input id={`${item.key}-credit`} value={item.credit} onChange={event => update(item.key, { credit: event.target.value })} /></div><div className="space-y-2"><Label htmlFor={`${item.key}-order`}>Ordre</Label><Input id={`${item.key}-order`} type="number" min={0} value={item.order} onChange={event => update(item.key, { order: event.target.value })} /></div></div>{item.error && <p role="alert" className="text-sm text-destructive">{item.error}</p>}</fieldset>)}{notice && <p role="status" className="rounded border p-3 text-sm">{notice}</p>}</div><SheetFooter className="shrink-0 border-t p-4"><Button variant="outline" disabled={busy} onClick={close}>Fermer</Button><Button disabled={busy || !unsaved} onClick={() => void save()}>{busy ? "Envoi en cours…" : "Enregistrer les photos restantes"}</Button></SheetFooter></SheetContent></Sheet><AlertDialog open={discard} onOpenChange={setDiscard}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Fermer les envois ?</AlertDialogTitle><AlertDialogDescription>Les photos enregistrées sont conservées. Les autres saisies seront abandonnées.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuer</AlertDialogCancel><AlertDialogAction onClick={onClose}>Fermer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>
}
