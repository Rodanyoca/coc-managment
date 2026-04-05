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

export type CoachListItem = {
  id: string
  nom: string
  prenom: string
  sexe: "M" | "F" | null
  sport: string
  discipline: string
  niveau: string
  federation: string
  athletesSuivis: number | null
  statut: "actif" | "inactif"
}

export default function EntraineursClient({ coachs }: { coachs: CoachListItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sportFilter, setSportFilter] = useState("Toutes")
  const [niveauFilter, setNiveauFilter] = useState("Tous")

  const sports = useMemo(() => {
    const uniq = Array.from(new Set(coachs.map((c) => c.sport).filter(Boolean))).sort()
    return ["Toutes", ...uniq]
  }, [coachs])

  const niveaux = useMemo(() => {
    const uniq = Array.from(new Set(coachs.map((c) => c.niveau).filter(Boolean))).sort()
    return ["Tous", ...uniq]
  }, [coachs])

  const filteredEntraineurs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return coachs.filter((entraineur) => {
      const matchesSearch =
        q.length === 0 ||
        entraineur.nom.toLowerCase().includes(q) ||
        entraineur.prenom.toLowerCase().includes(q) ||
        `${entraineur.prenom} ${entraineur.nom}`.toLowerCase().includes(q)

      const matchesSport = sportFilter === "Toutes" || entraineur.sport === sportFilter
      const matchesNiveau = niveauFilter === "Tous" || entraineur.niveau === niveauFilter

      return matchesSearch && matchesSport && matchesNiveau
    })
  }, [coachs, niveauFilter, searchQuery, sportFilter])

  const niveauConfig: Record<string, string> = {
    National: "bg-muted text-muted-foreground",
    Continental: "bg-chart-2/10 text-chart-2",
    International: "bg-chart-1/10 text-chart-1",
  }

  return (
    <div className="min-h-screen">
      <Header title="Entraîneurs" subtitle="Coachs et préparateurs sportifs" />

      <div className="p-6 space-y-6">
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

            <Select value={niveauFilter} onValueChange={setNiveauFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {niveaux.map((niv) => (
                  <SelectItem key={niv} value={niv}>
                    {niv}
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
                  <TableHead className="w-[250px]">Entraîneur</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Discipline</TableHead>
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
                            {(entraineur.prenom[0] || "?").toUpperCase()}
                            {(entraineur.nom[0] || "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {entraineur.prenom} {entraineur.nom}
                            </p>
                            {entraineur.sexe && (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] leading-none">
                                {entraineur.sexe === "M" ? "H" : "F"}
                              </Badge>
                            )}
                          </div>
                          {entraineur.federation && (
                            <p className="text-xs text-muted-foreground">{entraineur.federation}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{entraineur.id}</span>
                    </TableCell>
                    <TableCell>{entraineur.sport || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{entraineur.discipline || "-"}</TableCell>
                    <TableCell>
                      {entraineur.niveau ? (
                        <Badge
                          variant="secondary"
                          className={niveauConfig[entraineur.niveau] ?? "bg-muted text-muted-foreground"}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {entraineur.niveau}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entraineur.athletesSuivis === null ? "-" : entraineur.athletesSuivis}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          entraineur.statut === "actif"
                            ? "bg-coc-green/10 text-coc-green"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {entraineur.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Link href={`/dashboard/acteurs/entraineurs/${entraineur.id}`}>
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
            Affichage de {filteredEntraineurs.length} sur {coachs.length} entraîneurs
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
