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
import { Search, Eye } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

function getAgeFromDateString(dateString: string) {
  const [dd, mm, yyyy] = dateString.split("/").map((part) => Number(part))
  if (!dd || !mm || !yyyy) return null

  const birthDate = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

const officiels = [
  {
    id: "1",
    nom: "Kalamba",
    prenom: "Pierre",
    sexe: "M",
    dateNaissance: "12/04/1972",
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
    sexe: "F",
    dateNaissance: "08/11/1980",
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
    sexe: "M",
    dateNaissance: "02/02/1976",
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
    sexe: "F",
    dateNaissance: "19/06/1983",
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
    sexe: "M",
    dateNaissance: "21/09/1979",
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
    sexe: "F",
    dateNaissance: "15/01/1986",
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
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[250px]">Officiel</TableHead>
                  <TableHead>ID</TableHead>
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{officiel.prenom} {officiel.nom}</p>
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-[10px] leading-none"
                            >
                              {officiel.sexe === "M" ? "H" : "F"}
                            </Badge>
                          </div>
                          {(() => {
                            const age = getAgeFromDateString(officiel.dateNaissance)
                            return (
                              <p className="text-xs text-muted-foreground">
                                {age === null ? "" : `${age} ans`}
                              </p>
                            )
                          })()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{officiel.id}</span>
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
                      <div className="flex justify-end">
                        <Link href={`/dashboard/acteurs/officiels/${officiel.id}`}>
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
