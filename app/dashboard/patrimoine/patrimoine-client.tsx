"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Search, Package, CheckCircle, Calendar } from "lucide-react"
import { useMemo, useState } from "react"

export type PatrimoineItem = {
  id: string
  nom: string
  quantite: string
  dateAcquisition: string
  etat: string
}

function normalizeEtat(etat: string): string {
  const v = etat.trim().toUpperCase()
  if (v === "BON" || v === "BONNE") return "bon"
  if (v === "MOYEN" || v === "MOYENNE") return "moyen"
  if (v === "MAUVAIS" || v === "MAUVAISE") return "mauvais"
  return etat.trim().toLowerCase()
}

function etatLabel(etat: string): string {
  const v = normalizeEtat(etat)
  if (v === "bon") return "Bon"
  if (v === "moyen") return "Moyen"
  if (v === "mauvais") return "Mauvais"
  return etat || "-"
}

function etatClassName(etat: string): string {
  const v = normalizeEtat(etat)
  if (v === "bon") return "text-coc-green"
  if (v === "moyen") return "text-chart-2"
  if (v === "mauvais") return "text-destructive"
  return "text-muted-foreground"
}

export default function PatrimoineClient(props: { items: PatrimoineItem[] }) {
  const items = props.items ?? []

  const [searchQuery, setSearchQuery] = useState("")
  const [etatFilter, setEtatFilter] = useState("tous")

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch = q.length === 0 || item.nom.toLowerCase().includes(q)
      const matchesEtat = etatFilter === "tous" || normalizeEtat(item.etat) === etatFilter
      return matchesSearch && matchesEtat
    })
  }, [items, searchQuery, etatFilter])

  const stats = useMemo(() => {
    const totalQuantite = items.reduce((sum, item) => {
      const n = Number.parseInt(String(item.quantite ?? "0"), 10)
      return sum + (Number.isNaN(n) ? 0 : n)
    }, 0)
    const totalReferences = items.length
    const totalBonEtat = items.filter((i) => normalizeEtat(i.etat) === "bon").length
    const currentYear = String(new Date().getFullYear())
    const acquisitionsAnnee = items.filter((i) =>
      String(i.dateAcquisition ?? "").includes(currentYear)
    ).length

    return { totalQuantite, totalReferences, totalBonEtat, acquisitionsAnnee, currentYear }
  }, [items])

  return (
    <div className="min-h-screen">
      <Header title="Patrimoine" subtitle="Gestion des biens et équipements du COC" />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuantite}</p>
                <p className="text-sm text-muted-foreground">Quantité totale</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-1/10 text-chart-1">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReferences}</p>
                <p className="text-sm text-muted-foreground">Références</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-2/10 text-chart-2">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBonEtat}</p>
                <p className="text-sm text-muted-foreground">Bon état</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-3/10 text-chart-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.acquisitionsAnnee}</p>
                <p className="text-sm text-muted-foreground">Acquisitions {stats.currentYear}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un bien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={etatFilter} onValueChange={setEtatFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="État" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les états</SelectItem>
                <SelectItem value="bon">Bon</SelectItem>
                <SelectItem value="moyen">Moyen</SelectItem>
                <SelectItem value="mauvais">Mauvais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[350px]">Nom</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead>Date d&apos;acquisition</TableHead>
                  <TableHead>État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{item.nom || "-"}</TableCell>
                    <TableCell className="text-center font-medium">{item.quantite || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.dateAcquisition || "-"}</TableCell>
                    <TableCell className={etatClassName(item.etat)}>{etatLabel(item.etat)}</TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Aucun bien trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
