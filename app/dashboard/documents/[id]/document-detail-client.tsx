"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Image, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

export type DocumentDetail = {
  id: string
  nom: string
  type: string
  module: string
  entite: string
  taille: string
  note: string
  driveUrl: string | null
}

export default function DocumentDetailClient({ doc }: { doc: DocumentDetail }) {
  const isPdf = (doc.type || "").toLowerCase().includes("pdf")
  const isImage = (doc.type || "").toLowerCase().match(/image|jpg|jpeg|png|webp/)

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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {isPdf ? (
                      <FileText className="h-5 w-5 text-destructive" />
                    ) : (
                      <Image className="h-5 w-5 text-chart-4" />
                    )}
                    <p className="text-muted-foreground">
                      {isPdf ? "Document PDF" : isImage ? "Image" : doc.type || "Fichier"}
                    </p>
                  </div>

                  {doc.driveUrl ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.driveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.driveUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  )}
                </div>

                {isPdf && doc.driveUrl ? (
                  <div className="mt-4 overflow-hidden rounded-lg border border-border/50 bg-muted/20">
                    <iframe
                      title={`Aperçu PDF - ${doc.nom}`}
                      src={`https://drive.google.com/file/d/${doc.driveUrl.match(/[-\w]{25,}/)?.[0] || ""}/preview`}
                      className="h-[80vh] min-h-[560px] w-full"
                    />
                  </div>
                ) : (
                  <div className="mt-4 overflow-hidden rounded-lg border border-border/50 bg-muted/20 h-[40vh] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Aucun aperçu disponible</p>
                  </div>
                )}
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

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nom</p>
                  <p className="text-sm font-medium break-all">{doc.nom}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Module source</p>
                  <Badge variant="outline" className="text-xs">
                    {doc.module || "-"}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Entité liée</p>
                  <p className="text-sm font-medium">{doc.entite || "-"}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm font-medium">{doc.type || "-"}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Taille</p>
                  <p className="text-sm">{doc.taille || "-"}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-sm text-muted-foreground">
                      {doc.note || "Aucune note"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
