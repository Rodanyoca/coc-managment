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
import { Search, Plus, Calendar, MapPin, Users, Trophy, Eye, Edit } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const competitions = [
  {
    id: "1",
    nom: "Jeux Olympiques Paris 2024",
    lieu: "Paris, France",
    dateDebut: "26 Juillet 2024",
    dateFin: "11 Août 2024",
    statut: "termine" as const,
    type: "Olympique",
    athletes: 12,
    disciplines: 8,
  },
  {
    id: "2",
    nom: "Championnats d'Afrique d'Athlétisme 2026",
    lieu: "Douala, Cameroun",
    dateDebut: "15 Juin 2026",
    dateFin: "20 Juin 2026",
    statut: "a_venir" as const,
    type: "Continental",
    athletes: 24,
    disciplines: 5,
  },
  {
    id: "3",
    nom: "Jeux Africains 2027",
    lieu: "Accra, Ghana",
    dateDebut: "4 Septembre 2027",
    dateFin: "18 Septembre 2027",
    statut: "a_venir" as const,
    type: "Continental",
    athletes: 45,
    disciplines: 12,
  },
  {
    id: "4",
    nom: "Jeux de la Francophonie 2025",
    lieu: "Kinshasa, RDC",
    dateDebut: "28 Juillet 2025",
    dateFin: "6 Août 2025",
    statut: "a_venir" as const,
    type: "Francophonie",
    athletes: 35,
    disciplines: 10,
  },
  {
    id: "5",
    nom: "Championnats du Monde de Judo 2025",
    lieu: "Budapest, Hongrie",
    dateDebut: "8 Juin 2025",
    dateFin: "15 Juin 2025",
    statut: "a_venir" as const,
    type: "Mondial",
    athletes: 3,
    disciplines: 1,
  },
  {
    id: "6",
    nom: "Jeux Olympiques Los Angeles 2028",
    lieu: "Los Angeles, USA",
    dateDebut: "14 Juillet 2028",
    dateFin: "30 Juillet 2028",
    statut: "a_venir" as const,
    type: "Olympique",
    athletes: 0,
    disciplines: 0,
  },
]

const statusConfig = {
  a_venir: { label: "À venir", className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Terminé", className: "bg-muted text-muted-foreground" },
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
        title="Compétitions" 
        subtitle="Gestion des compétitions internationales"
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
                <p className="text-sm text-muted-foreground">Total compétitions</p>
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
                <p className="text-sm text-muted-foreground">À venir</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-3/10 text-chart-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitions.reduce((sum, c) => sum + c.athletes, 0)}</p>
                <p className="text-sm text-muted-foreground">Athlètes engagés</p>
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
                <p className="text-sm text-muted-foreground">Pays différents</p>
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
                placeholder="Rechercher une compétition..."
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
                <SelectItem value="a_venir">À venir</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle compétition
          </Button>
        </div>

        {/* Competition Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompetitions.map((competition) => (
            <Card key={competition.id} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-xs">
                      {competition.type}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className={cn("text-xs", statusConfig[competition.statut].className)}
                    >
                      {statusConfig[competition.statut].label}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{competition.nom}</h3>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{competition.lieu}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{competition.dateDebut} - {competition.dateFin}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{competition.athletes}</span>
                        <span className="text-muted-foreground">athlètes</span>
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
