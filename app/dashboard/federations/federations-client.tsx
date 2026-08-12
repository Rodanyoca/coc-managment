"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Building2, CheckCircle2, Network, Search, Settings, ShieldAlert, TriangleAlert, UsersRound } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { buildTerritorialAnomalies, type TerritorialAnomaly } from "@/lib/federations/anomalies"
import type { Club, Entente, FederationData, Ligue, RelationHierarchique } from "@/lib/federations/types"

const normalize = (value: string) => value.trim().toLocaleLowerCase("fr")
const matches = (values: string[], query: string) => !query || values.some((value) => normalize(value).includes(normalize(query)))

function buildHierarchyChain(relations: RelationHierarchique[]): string[] {
  return [...relations].sort((a, b) => Number(a.niveau || 999) - Number(b.niveau || 999)).map((item) => item.nom_structure).filter(Boolean)
}

function StatusBadge({ value }: { value: string }) {
  const active = normalize(value) === "actif"
  return <Badge variant="outline" className={active ? "border-green-300 bg-green-50 text-green-700" : "border-orange-300 bg-orange-50 text-orange-700"}>{value || "—"}</Badge>
}

function EmptyRow({ columns }: { columns: number }) {
  return <TableRow><TableCell colSpan={columns} className="h-28 text-center text-muted-foreground">Aucun enregistrement pour cette fédération.</TableCell></TableRow>
}

export default function FederationsClient({ initialData, loadError, canConfigure = false }: { initialData: FederationData; loadError?: string; canConfigure?: boolean }) {
  const router = useRouter()
  const [federationId, setFederationId] = useState(initialData.federations[0]?.id_federation ?? "")
  const [searchLigues, setSearchLigues] = useState("")
  const [searchEntentes, setSearchEntentes] = useState("")
  const [searchClubs, setSearchClubs] = useState("")
  const [provinceFilter, setProvinceFilter] = useState("toutes")
  const [ligueStatus, setLigueStatus] = useState("tous")
  const [ententeStatus, setEntenteStatus] = useState("tous")
  const [clubStatus, setClubStatus] = useState("tous")
  const [ententeLeague, setEntenteLeague] = useState("toutes")
  const [ententeCity, setEntenteCity] = useState("toutes")
  const [clubCategory, setClubCategory] = useState("toutes")
  const [clubLeague, setClubLeague] = useState("toutes")
  const [clubEntente, setClubEntente] = useState("toutes")
  const [clubCity, setClubCity] = useState("toutes")

  function changeFederation(value: string) {
    setFederationId(value)
    setSearchLigues("")
    setSearchEntentes("")
    setSearchClubs("")
    setProvinceFilter("toutes")
    setLigueStatus("tous")
    setEntenteStatus("tous")
    setClubStatus("tous")
    setEntenteLeague("toutes")
    setEntenteCity("toutes")
    setClubCategory("toutes")
    setClubLeague("toutes")
    setClubEntente("toutes")
    setClubCity("toutes")
  }

  useEffect(() => {
    const refreshWhenVisible = () => document.visibilityState === "visible" && router.refresh()
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => document.removeEventListener("visibilitychange", refreshWhenVisible)
  }, [router])

  useEffect(() => {
    if (!initialData.federations.some((item) => item.id_federation === federationId)) {
      setFederationId(initialData.federations[0]?.id_federation ?? "")
    }
  }, [federationId, initialData.federations])

  const federation = initialData.federations.find((item) => item.id_federation === federationId)
  const filtered = useMemo(() => ({
    ligues: initialData.ligues.filter((item) => item.id_federation === federationId),
    ententes: initialData.ententes.filter((item) => item.id_federation === federationId),
    clubs: initialData.clubs.filter((item) => item.id_federation === federationId),
    hierarchie: initialData.hierarchie.filter((item) => item.id_federation === federationId),
  }), [federationId, initialData])

  const hierarchyChain = useMemo(() => buildHierarchyChain(filtered.hierarchie), [filtered.hierarchie])
  const orderedHierarchy = useMemo(() => [...filtered.hierarchie].sort((a, b) => Number(a.niveau || 999) - Number(b.niveau || 999)), [filtered.hierarchie])
  const clubIndex = orderedHierarchy.findIndex((item) => normalize(item.nom_structure).includes("club"))
  const usesEntentes = clubIndex > 0 && normalize(orderedHierarchy[clubIndex - 1]?.nom_structure ?? "").includes("entente")
  const provinceCount = new Set(filtered.ligues.map((item) => item.id_province).filter(Boolean)).size
  const cityCount = new Set([...filtered.ententes.map((item) => item.id_ville), ...filtered.clubs.map((item) => item.id_ville)].filter(Boolean)).size
  const anomalies = useMemo(() => buildTerritorialAnomalies(initialData, federationId), [initialData, federationId])

  const criticalCount = anomalies.filter((item) => item.severity === "rouge").length
  const correctlyAttached = filtered.ententes.filter((item) => item.id_ligue_coc && filtered.ligues.some((league) => league.id_ligue_coc === item.id_ligue_coc)).length
    + filtered.clubs.filter((item) => usesEntentes
      ? item.id_entente_coc && filtered.ententes.some((entente) => entente.id_entente_coc === item.id_entente_coc)
      : item.id_ligue_coc && filtered.ligues.some((league) => league.id_ligue_coc === item.id_ligue_coc)).length

  const visibleLigues = filtered.ligues.filter((item) => matches([item.id_ligue_coc, item.id_ligue_federation, item.nom_ligue, item.pseudo_ligue, item.email_ligue], searchLigues) && (provinceFilter === "toutes" || item.id_province === provinceFilter) && (ligueStatus === "tous" || normalize(item.statut) === ligueStatus))
  const visibleEntentes = filtered.ententes.filter((item) => matches([item.id_entente_coc, item.id_entente_federation, item.nom_entente, item.pseudo_entente, item.nom_ligue, item.nom_ville], searchEntentes) && (ententeStatus === "tous" || normalize(item.statut) === ententeStatus) && (ententeLeague === "toutes" || item.id_ligue_coc === ententeLeague) && (ententeCity === "toutes" || item.id_ville === ententeCity))
  const visibleClubs = filtered.clubs.filter((item) => matches([item.id_club_coc, item.id_club_federation, item.nom_club, item.nom_ligue, item.pseudo_ligue, item.nom_entente, item.pseudo_entente, item.nom_ville], searchClubs) && (clubStatus === "tous" || normalize(item.statut) === clubStatus) && (clubCategory === "toutes" || item.id_categorie === clubCategory) && (clubLeague === "toutes" || item.id_ligue_coc === clubLeague) && (clubEntente === "toutes" || item.id_entente_coc === clubEntente) && (clubCity === "toutes" || item.id_ville === clubCity))

  if (loadError) return <div><Header title="Fédérations" subtitle="Structure territoriale" /><div className="p-6"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Impossible de charger les données</AlertTitle><AlertDescription>{loadError}</AlertDescription></Alert></div></div>

  return <div className="min-h-screen">
    <Header title="Fédérations" subtitle="Structure territoriale des fédérations sportives nationales" />
    <main className="space-y-6 p-4 md:p-6">
      <Card><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3"><Building2 className="h-6 w-6 text-primary" /></div><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{federation?.nom_federation || "Sélectionnez une fédération"}</p>{federation?.sigle_federation && <Badge variant="secondary">{federation.sigle_federation}</Badge>}{federation?.statut && <StatusBadge value={federation.statut} />}</div><p className="text-sm text-muted-foreground">{federation?.nom_sport || "Sport non renseigné"}{federation?.date_affiliation_coc ? ` · Affiliée le ${federation.date_affiliation_coc}` : ""}</p></div></div>
        <div className="flex w-full items-center gap-2 sm:w-auto"><Select value={federationId} onValueChange={changeFederation}><SelectTrigger className="min-w-0 flex-1 sm:w-56"><SelectValue placeholder="Choisir un sigle" /></SelectTrigger><SelectContent>{initialData.federations.map((item) => <SelectItem key={item.id_federation} value={item.id_federation}>{item.sigle_federation || item.nom_federation}</SelectItem>)}</SelectContent></Select>{canConfigure && federationId && <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon" className="shrink-0" aria-label="Paramétrer la fédération"><Link href={`/dashboard/federations/${encodeURIComponent(federationId)}/parametres`}><Settings className="h-4 w-4" /></Link></Button></TooltipTrigger><TooltipContent>Paramétrer la fédération</TooltipContent></Tooltip>}</div>
      </CardContent></Card>

      {!federation ? <Alert><ShieldAlert className="h-4 w-4" /><AlertTitle>Aucune fédération disponible</AlertTitle><AlertDescription>Vérifiez les colonnes du référentiel FEDERATIONS.</AlertDescription></Alert> : <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[["Ligues", filtered.ligues.length, Building2], ["Ententes", filtered.ententes.length, Network], ["Clubs", filtered.clubs.length, UsersRound], ["Provinces", provinceCount, Building2], ["Villes", cityCount, Building2], ["Anomalies", anomalies.length, anomalies.length ? TriangleAlert : CheckCircle2]].map(([label, count, Icon]) => { const KpiIcon = Icon as typeof Building2; return <Card key={String(label)}><CardContent className="flex items-center gap-3 p-4"><KpiIcon className={`h-5 w-5 ${label === "Anomalies" && Number(count) ? "text-orange-600" : "text-primary"}`} /><div><p className="text-2xl font-bold">{String(count)}</p><p className="text-xs text-muted-foreground">{String(label)}</p></div></CardContent></Card> })}
        </div>

        <Tabs defaultValue="apercu">
          <div className="overflow-x-auto"><TabsList className="w-max"><TabsTrigger value="apercu">Aperçu</TabsTrigger><TabsTrigger value="hierarchie">Hiérarchie</TabsTrigger><TabsTrigger value="structures">Structures</TabsTrigger><TabsTrigger value="anomalies">Anomalies{anomalies.length ? ` (${anomalies.length})` : ""}</TabsTrigger></TabsList></div>

          <TabsContent value="apercu" className="space-y-4">
            <Card><CardHeader><CardTitle>Chaîne hiérarchique</CardTitle></CardHeader><CardContent>{hierarchyChain.length ? <div className="flex flex-wrap items-center gap-2">{hierarchyChain.map((name, index) => <div key={`${name}-${index}`} className="flex items-center gap-2">{index > 0 && <span className="text-muted-foreground">→</span>}<Badge variant={index === hierarchyChain.length - 1 ? "default" : "secondary"}>{name}</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">Aucune hiérarchie configurée.</p>}</CardContent></Card>
            <Card><CardHeader><CardTitle>Qualité de la structure</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <QualityItem label="Structures correctement rattachées" count={correctlyAttached} severity="ok" />
              <QualityItem label="Ententes sans ligue" count={anomalies.filter((item) => item.entityType === "Entente" && item.type === "Parent manquant").length} severity="warning" />
              <QualityItem label="Clubs sans parent attendu" count={anomalies.filter((item) => item.entityType === "Club" && item.type === "Parent manquant").length} severity="warning" />
              <QualityItem label="Anomalies critiques" count={criticalCount} severity="critical" />
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Couverture territoriale</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div><p className="mb-2 text-sm font-medium">Provinces avec au moins une ligue</p><div className="flex flex-wrap gap-2">{[...new Set(filtered.ligues.map((item) => item.nom_province).filter(Boolean))].map((name) => <Badge key={name} variant="secondary">{name}</Badge>)}{!provinceCount && <span className="text-sm text-muted-foreground">Aucune province représentée.</span>}</div></div><div><p className="mb-2 text-sm font-medium">Villes avec une entente ou un club</p><div className="flex flex-wrap gap-2">{[...new Set([...filtered.ententes.map((item) => item.nom_ville), ...filtered.clubs.map((item) => item.nom_ville)].filter(Boolean))].map((name) => <Badge key={name} variant="secondary">{name}</Badge>)}{!cityCount && <span className="text-sm text-muted-foreground">Aucune ville représentée.</span>}</div></div></CardContent></Card>
          </TabsContent>

          <TabsContent value="hierarchie" className="space-y-4">
            <Card><CardHeader><CardTitle>Configuration territoriale</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Niveau</TableHead><TableHead>Structure</TableHead><TableHead>Observations</TableHead></TableRow></TableHeader><TableBody>
              {[...filtered.hierarchie].sort((a, b) => Number(a.niveau) - Number(b.niveau)).map((item, index) => <TableRow key={`${item.id_hierarchie}-${index}`}><TableCell>{item.niveau || index + 1}</TableCell><TableCell>{item.nom_structure || "Type inconnu"}</TableCell><TableCell>{item.observations || "—"}</TableCell></TableRow>)}{!filtered.hierarchie.length && <EmptyRow columns={3} />}
            </TableBody></Table></div></CardContent></Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-6">
            <LiguesTable rows={visibleLigues} search={searchLigues} onSearch={setSearchLigues} provinces={initialData.provinces} provinceFilter={provinceFilter} onProvinceFilter={setProvinceFilter} status={ligueStatus} onStatus={setLigueStatus} />
            <EntentesTable rows={visibleEntentes} allRows={filtered.ententes} ligues={filtered.ligues} search={searchEntentes} onSearch={setSearchEntentes} status={ententeStatus} onStatus={setEntenteStatus} league={ententeLeague} onLeague={setEntenteLeague} city={ententeCity} onCity={setEntenteCity} />
            <ClubsTable rows={visibleClubs} allRows={filtered.clubs} ligues={filtered.ligues} ententes={filtered.ententes} search={searchClubs} onSearch={setSearchClubs} status={clubStatus} onStatus={setClubStatus} showEntente={usesEntentes} category={clubCategory} onCategory={setClubCategory} league={clubLeague} onLeague={setClubLeague} entente={clubEntente} onEntente={setClubEntente} city={clubCity} onCity={setClubCity} />
          </TabsContent>

          <TabsContent value="anomalies"><AnomaliesTable rows={anomalies} /></TabsContent>
        </Tabs>
      </>}
    </main>
  </div>
}

function QualityItem({ label, count, severity }: { label: string; count: number; severity: "ok" | "warning" | "critical" }) {
  const positive = severity === "ok" || count === 0
  const Icon = positive ? CheckCircle2 : severity === "critical" ? AlertCircle : TriangleAlert
  const color = positive ? "text-green-600" : severity === "critical" ? "text-red-600" : "text-orange-600"
  return <div className="flex items-start gap-2 rounded-lg border p-3"><Icon className={`mt-0.5 h-4 w-4 ${color}`} /><div><p className="font-medium">{count}</p><p className="text-muted-foreground">{label}</p></div></div>
}

function TableTools({ search, onSearch, status, onStatus, children }: { search: string; onSearch: (value: string) => void; status: string; onStatus: (value: string) => void; children?: React.ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"><div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Rechercher par ID ou nom…" className="pl-9" /></div>{children}<Select value={status} onValueChange={onStatus}><SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tous">Tous les statuts</SelectItem><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem></SelectContent></Select></div>
}

function FilterSelect({ value, onChange, allLabel, options }: { value: string; onChange: (value: string) => void; allLabel: string; options: { value: string; label: string }[] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="toutes">{allLabel}</SelectItem>{options.filter((item, index, all) => item.value && all.findIndex((other) => other.value === item.value) === index).map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select>
}

function LiguesTable({ rows, search, onSearch, provinces, provinceFilter, onProvinceFilter, status, onStatus }: { rows: Ligue[]; search: string; onSearch: (value: string) => void; provinces: FederationData["provinces"]; provinceFilter: string; onProvinceFilter: (value: string) => void; status: string; onStatus: (value: string) => void }) {
  return <Card><CardHeader><CardTitle>Ligues</CardTitle><TableTools search={search} onSearch={onSearch} status={status} onStatus={onStatus}><FilterSelect value={provinceFilter} onChange={onProvinceFilter} allLabel="Toutes les provinces" options={provinces.map((item) => ({ value: item.id_province, label: item.nom_province }))} /></TableTools></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ID COC</TableHead><TableHead className="hidden md:table-cell">ID fédéral</TableHead><TableHead>Ligue</TableHead><TableHead>Province</TableHead><TableHead className="hidden lg:table-cell">E-mail</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${row.id_ligue_coc}-${index}`}><TableCell>{row.id_ligue_coc || "—"}</TableCell><TableCell className="hidden md:table-cell">{row.id_ligue_federation || "—"}</TableCell><TableCell><p>{row.pseudo_ligue || row.nom_ligue || "—"}</p>{row.pseudo_ligue && row.nom_ligue && <p className="text-xs text-muted-foreground">{row.nom_ligue}</p>}</TableCell><TableCell>{row.nom_province || "—"}</TableCell><TableCell className="hidden lg:table-cell">{row.email_ligue || "—"}</TableCell><TableCell><StatusBadge value={row.statut} /></TableCell></TableRow>)}{!rows.length && <EmptyRow columns={6} />}</TableBody></Table></div></CardContent></Card>
}

function EntentesTable({ rows, allRows, ligues, search, onSearch, status, onStatus, league, onLeague, city, onCity }: { rows: Entente[]; allRows: Entente[]; ligues: Ligue[]; search: string; onSearch: (value: string) => void; status: string; onStatus: (value: string) => void; league: string; onLeague: (value: string) => void; city: string; onCity: (value: string) => void }) {
  const leagueName = (row: Entente) => ligues.find((item) => item.id_ligue_coc === row.id_ligue_coc)?.pseudo_ligue || row.nom_ligue || "—"
  return <Card><CardHeader><CardTitle>Ententes</CardTitle><TableTools search={search} onSearch={onSearch} status={status} onStatus={onStatus}><FilterSelect value={league} onChange={onLeague} allLabel="Toutes les ligues" options={ligues.map((item) => ({ value: item.id_ligue_coc, label: item.pseudo_ligue || item.nom_ligue }))} /><FilterSelect value={city} onChange={onCity} allLabel="Toutes les villes" options={allRows.map((item) => ({ value: item.id_ville, label: item.nom_ville }))} /></TableTools></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ID COC</TableHead><TableHead className="hidden md:table-cell">ID fédéral</TableHead><TableHead>Entente</TableHead><TableHead>Ligue</TableHead><TableHead>Ville</TableHead><TableHead className="hidden lg:table-cell">E-mail</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${row.id_entente_coc}-${index}`}><TableCell>{row.id_entente_coc || "—"}</TableCell><TableCell className="hidden md:table-cell">{row.id_entente_federation || "—"}</TableCell><TableCell><p>{row.pseudo_entente || row.nom_entente || "—"}</p>{row.pseudo_entente && row.nom_entente && <p className="text-xs text-muted-foreground">{row.nom_entente}</p>}</TableCell><TableCell>{leagueName(row)}</TableCell><TableCell>{row.nom_ville || "—"}</TableCell><TableCell className="hidden lg:table-cell">{row.email_entente || "—"}</TableCell><TableCell><StatusBadge value={row.statut} /></TableCell></TableRow>)}{!rows.length && <EmptyRow columns={7} />}</TableBody></Table></div></CardContent></Card>
}

function ClubsTable({ rows, allRows, ligues, ententes, search, onSearch, status, onStatus, showEntente, category, onCategory, league, onLeague, entente, onEntente, city, onCity }: { rows: Club[]; allRows: Club[]; ligues: Ligue[]; ententes: Entente[]; search: string; onSearch: (value: string) => void; status: string; onStatus: (value: string) => void; showEntente: boolean; category: string; onCategory: (value: string) => void; league: string; onLeague: (value: string) => void; entente: string; onEntente: (value: string) => void; city: string; onCity: (value: string) => void }) {
  const columns = showEntente ? 8 : 7
  const leagueLabel = (row: Club) => ligues.find((item) => item.id_ligue_coc === row.id_ligue_coc)?.pseudo_ligue || row.pseudo_ligue || row.nom_ligue || "—"
  const ententeLabel = (row: Club) => ententes.find((item) => item.id_entente_coc === row.id_entente_coc)?.pseudo_entente || row.pseudo_entente || row.nom_entente || "—"
  return <Card><CardHeader><CardTitle>Clubs</CardTitle><TableTools search={search} onSearch={onSearch} status={status} onStatus={onStatus}><FilterSelect value={category} onChange={onCategory} allLabel="Toutes les catégories" options={allRows.map((item) => ({ value: item.id_categorie, label: item.nom_categorie }))} /><FilterSelect value={league} onChange={onLeague} allLabel="Toutes les ligues" options={ligues.map((item) => ({ value: item.id_ligue_coc, label: item.pseudo_ligue || item.nom_ligue }))} />{showEntente && <FilterSelect value={entente} onChange={onEntente} allLabel="Toutes les ententes" options={ententes.map((item) => ({ value: item.id_entente_coc, label: item.pseudo_entente || item.nom_entente }))} />}<FilterSelect value={city} onChange={onCity} allLabel="Toutes les villes" options={allRows.map((item) => ({ value: item.id_ville, label: item.nom_ville }))} /></TableTools></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ID COC</TableHead><TableHead className="hidden md:table-cell">ID fédéral</TableHead><TableHead>Club</TableHead><TableHead className="hidden lg:table-cell">Catégorie</TableHead><TableHead>Ligue</TableHead>{showEntente && <TableHead>Entente</TableHead>}<TableHead>Ville</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${row.id_club_coc}-${index}`}><TableCell>{row.id_club_coc || "—"}</TableCell><TableCell className="hidden md:table-cell">{row.id_club_federation || "—"}</TableCell><TableCell>{row.nom_club || "—"}</TableCell><TableCell className="hidden lg:table-cell">{row.nom_categorie || "—"}</TableCell><TableCell>{leagueLabel(row)}</TableCell>{showEntente && <TableCell>{ententeLabel(row)}</TableCell>}<TableCell>{row.nom_ville || "—"}</TableCell><TableCell><StatusBadge value={row.statut} /></TableCell></TableRow>)}{!rows.length && <EmptyRow columns={columns} />}</TableBody></Table></div></CardContent></Card>
}

function AnomaliesTable({ rows }: { rows: TerritorialAnomaly[] }) {
  return <Card><CardHeader><CardTitle>Anomalies territoriales</CardTitle><p className="text-sm text-muted-foreground">{rows.length} anomalie(s) détectée(s)</p></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Gravité</TableHead><TableHead>Type d’anomalie</TableHead><TableHead>Entité</TableHead><TableHead>ID</TableHead><TableHead>Nom</TableHead><TableHead>Problème détecté</TableHead><TableHead>Relation attendue</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${row.entityType}-${row.id}-${row.type}-${index}`}><TableCell><Badge variant="outline" className={row.severity === "rouge" ? "border-red-300 bg-red-50 text-red-700" : "border-orange-300 bg-orange-50 text-orange-700"}>{row.severity === "rouge" ? "Critique" : "Attention"}</Badge></TableCell><TableCell>{row.type}</TableCell><TableCell>{row.entityType}</TableCell><TableCell>{row.id}</TableCell><TableCell>{row.name || "—"}</TableCell><TableCell>{row.problem}</TableCell><TableCell>{row.expected}</TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={7} className="h-32 text-center"><div className="flex flex-col items-center gap-2 text-green-700"><CheckCircle2 className="h-6 w-6" /><span>Aucune anomalie détectée.</span></div></TableCell></TableRow>}</TableBody></Table></div></CardContent></Card>
}
