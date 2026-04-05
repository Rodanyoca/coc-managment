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
import { Search, Eye, Award } from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

export type ArbitreListItem = {
  id: string
  nom: string
  prenom: string
  sexe: "M" | "F" | null
  sport: string
  grade: string
  federation: string
  competitionsArbitrees: number | null
  statut: "actif" | "inactif"
}

export default function ArbitresClient({ arbitres }: { arbitres: ArbitreListItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sportFilter, setSportFilter] = useState("Toutes")
  const [gradeFilter, setGradeFilter] = useState("Tous")

  const sports = useMemo(() => {
    const uniq = Array.from(new Set(arbitres.map((a) => a.sport).filter(Boolean))).sort()
    return ["Toutes", ...uniq]
  }, [arbitres])

  const grades = useMemo(() => {
    const uniq = Array.from(new Set(arbitres.map((a) => a.grade).filter(Boolean))).sort()
    return ["Tous", ...uniq]
  }, [arbitres])

  const filteredArbitres = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return arbitres.filter((arbitre) => {
      const matchesSearch =
        q.length === 0 ||
        arbitre.nom.toLowerCase().includes(q) ||
        arbitre.prenom.toLowerCase().includes(q) ||
        `${arbitre.prenom} ${arbitre.nom}`.toLowerCase().includes(q)

      const matchesSport = sportFilter === "Toutes" || arbitre.sport === sportFilter
      const matchesGrade = gradeFilter === "Tous" || arbitre.grade === gradeFilter

      return matchesSearch && matchesSport && matchesGrade
    })
  }, [arbitres, gradeFilter, searchQuery, sportFilter])

  const gradeConfig: Record<string, string> = {
    National: "bg-muted text-muted-foreground",
    Continental: "bg-chart-2/10 text-chart-2",
    International: "bg-chart-1/10 text-chart-1",
  }

  return (
    <div className="min-h-screen">
      <Header title="Arbitres" subtitle="Arbitres et juges officiels" />

      <div className="p-6 space-y-6">
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

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((disc) => (
                  <SelectItem key={disc} value={disc}>
                    {disc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
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
                  <TableHead className="w-[250px]">Arbitre</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Compétitions</TableHead>
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
                            {(arbitre.prenom[0] || "?").toUpperCase()}
                            {(arbitre.nom[0] || "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {arbitre.prenom} {arbitre.nom}
                            </p>
                            {arbitre.sexe && (
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] leading-none text-muted-foreground"
                              >
                                {arbitre.sexe === "M" ? "H" : "F"}
                              </Badge>
                            )}
                          </div>
                          {arbitre.federation && (
                            <p className="text-xs text-muted-foreground">{arbitre.federation}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{arbitre.id}</span>
                    </TableCell>
                    <TableCell>{arbitre.sport || "-"}</TableCell>
                    <TableCell>
                      {arbitre.grade ? (
                        <Badge
                          variant="secondary"
                          className={gradeConfig[arbitre.grade] ?? "bg-muted text-muted-foreground"}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {arbitre.grade}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {arbitre.competitionsArbitrees === null ? "-" : arbitre.competitionsArbitrees}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          arbitre.statut === "actif"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {arbitre.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Link href={`/dashboard/acteurs/arbitres/${arbitre.id}`}>
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
            Affichage de {filteredArbitres.length} sur {arbitres.length} arbitres
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
