"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Calendar, MapPin, Users, Trophy, Eye, Activity } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export type CompetitionListItem = {
  id: string
  nom: string
  pays: string
  ville: string
  sites: string[]
  dateDebut: string
  dateFin: string
  statut: "a_venir" | "en_cours" | "termine" | string
  type: string
  participants: number
}

const statusConfig: Record<string, { label: string; className: string }> = {
  a_venir: { label: "À venir", className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Terminée", className: "bg-muted text-muted-foreground" },
}

export default function CompetitionsClient({ competitions }: { competitions: CompetitionListItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("Tous")
  const [statutFilter, setStatutFilter] = useState("tous")

  const types = useMemo(() => {
    const uniq = Array.from(new Set(competitions.map((c) => c.type).filter(Boolean))).sort()
    return ["Tous", ...uniq]
  }, [competitions])

  const filteredCompetitions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return competitions.filter((comp) => {
      const matchesSearch = q.length === 0 || comp.nom.toLowerCase().includes(q)
      const matchesType = typeFilter === "Tous" || comp.type === typeFilter
      const matchesStatut = statutFilter === "tous" || comp.statut === statutFilter
      return matchesSearch && matchesType && matchesStatut
    })
  }, [competitions, searchQuery, statutFilter, typeFilter])

  const competitionStats = useMemo(
    () => ({
      total: competitions.length,
      aVenir: competitions.filter((c) => c.statut === "a_venir").length,
      enCours: competitions.filter((c) => c.statut === "en_cours").length,
      terminees: competitions.filter((c) => c.statut === "termine").length,
    }),
    [competitions]
  )

  return (
    <div className="min-h-screen">
      <Header title="Competitions" subtitle="Gestion des competitions internationales" />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-1/10 text-chart-1">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitionStats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-2/10 text-chart-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitionStats.aVenir}</p>
                <p className="text-sm text-muted-foreground">À venir</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-4/10 text-chart-4">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitionStats.enCours}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-muted text-muted-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitionStats.terminees}</p>
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
                placeholder="Rechercher une competition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="a_venir">À venir</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Terminées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nom</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitions.map((competition, index) => (
                  <TableRow key={`${competition.id}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{competition.nom}</div>
                      <div className="text-sm text-muted-foreground">{competition.ville}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {competition.dateDebut} - {competition.dateFin}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground whitespace-normal break-words max-w-[220px]">
                          {competition.sites.join(", ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {competition.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{competition.participants}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          statusConfig[competition.statut]?.className ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {statusConfig[competition.statut]?.label ?? competition.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Link href={`/dashboard/competitions/${competition.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Affichage de {filteredCompetitions.length} sur {competitions.length} competitions
          </span>
        </div>
      </div>
    </div>
  )
}
