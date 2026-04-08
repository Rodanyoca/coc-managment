"use client"

import { Header } from "@/components/dashboard/header"
import { MediaUploadDialog } from "@/components/dashboard/media-upload-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Download,
  Edit,
  Trash2,
  Link2,
  ExternalLink,
  Calendar,
  User,
  Building,
  Tag,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

export type CourrierDetail = {
  id: string
  code: string
  reference: string
  objet: string
  expediteur: string
  destinataire: string
  dateReception: string
  dateCreation: string
  sens: "entrant" | "sortant"
  categorie: string
  statut: "traite" | "en_attente" | "non_traite"
  pdfUrl: string | null
  contenu: string
  responsable: string
  notes: string
}

const statutConfig = {
  traite: { label: "Traité", className: "bg-coc-green/10 text-coc-green" },
  en_attente: { label: "En attente", className: "bg-chart-2/10 text-chart-2" },
  non_traite: { label: "Non traité", className: "bg-destructive/10 text-destructive" },
}

export default function CourrierDetailClient(props: { courrier: CourrierDetail }) {
  const courrier = props.courrier
  const router = useRouter()
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null)
  const currentPdfUrl = uploadedPdfUrl || courrier.pdfUrl

  const identityFields = [
    { label: "Code", value: courrier.code },
    { label: "Référence", value: courrier.reference || "-" },
    { label: "Objet", value: courrier.objet || "-" },
    { label: "Expéditeur", value: courrier.expediteur || "-" },
    { label: "Date", value: courrier.dateReception || "-" },
  ]

  return (
    <div className="min-h-screen">
      <Header title={`Courrier #${courrier.code}`} subtitle={courrier.reference} />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Link href="/dashboard/courriers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-full p-2",
                        courrier.sens === "entrant"
                          ? "bg-coc-green/10 text-coc-green"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {courrier.sens === "entrant" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {courrier.sens === "entrant" ? "Courrier entrant" : "Courrier sortant"}
                      </p>
                      <CardTitle className="text-xl">{courrier.objet}</CardTitle>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0", statutConfig[courrier.statut].className)}
                  >
                    {statutConfig[courrier.statut].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {courrier.sens === "entrant" ? "Expéditeur" : "Destinataire"}
                      </p>
                      <p className="font-medium">
                        {courrier.sens === "entrant" ? courrier.expediteur : courrier.destinataire}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {courrier.sens === "entrant" ? "Destinataire" : "Expéditeur"}
                      </p>
                      <p className="font-medium">
                        {courrier.sens === "entrant" ? courrier.destinataire : courrier.expediteur}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date de réception</p>
                      <p className="font-medium">{courrier.dateReception}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Catégorie</p>
                      <Badge variant="outline">{courrier.categorie}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Contenu du courrier</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-muted-foreground leading-relaxed">{courrier.contenu}</p>
                  </div>
                </div>

                {courrier.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Notes et suivi</h3>
                      <div className="bg-chart-2/5 border border-chart-2/20 rounded-lg p-4">
                        <p className="text-muted-foreground">{courrier.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPdfUrl ? (
                  <div className="space-y-3">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-center">
                      <FileText className="h-12 w-12 mx-auto text-destructive mb-2" />
                      <p className="text-sm font-medium">courrier-{courrier.code}.pdf</p>
                      <p className="text-xs text-muted-foreground">PDF attaché</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir
                        </a>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <a href={currentPdfUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                    <MediaUploadDialog
                      mediaType="courrier"
                      title="Remplacer le PDF"
                      courrierCode={courrier.code}
                      identityFields={identityFields}
                      trigger={
                        <Button variant="outline" className="w-full">
                          <Link2 className="h-4 w-4 mr-2" />
                          Remplacer
                        </Button>
                      }
                      onSuccess={({ url }) => {
                        setUploadedPdfUrl(url)
                        router.refresh()
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-muted/50 border border-dashed border-border rounded-lg p-6 text-center">
                      <Link2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Aucun PDF attaché</p>
                      <p className="text-xs text-muted-foreground">Liez un document PDF à ce courrier</p>
                    </div>
                    <MediaUploadDialog
                      mediaType="courrier"
                      title="Lier un PDF au courrier"
                      courrierCode={courrier.code}
                      identityFields={identityFields}
                      trigger={
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <Link2 className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      }
                      onSuccess={({ url }) => {
                        setUploadedPdfUrl(url)
                        router.refresh()
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Responsable</p>
                  <p className="font-medium text-sm">{courrier.responsable || "Non assigné"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Référence complète</p>
                  <p className="font-mono text-sm">{courrier.reference}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
