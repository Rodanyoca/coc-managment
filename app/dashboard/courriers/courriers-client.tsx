"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Search, ArrowDownLeft, ArrowUpRight, Eye, FileText, Link2 } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export type CourrierListItem = {
  id: string
  code: string
  reference: string
  objet: string
  expediteur: string
  destinataire: string
  date: string
  sens: "entrant" | "sortant"
  categorie: string
  statut: "traite" | "en_attente" | "non_traite"
  pdfUrl: string | null
}

const statutConfig = {
  traite: { label: "Traité", className: "bg-coc-green/10 text-coc-green" },
  en_attente: { label: "En attente", className: "bg-chart-2/10 text-chart-2" },
  non_traite: { label: "Non traité", className: "bg-destructive/10 text-destructive" },
}

export default function CourriersClient(props: { courriers: CourrierListItem[] }) {
  const courriers = props.courriers ?? []

  const [searchQuery, setSearchQuery] = useState("")
  const [categorieFilter, setCategorieFilter] = useState("Toutes")
  const [sensFilter, setSensFilter] = useState("tous")
  const [statutFilter, setStatutFilter] = useState("tous")

  const categories = useMemo(() => {
    const unique = new Set<string>()
    for (const c of courriers) {
      if (c.categorie?.trim()) unique.add(c.categorie.trim())
    }
    return ["Toutes", ...Array.from(unique).sort((a, b) => a.localeCompare(b))]
  }, [courriers])

  const filteredCourriers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return courriers.filter((courrier) => {
      const matchesSearch =
        q.length === 0 ||
        courrier.objet.toLowerCase().includes(q) ||
        courrier.reference.toLowerCase().includes(q) ||
        courrier.code.includes(searchQuery.trim())

      const matchesCategorie =
        categorieFilter === "Toutes" || courrier.categorie === categorieFilter

      const matchesSens = sensFilter === "tous" || courrier.sens === sensFilter

      const matchesStatut =
        statutFilter === "tous" || courrier.statut === statutFilter

      return matchesSearch && matchesCategorie && matchesSens && matchesStatut
    })
  }, [courriers, searchQuery, categorieFilter, sensFilter, statutFilter])

  const stats = useMemo(() => {
    return {
      entrants: courriers.filter((c) => c.sens === "entrant").length,
      sortants: courriers.filter((c) => c.sens === "sortant").length,
      nonTraites: courriers.filter((c) => c.statut === "non_traite").length,
      sansPdf: courriers.filter((c) => !c.pdfUrl).length,
    }
  }, [courriers])

  return (
    <div className="min-h-screen">
      <Header title="Courriers" subtitle="Gestion des courriers entrants et sortants" />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-coc-green/10 text-coc-green">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.entrants}</p>
                <p className="text-sm text-muted-foreground">Courriers reçus</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sortants}</p>
                <p className="text-sm text-muted-foreground">Courriers expédiés</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-destructive/10 text-destructive">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.nonTraites}</p>
                <p className="text-sm text-muted-foreground">Non traités</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-2/10 text-chart-2">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sansPdf}</p>
                <p className="text-sm text-muted-foreground">Sans PDF</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par code, référence ou objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sensFilter} onValueChange={setSensFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="entrant">Entrants</SelectItem>
                <SelectItem value="sortant">Sortants</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categorieFilter} onValueChange={setCategorieFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="traite">Traité</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="non_traite">Non traité</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[80px]">Code</TableHead>
                  <TableHead className="w-[80px]">Sens</TableHead>
                  <TableHead className="w-[350px]">Objet</TableHead>
                  <TableHead>Correspondant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourriers.map((courrier) => (
                  <TableRow key={courrier.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-primary">{courrier.code}</TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                          courrier.sens === "entrant"
                            ? "bg-coc-green/10 text-coc-green"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {courrier.sens === "entrant" ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/courriers/${courrier.code}`}
                        className="font-medium hover:text-primary hover:underline truncate max-w-[300px] block"
                      >
                        {courrier.objet}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {courrier.sens === "entrant" ? courrier.expediteur : courrier.destinataire}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{courrier.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statutConfig[courrier.statut].className}
                      >
                        {statutConfig[courrier.statut].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {courrier.pdfUrl ? (
                        <FileText className="h-4 w-4 text-destructive" />
                      ) : (
                        <Link href={`/dashboard/courriers/${courrier.code}/lier-pdf`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-chart-2 hover:text-chart-2"
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Lier
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/courriers/${courrier.code}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Affichage de {filteredCourriers.length} sur {courriers.length} courriers
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
