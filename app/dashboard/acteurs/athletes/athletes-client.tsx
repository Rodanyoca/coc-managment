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
import { Search, Filter, Eye } from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

export type AthleteListItem = {
  id: string
  nom: string
  prenom: string
  sexe: "M" | "F"
  discipline: string
  specialite?: string
  dateNaissance?: string
  federation?: string
  statut?: string
  avatar?: string | null
}

export function AthletesClient({ athletes }: { athletes: AthleteListItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [disciplineFilter, setDisciplineFilter] = useState("Toutes")

  const disciplines = useMemo(() => {
    const unique = Array.from(new Set(athletes.map((a) => a.discipline).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    )
    return ["Toutes", ...unique]
  }, [athletes])

  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch =
      athlete.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.prenom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDiscipline = disciplineFilter === "Toutes" || athlete.discipline === disciplineFilter
    return matchesSearch && matchesDiscipline
  })

  return (
    <div className="min-h-screen">
      <Header title="Athlètes" subtitle="Liste des athlètes enregistrés" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un athlète..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((discipline) => (
                  <SelectItem key={discipline} value={discipline}>
                    {discipline}
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
                  <TableHead className="w-[300px]">Athlète</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Fédération</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAthletes.map((athlete) => (
                  <TableRow key={athlete.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={athlete.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {athlete.prenom?.[0]}
                            {athlete.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {athlete.prenom} {athlete.nom}
                            </p>
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] leading-none">
                              {athlete.sexe === "M" ? "H" : "F"}
                            </Badge>
                          </div>
                          {athlete.dateNaissance ? (
                            <p className="text-xs text-muted-foreground">Né(e) le {athlete.dateNaissance}</p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{athlete.id}</span>
                    </TableCell>
                    <TableCell>
                      {athlete.specialite ? (
                        <div className="space-y-0.5">
                          <p className="font-medium">{athlete.discipline}</p>
                          <p className="text-xs text-muted-foreground">{athlete.specialite}</p>
                        </div>
                      ) : (
                        <p className="font-medium">{athlete.discipline}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {athlete.federation ? (
                        <Badge variant="outline" className="text-xs">
                          {athlete.federation}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          athlete.statut === "actif" ? "bg-coc-green/10 text-coc-green" : "bg-muted text-muted-foreground"
                        }
                      >
                        {athlete.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Link href={`/dashboard/acteurs/athletes/${athlete.id}`}>
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
            Affichage de {filteredAthletes.length} sur {athletes.length} athlètes
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
