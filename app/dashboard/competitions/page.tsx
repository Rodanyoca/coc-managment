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
import { Search, Calendar, MapPin, Users, Trophy, Eye } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const competitions = [
  {
    id: "1",
    nom: "Jeux Olympiques Paris 2024",
    pays: "France",
    ville: "Paris",
    sites: ["Stade de France", "Bercy Arena", "Roland-Garros"],
    dateDebut: "26/07/2024",
    dateFin: "11/08/2024",
    statut: "termine" as const,
    type: "Olympique",
    participants: 12,
  },
  {
    id: "2",
    nom: "Championnats d'Afrique d'Athlétisme 2026",
    pays: "Cameroun",
    ville: "Douala",
    sites: ["Stade de la Reunification"],
    dateDebut: "15/06/2026",
    dateFin: "20/06/2026",
    statut: "a_venir" as const,
    type: "Continental",
    participants: 24,
  },
  {
    id: "3",
    nom: "Jeux Africains 2027",
    pays: "Ghana",
    ville: "Accra",
    sites: ["Accra Sports Stadium", "University of Ghana Stadium"],
    dateDebut: "04/09/2027",
    dateFin: "18/09/2027",
    statut: "a_venir" as const,
    type: "Continental",
    participants: 45,
  },
  {
    id: "4",
    nom: "Jeux de la Francophonie 2025",
    pays: "RDC",
    ville: "Kinshasa",
    sites: ["Stade des Martyrs", "Palais du Peuple"],
    dateDebut: "28/07/2025",
    dateFin: "06/08/2025",
    statut: "en_cours" as const,
    type: "Francophonie",
    participants: 35,
  },
  {
    id: "5",
    nom: "Championnats du Monde de Judo 2025",
    pays: "Hongrie",
    ville: "Budapest",
    sites: ["Laszlo Papp Arena"],
    dateDebut: "08/06/2025",
    dateFin: "15/06/2025",
    statut: "a_venir" as const,
    type: "Mondial",
    participants: 3,
  },
  {
    id: "6",
    nom: "Jeux Olympiques Los Angeles 2028",
    pays: "USA",
    ville: "Los Angeles",
    sites: ["SoFi Stadium", "LA Memorial Coliseum", "Staples Center"],
    dateDebut: "14/07/2028",
    dateFin: "30/07/2028",
    statut: "a_venir" as const,
    type: "Olympique",
    participants: 0,
  },
]

const statusConfig = {
  a_venir: { label: "A venir", className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Termine", className: "bg-muted text-muted-foreground" },
}

const types = ["Tous", "Olympique", "Continental", "Mondial", "Francophonie"]

export default function CompetitionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("Tous")
  const [statutFilter, setStatutFilter] = useState("tous")

  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch = comp.nom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "Tous" || comp.type === typeFilter
    const matchesStatut = statutFilter === "tous" || comp.statut === statutFilter
    return matchesSearch && matchesType && matchesStatut
  })

  return (
    <div className="min-h-screen">
      <Header 
        title="Competitions" 
        subtitle="Gestion des competitions internationales"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-1/10 text-chart-1">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitions.length}</p>
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
                <p className="text-2xl font-bold">{competitions.filter(c => c.statut === "a_venir").length}</p>
                <p className="text-sm text-muted-foreground">A venir</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-3/10 text-chart-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitions.reduce((sum, c) => sum + c.participants, 0)}</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-4/10 text-chart-4">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Pays</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
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
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="a_venir">A venir</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Termine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Competitions Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nom</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Sites</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitions.map((competition) => (
                  <TableRow key={competition.id}>
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
                        className={cn("text-xs", statusConfig[competition.statut].className)}
                      >
                        {statusConfig[competition.statut].label}
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

        {/* Pagination Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Affichage de {filteredCompetitions.length} sur {competitions.length} competitions</span>
        </div>
      </div>
    </div>
  )
}
