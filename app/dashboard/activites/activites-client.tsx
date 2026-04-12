"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Calendar, CheckCircle2, Clock, AlertCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export type ActiviteListItem = {
  id: string
  titre: string
  dateDebut: string
  dateFin: string
  annee?: string
  responsable: string
  priorite: "haute" | "moyenne" | "normale"
  lieu: string
  statut: "planifie" | "en_cours" | "termine" | "annule"
}

const statutConfig = {
  planifie: { label: "Planifié", icon: Calendar, className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", icon: Clock, className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Terminé", icon: CheckCircle2, className: "bg-coc-green/10 text-coc-green" },
  annule: { label: "Annulé", icon: AlertCircle, className: "bg-destructive/10 text-destructive" },
}

const prioriteConfig = {
  haute: { label: "Haute", className: "bg-destructive/10 text-destructive" },
  moyenne: { label: "Moyenne", className: "bg-chart-2/10 text-chart-2" },
  normale: { label: "Normale", className: "bg-muted text-muted-foreground" },
}

export default function ActivitesClient(props: { activites: ActiviteListItem[] }) {
  const activites = props.activites ?? []

  const [searchQuery, setSearchQuery] = useState("")
  const [statutFilter, setStatutFilter] = useState("tous")
  const [anneeFilter, setAnneeFilter] = useState("toutes")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  // Reset to page 1 when filters change
  const handleSearch = (v: string) => { setSearchQuery(v); setPage(1) }
  const handleStatut = (v: string) => { setStatutFilter(v); setPage(1) }
  const handleAnnee = (v: string) => { setAnneeFilter(v); setPage(1) }

  const anneesDisponibles = useMemo(() => {
    const set = new Set<string>()
    for (const a of activites) {
      const y = String(a.annee ?? "").trim()
      if (y) set.add(y)
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [activites])

  const filteredActivites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return activites.filter((activite) => {
      const matchesSearch = q.length === 0 || activite.titre.toLowerCase().includes(q)
      const matchesStatut = statutFilter === "tous" || activite.statut === statutFilter
      const matchesAnnee =
        anneeFilter === "toutes" || String(activite.annee ?? "").trim() === anneeFilter
      return matchesSearch && matchesStatut && matchesAnnee
    })
  }, [activites, searchQuery, statutFilter, anneeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredActivites.length / PAGE_SIZE))
  const paginatedActivites = filteredActivites.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = useMemo(() => {
    return {
      total: activites.length,
      planifie: activites.filter((a) => a.statut === "planifie").length,
      en_cours: activites.filter((a) => a.statut === "en_cours").length,
      termine: activites.filter((a) => a.statut === "termine").length,
    }
  }, [activites])

  return (
    <div className="min-h-screen">
      <Header title="Activités" subtitle="Suivi des activités pour le rapport annuel" />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total activités</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-1/10 text-chart-1">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.planifie}</p>
                <p className="text-sm text-muted-foreground">Planifiées</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-2/10 text-chart-2">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.en_cours}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-coc-green/10 text-coc-green">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.termine}</p>
                <p className="text-sm text-muted-foreground">Terminées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une activité..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={anneeFilter} onValueChange={handleAnnee}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes</SelectItem>
                {anneesDisponibles.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={handleStatut}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="planifie">Planifié</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <Table className="table-fixed w-full text-xs">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[30%] text-xs">Activité</TableHead>
                  <TableHead className="w-[17%] text-xs">Période</TableHead>
                  <TableHead className="w-[15%] text-xs">Responsable</TableHead>
                  <TableHead className="w-[12%] text-xs">Priorité</TableHead>
                  <TableHead className="w-[14%] text-xs">Statut</TableHead>
                  <TableHead className="w-[12%] text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActivites.map((activite) => {
                  const StatutIcon = statutConfig[activite.statut].icon
                  return (
                    <TableRow key={activite.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium whitespace-normal break-words">{activite.titre}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="whitespace-normal break-words">
                          {activite.dateDebut === activite.dateFin
                            ? activite.dateDebut
                            : `${activite.dateDebut} - ${activite.dateFin}`}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-normal break-words">{activite.responsable}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", prioriteConfig[activite.priorite].className)}
                        >
                          {prioriteConfig[activite.priorite].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs flex w-fit items-center gap-1",
                            statutConfig[activite.statut].className
                          )}
                        >
                          <StatutIcon className="h-3 w-3" />
                          {statutConfig[activite.statut].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Link href={`/dashboard/activites/${activite.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredActivites.length} résultat{filteredActivites.length > 1 ? "s" : ""} — page {page}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
