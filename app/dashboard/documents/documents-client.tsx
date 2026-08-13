"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Eye, Plus, Search } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DocumentRecord, DocumentReferences } from "@/lib/documents/types"

type Item = DocumentRecord & { typeLabel: string; linkedLabel: string }
const PAGE_SIZE = 10
const formatSize = (value: string) => { const bytes = Number(value); if (!Number.isFinite(bytes) || bytes <= 0) return "—"; return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.ceil(bytes / 1024)} Ko` }

export default function DocumentsClient({ items, references }: { items: Item[]; references: DocumentReferences }) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("TOUS")
  const [entityTypeFilter, setEntityTypeFilter] = useState("TOUS")
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fr")
    return items.filter((item) => (!search || [item.id_document, item.nom_document, item.typeLabel, item.note, item.type_entite_liee, item.linkedLabel].join(" ").toLocaleLowerCase("fr").includes(search)) && (typeFilter === "TOUS" || item.id_type_document === typeFilter) && (entityTypeFilter === "TOUS" || item.type_entite_liee === entityTypeFilter))
  }, [items, query, typeFilter, entityTypeFilter])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const storage = items.reduce((sum, item) => sum + (Number(item.taille) || 0), 0)
  const linked = items.filter((item) => item.type_entite_liee && item.id_entite_liee).length
  const documentTypes = references.hasDocumentTypeReferential ? references.documentTypes : [...new Map(items.filter((item) => item.id_type_document).map((item) => [item.id_type_document, { id: item.id_type_document, label: item.typeLabel }])).values()]
  function filter(setter: (value: string) => void, value: string) { setter(value); setPage(1) }

  return <div className="min-h-screen"><Header title="Documents" subtitle="Référentiel documentaire" /><main className="space-y-6 p-4 sm:p-6">
    <div className="flex justify-end"><Button asChild><Link href="/dashboard/documents/nouveau"><Plus className="h-4 w-4" />Nouveau document</Link></Button></div>
    <div className="grid gap-3 sm:grid-cols-4">{[["Total documents", items.length], ["Documents liés", linked], ["Documents non liés", items.length - linked], ["Stockage", formatSize(String(storage))]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-sm text-muted-foreground">{label}</p></CardContent></Card>)}</div>
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1 sm:max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Rechercher un document…" value={query} onChange={(event) => filter(setQuery, event.target.value)} /></div><Select value={typeFilter} onValueChange={(value) => filter(setTypeFilter, value)}><SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TOUS">Tous les types</SelectItem>{documentTypes.map((type) => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}</SelectContent></Select><Select value={entityTypeFilter} onValueChange={(value) => filter(setEntityTypeFilter, value)}><SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TOUS">Tous les rattachements</SelectItem>{references.entityTypes.map((type) => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}</SelectContent></Select></div>
    <Card><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Rattachement</TableHead><TableHead>Taille</TableHead><TableHead>Fichier</TableHead><TableHead /></TableRow></TableHeader><TableBody>{visible.map((item) => <TableRow key={item.id_document}><TableCell className="font-mono text-xs">{item.id_document}</TableCell><TableCell className="font-medium">{item.nom_document}</TableCell><TableCell>{item.typeLabel || "—"}</TableCell><TableCell>{item.type_entite_liee ? `${item.type_entite_liee} · ${item.linkedLabel || item.id_entite_liee}` : "—"}</TableCell><TableCell>{formatSize(item.taille)}</TableCell><TableCell><Badge variant={item.drive_document_id ? "secondary" : "outline"}>{item.drive_document_id ? "Disponible" : "Non disponible"}</Badge></TableCell><TableCell><Button asChild variant="ghost" size="icon"><Link href={`/dashboard/documents/${item.id_document}`} aria-label="Voir le document"><Eye className="h-4 w-4" /></Link></Button></TableCell></TableRow>)}{!visible.length && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Aucun document trouvé.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
    {pageCount > 1 && <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Page {currentPage} sur {pageCount} · {filtered.length} document(s)</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Précédent</Button><Button variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Suivant</Button></div></div>}
  </main></div>
}
