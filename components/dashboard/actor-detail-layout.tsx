"use client"

import { Header } from "@/components/dashboard/header"
import { MediaUploadDialog } from "@/components/dashboard/media-upload-dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ExternalLink, FileText, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ReactNode, useState } from "react"

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
  urlPasseport?: string | null
  passportInfo?: { label: string; value: string }[]
  actorType?: string
  actorId?: string
  showActorId?: boolean
  profileActions?: ReactNode
  actorDateNaissance?: string
  actorSexe?: string
  status?: "actif" | "inactif"
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
    url?: string | null
  }[]
  children?: ReactNode
}

function ProfileAvatarImage({ src, alt, onError }: { src: string; alt: string; onError: () => void }) {
  return <Image src={src} alt={alt} fill sizes="96px" className="object-cover" referrerPolicy="no-referrer" unoptimized onError={onError} />
}

function ageFromBirthDate(value?: string) {
  if (!value) return null
  const normalized = value.trim()
  const iso = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  const local = normalized.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/)
  const parts = iso ? [Number(iso[1]), Number(iso[2]), Number(iso[3])] : local ? [Number(local[3]), Number(local[2]), Number(local[1])] : null
  if (!parts) return null
  const [year, month, day] = parts
  const birthDate = new Date(year, month - 1, day)
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) return null
  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age--
  return age >= 0 && age <= 130 ? age : null
}

export function ActorDetailLayout({
  backHref,
  backLabel,
  title,
  subtitle,
  avatarInitials,
  avatarColorClass,
  avatarUrl,
  urlPasseport,
  passportInfo,
  actorType,
  actorId,
  showActorId = true,
  profileActions,
  actorDateNaissance,
  actorSexe,
  status,
  mainInfo,
  contactInfo,
  additionalSections = [],
  documents = [],
  children,
}: ActorDetailLayoutProps) {
  const router = useRouter()
  const [uploadedPasseportUrl, setUploadedPasseportUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState(false)

  const currentAvatarUrl = avatarUrl || null
  const currentPasseportUrl = uploadedPasseportUrl || urlPasseport || null
  const actorAge = ageFromBirthDate(actorDateNaissance)

  const identityFields = [
    ...(actorId && showActorId ? [{ label: "ID", value: actorId }] : []),
    { label: "Nom", value: title },
    { label: "Date de naissance", value: actorDateNaissance || "-" },
    ...(actorSexe
      ? [{ label: "Sexe", value: actorSexe === "M" ? "Homme" : actorSexe === "F" ? "Femme" : actorSexe }]
      : []),
  ]

  return (
    <div className="min-h-screen">
      <Header title={title} subtitle={subtitle} />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <div className="mb-2 flex items-center justify-between gap-3">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
          {profileActions}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card - Profile */}
          <Card className="lg:col-span-1 border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  {currentAvatarUrl && !avatarError ? (
                    <ProfileAvatarImage
                      key={currentAvatarUrl}
                      src={currentAvatarUrl}
                      alt={title}
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <AvatarFallback className={`${avatarColorClass} text-2xl`}>
                      {avatarInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-xl font-semibold">{title}</h2>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                {status && (
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
                )}

                {/* ID, Nom, Date de naissance */}
                <div className="mt-4 w-full space-y-1 text-sm">
                  {actorId && showActorId && (
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
                      <span className="font-medium">{actorDateNaissance}{actorAge !== null && <span className="ml-2 text-muted-foreground">({actorAge} ans)</span>}</span>
                    </div>
                  )}
                </div>

                {/* Passport info fields */}
                {passportInfo && passportInfo.length > 0 && (
                  <div className="mt-4 w-full space-y-1 text-sm border-t border-border pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Passeport</p>
                    {passportInfo.map((f, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className="font-medium">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                <TabsList
                  className="grid w-full"
                  style={{ gridTemplateColumns: `repeat(${2 + additionalSections.length}, minmax(0, 1fr))` }}
                >
                  <TabsTrigger value="infos">Informations</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  {additionalSections.map((section) => (
                    <TabsTrigger key={section.id} value={section.id}>
                      {section.label}
                    </TabsTrigger>
                  ))}
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
                  <div className="space-y-4">
                    {/* Passeport section */}
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <FileText className="h-4 w-4 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Passeport</p>
                            <p className="text-xs text-muted-foreground">
                              {currentPasseportUrl ? "PDF attaché" : "Aucun fichier"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentPasseportUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={currentPasseportUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Ouvrir
                              </a>
                            </Button>
                          )}
                          <MediaUploadDialog
                            mediaType="passeport"
                            title="Passeport / Pièce d'identité"
                            actorType={actorType}
                            actorId={actorId}
                            identityFields={identityFields}
                            trigger={
                              <Button variant="outline" size="sm" className="gap-1">
                                <Upload className="h-3 w-3" />
                                {currentPasseportUrl ? "Remplacer" : "Ajouter"}
                              </Button>
                            }
                            onSuccess={({ url }) => {
                              setUploadedPasseportUrl(url)
                              router.refresh()
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Other documents */}
                    {documents.length > 0 ? (
                      documents.map((doc, index) => (
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
                          {doc.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                Voir
                              </a>
                            </Button>
                          )}
                        </div>
                      ))
                    ) : null}
                  </div>
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
