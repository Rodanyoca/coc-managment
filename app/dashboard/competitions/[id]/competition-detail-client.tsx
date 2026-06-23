"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Copy,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"

export type CompetitionDetail = {
  id: string
  nom: string
  pays: string
  ville: string
  lieu: string
  dateDebut: string
  dateFin: string
  statut: "a_venir" | "en_cours" | "termine" | string
  type: string
  description: string
  disciplines: string[]
  contact: string
  budget: string
}

export type CompetitionParticipant = {
  id: string
  nom: string
  role: string
  discipline: string
  dateDepart: string
  dateArrivee: string
  statutTransport: string
  vol: string
  hotel: string
  chambre: string
  statutHebergement: string
}

const transportStatusConfig: Record<
  string,
  { label: string; icon: typeof Check; className: string }
> = {
  valide: { label: "Valide", icon: Check, className: "bg-green-100 text-green-700" },
  reporte: { label: "Reporte", icon: Clock, className: "bg-amber-100 text-amber-700" },
  annule: { label: "Annule", icon: AlertCircle, className: "bg-red-100 text-red-700" },
  en_attente: { label: "En attente", icon: Clock, className: "bg-gray-100 text-gray-700" },
}

const hebergementStatusConfig: Record<string, { label: string; className: string }> = {
  confirme: { label: "Confirme", className: "bg-green-100 text-green-700" },
  en_attente: { label: "En attente", className: "bg-amber-100 text-amber-700" },
  annule: { label: "Annule", className: "bg-red-100 text-red-700" },
}

const competitionStatusConfig: Record<string, { label: string; className: string }> = {
  a_venir: { label: "A venir", className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Termine", className: "bg-muted text-muted-foreground" },
}

export default function CompetitionDetailClient({
  competition,
  participants,
}: {
  competition: CompetitionDetail
  participants: CompetitionParticipant[]
}) {
  const [roleFilter, setRoleFilter] = useState("tous")
  const [transportFilter, setTransportFilter] = useState("tous")
  const [activeTab, setActiveTab] = useState("participants")
  const [exportOpen, setExportOpen] = useState(false)
  const [generatedAt, setGeneratedAt] = useState("")

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesRole =
        roleFilter === "tous" || p.role.toLowerCase() === roleFilter.toLowerCase()
      const matchesTransport =
        transportFilter === "tous" || p.statutTransport === transportFilter
      return matchesRole && matchesTransport
    })
  }, [participants, roleFilter, transportFilter])

  const stats = useMemo(() => {
    return {
      total: participants.length,
      athletes: participants.filter((p) => p.role.toLowerCase() === "athlete").length,
      transportValide: participants.filter((p) => p.statutTransport === "valide").length,
      hebergementConfirme: participants.filter((p) => p.statutHebergement === "confirme").length,
    }
  }, [participants])

  const statutLabel =
    competitionStatusConfig[competition.statut]?.label ?? competition.statut ?? "-"
  const statutClass =
    competitionStatusConfig[competition.statut]?.className ?? "bg-muted text-muted-foreground"

  const disciplines = competition.disciplines.length > 0 ? competition.disciplines : []

  const visibleExportParticipants =
    activeTab === "hebergement" ? participants : filteredParticipants

  const exportText = useMemo(() => {
    const lines = [
      "Liste des participants",
      `Date de génération : ${generatedAt || new Date().toLocaleString("fr-FR")}`,
      `Compétition : ${competition.nom || "-"}`,
      "",
      ["Nom", "Rôle", "Entité", "Date d'arrivée", "Date de départ"].join("\t"),
      ...visibleExportParticipants.map((participant) =>
        [
          participant.nom || "-",
          participant.role || "-",
          participant.discipline || "-",
          participant.dateArrivee || "-",
          participant.dateDepart || "-",
        ].join("\t")
      ),
    ]

    return lines.join("\n")
  }, [competition.nom, generatedAt, visibleExportParticipants])

  function openExportDialog() {
    setGeneratedAt(new Date().toLocaleString("fr-FR"))
    setExportOpen(true)
  }

  async function copyExportText() {
    await navigator.clipboard.writeText(exportText)
  }

  return (
    <div className="min-h-screen">
      <Header title={competition.nom} subtitle="Details de la competition" />

      <div className="p-6 space-y-6">
        <Link href="/dashboard/competitions">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour a la liste
          </Button>
        </Link>

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
                    {(competition.ville || "-") + ", " + (competition.pays || "-")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {competition.dateDebut || "-"} - {competition.dateFin || "-"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={cn("text-sm", statutClass)}>
                {statutLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{competition.type || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium">{competition.lieu || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{competition.contact || "-"}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Disciplines</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {disciplines.length === 0 ? (
                  <Badge variant="outline">-</Badge>
                ) : (
                  disciplines.map((d) => (
                    <Badge key={d} variant="outline">
                      {d}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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

          <TabsContent value="participants">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des participants</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={openExportDialog}>
                    <Copy className="h-4 w-4" />
                    Export texte
                  </Button>
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
                      <TableHead>Entité</TableHead>
                      <TableHead>Transport</TableHead>
                      <TableHead>Hebergement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant, index) => (
                      <TableRow key={`${participant.id}-${index}`}>
                        <TableCell className="font-medium">{participant.nom}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{participant.role}</Badge>
                        </TableCell>
                        <TableCell>{participant.discipline}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs",
                              transportStatusConfig[participant.statutTransport]?.className ??
                                transportStatusConfig.en_attente.className
                            )}
                          >
                            {(transportStatusConfig[participant.statutTransport]?.label ??
                              transportStatusConfig.en_attente.label) as string}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs",
                              hebergementStatusConfig[participant.statutHebergement]?.className ??
                                hebergementStatusConfig.en_attente.className
                            )}
                          >
                            {(hebergementStatusConfig[participant.statutHebergement]?.label ??
                              hebergementStatusConfig.en_attente.label) as string}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

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
                      const StatusIcon =
                        transportStatusConfig[participant.statutTransport]?.icon ??
                        transportStatusConfig.en_attente.icon
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
                            <Badge
                              className={cn(
                                "text-xs gap-1",
                                transportStatusConfig[participant.statutTransport]?.className ??
                                  transportStatusConfig.en_attente.className
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {transportStatusConfig[participant.statutTransport]?.label ??
                                transportStatusConfig.en_attente.label}
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
                            {participant.hotel || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{participant.chambre || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs",
                              hebergementStatusConfig[participant.statutHebergement]?.className ??
                                hebergementStatusConfig.en_attente.className
                            )}
                          >
                            {hebergementStatusConfig[participant.statutHebergement]?.label ??
                              hebergementStatusConfig.en_attente.label}
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

        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Liste des participants</DialogTitle>
              <DialogDescription>
                Export texte simple à copier dans Word.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-1 text-sm">
                <p>
                  <span className="font-medium">Date de génération :</span>{" "}
                  {generatedAt || "-"}
                </p>
                <p>
                  <span className="font-medium">Compétition :</span>{" "}
                  {competition.nom || "-"}
                </p>
              </div>

              <div className="max-h-[50vh] overflow-auto rounded-md border border-border/50 bg-muted/20 p-4">
                <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                  {exportText}
                </pre>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fermer</Button>
              </DialogClose>
              <Button className="gap-2" onClick={copyExportText}>
                <Copy className="h-4 w-4" />
                Copier le texte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
