"use client"

import { Header } from "@/components/dashboard/header"
import { MediaUploadDialog } from "@/components/dashboard/media-upload-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, FileText, Link2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type CourrierInfo = {
  code: string
  reference: string
  objet: string
  expediteur: string
  dateCourrier: string
}

export default function LierPdfClient(props: {
  code: string
  courrier: CourrierInfo | null
}) {
  const { code, courrier } = props
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  if (!courrier) {
    return (
      <div className="min-h-screen">
        <Header title="Courrier non trouvé" subtitle="" />
        <div className="p-6">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Courrier introuvable</h2>
              <p className="text-muted-foreground mb-4">
                Le courrier avec le code {code} n&apos;existe pas.
              </p>
              <Link href="/dashboard/courriers">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la liste
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const identityFields = [
    { label: "Code", value: courrier.code },
    { label: "Référence", value: courrier.reference || "-" },
    { label: "Objet", value: courrier.objet || "-" },
    { label: "Expéditeur", value: courrier.expediteur || "-" },
    { label: "Date", value: courrier.dateCourrier || "-" },
  ]

  return (
    <div className="min-h-screen">
      <Header
        title="Lier un PDF"
        subtitle={`Courrier #${code} — ${courrier.reference}`}
      />

      <div className="p-6 space-y-6">
        <Link href={`/dashboard/courriers/${code}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au courrier
          </Button>
        </Link>

        <div className="max-w-md mx-auto">
          {uploadedUrl ? (
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="rounded-lg border border-coc-green/30 bg-coc-green/5 p-4 text-center">
                  <FileText className="h-10 w-10 mx-auto text-coc-green mb-2" />
                  <p className="font-medium text-sm">PDF lié avec succès</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le document a été attaché au courrier #{code}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir le PDF
                    </a>
                  </Button>
                  <Link href={`/dashboard/courriers/${code}`} className="flex-1">
                    <Button className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour au courrier
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-3">
              <Link href={`/dashboard/courriers/${code}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
              <MediaUploadDialog
                mediaType="courrier"
                title="Lier un PDF au courrier"
                courrierCode={code}
                identityFields={identityFields}
                trigger={
                  <Button className="flex-1 gap-2">
                    <Link2 className="h-4 w-4" />
                    Sélectionner le PDF
                  </Button>
                }
                onSuccess={({ url }) => setUploadedUrl(url)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
