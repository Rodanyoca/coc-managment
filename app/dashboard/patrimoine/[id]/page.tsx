"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Car,
  Laptop,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Hash,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { use } from "react"

const patrimoine: Record<string, {
  id: string
  libelle: string
  categorie: string
  nombre: number
  valeur: number
  dateAcquisition: string
  etat: string
  description: string
  localisation: string
  responsable: string
  numeroSerie: string
  historique: { date: string; action: string; par: string }[]
  documents: { nom: string; type: string; date: string }[]
}> = {
  "1": {
    id: "1",
    libelle: "Siège COC - Immeuble administratif",
    categorie: "Immobilier",
    nombre: 1,
    valeur: 350000,
    dateAcquisition: "15/03/2015",
    etat: "bon",
    description: "Immeuble de 3 étages situé au centre-ville de Kinshasa, abritant les bureaux administratifs du COC. Surface totale de 1500m², comprenant 25 bureaux, 3 salles de réunion et un auditorium de 100 places.",
    localisation: "Avenue de la Libération, Gombe, Kinshasa",
    responsable: "Direction Générale",
    numeroSerie: "TITRE-KIN-2015-0342",
    historique: [
      { date: "15/03/2015", action: "Acquisition du bien", par: "Direction Générale" },
      { date: "10/06/2018", action: "Rénovation complète", par: "Service Patrimoine" },
      { date: "22/01/2024", action: "Mise à jour inventaire", par: "Admin COC" },
    ],
    documents: [
      { nom: "Titre de propriété.pdf", type: "pdf", date: "15/03/2015" },
      { nom: "Plan architectural.pdf", type: "pdf", date: "10/06/2018" },
      { nom: "Photos immeuble.zip", type: "zip", date: "22/01/2024" },
    ],
  },
  "3": {
    id: "3",
    libelle: "Toyota Land Cruiser V8",
    categorie: "Véhicules",
    nombre: 2,
    valeur: 65000,
    dateAcquisition: "10/01/2023",
    etat: "bon",
    description: "Véhicules tout-terrain utilisés pour les déplacements officiels et le transport des délégations sportives. Équipés de climatisation, GPS et système de communication.",
    localisation: "Garage COC, Gombe",
    responsable: "Service Logistique",
    numeroSerie: "KIN-2023-LC001, KIN-2023-LC002",
    historique: [
      { date: "10/01/2023", action: "Acquisition du bien", par: "Service Logistique" },
      { date: "15/07/2023", action: "Entretien 10 000 km", par: "Service Logistique" },
      { date: "20/01/2024", action: "Entretien 20 000 km", par: "Service Logistique" },
    ],
    documents: [
      { nom: "Facture achat.pdf", type: "pdf", date: "10/01/2023" },
      { nom: "Carte grise.pdf", type: "pdf", date: "15/01/2023" },
      { nom: "Assurance 2024.pdf", type: "pdf", date: "01/01/2024" },
    ],
  },
}

const categorieConfig: Record<string, { icon: React.ElementType; className: string }> = {
  "Immobilier": { icon: Building2, className: "bg-chart-1/10 text-chart-1" },
  "Véhicules": { icon: Car, className: "bg-chart-2/10 text-chart-2" },
  "Équipements IT": { icon: Laptop, className: "bg-chart-3/10 text-chart-3" },
  "Matériel sportif": { icon: Package, className: "bg-chart-4/10 text-chart-4" },
}

const etatConfig = {
  bon: { label: "Bon état", className: "bg-coc-green/10 text-coc-green border-coc-green/30" },
  moyen: { label: "État moyen", className: "bg-chart-2/10 text-chart-2 border-chart-2/30" },
  mauvais: { label: "Mauvais état", className: "bg-destructive/10 text-destructive border-destructive/30" },
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

export default function PatrimoineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const item = patrimoine[resolvedParams.id] || patrimoine["1"]
  
  const catConfig = categorieConfig[item.categorie]
  const CatIcon = catConfig?.icon || Package
  const etat = etatConfig[item.etat as keyof typeof etatConfig]

  return (
    <div className="min-h-screen">
      <Header 
        title="Détails du bien" 
        subtitle={item.libelle}
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/patrimoine">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;inventaire
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn("rounded-xl p-4", catConfig?.className)}>
                    <CatIcon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">{item.libelle}</h2>
                      <Badge variant="outline" className={cn("text-xs", etat.className)}>
                        {etat.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        {item.numeroSerie}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {item.localisation}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="informations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="informations">Informations</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="historique">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="informations" className="mt-4">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Catégorie</p>
                          <p className="font-medium flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{item.categorie}</Badge>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quantité</p>
                          <p className="font-medium mt-1">{item.nombre} unité(s)</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date d&apos;acquisition</p>
                          <p className="font-medium flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {item.dateAcquisition}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Valeur estimée</p>
                          <p className="font-medium flex items-center gap-2 mt-1 text-lg text-primary">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(item.valeur)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Responsable</p>
                          <p className="font-medium flex items-center gap-2 mt-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {item.responsable}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Localisation</p>
                          <p className="font-medium flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {item.localisation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {item.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg p-2 bg-primary/10 text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.nom}</p>
                              <p className="text-xs text-muted-foreground">Ajouté le {doc.date}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Télécharger
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historique" className="mt-4">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {item.historique.map((h, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="rounded-full p-2 bg-primary/10 text-primary">
                              <Clock className="h-4 w-4" />
                            </div>
                            {index < item.historique.length - 1 && (
                              <div className="flex-1 w-px bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-sm">{h.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {h.date} par {h.par}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Résumé financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valeur unitaire</span>
                  <span className="font-medium">{formatCurrency(item.valeur / item.nombre)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantité</span>
                  <span className="font-medium">{item.nombre}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Valeur totale</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(item.valeur)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Générer fiche inventaire
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Planifier maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <DollarSign className="h-4 w-4" />
                  Mettre à jour valeur
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
