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
import Link from "next/link"

const arbitres = [
  {
    id: "1",
    nom: "Kanyinda",
    prenom: "Emmanuel",
    discipline: "Athlétisme",
    grade: "International",
    federation: "FECOATH",
    licenceValide: true,
    competitionsArbitrees: 45,
    statut: "actif",
  },
  {
    id: "2",
    nom: "Mwana",
    prenom: "Solange",
    discipline: "Basketball",
    grade: "Continental",
    federation: "FECOBA",
    licenceValide: true,
    competitionsArbitrees: 32,
    statut: "actif",
  },
  {
    id: "3",
    nom: "Kabamba",
    prenom: "Freddy",
    discipline: "Judo",
    grade: "International",
    federation: "FECOJU",
    licenceValide: true,
    competitionsArbitrees: 67,
    statut: "actif",
  },
  {
    id: "4",
    nom: "Lufuma",
    prenom: "Christine",
    discipline: "Taekwondo",
    grade: "National",
    federation: "FECOTAE",
    licenceValide: false,
    competitionsArbitrees: 18,
    statut: "inactif",
  },
  {
    id: "5",
    nom: "Ngandu",
    prenom: "Michel",
    discipline: "Volleyball",
    grade: "Continental",
    federation: "FECOVO",
    licenceValide: true,
    competitionsArbitrees: 28,
    statut: "actif",
  },
  {
    id: "6",
    nom: "Tshibangu",
    prenom: "Alice",
    discipline: "Natation",
    grade: "National",
    federation: "FENACO",
    licenceValide: true,
    competitionsArbitrees: 12,
    statut: "actif",
  },
]

const disciplines = ["Toutes", "Athlétisme", "Basketball", "Judo", "Taekwondo", "Volleyball", "Natation"]
const grades = ["Tous", "National", "Continental", "International"]

export default function ArbitresPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [disciplineFilter, setDisciplineFilter] = useState("Toutes")
  const [gradeFilter, setGradeFilter] = useState("Tous")

  const filteredArbitres = arbitres.filter((arbitre) => {
    const matchesSearch = 
      arbitre.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arbitre.prenom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDiscipline = disciplineFilter === "Toutes" || arbitre.discipline === disciplineFilter
    const matchesGrade = gradeFilter === "Tous" || arbitre.grade === gradeFilter
    return matchesSearch && matchesDiscipline && matchesGrade
  })

  const gradeConfig: Record<string, string> = {
    "National": "bg-muted text-muted-foreground",
    "Continental": "bg-chart-2/10 text-chart-2",
    "International": "bg-chart-1/10 text-chart-1",
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Arbitres" 
        subtitle="Arbitres et juges officiels"
      />
      
      <div className="p-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un arbitre..."
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
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel arbitre
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[250px]">Arbitre</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Compétitions</TableHead>
                  <TableHead>Licence</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArbitres.map((arbitre) => (
                  <TableRow key={arbitre.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-chart-5/10 text-chart-5 text-sm">
                            {arbitre.prenom[0]}{arbitre.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{arbitre.prenom} {arbitre.nom}</p>
                          <p className="text-xs text-muted-foreground">{arbitre.federation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{arbitre.discipline}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={gradeConfig[arbitre.grade]}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {arbitre.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{arbitre.competitionsArbitrees}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={arbitre.licenceValide 
                          ? "bg-coc-green/10 text-coc-green" 
                          : "bg-destructive/10 text-destructive"
                        }
                      >
                        {arbitre.licenceValide ? "Valide" : "Expirée"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={arbitre.statut === "actif" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {arbitre.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/acteurs/arbitres/${arbitre.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
          <span>Affichage de {filteredArbitres.length} sur {arbitres.length} arbitres</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
