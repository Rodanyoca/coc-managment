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
import { Search, Plus, Building2, Car, Laptop, Package, DollarSign, Eye, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const patrimoine = [
  {
    id: "1",
    libelle: "Siège COC - Immeuble administratif",
    categorie: "Immobilier",
    nombre: 1,
    valeur: 350000,
    dateAcquisition: "15/03/2015",
    etat: "bon",
  },
  {
    id: "2",
    libelle: "Centre d'entraînement olympique",
    categorie: "Immobilier",
    nombre: 1,
    valeur: 100000,
    dateAcquisition: "22/06/2018",
    etat: "bon",
  },
  {
    id: "3",
    libelle: "Toyota Land Cruiser V8",
    categorie: "Véhicules",
    nombre: 2,
    valeur: 65000,
    dateAcquisition: "10/01/2023",
    etat: "bon",
  },
  {
    id: "4",
    libelle: "Toyota Hilux Pick-up",
    categorie: "Véhicules",
    nombre: 3,
    valeur: 60000,
    dateAcquisition: "05/09/2022",
    etat: "moyen",
  },
  {
    id: "5",
    libelle: "Ordinateurs portables MacBook Pro",
    categorie: "Équipements IT",
    nombre: 12,
    valeur: 18000,
    dateAcquisition: "20/11/2024",
    etat: "bon",
  },
  {
    id: "6",
    libelle: "Ordinateurs de bureau Dell",
    categorie: "Équipements IT",
    nombre: 8,
    valeur: 8000,
    dateAcquisition: "15/06/2023",
    etat: "bon",
  },
  {
    id: "7",
    libelle: "Imprimantes multifonctions",
    categorie: "Équipements IT",
    nombre: 4,
    valeur: 4000,
    dateAcquisition: "10/03/2024",
    etat: "bon",
  },
  {
    id: "8",
    libelle: "Équipements d'athlétisme",
    categorie: "Matériel sportif",
    nombre: 50,
    valeur: 35000,
    dateAcquisition: "01/07/2024",
    etat: "bon",
  },
  {
    id: "9",
    libelle: "Équipements de judo",
    categorie: "Matériel sportif",
    nombre: 30,
    valeur: 15000,
    dateAcquisition: "15/08/2023",
    etat: "moyen",
  },
  {
    id: "10",
    libelle: "Tenues officielles délégation",
    categorie: "Matériel sportif",
    nombre: 200,
    valeur: 25000,
    dateAcquisition: "01/06/2024",
    etat: "bon",
  },
]

const categorieConfig: Record<string, { icon: React.ElementType; className: string }> = {
  "Immobilier": { icon: Building2, className: "bg-chart-1/10 text-chart-1" },
  "Véhicules": { icon: Car, className: "bg-chart-2/10 text-chart-2" },
  "Équipements IT": { icon: Laptop, className: "bg-chart-3/10 text-chart-3" },
  "Matériel sportif": { icon: Package, className: "bg-chart-4/10 text-chart-4" },
}

const etatConfig = {
  bon: { label: "Bon état", className: "bg-coc-green/10 text-coc-green" },
  moyen: { label: "État moyen", className: "bg-chart-2/10 text-chart-2" },
  mauvais: { label: "Mauvais état", className: "bg-destructive/10 text-destructive" },
}

const categories = ["Toutes", "Immobilier", "Véhicules", "Équipements IT", "Matériel sportif"]

export default function PatrimoinePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categorieFilter, setCategorieFilter] = useState("Toutes")

  const filteredPatrimoine = patrimoine.filter((item) => {
    const matchesSearch = item.libelle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategorie = categorieFilter === "Toutes" || item.categorie === categorieFilter
    return matchesSearch && matchesCategorie
  })

  const totalValeur = patrimoine.reduce((sum, item) => sum + item.valeur, 0)
  const totalBiens = patrimoine.reduce((sum, item) => sum + item.nombre, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Patrimoine" 
        subtitle="Gestion des biens et équipements du COC"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalValeur)}</p>
                <p className="text-sm text-muted-foreground">Valeur totale</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-1/10 text-chart-1">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBiens}</p>
                <p className="text-sm text-muted-foreground">Total des biens</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-2/10 text-chart-2">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patrimoine.filter(p => p.categorie === "Immobilier").length}</p>
                <p className="text-sm text-muted-foreground">Biens immobiliers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-3/10 text-chart-3">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patrimoine.filter(p => p.categorie === "Véhicules").reduce((s, p) => s + p.nombre, 0)}</p>
                <p className="text-sm text-muted-foreground">Véhicules</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
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
            <Select value={categorieFilter} onValueChange={setCategorieFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau bien
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[350px]">Libellé</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead className="text-right">Valeur</TableHead>
                  <TableHead>Date acquisition</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatrimoine.map((item) => {
                  const catConfig = categorieConfig[item.categorie]
                  const CatIcon = catConfig?.icon || Package
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("rounded-lg p-2", catConfig?.className)}>
                            <CatIcon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{item.libelle}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.categorie}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{item.nombre}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.valeur)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.dateAcquisition}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={cn("text-xs", etatConfig[item.etat as keyof typeof etatConfig].className)}
                        >
                          {etatConfig[item.etat as keyof typeof etatConfig].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
