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
import { Search, Plus, Filter, ArrowDownLeft, ArrowUpRight, Eye, Edit, FileText, ExternalLink } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const courriers = [
  {
    id: "1",
    reference: "COC/2026/001",
    objet: "Convocation Assemblée Générale CIO",
    expediteur: "Comité International Olympique",
    destinataire: "COC",
    date: "28/03/2026",
    sens: "entrant" as const,
    categorie: "Institutionnel",
    statut: "traite",
    pdf: true,
  },
  {
    id: "2",
    reference: "COC/2026/002",
    objet: "Demande de subvention annuelle",
    expediteur: "COC",
    destinataire: "Ministère des Sports",
    date: "25/03/2026",
    sens: "sortant" as const,
    categorie: "Financier",
    statut: "en_attente",
    pdf: true,
  },
  {
    id: "3",
    reference: "COC/2026/003",
    objet: "Accréditation Jeux Olympiques 2028",
    expediteur: "CIO",
    destinataire: "COC",
    date: "22/03/2026",
    sens: "entrant" as const,
    categorie: "Compétitions",
    statut: "traite",
    pdf: true,
  },
  {
    id: "4",
    reference: "COC/2026/004",
    objet: "Rapport mission Lausanne",
    expediteur: "COC",
    destinataire: "ACNOA",
    date: "20/03/2026",
    sens: "sortant" as const,
    categorie: "Rapport",
    statut: "traite",
    pdf: false,
  },
  {
    id: "5",
    reference: "COC/2026/005",
    objet: "Invitation Séminaire Olympique Africain",
    expediteur: "ACNOA",
    destinataire: "COC",
    date: "18/03/2026",
    sens: "entrant" as const,
    categorie: "Événement",
    statut: "non_traite",
    pdf: true,
  },
  {
    id: "6",
    reference: "COC/2026/006",
    objet: "Confirmation participation Jeux Africains",
    expediteur: "COC",
    destinataire: "Comité d'Organisation",
    date: "15/03/2026",
    sens: "sortant" as const,
    categorie: "Compétitions",
    statut: "traite",
    pdf: true,
  },
]

const categories = ["Toutes", "Institutionnel", "Financier", "Compétitions", "Rapport", "Événement"]
const annees = ["2026", "2025", "2024", "2023"]

export default function CourriersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categorieFilter, setCategorieFilter] = useState("Toutes")
  const [sensFilter, setSensFilter] = useState("tous")

  const filteredCourriers = courriers.filter((courrier) => {
    const matchesSearch = 
      courrier.objet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courrier.reference.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategorie = 
      categorieFilter === "Toutes" || courrier.categorie === categorieFilter
    const matchesSens = 
      sensFilter === "tous" || courrier.sens === sensFilter
    return matchesSearch && matchesCategorie && matchesSens
  })

  const statutConfig = {
    traite: { label: "Traité", className: "bg-coc-green/10 text-coc-green" },
    en_attente: { label: "En attente", className: "bg-chart-2/10 text-chart-2" },
    non_traite: { label: "Non traité", className: "bg-destructive/10 text-destructive" },
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Courriers" 
        subtitle="Gestion des courriers entrants et sortants"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-coc-green/10 text-coc-green">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">87</p>
                <p className="text-sm text-muted-foreground">Courriers reçus</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">69</p>
                <p className="text-sm text-muted-foreground">Courriers expédiés</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-destructive/10 text-destructive">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Non traités</p>
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
                placeholder="Rechercher un courrier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sensFilter} onValueChange={setSensFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="entrant">Entrants</SelectItem>
                <SelectItem value="sortant">Sortants</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categorieFilter} onValueChange={setCategorieFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau courrier
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[100px]">Réf.</TableHead>
                  <TableHead>Sens</TableHead>
                  <TableHead className="w-[350px]">Objet</TableHead>
                  <TableHead>Correspondant</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourriers.map((courrier) => (
                  <TableRow key={courrier.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {courrier.reference}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                          courrier.sens === "entrant"
                            ? "bg-coc-green/10 text-coc-green"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {courrier.sens === "entrant" ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                        {courrier.sens === "entrant" ? "Reçu" : "Expédié"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-[300px]">{courrier.objet}</span>
                        {courrier.pdf && (
                          <FileText className="h-4 w-4 text-destructive shrink-0" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {courrier.sens === "entrant" ? courrier.expediteur : courrier.destinataire}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {courrier.categorie}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{courrier.date}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={statutConfig[courrier.statut as keyof typeof statutConfig].className}
                      >
                        {statutConfig[courrier.statut as keyof typeof statutConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {courrier.pdf && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Affichage de {filteredCourriers.length} sur {courriers.length} courriers</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
