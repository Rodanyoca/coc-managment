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
import { useMemo, useState } from "react"
import Link from "next/link"

export type OfficielListItem = {
  id: string
  nom: string
  prenom: string
  nomComplet: string
  sexe: "M" | "F"
  dateNaissance?: string
  fonction: string
  organisation: string
  type: "coc" | "federation"
  telephone?: string
  email?: string
  statut: "actif" | "inactif"
  avatar?: string | null
}

function getAgeFromDateString(dateString?: string) {
  if (!dateString) return null
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

export function OfficielsClient({ officiels }: { officiels: OfficielListItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("tous")
  const [organisationFilter, setOrganisationFilter] = useState("Toutes")

  const organisations = useMemo(() => {
    const unique = Array.from(new Set(officiels.map((o) => o.organisation).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    )
    return ["Toutes", ...unique]
  }, [officiels])

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
      <Header title="Officiels" subtitle="Officiels COC et du mouvement sportif" />

      <div className="p-6 space-y-6">
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
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
                {filteredOfficiels.map((officiel, index) => (
                  <TableRow key={`${officiel.id}-${index}`} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={officiel.avatar || undefined} />
                          <AvatarFallback className="bg-chart-2/10 text-chart-2 text-sm">
                            {officiel.prenom?.[0]}
                            {officiel.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{officiel.prenom} {officiel.nom}</p>
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] leading-none">
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
                        <p>{officiel.telephone || "-"}</p>
                        <p className="text-muted-foreground">{officiel.email || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          officiel.statut === "actif" ? "bg-coc-green/10 text-coc-green" : "bg-muted text-muted-foreground"
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

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Affichage de {filteredOfficiels.length} sur {officiels.length} officiels
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Précédent
            </Button>
            <Button variant="outline" size="sm" disabled>
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
