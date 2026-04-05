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
import { Search, FileText, Folder, HardDrive, Eye } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const documents = [
  {
    id: "1",
    nom: "Rapport_annuel_2025.pdf",
    type: "pdf" as const,
    module: "Courriers",
    entite: "COC",
    dateAjout: "28/03/2026",
    taille: "2.4 MB",
    driveLink: "#",
  },
  {
    id: "2",
    nom: "Photo_delegation_JO_Paris.jpg",
    type: "image" as const,
    module: "Compétitions",
    entite: "JO Paris 2024",
    dateAjout: "15/08/2024",
    taille: "1.8 MB",
    driveLink: "#",
  },
  {
    id: "3",
    nom: "Passeport_Makala_JP.pdf",
    type: "pdf" as const,
    module: "Acteurs",
    entite: "Jean-Pierre Makala",
    dateAjout: "22/03/2026",
    taille: "450 KB",
    driveLink: "#",
  },
  {
    id: "4",
    nom: "Statuts_COC_2024.pdf",
    type: "pdf" as const,
    module: "Courriers",
    entite: "COC",
    dateAjout: "20/03/2026",
    taille: "1.2 MB",
    driveLink: "#",
  },
  {
    id: "5",
    nom: "Avatar_Mbemba_G.jpg",
    type: "image" as const,
    module: "Acteurs",
    entite: "Grace Mbemba",
    dateAjout: "18/03/2026",
    taille: "156 KB",
    driveLink: "#",
  },
  {
    id: "6",
    nom: "Lettre_CIO_Convocation.pdf",
    type: "pdf" as const,
    module: "Courriers",
    entite: "COC/2026/001",
    dateAjout: "15/03/2026",
    taille: "890 KB",
    driveLink: "#",
  },
  {
    id: "7",
    nom: "Photo_equipe_judo.jpg",
    type: "image" as const,
    module: "Acteurs",
    entite: "Équipe Judo",
    dateAjout: "10/03/2026",
    taille: "2.1 MB",
    driveLink: "#",
  },
  {
    id: "8",
    nom: "PV_AG_2025.pdf",
    type: "pdf" as const,
    module: "Activités",
    entite: "AG 2025",
    dateAjout: "05/03/2026",
    taille: "3.5 MB",
    driveLink: "#",
  },
  {
    id: "9",
    nom: "Inventaire_patrimoine_2025.pdf",
    type: "pdf" as const,
    module: "Patrimoine",
    entite: "COC",
    dateAjout: "01/03/2026",
    taille: "1.8 MB",
    driveLink: "#",
  },
  {
    id: "10",
    nom: "Photo_centre_entrainement.jpg",
    type: "image" as const,
    module: "Patrimoine",
    entite: "Centre olympique",
    dateAjout: "25/02/2026",
    taille: "4.2 MB",
    driveLink: "#",
  },
]

const modules = ["Tous", "Acteurs", "Compétitions", "Courriers", "Activités", "Patrimoine"]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("Tous")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.entite.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModule = moduleFilter === "Tous" || doc.module === moduleFilter
    return matchesSearch && matchesModule
  })

  const parseSizeToMB = (size: string) => {
    const value = Number(size.replace(/[^0-9.]/g, ""))
    if (Number.isNaN(value)) return 0
    if (size.toLowerCase().includes("kb")) return value / 1024
    return value
  }

  const totalStorageMB = documents.reduce((sum, d) => sum + parseSizeToMB(d.taille), 0)
  const modulesCount = new Set(documents.map((d) => d.module)).size

  return (
    <div className="min-h-screen">
      <Header 
        title="Documents & Médias" 
        subtitle="Vue transverse de tous les fichiers"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Total fichiers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-2/10 text-chart-2">
                <Folder className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{modulesCount}</p>
                <p className="text-sm text-muted-foreground">Modules</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-chart-4/10 text-chart-4">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStorageMB.toFixed(1)} MB</p>
                <p className="text-sm text-muted-foreground">Stockage</p>
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
                placeholder="Rechercher un fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((mod) => (
                  <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nom du fichier</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Entité liée</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {doc.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.entite}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.taille}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Voir plus"
                            aria-label="Voir plus"
                          >
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
          <span>Affichage de {filteredDocuments.length} sur {documents.length} fichiers</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
