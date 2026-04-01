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
import { ArrowLeft, Upload, FileText, Image, X, Check, File } from "lucide-react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const modules = [
  { value: "acteurs", label: "Acteurs" },
  { value: "competitions", label: "Compétitions" },
  { value: "courriers", label: "Courriers" },
  { value: "activites", label: "Activités" },
  { value: "patrimoine", label: "Patrimoine" },
]

export default function NouveauDocumentPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [module, setModule] = useState("")
  const [entite, setEntite] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-chart-4" />
    }
    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-destructive" />
    }
    return <File className="h-5 w-5 text-muted-foreground" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    // Simulation d'upload
    setTimeout(() => {
      setIsUploading(false)
      // Redirect would happen here
    }, 2000)
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Ajouter un fichier" 
        subtitle="Uploader un nouveau document ou image"
      />
      
      <div className="p-6">
        <div className="mb-6">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Zone d'upload */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Fichiers à uploader</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full p-4 bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Glissez-déposez vos fichiers ici
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ou cliquez pour sélectionner
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, Images, Word, Excel (max 10 MB par fichier)
                  </p>
                </div>
              </div>

              {/* Liste des fichiers uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Fichiers sélectionnés ({uploadedFiles.length})
                  </p>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getFileIcon(file)}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations du document */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="module">Module associé</Label>
                  <Select value={module} onValueChange={setModule}>
                    <SelectTrigger id="module">
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((mod) => (
                        <SelectItem key={mod.value} value={mod.value}>
                          {mod.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entite">Entité liée</Label>
                  <Input
                    id="entite"
                    placeholder="Ex: COC, Jean Makala, JO Paris..."
                    value={entite}
                    onChange={(e) => setEntite(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Ajoutez une description pour ce(s) fichier(s)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/documents">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 min-w-[140px]"
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
