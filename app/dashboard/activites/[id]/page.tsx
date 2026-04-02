"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Flag,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"

const activites = [
  {
    id: "1",
    titre: "Assemblée Générale Ordinaire",
    description: "AG annuelle du COC avec élection du bureau exécutif",
    lieu: "Siège du COC - Kinshasa",
    dateDebut: "15/04/2026",
    dateFin: "15/04/2026",
    statut: "planifie" as const,
    priorite: "haute" as const,
    responsable: "Secrétariat Général",
  },
  {
    id: "2",
    titre: "Formation des entraîneurs - Module 1",
    description: "Formation olympique pour les entraîneurs nationaux",
    lieu: "Centre Technique - Kinshasa",
    dateDebut: "10/05/2026",
    dateFin: "14/05/2026",
    statut: "planifie" as const,
    priorite: "moyenne" as const,
    responsable: "Commission Technique",
  },
  {
    id: "3",
    titre: "Séminaire Anti-dopage",
    description: "Sensibilisation des athlètes aux règles antidopage",
    lieu: "INJS - Kinshasa",
    dateDebut: "20/03/2026",
    dateFin: "22/03/2026",
    statut: "en_cours" as const,
    priorite: "haute" as const,
    responsable: "Commission Médicale",
  },
  {
    id: "4",
    titre: "Réunion Commission des Athlètes",
    description: "Réunion trimestrielle de la commission des athlètes",
    lieu: "Salle de réunion - COC",
    dateDebut: "05/03/2026",
    dateFin: "05/03/2026",
    statut: "termine" as const,
    priorite: "normale" as const,
    responsable: "Commission des Athlètes",
  },
  {
    id: "5",
    titre: "Journée Olympique 2026",
    description: "Célébration de la Journée Olympique Internationale",
    lieu: "Stade des Martyrs - Kinshasa",
    dateDebut: "23/06/2026",
    dateFin: "23/06/2026",
    statut: "planifie" as const,
    priorite: "haute" as const,
    responsable: "Direction Générale",
  },
  {
    id: "6",
    titre: "Audit financier annuel",
    description: "Audit des comptes 2025 par le cabinet externe",
    lieu: "Direction Financière - COC",
    dateDebut: "01/02/2026",
    dateFin: "28/02/2026",
    statut: "termine" as const,
    priorite: "haute" as const,
    responsable: "Direction Financière",
  },
]

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

const participantsParActivite: Record<
  string,
  {
    id: string
    nom: string
    categorie: "Athlète" | "Médecin" | "Officiel" | "Entraîneur" | "Arbitre"
    sexe: "M" | "F"
    age: number
    federation: string
  }[]
> = {
  "1": [
    { id: "p1", nom: "Jean-Pierre Makala", categorie: "Officiel", sexe: "M", age: 44, federation: "COC" },
    { id: "p2", nom: "Marie Kabongo", categorie: "Officiel", sexe: "F", age: 39, federation: "COC" },
  ],
  "2": [
    { id: "p3", nom: "Patrick Lumumba", categorie: "Entraîneur", sexe: "M", age: 41, federation: "COC" },
    { id: "p4", nom: "Sophie Mbuyi", categorie: "Entraîneur", sexe: "F", age: 34, federation: "COC" },
  ],
  "3": [
    { id: "p5", nom: "Dr. Albert Kasongo", categorie: "Médecin", sexe: "M", age: 50, federation: "COC" },
    { id: "p6", nom: "Esther Nzaba", categorie: "Athlète", sexe: "F", age: 22, federation: "COC" },
  ],
  "4": [
    { id: "p7", nom: "Claude Mbenza", categorie: "Athlète", sexe: "M", age: 24, federation: "COC" },
    { id: "p8", nom: "Alain Kiala", categorie: "Officiel", sexe: "M", age: 46, federation: "COC" },
  ],
  "5": [
    { id: "p9", nom: "Nadine Tshibanda", categorie: "Athlète", sexe: "F", age: 20, federation: "COC" },
    { id: "p10", nom: "Benoît Ilunga", categorie: "Médecin", sexe: "M", age: 38, federation: "COC" },
  ],
  "6": [
    { id: "p11", nom: "Mireille Mayala", categorie: "Officiel", sexe: "F", age: 36, federation: "COC" },
    { id: "p12", nom: "Gérard Kimpese", categorie: "Officiel", sexe: "M", age: 52, federation: "COC" },
  ],
}

export default function ActiviteDetailPage() {
  const params = useParams()
  const id = params.id as string

  const activite = activites.find((a) => a.id === id)
  const participants = participantsParActivite[id] ?? []

  if (!activite) {
    return (
      <div className="min-h-screen">
        <Header title="Activité introuvable" subtitle="" />
        <div className="p-6">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center space-y-4">
              <p className="text-muted-foreground">Aucune activité trouvée pour l&apos;ID {id}.</p>
              <Link href="/dashboard/activites">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la liste
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const StatutIcon = statutConfig[activite.statut].icon

  return (
    <div className="min-h-screen">
      <Header title={activite.titre} subtitle="Détails de l'activité" />

      <div className="p-6 space-y-6">
        <Link href="/dashboard/activites">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{activite.description}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Période</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dates</p>
                    <p className="font-medium">
                      {activite.dateDebut === activite.dateFin
                        ? activite.dateDebut
                        : `${activite.dateDebut} - ${activite.dateFin}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lieu</p>
                    <p className="font-medium">{activite.lieu}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Responsable</p>
                    <p className="font-medium text-sm">{activite.responsable}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Priorité</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", prioriteConfig[activite.priorite].className)}
                  >
                    {prioriteConfig[activite.priorite].label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatutIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Statut</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", statutConfig[activite.statut].className)}
                  >
                    {statutConfig[activite.statut].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Fédération</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{p.nom}</TableCell>
                    <TableCell className="text-muted-foreground">{p.categorie}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sexe}</TableCell>
                    <TableCell className="text-muted-foreground">{p.age}</TableCell>
                    <TableCell className="text-muted-foreground">{p.federation}</TableCell>
                  </TableRow>
                ))}

                {participants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun participant
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
