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
import { ArrowLeft, Save, Trophy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function NouvelleCompetitionPage() {
  const [formData, setFormData] = useState({
    nom: "",
    type: "",
    pays: "",
    ville: "",
    lieu: "",
    dateDebut: "",
    dateFin: "",
    description: "",
    budget: "",
    contact: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logique de soumission
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Nouvelle competition" 
        subtitle="Ajouter une nouvelle competition"
      />
      
      <div className="p-6 space-y-6">
        <Link href="/dashboard/competitions">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour a la liste
          </Button>
        </Link>

        <form onSubmit={handleSubmit}>
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <CardTitle>Informations de la competition</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la competition *</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Jeux Olympiques Paris 2024"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="olympique">Olympique</SelectItem>
                      <SelectItem value="continental">Continental</SelectItem>
                      <SelectItem value="mondial">Mondial</SelectItem>
                      <SelectItem value="francophonie">Francophonie</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pays">Pays *</Label>
                  <Input
                    id="pays"
                    placeholder="Ex: France"
                    value={formData.pays}
                    onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    placeholder="Ex: Paris"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lieu">Lieu / Stade</Label>
                  <Input
                    id="lieu"
                    placeholder="Ex: Stade de France"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateDebut">Date de debut *</Label>
                  <Input
                    id="dateDebut"
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFin">Date de fin *</Label>
                  <Input
                    id="dateFin"
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget previsionnel</Label>
                  <Input
                    id="budget"
                    placeholder="Ex: 150 000 USD"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Email de contact</Label>
                  <Input
                    id="contact"
                    type="email"
                    placeholder="Ex: contact@competition.com"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de la competition..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/dashboard/competitions">
                  <Button variant="outline">Annuler</Button>
                </Link>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
