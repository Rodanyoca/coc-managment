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
import { Search, FileText, Folder, HardDrive, Eye, ExternalLink } from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

export type DocumentItem = {
  id: string
  nom: string
  moduleSource: string
  entiteLie: string
  taille: string
  type: string
  note: string
  urlDriveDocument: string
  idDriveDocument: string
}

function parseSizeToMB(size: string): number {
  const value = Number(size.replace(/[^0-9.]/g, ""))
  if (Number.isNaN(value)) return 0
  const lower = size.toLowerCase()
  if (lower.includes("kb") || lower.includes("ko")) return value / 1024
  if (lower.includes("gb") || lower.includes("go")) return value * 1024
  return value
}

export default function DocumentsClient(props: { items: DocumentItem[] }) {
  const items = props.items ?? []

  const [searchQuery, setSearchQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("Tous")
  const [typeFilter, setTypeFilter] = useState("Tous")

  const modules = useMemo(() => {
    const set = new Set(items.map((d) => d.moduleSource).filter(Boolean))
    return ["Tous", ...Array.from(set).sort()]
  }, [items])

  const types = useMemo(() => {
    const set = new Set(items.map((d) => d.type).filter(Boolean))
    return ["Tous", ...Array.from(set).sort()]
  }, [items])

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return items.filter((doc) => {
      const matchesSearch =
        q.length === 0 ||
        doc.nom.toLowerCase().includes(q) ||
        doc.entiteLie.toLowerCase().includes(q)
      const matchesModule = moduleFilter === "Tous" || doc.moduleSource === moduleFilter
      const matchesType = typeFilter === "Tous" || doc.type === typeFilter
      return matchesSearch && matchesModule && matchesType
    })
  }, [items, searchQuery, moduleFilter, typeFilter])

  const stats = useMemo(() => {
    const totalFichiers = items.length
    const modulesCount = new Set(items.map((d) => d.moduleSource).filter(Boolean)).size
    const totalStorageMB = items.reduce((sum, d) => sum + parseSizeToMB(d.taille), 0)
    return { totalFichiers, modulesCount, totalStorageMB }
  }, [items])

  return (
    <div className="min-h-screen">
      <Header title="Documents & Médias" subtitle="Vue transverse de tous les fichiers" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg p-3 bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalFichiers}</p>
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
                <p className="text-2xl font-bold">{stats.modulesCount}</p>
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
                <p className="text-2xl font-bold">{stats.totalStorageMB.toFixed(1)} MB</p>
                <p className="text-sm text-muted-foreground">Stockage</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Entité liée</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <span className="font-medium">{doc.nom || "-"}</span>
                    </TableCell>
                    <TableCell>
                      {doc.type ? (
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {doc.moduleSource ? (
                        <Badge variant="secondary" className="text-xs">{doc.moduleSource}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.entiteLie || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.taille || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir plus" aria-label="Voir plus">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {doc.urlDriveDocument && (
                          <a href={doc.urlDriveDocument} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Ouvrir dans Drive" aria-label="Ouvrir dans Drive">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucun document trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Affichage de {filteredItems.length} sur {items.length} fichiers</span>
        </div>
      </div>
    </div>
  )
}
