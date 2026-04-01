"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Search, Plus, Filter, Eye, Edit, FileText } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const officiels = [
  {
    id: "1",
    nom: "Kalamba",
    prenom: "Pierre",
    fonction: "Président",
    organisation: "COC",
    type: "coc",
    telephone: "+243 81 234 5678",
    email: "p.kalamba@coc.cd",
    statut: "actif",
  },
  {
    id: "2",
    nom: "Mbuyi",
    prenom: "Claire",
    fonction: "Secrétaire Général",
    organisation: "COC",
    type: "coc",
    telephone: "+243 82 345 6789",
    email: "c.mbuyi@coc.cd",
    statut: "actif",
  },
  {
    id: "3",
    nom: "Lukusa",
    prenom: "Jean",
    fonction: "Trésorier",
    organisation: "COC",
    type: "coc",
    telephone: "+243 83 456 7890",
    email: "j.lukusa@coc.cd",
    statut: "actif",
  },
  {
    id: "4",
    nom: "Ndala",
    prenom: "Marie",
    fonction: "Présidente",
    organisation: "FECOATH",
    type: "federation",
    telephone: "+243 84 567 8901",
    email: "m.ndala@fecoath.cd",
    statut: "actif",
  },
  {
    id: "5",
    nom: "Kabongo",
    prenom: "Paul",
    fonction: "Secrétaire Général",
    organisation: "FECOBA",
    type: "federation",
    telephone: "+243 85 678 9012",
    email: "p.kabongo@fecoba.cd",
    statut: "actif",
  },
  {
    id: "6",
    nom: "Tshisekedi",
    prenom: "Anne",
    fonction: "Membre Exécutif",
    organisation: "COC",
    type: "coc",
    telephone: "+243 86 789 0123",
    email: "a.tshisekedi@coc.cd",
    statut: "inactif",
  },
]

const organisations = ["Toutes", "COC", "FECOATH", "FECOBA", "FECOJU", "FENACO"]

export default function OfficielsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("tous")
  const [organisationFilter, setOrganisationFilter] = useState("Toutes")

  const filteredOfficiels = officiels.filter((officiel) => {
    const matchesSearch = 
      officiel.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officiel.prenom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "tous" || officiel.type === typeFilter
    const matchesOrg = organisationFilter === "Toutes" || officiel.organisation === organisationFilter
    return matchesSearch && matchesType && matchesOrg
  })

  return (
    <div className="min-h-screen">
      <Header 
        title="Officiels" 
        subtitle="Officiels COC et du mouvement sportif"
      />
      
      <div className="p-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un officiel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="coc">COC</SelectItem>
                <SelectItem value="federation">Fédérations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={organisationFilter} onValueChange={setOrganisationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Organisation" />
              </SelectTrigger>
              <SelectContent>
                {organisations.map((org) => (
                  <SelectItem key={org} value={org}>{org}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel officiel
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[250px]">Officiel</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOfficiels.map((officiel) => (
                  <TableRow key={officiel.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-chart-2/10 text-chart-2 text-sm">
                            {officiel.prenom[0]}{officiel.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{officiel.prenom} {officiel.nom}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{officiel.fonction}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={officiel.type === "coc" ? "border-primary text-primary" : ""}
                      >
                        {officiel.organisation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{officiel.telephone}</p>
                        <p className="text-muted-foreground">{officiel.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={officiel.statut === "actif" 
                          ? "bg-coc-green/10 text-coc-green" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {officiel.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/acteurs/officiels/${officiel.id}`}>
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

        {/* Pagination Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Affichage de {filteredOfficiels.length} sur {officiels.length} officiels</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
