"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Plane, 
  Hotel, 
  Check,
  Clock,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Donnees de la competition
const competition = {
  id: "4",
  nom: "Jeux de la Francophonie 2025",
  pays: "RDC",
  ville: "Kinshasa",
  lieu: "Stade des Martyrs",
  dateDebut: "28/07/2025",
  dateFin: "06/08/2025",
  statut: "en_cours" as const,
  type: "Francophonie",
  description: "Les Jeux de la Francophonie sont une competition multisport et culturelle organisee tous les quatre ans.",
  disciplines: ["Athletisme", "Basketball", "Judo", "Football", "Tennis de table"],
  contact: "comite@jeux2025.cd",
  budget: "150 000 USD",
}

// Participants
const participants = [
  {
    id: "1",
    nom: "Jean-Pierre Mukendi",
    role: "Athlete",
    discipline: "Athletisme",
    dateDepart: "25/07/2025",
    dateArrivee: "26/07/2025",
    statutTransport: "valide" as const,
    vol: "ET 845",
    hotel: "Hotel Memling",
    chambre: "305",
    statutHebergement: "confirme" as const,
  },
  {
    id: "2",
    nom: "Marie Kabongo",
    role: "Athlete",
    discipline: "Judo",
    dateDepart: "26/07/2025",
    dateArrivee: "27/07/2025",
    statutTransport: "valide" as const,
    vol: "KQ 502",
    hotel: "Hotel Memling",
    chambre: "306",
    statutHebergement: "confirme" as const,
  },
  {
    id: "3",
    nom: "Patrick Lumumba",
    role: "Entraineur",
    discipline: "Athletisme",
    dateDepart: "25/07/2025",
    dateArrivee: "26/07/2025",
    statutTransport: "valide" as const,
    vol: "ET 845",
    hotel: "Hotel Memling",
    chambre: "310",
    statutHebergement: "confirme" as const,
  },
  {
    id: "4",
    nom: "Sophie Mbuyi",
    role: "Athlete",
    discipline: "Basketball",
    dateDepart: "27/07/2025",
    dateArrivee: "27/07/2025",
    statutTransport: "reporte" as const,
    vol: "En attente",
    hotel: "Grand Hotel",
    chambre: "A attribuer",
    statutHebergement: "en_attente" as const,
  },
  {
    id: "5",
    nom: "Dr. Albert Kasongo",
    role: "Medecin",
    discipline: "Staff medical",
    dateDepart: "25/07/2025",
    dateArrivee: "26/07/2025",
    statutTransport: "valide" as const,
    vol: "ET 845",
    hotel: "Hotel Memling",
    chambre: "315",
    statutHebergement: "confirme" as const,
  },
  {
    id: "6",
    nom: "Emmanuel Tshisekedi",
    role: "Officiel",
    discipline: "Direction",
    dateDepart: "26/07/2025",
    dateArrivee: "26/07/2025",
    statutTransport: "valide" as const,
    vol: "Air France 892",
    hotel: "Pullman Kinshasa",
    chambre: "Suite 12",
    statutHebergement: "confirme" as const,
  },
]

const transportStatusConfig = {
  valide: { label: "Valide", icon: Check, className: "bg-green-100 text-green-700" },
  reporte: { label: "Reporte", icon: Clock, className: "bg-amber-100 text-amber-700" },
  annule: { label: "Annule", icon: AlertCircle, className: "bg-red-100 text-red-700" },
  en_attente: { label: "En attente", icon: Clock, className: "bg-gray-100 text-gray-700" },
}

const hebergementStatusConfig = {
  confirme: { label: "Confirme", className: "bg-green-100 text-green-700" },
  en_attente: { label: "En attente", className: "bg-amber-100 text-amber-700" },
  annule: { label: "Annule", className: "bg-red-100 text-red-700" },
}

const competitionStatusConfig = {
  a_venir: { label: "A venir", className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Termine", className: "bg-muted text-muted-foreground" },
}

export default function CompetitionDetailPage() {
  const [roleFilter, setRoleFilter] = useState("tous")
  const [transportFilter, setTransportFilter] = useState("tous")

  const filteredParticipants = participants.filter((p) => {
    const matchesRole = roleFilter === "tous" || p.role.toLowerCase() === roleFilter.toLowerCase()
    const matchesTransport = transportFilter === "tous" || p.statutTransport === transportFilter
    return matchesRole && matchesTransport
  })

  const stats = {
    total: participants.length,
    athletes: participants.filter(p => p.role === "Athlete").length,
    transportValide: participants.filter(p => p.statutTransport === "valide").length,
    hebergementConfirme: participants.filter(p => p.statutHebergement === "confirme").length,
  }

  return (
    <div className="min-h-screen">
      <Header 
        title={competition.nom}
        subtitle="Details de la competition"
      />
      
      <div className="p-6 space-y-6">
        {/* Back button */}
        <Link href="/dashboard/competitions">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour a la liste
          </Button>
        </Link>

        {/* General Info Card */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{competition.nom}</CardTitle>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {competition.ville}, {competition.pays}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {competition.dateDebut} - {competition.dateFin}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary"
                className={cn("text-sm", competitionStatusConfig[competition.statut].className)}
              >
                {competitionStatusConfig[competition.statut].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{competition.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium">{competition.lieu}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{competition.contact}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Disciplines</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {competition.disciplines.map((d) => (
                  <Badge key={d} variant="outline">{d}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-1/10 text-chart-1">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-2/10 text-chart-2">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.athletes}</p>
                <p className="text-sm text-muted-foreground">Athletes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-3/10 text-chart-3">
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.transportValide}</p>
                <p className="text-sm text-muted-foreground">Transports valides</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-4/10 text-chart-4">
                <Hotel className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.hebergementConfirme}</p>
                <p className="text-sm text-muted-foreground">Hebergements confirmes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="participants" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
            <TabsTrigger value="participants" className="w-full justify-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="transport" className="w-full justify-center gap-2">
              <Plane className="h-4 w-4" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="hebergement" className="w-full justify-center gap-2">
              <Hotel className="h-4 w-4" />
              Hebergement
            </TabsTrigger>
          </TabsList>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des participants</CardTitle>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous les roles</SelectItem>
                      <SelectItem value="athlete">Athletes</SelectItem>
                      <SelectItem value="entraineur">Entraineurs</SelectItem>
                      <SelectItem value="officiel">Officiels</SelectItem>
                      <SelectItem value="medecin">Medecins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nom</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Discipline</TableHead>
                      <TableHead>Transport</TableHead>
                      <TableHead>Hebergement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.nom}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{participant.role}</Badge>
                        </TableCell>
                        <TableCell>{participant.discipline}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", transportStatusConfig[participant.statutTransport].className)}>
                            {transportStatusConfig[participant.statutTransport].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", hebergementStatusConfig[participant.statutHebergement].className)}>
                            {hebergementStatusConfig[participant.statutHebergement].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Details du transport</CardTitle>
                <div className="flex gap-2">
                  <Select value={transportFilter} onValueChange={setTransportFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous</SelectItem>
                      <SelectItem value="valide">Valide</SelectItem>
                      <SelectItem value="reporte">Reporte</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nom</TableHead>
                      <TableHead>Date depart</TableHead>
                      <TableHead>Date arrivee</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => {
                      const StatusIcon = transportStatusConfig[participant.statutTransport].icon
                      return (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{participant.nom}</p>
                            </div>
                          </TableCell>
                          <TableCell>{participant.dateDepart}</TableCell>
                          <TableCell>{participant.dateArrivee}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs gap-1", transportStatusConfig[participant.statutTransport].className)}>
                              <StatusIcon className="h-3 w-3" />
                              {transportStatusConfig[participant.statutTransport].label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hebergement Tab */}
          <TabsContent value="hebergement">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Details de l&apos;hebergement</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nom</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Chambre</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.nom}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{participant.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Hotel className="h-4 w-4 text-muted-foreground" />
                            {participant.hotel}
                          </div>
                        </TableCell>
                        <TableCell>{participant.chambre}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", hebergementStatusConfig[participant.statutHebergement].className)}>
                            {hebergementStatusConfig[participant.statutHebergement].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
