"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  X,
  Check,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

// Données simulées
const courriersData: Record<string, {
  code: string
  reference: string
  objet: string
}> = {
  "001": { code: "001", reference: "COC/2026/001", objet: "Convocation Assemblée Générale CIO" },
  "002": { code: "002", reference: "COC/2026/002", objet: "Demande de subvention annuelle" },
  "003": { code: "003", reference: "COC/2026/003", objet: "Accréditation Jeux Olympiques 2028" },
  "004": { code: "004", reference: "COC/2026/004", objet: "Rapport mission Lausanne" },
  "005": { code: "005", reference: "COC/2026/005", objet: "Invitation Séminaire Olympique Africain" },
  "006": { code: "006", reference: "COC/2026/006", objet: "Confirmation participation Jeux Africains" },
  "007": { code: "007", reference: "COC/2026/007", objet: "Demande d'équipements sportifs" },
  "008": { code: "008", reference: "COC/2026/008", objet: "Convocation réunion du Bureau Exécutif" },
}

export default function LierPdfPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const courrier = courriersData[code]

  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      } else {
        setError("Seuls les fichiers PDF sont acceptés")
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
      } else {
        setError("Seuls les fichiers PDF sont acceptés")
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError(null)

    // Simulation d'upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setUploading(false)
    setSuccess(true)

    // Redirection après succès
    setTimeout(() => {
      router.push(`/dashboard/courriers/${code}`)
    }, 1500)
  }

  if (!courrier) {
    return (
      <div className="min-h-screen">
        <Header title="Courrier non trouvé" subtitle="" />
        <div className="p-6">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Courrier introuvable</h2>
              <p className="text-muted-foreground mb-4">Le courrier avec le code {code} n&apos;existe pas.</p>
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

  if (success) {
    return (
      <div className="min-h-screen">
        <Header title="Lier un PDF" subtitle={`Courrier #${code}`} />
        <div className="p-6">
          <Card className="border-border/50 max-w-xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="rounded-full bg-coc-green/10 p-4 w-fit mx-auto mb-4">
                <Check className="h-8 w-8 text-coc-green" />
              </div>
              <h2 className="text-xl font-semibold mb-2">PDF lié avec succès</h2>
              <p className="text-muted-foreground mb-4">
                Le document a été attaché au courrier #{code}.
              </p>
              <p className="text-sm text-muted-foreground">Redirection en cours...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Lier un PDF"
        subtitle={`Courrier #${code} - ${courrier.reference}`}
      />
      
      <div className="p-6 space-y-6">
        {/* Navigation */}
        <Link href={`/dashboard/courriers/${code}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au courrier
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Attacher un document PDF</CardTitle>
              <CardDescription>
                Liez un fichier PDF au courrier &quot;{courrier.objet}&quot;
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info courrier */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono font-bold text-primary">{courrier.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Référence:</span>
                      <span className="font-mono">{courrier.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Objet:</span>
                      <span className="truncate max-w-[250px]">{courrier.objet}</span>
                    </div>
                  </div>
                </div>

                {/* Zone de dépôt */}
                <div className="space-y-2">
                  <Label>Fichier PDF</Label>
                  
                  {!file ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragActive 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      )}
                    >
                      <Input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-4">
                        <div className="rounded-full bg-muted p-4 w-fit mx-auto">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Glissez-déposez votre PDF ici
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ou cliquez pour sélectionner un fichier
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Format accepté: PDF uniquement (max. 10 Mo)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-destructive/10 p-3">
                          <FileText className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} Mo
                          </p>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={handleRemoveFile}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Link href={`/dashboard/courriers/${code}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Annuler
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={!file || uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="animate-spin mr-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Lier le PDF
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
