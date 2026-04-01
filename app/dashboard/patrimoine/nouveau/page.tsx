"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Upload, Building2, Car, Laptop, Package, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const categories = [
  { value: "immobilier", label: "Immobilier", icon: Building2 },
  { value: "vehicules", label: "Véhicules", icon: Car },
  { value: "equipements-it", label: "Équipements IT", icon: Laptop },
  { value: "materiel-sportif", label: "Matériel sportif", icon: Package },
]

const etats = [
  { value: "bon", label: "Bon état" },
  { value: "moyen", label: "État moyen" },
  { value: "mauvais", label: "Mauvais état" },
]

export default function NouveauPatrimoinePage() {
  const [selectedCategorie, setSelectedCategorie] = useState("")
  const [documents, setDocuments] = useState<File[]>([])

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)])
    }
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Nouveau bien" 
        subtitle="Ajouter un bien au patrimoine du COC"
      />
      
      <div className="p-6">
        <div className="mb-6">
          <Link href="/dashboard/patrimoine">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;inventaire
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé du bien *</Label>
                <Input
                  id="libelle"
                  placeholder="Ex: Toyota Land Cruiser V8"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedCategorie(cat.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                          selectedCategorie === cat.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn(
                          "h-6 w-6",
                          selectedCategorie === cat.value ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          selectedCategorie === cat.value ? "text-primary" : "text-foreground"
                        )}>
                          {cat.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité *</Label>
                  <Input
                    id="quantite"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valeur">Valeur (USD) *</Label>
                  <Input
                    id="valeur"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateAcquisition">Date d&apos;acquisition *</Label>
                  <Input
                    id="dateAcquisition"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etat">État *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'état" />
                    </SelectTrigger>
                    <SelectContent>
                      {etats.map((etat) => (
                        <SelectItem key={etat.value} value={etat.value}>
                          {etat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description détaillée du bien..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Localisation et responsable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="localisation">Localisation</Label>
                  <Input
                    id="localisation"
                    placeholder="Ex: Siège COC, Bureau 201"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable</Label>
                  <Input
                    id="responsable"
                    placeholder="Nom du responsable"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroSerie">Numéro de série / Immatriculation</Label>
                <Input
                  id="numeroSerie"
                  placeholder="Ex: ABC-123-XY ou SN-12345678"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Documents justificatifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Glissez-déposez vos fichiers ici
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Factures, bons de commande, photos (PDF, JPG, PNG - Max 10MB)
                    </p>
                  </div>
                  <label htmlFor="document-upload">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Parcourir</span>
                    </Button>
                    <input
                      id="document-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                  </label>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="text-sm truncate">{doc.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/patrimoine">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer le bien
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
