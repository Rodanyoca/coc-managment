"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Camera, FileText, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import { ReactNode, useCallback, useRef, useState } from "react"

const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg,.webp"
const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const MAX_SIZE_MB = 2
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

interface InfoField {
  label: string
  value: string | ReactNode
  icon?: ReactNode
}

interface ActorDetailLayoutProps {
  backHref: string
  backLabel: string
  title: string
  subtitle?: string
  avatarInitials: string
  avatarColorClass: string
  avatarUrl?: string | null
  actorType?: string
  actorId?: string
  actorDateNaissance?: string
  actorSexe?: string
  status: "actif" | "inactif"
  mainInfo: InfoField[]
  contactInfo?: InfoField[]
  additionalSections?: {
    id: string
    label: string
    content: ReactNode
  }[]
  documents?: {
    name: string
    type: string
    date: string
  }[]
  children?: ReactNode
}

export function ActorDetailLayout({
  backHref,
  backLabel,
  title,
  subtitle,
  avatarInitials,
  avatarColorClass,
  avatarUrl,
  actorType,
  actorId,
  actorDateNaissance,
  actorSexe,
  status,
  mainInfo,
  contactInfo,
  additionalSections = [],
  documents = [],
  children,
}: ActorDetailLayoutProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentAvatarUrl = uploadedUrl || avatarUrl || null

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploadError("Format non supporté. Utilisez PNG, JPG ou WebP.")
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`Le fichier dépasse ${MAX_SIZE_MB} Mo.`)
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !actorType || !actorId) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("actorType", actorType)
      formData.append("actorId", actorId)

      const res = await fetch("/api/upload-photo", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || "Erreur lors de l'upload")
        return
      }

      setUploadedUrl(data.url)
      setDialogOpen(false)
      setSelectedFile(null)
      setPreview(null)
    } catch {
      setUploadError("Erreur réseau. Veuillez réessayer.")
    } finally {
      setUploading(false)
    }
  }, [selectedFile, actorType, actorId])

  const resetDialog = useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
    setUploadError(null)
  }, [])

  return (
    <div className="min-h-screen">
      <Header title={title} subtitle={subtitle} />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-2 mb-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card - Profile */}
          <Card className="lg:col-span-1 border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  {currentAvatarUrl && (
                    <AvatarImage src={currentAvatarUrl} alt={title} />
                  )}
                  <AvatarFallback className={`${avatarColorClass} text-2xl`}>
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{title}</h2>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                <Badge
                  variant="secondary"
                  className={`mt-3 ${
                    status === "actif"
                      ? "bg-coc-green/10 text-coc-green"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status === "actif" ? "Actif" : "Inactif"}
                </Badge>

                {/* ID, Nom, Date de naissance */}
                <div className="mt-4 w-full space-y-1 text-sm">
                  {actorId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID</span>
                      <span className="font-medium font-mono text-xs">{actorId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{title}</span>
                  </div>
                  {actorDateNaissance && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de naissance</span>
                      <span className="font-medium">{actorDateNaissance}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6 w-full">
                  <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetDialog() }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 gap-2">
                        <Camera className="h-4 w-4" />
                        {currentAvatarUrl ? "Changer la photo" : "Ajouter la photo"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Photo de profil</DialogTitle>
                        <DialogDescription>
                          Formats acceptés : PNG, JPG, JPEG, WebP — Taille max : {MAX_SIZE_MB} Mo
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Fiche d'identification */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Vérification de l'identité</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {actorId && (
                              <>
                                <span className="text-muted-foreground">ID</span>
                                <span className="font-medium font-mono text-xs">{actorId}</span>
                              </>
                            )}
                            <span className="text-muted-foreground">Nom</span>
                            <span className="font-medium">{title}</span>
                            {actorDateNaissance && (
                              <>
                                <span className="text-muted-foreground">Date de naissance</span>
                                <span className="font-medium">{actorDateNaissance}</span>
                              </>
                            )}
                            {actorSexe && (
                              <>
                                <span className="text-muted-foreground">Sexe</span>
                                <span className="font-medium">{actorSexe === "M" ? "Homme" : actorSexe === "F" ? "Femme" : actorSexe}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {!preview ? (
                          <div
                            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                            <p className="font-medium text-sm">Cliquez pour sélectionner un fichier</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG, JPEG ou WebP — max {MAX_SIZE_MB} Mo
                            </p>
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={preview}
                              alt="Aperçu"
                              className="w-full max-h-64 object-contain rounded-lg border border-border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7"
                              onClick={resetDialog}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                              {selectedFile?.name} ({(selectedFile?.size ?? 0 / 1024 / 1024).toFixed(1)} Ko)
                            </p>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED_EXTENSIONS}
                          className="hidden"
                          onChange={handleFileSelect}
                        />

                        {uploadError && (
                          <p className="text-sm text-destructive">{uploadError}</p>
                        )}

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => { setDialogOpen(false); resetDialog() }}>
                            Annuler
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            className="gap-2"
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Envoi...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Envoyer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Contact Info */}
              {contactInfo && contactInfo.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      {info.icon && <span className="text-muted-foreground">{info.icon}</span>}
                      <div>
                        <p className="text-muted-foreground text-xs">{info.label}</p>
                        <p className="font-medium">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Tabs */}
          <Card className="lg:col-span-2 border-border/50">
            <Tabs defaultValue="infos" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="infos">Informations</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  {additionalSections.length > 0 && (
                    <TabsTrigger value={additionalSections[0].id}>
                      {additionalSections[0].label}
                    </TabsTrigger>
                  )}
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="infos" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mainInfo.map((info, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm text-muted-foreground">{info.label}</p>
                        <p className="font-medium">{info.value}</p>
                      </div>
                    ))}
                  </div>
                  {children}
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type} - {doc.date}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Aucun document disponible</p>
                    </div>
                  )}
                </TabsContent>

                {additionalSections.map((section) => (
                  <TabsContent key={section.id} value={section.id} className="mt-0">
                    {section.content}
                  </TabsContent>
                ))}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
