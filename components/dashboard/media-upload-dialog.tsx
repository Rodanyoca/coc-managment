"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, FileText, Loader2, Upload, X } from "lucide-react"
import { Fragment, ReactNode, useCallback, useRef, useState } from "react"

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

type MediaTypeKey = "avatar" | "passeport" | "courrier" | "document"

const MEDIA_CONFIGS: Record<
  MediaTypeKey,
  { acceptedMime: string[]; acceptedExtensions: string; formatLabel: string }
> = {
  avatar: {
    acceptedMime: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    acceptedExtensions: ".png,.jpg,.jpeg,.webp",
    formatLabel: "PNG, JPG, JPEG ou WebP",
  },
  passeport: {
    acceptedMime: ["application/pdf"],
    acceptedExtensions: ".pdf",
    formatLabel: "PDF",
  },
  courrier: {
    acceptedMime: ["application/pdf"],
    acceptedExtensions: ".pdf",
    formatLabel: "PDF",
  },
  document: {
    acceptedMime: ["application/pdf"],
    acceptedExtensions: ".pdf",
    formatLabel: "PDF",
  },
}

interface MediaUploadDialogProps {
  mediaType: MediaTypeKey
  title: string
  description?: string
  actorType?: string
  actorId?: string
  courrierCode?: string
  identityFields?: { label: string; value: string }[]
  trigger: ReactNode
  onSuccess?: (result: { fileId: string; url: string }) => void
}

export function MediaUploadDialog({
  mediaType,
  title,
  description,
  actorType,
  actorId,
  courrierCode,
  identityFields,
  trigger,
  onSuccess,
}: MediaUploadDialogProps) {
  const config = MEDIA_CONFIGS[mediaType]
  const isImage = mediaType === "avatar"

  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setFile(null)
    setPreview(null)
    setError(null)
    setSuccess(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const f = e.target.files?.[0]
      if (!f) return

      if (!config.acceptedMime.includes(f.type)) {
        setError(`Format non supporté. Utilisez ${config.formatLabel}.`)
        return
      }
      if (f.size > MAX_SIZE_BYTES) {
        setError(`Le fichier dépasse ${MAX_SIZE_MB} Mo.`)
        return
      }

      setFile(f)
      if (isImage) {
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target?.result as string)
        reader.readAsDataURL(f)
      }
    },
    [config, isImage]
  )

  const handleUpload = useCallback(async () => {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mediaType", mediaType)
      if (actorType) formData.append("actorType", actorType)
      if (actorId) formData.append("actorId", actorId)
      if (courrierCode) formData.append("courrierCode", courrierCode)

      const res = await fetch("/api/upload-media", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload")
        return
      }

      setSuccess(true)
      onSuccess?.({ fileId: data.fileId, url: data.url })

      setTimeout(() => {
        setOpen(false)
        reset()
      }, 1200)
    } catch {
      setError("Erreur réseau. Veuillez réessayer.")
    } finally {
      setUploading(false)
    }
  }, [file, mediaType, actorType, actorId, courrierCode, onSuccess, reset])

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ||
              `Formats acceptés : ${config.formatLabel} — Taille max : ${MAX_SIZE_MB} Mo`}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-6">
            <div className="rounded-full bg-coc-green/10 p-4 mb-3">
              <Check className="h-6 w-6 text-coc-green" />
            </div>
            <p className="font-medium">Fichier envoyé avec succès</p>
          </div>
        ) : (
          <div className="space-y-4">
            {identityFields && identityFields.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Vérification
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {identityFields.map((f, i) => (
                    <Fragment key={i}>
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-medium truncate" title={f.value}>{f.value}</span>
                    </Fragment>
                  ))}
                </div>
              </div>
            )}

            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-sm">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.formatLabel} — max {MAX_SIZE_MB} Mo
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {isImage && preview ? (
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
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border p-4 overflow-hidden">
                    <div className="shrink-0 rounded-lg bg-destructive/10 p-2">
                      <FileText className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} Mo
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={config.acceptedExtensions}
              className="hidden"
              onChange={handleFileSelect}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  reset()
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
