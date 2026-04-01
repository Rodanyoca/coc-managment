"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Search, Plus, Eye, Edit, FileText, Award } from "lucide-react"
import { useState } from "react"

const entraineurs = [
  {
    id: "1",
    nom: "Mwamba",
    prenom: "Christian",
    discipline: "Athlétisme",
    specialite: "Sprint",
    niveau: "International",
    federation: "FECOATH",
    athletesSuivis: 8,
    statut: "actif",
  },
  {
    id: "2",
    nom: "Kasongo",
    prenom: "Bernadette",
    discipline: "Basketball",
    specialite: "Préparation physique",
    niveau: "National",
    federation: "FECOBA",
    athletesSuivis: 12,
    statut: "actif",
  },
  {
    id: "3",
    nom: "Ilunga",
    prenom: "Patrick",
    discipline: "Judo",
    specialite: "Technique",
    niveau: "Continental",
    federation: "FECOJU",
    athletesSuivis: 6,
    statut: "actif",
  },
  {
    id: "4",
    nom: "Ngoy",
    prenom: "Sylvie",
    discipline: "Natation",
    specialite: "Nage libre",
    niveau: "National",
    federation: "FENACO",
    athletesSuivis: 4,
    statut: "inactif",
  },
  {
    id: "5",
    nom: "Banza",
    prenom: "Jacques",
    discipline: "Taekwondo",
    specialite: "Combat",
    niveau: "International",
    federation: "FECOTAE",
    athletesSuivis: 5,
    statut: "actif",
  },
]

const disciplines = ["Toutes", "Athlétisme", "Basketball", "Judo", "Natation", "Taekwondo"]
const niveaux = ["Tous", "National", "Continental", "International"]

export default function EntraineursPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [disciplineFilter, setDisciplineFilter] = useState("Toutes")
  const [niveauFilter, setNiveauFilter] = useState("Tous")

  const filteredEntraineurs = entraineurs.filter((entraineur) => {
    const matchesSearch = 
      entraineur.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entraineur.prenom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDiscipline = disciplineFilter === "Toutes" || entraineur.discipline === disciplineFilter
    const matchesNiveau = niveauFilter === "Tous" || entraineur.niveau === niveauFilter
    return matchesSearch && matchesDiscipline && matchesNiveau
  })

  const niveauConfig: Record<string, string> = {
    "National": "bg-muted text-muted-foreground",
    "Continental": "bg-chart-2/10 text-chart-2",
    "International": "bg-chart-1/10 text-chart-1",
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Entraîneurs" 
        subtitle="Coachs et préparateurs sportifs"
      />
      
      <div className="p-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un entraîneur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((disc) => (
                  <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={niveauFilter} onValueChange={setNiveauFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {niveaux.map((niv) => (
                  <SelectItem key={niv} value={niv}>{niv}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel entraîneur
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[250px]">Entraîneur</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Athlètes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntraineurs.map((entraineur) => (
                  <TableRow key={entraineur.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-chart-3/10 text-chart-3 text-sm">
                            {entraineur.prenom[0]}{entraineur.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entraineur.prenom} {entraineur.nom}</p>
                          <p className="text-xs text-muted-foreground">{entraineur.federation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{entraineur.discipline}</TableCell>
                    <TableCell className="text-muted-foreground">{entraineur.specialite}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={niveauConfig[entraineur.niveau]}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {entraineur.niveau}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entraineur.athletesSuivis}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={entraineur.statut === "actif" 
                          ? "bg-coc-green/10 text-coc-green" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {entraineur.statut === "actif" ? "Actif" : "Inactif"}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
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
          <span>Affichage de {filteredEntraineurs.length} sur {entraineurs.length} entraîneurs</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
