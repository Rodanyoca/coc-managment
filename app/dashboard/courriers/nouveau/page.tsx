"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  X,
  Check,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

const categories = ["Institutionnel", "Financier", "Compétitions", "Rapport", "Événement", "Logistique"]

export default function NouveauCourrierPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    code: "",
    sens: "",
    objet: "",
    expediteur: "",
    destinataire: "",
    categorie: "",
    contenu: "",
    responsable: "",
    notes: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.code || formData.code.length !== 3 || !/^\d{3}$/.test(formData.code)) {
      newErrors.code = "Le code doit être composé de 3 chiffres"
    }
    if (!formData.sens) newErrors.sens = "Veuillez sélectionner le sens"
    if (!formData.objet) newErrors.objet = "L'objet est obligatoire"
    if (!formData.expediteur) newErrors.expediteur = "L'expéditeur est obligatoire"
    if (!formData.destinataire) newErrors.destinataire = "Le destinataire est obligatoire"
    if (!formData.categorie) newErrors.categorie = "La catégorie est obligatoire"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)

    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitting(false)
    setSuccess(true)

    // Redirection après succès
    setTimeout(() => {
      router.push(`/dashboard/courriers/${formData.code}`)
    }, 1500)
  }

  if (success) {
    return (
      <div className="min-h-screen">
        <Header title="Nouveau courrier" subtitle="" />
        <div className="p-6">
          <Card className="border-border/50 max-w-xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="rounded-full bg-coc-green/10 p-4 w-fit mx-auto mb-4">
                <Check className="h-8 w-8 text-coc-green" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Courrier créé avec succès</h2>
              <p className="text-muted-foreground mb-4">
                Le courrier #{formData.code} a été enregistré.
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
        title="Nouveau courrier"
        subtitle="Enregistrer un nouveau courrier"
      />
      
      <div className="p-6 space-y-6">
        {/* Navigation */}
        <Link href="/dashboard/courriers">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Informations principales */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
              <CardDescription>Renseignez les informations de base du courrier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Code (3 chiffres) *</Label>
                  <Input
                    id="code"
                    placeholder="Ex: 009"
                    maxLength={3}
                    value={formData.code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      handleInputChange("code", value)
                    }}
                    className={cn(errors.code && "border-destructive")}
                  />
                  {errors.code && (
                    <p className="text-xs text-destructive">{errors.code}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Référence générée: COC/2026/{formData.code.padStart(3, "0") || "XXX"}
                  </p>
                </div>

                {/* Sens */}
                <div className="space-y-2">
                  <Label>Sens du courrier *</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.sens === "entrant" ? "default" : "outline"}
                      className={cn(
                        "flex-1",
                        formData.sens === "entrant" && "bg-coc-green hover:bg-coc-green/90"
                      )}
                      onClick={() => handleInputChange("sens", "entrant")}
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-2" />
                      Entrant
                    </Button>
                    <Button
                      type="button"
                      variant={formData.sens === "sortant" ? "default" : "outline"}
                      className={cn(
                        "flex-1",
                        formData.sens === "sortant" && "bg-primary hover:bg-primary/90"
                      )}
                      onClick={() => handleInputChange("sens", "sortant")}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Sortant
                    </Button>
                  </div>
                  {errors.sens && (
                    <p className="text-xs text-destructive">{errors.sens}</p>
                  )}
                </div>
              </div>

              {/* Objet */}
              <div className="space-y-2">
                <Label htmlFor="objet">Objet *</Label>
                <Input
                  id="objet"
                  placeholder="Ex: Convocation Assemblée Générale"
                  value={formData.objet}
                  onChange={(e) => handleInputChange("objet", e.target.value)}
                  className={cn(errors.objet && "border-destructive")}
                />
                {errors.objet && (
                  <p className="text-xs text-destructive">{errors.objet}</p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Expéditeur */}
                <div className="space-y-2">
                  <Label htmlFor="expediteur">Expéditeur *</Label>
                  <Input
                    id="expediteur"
                    placeholder={formData.sens === "sortant" ? "COC" : "Ex: CIO, ACNOA..."}
                    value={formData.expediteur}
                    onChange={(e) => handleInputChange("expediteur", e.target.value)}
                    className={cn(errors.expediteur && "border-destructive")}
                  />
                  {errors.expediteur && (
                    <p className="text-xs text-destructive">{errors.expediteur}</p>
                  )}
                </div>

                {/* Destinataire */}
                <div className="space-y-2">
                  <Label htmlFor="destinataire">Destinataire *</Label>
                  <Input
                    id="destinataire"
                    placeholder={formData.sens === "entrant" ? "COC" : "Ex: Ministère des Sports..."}
                    value={formData.destinataire}
                    onChange={(e) => handleInputChange("destinataire", e.target.value)}
                    className={cn(errors.destinataire && "border-destructive")}
                  />
                  {errors.destinataire && (
                    <p className="text-xs text-destructive">{errors.destinataire}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Catégorie */}
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select 
                    value={formData.categorie} 
                    onValueChange={(value) => handleInputChange("categorie", value)}
                  >
                    <SelectTrigger className={cn(errors.categorie && "border-destructive")}>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categorie && (
                    <p className="text-xs text-destructive">{errors.categorie}</p>
                  )}
                </div>

                {/* Responsable */}
                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable</Label>
                  <Input
                    id="responsable"
                    placeholder="Ex: Secrétaire Général"
                    value={formData.responsable}
                    onChange={(e) => handleInputChange("responsable", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenu */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
              <CardDescription>Résumé ou transcription du courrier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contenu">Contenu du courrier</Label>
                <Textarea
                  id="contenu"
                  placeholder="Résumez le contenu du courrier..."
                  rows={5}
                  value={formData.contenu}
                  onChange={(e) => handleInputChange("contenu", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes et suivi</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes internes, suivi, actions à mener..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Document PDF */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Document PDF (optionnel)</CardTitle>
              <CardDescription>Attachez le fichier PDF du courrier</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm">
                      Glissez-déposez un PDF ou <span className="text-primary">parcourir</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF uniquement (max. 10 Mo)
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
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/dashboard/courriers">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Enregistrer le courrier
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
