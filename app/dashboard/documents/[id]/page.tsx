"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Image, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

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

export default function DocumentDetailPage() {
  const params = useParams()
  const id = params.id as string

  const doc = documents.find((d) => d.id === id)

  if (!doc) {
    return (
      <div className="min-h-screen">
        <Header title="Document introuvable" subtitle="" />
        <div className="p-6">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center space-y-4">
              <p className="text-muted-foreground">Aucun document trouvé pour l&apos;ID {id}.</p>
              <Link href="/dashboard/documents">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la liste
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title={doc.nom} subtitle="Détails du fichier" />

      <div className="p-6 space-y-6">
        <Link href="/dashboard/documents">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Aperçu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {doc.type === "pdf" ? (
                    <FileText className="h-5 w-5 text-destructive" />
                  ) : (
                    <Image className="h-5 w-5 text-chart-4" />
                  )}
                  <p className="text-muted-foreground">{doc.type === "pdf" ? "Document PDF" : "Image"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Module</p>
                  <Badge variant="outline" className="text-xs">
                    {doc.module}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Entité liée</p>
                  <p className="text-sm font-medium">{doc.entite}</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Date d&apos;ajout</p>
                  <p className="text-sm font-medium">{doc.dateAjout}</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Taille</p>
                  <p className="text-sm font-medium">{doc.taille}</p>
                </div>

                <Separator />

                <Button variant="outline" className="w-full" asChild>
                  <a href={doc.driveLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ID</p>
                  <p className="font-mono text-sm">{doc.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
