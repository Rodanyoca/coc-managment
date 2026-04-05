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
import { Search, Eye, Stethoscope } from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

export type MedecinListItem = {
  id: string
  nom: string
  prenom: string
  sexe: "M" | "F" | null
  specialite: string
  etablissement: string
  grade: string
  telephone: string
  statut: "actif" | "inactif"
}

export default function MedecinsClient({ medecins }: { medecins: MedecinListItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [specialiteFilter, setSpecialiteFilter] = useState("Toutes")

  const specialites = useMemo(() => {
    const uniq = Array.from(new Set(medecins.map((m) => m.specialite).filter(Boolean))).sort()
    return ["Toutes", ...uniq]
  }, [medecins])

  const filteredMedecins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return medecins.filter((medecin) => {
      const matchesSearch =
        q.length === 0 ||
        medecin.nom.toLowerCase().includes(q) ||
        medecin.prenom.toLowerCase().includes(q) ||
        `${medecin.prenom} ${medecin.nom}`.toLowerCase().includes(q)
      const matchesSpecialite =
        specialiteFilter === "Toutes" || medecin.specialite === specialiteFilter
      return matchesSearch && matchesSpecialite
    })
  }, [medecins, searchQuery, specialiteFilter])

  return (
    <div className="min-h-screen">
      <Header title="Médecins" subtitle="Personnel médical sportif" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un médecin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={specialiteFilter} onValueChange={setSpecialiteFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                {specialites.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
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
                  <TableHead className="w-[250px]">Médecin</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedecins.map((medecin) => (
                  <TableRow key={medecin.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-chart-4/10 text-chart-4 text-sm">
                            <Stethoscope className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {medecin.prenom} {medecin.nom}
                            </p>
                            {medecin.sexe && (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] leading-none">
                                {medecin.sexe === "M" ? "H" : "F"}
                              </Badge>
                            )}
                          </div>
                          {medecin.grade && (
                            <p className="text-xs text-muted-foreground">{medecin.grade}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{medecin.id}</span>
                    </TableCell>
                    <TableCell>{medecin.specialite || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{medecin.etablissement || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{medecin.telephone || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          medecin.statut === "actif"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {medecin.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Link href={`/dashboard/acteurs/medecins/${medecin.id}`}>
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
            Affichage de {filteredMedecins.length} sur {medecins.length} médecins
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
