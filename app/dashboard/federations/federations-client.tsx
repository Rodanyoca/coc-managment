"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, Eye, Search } from "lucide-react"
import { ListPagination } from "@/components/dashboard/list-pagination"
import { Header } from "@/components/dashboard/header"
import { FederationCreateSheet, type FederationCreationReferences } from "@/components/dashboard/federation-create-sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Federation } from "@/lib/federations/types"

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
const readable = (value: string) => value ? value.replaceAll("_", " ").toLocaleLowerCase("fr").replace(/^./, (letter) => letter.toLocaleUpperCase("fr")) : "Non renseigné"
const positive = (value: string) => ["actif", "affilie", "reconnu", "oui", "valide"].some((word) => normalize(value).includes(word))
const initials = (name: string, sigle: string) => sigle.slice(0, 3).toUpperCase() || name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "FD"

function StatusBadge({ value, shortLabel }: { value: string; shortLabel?: string }) {
  const label = readable(value)
  return <Tooltip><TooltipTrigger asChild><Badge variant="outline" className={value && positive(value) ? "max-w-full border-green-300 bg-green-50 text-green-700" : value ? "max-w-full border-orange-300 bg-orange-50 text-orange-700" : "max-w-full text-muted-foreground"}><span className="whitespace-normal text-center leading-4 sm:hidden">{shortLabel || label}</span><span className="hidden whitespace-normal text-center leading-4 sm:inline">{label}</span></Badge></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
}

export default function FederationsClient({ initialFederations: initial, references, canWrite, loadError }: { initialFederations: Federation[]; references: FederationCreationReferences; canWrite: boolean; loadError?: string }) {
  const [initialFederations, setFederations] = useState(initial)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("TOUTES")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const categories = useMemo(() => [...new Set(initialFederations.map((item) => item.categorie_entite).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr")), [initialFederations])
  const rows = useMemo(() => { const needle=normalize(query.trim()); return initialFederations.filter((item) => (category === "TOUTES" || item.categorie_entite === category) && (!needle || normalize([item.id_federation,item.nom_federation,item.sigle_federation,item.categorie_entite,item.statut_reconnaissance_ministere,item.statut_affiliation_coc].join(" ")).includes(needle))) }, [category, initialFederations, query])
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  return <div className="min-h-screen"><Header title="Fédérations" subtitle="Fédérations sportives nationales" /><main className="space-y-6 p-4 md:p-6">
    <div className="flex justify-end">{canWrite && <FederationCreateSheet references={references} onCreated={(federation) => setFederations((current) => [...current, federation].sort((a, b) => a.nom_federation.localeCompare(b.nom_federation, "fr")))} />}</div>
    {loadError ? <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Impossible de charger les fédérations</AlertTitle><AlertDescription>Les données sont temporairement indisponibles. Réessayez plus tard.</AlertDescription></Alert> : <>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 flex-1 sm:min-w-[200px] sm:max-w-md"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Rechercher une fédération" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Rechercher une fédération…" className="pl-9" /></div>
        <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1) }}><SelectTrigger className="w-full sm:w-[220px]" aria-label="Filtrer par catégorie"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TOUTES">Toutes les catégories</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(1,10,20,0.12)]">
        <Table>
          <TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead className="font-semibold">Logo</TableHead><TableHead className="font-medium">Fédération</TableHead><TableHead className="font-semibold">Sigle</TableHead><TableHead className="font-semibold">Catégorie</TableHead><TableHead className="font-semibold">Reconnaissance</TableHead><TableHead className="font-semibold">Affiliation COC</TableHead><TableHead className="w-[100px] text-center">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{visible.map((item) => <TableRow key={item.id_federation} className="hover:bg-muted/30">
            <TableCell><Avatar className="h-9 w-9 border border-border/60 bg-muted">{item.logo_drive_url && <AvatarImage src={item.logo_drive_url} alt={`Logo de ${item.nom_federation || item.id_federation}`} className="object-contain p-0.5" />}<AvatarFallback className="text-[10px] font-medium">{initials(item.nom_federation, item.sigle_federation)}</AvatarFallback></Avatar></TableCell>
            <TableCell className="max-w-sm whitespace-normal break-words font-medium">{item.nom_federation || "Non renseigné"}</TableCell>
            <TableCell>{item.sigle_federation || "Non renseigné"}</TableCell><TableCell>{item.categorie_entite || "Non renseigné"}</TableCell>
            <TableCell><StatusBadge value={item.statut_reconnaissance_ministere} shortLabel="Ministère" /></TableCell><TableCell><StatusBadge value={item.statut_affiliation_coc} shortLabel="COC" /></TableCell>
            <TableCell className="text-center"><Tooltip><TooltipTrigger asChild><Button asChild variant="ghost" size="icon-sm"><Link href={`/dashboard/federations/${encodeURIComponent(item.id_federation)}`} aria-label={`Voir la fiche de ${item.nom_federation || item.id_federation}`}><Eye className="h-4 w-4" /></Link></Button></TooltipTrigger><TooltipContent>Voir la fiche</TooltipContent></Tooltip></TableCell>
          </TableRow>)}{!visible.length && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">{initialFederations.length ? "Aucune fédération ne correspond à cette recherche." : "Aucune fédération enregistrée."}</TableCell></TableRow>}</TableBody>
        </Table>
      </div>
      <ListPagination total={rows.length} pageSize={pageSize} currentPage={currentPage} pageCount={pageCount} pageSizeLabel="Nombre de fédérations par page" onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} onPageChange={setPage} />
    </>}
  </main></div>
}
