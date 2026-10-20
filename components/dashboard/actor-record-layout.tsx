"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft, ExternalLink, Pencil, Upload, type LucideIcon } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { MediaUploadDialog } from "@/components/dashboard/media-upload-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAthleteAge as getActorAge } from "@/lib/athletes/presentation"

export function ActorSexAge({ sex, date }: { sex: string; date: string }) {
  const normalized = sex.trim().toLocaleLowerCase("fr")
  const label = ["m", "h", "homme", "masculin"].includes(normalized) ? "M"
    : ["f", "femme", "féminin", "feminin"].includes(normalized) ? "F" : sex || "—"
  const age = getActorAge(date)
  return <div className="flex flex-col items-center leading-tight"><span className="text-sm font-semibold">{label}</span><span className="text-xs text-muted-foreground tabular-nums" title={date || undefined}>{age === null ? "—" : `${age} ans`}</span></div>
}

export function ActorInfoCard({ title, icon: Icon, fields }: { title: string; icon: LucideIcon; fields: { label: string; value: ReactNode }[] }) {
  return <Card className="min-w-0"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle></CardHeader><CardContent className="space-y-3">{fields.map(field => <div key={field.label} className="flex items-start justify-between gap-3"><span className="max-w-[50%] shrink-0 break-words text-sm text-muted-foreground">{field.label}</span><span className="min-w-0 max-w-[70%] whitespace-pre-line break-words text-right text-sm font-medium text-foreground">{field.value || "—"}</span></div>)}</CardContent></Card>
}

export function ActorPassportCard({ actorType, actorId, number, issued, expires, url, identityFields, onUploaded, canManageMedia = true }: {
  actorType: "athletes" | "officiels" | "entraineurs" | "medecins" | "arbitres" | "autres"; actorId: string; number: string; issued: string; expires: string
  url: string | null; identityFields: { label: string; value: string }[]; onUploaded?: (url: string) => void; canManageMedia?: boolean
}) {
  return <Card><CardHeader><CardTitle>Passeport</CardTitle></CardHeader><CardContent className="space-y-5">
    <dl className="grid gap-4 sm:grid-cols-3">{[{ label: "N° Passeport", value: number }, { label: "Délivré le", value: issued }, { label: "Expire le", value: expires }].map(field => <div key={field.label} className="min-w-0"><dt className="text-sm text-muted-foreground">{field.label}</dt><dd className="mt-1 break-words text-sm font-medium">{field.value || "—"}</dd></div>)}</dl>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><p className="text-sm text-muted-foreground">{url ? "PDF attaché" : "Aucun fichier"}</p><div className="flex flex-wrap gap-2">{url && <Button asChild variant="ghost" size="sm"><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Ouvrir</a></Button>}{canManageMedia && <MediaUploadDialog mediaType="passeport" title="Passeport / Pièce d’identité" actorType={actorType} actorId={actorId} identityFields={identityFields} trigger={<Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />{url ? "Remplacer" : "Ajouter"}</Button>} onSuccess={({ url: uploadedUrl }) => onUploaded?.(uploadedUrl)} />}</div></div>
  </CardContent></Card>
}

export function ActorRecordLayout({ backHref, backLabel, title, subtitle, avatarUrl, avatarInitials, status, onEdit, actions, generalContent, documents, additionalSections }: {
  backHref: string; backLabel: string; title: string; subtitle?: string; avatarUrl: string | null; avatarInitials: string
  status?: "actif" | "inactif"; onEdit?: () => void; actions?: ReactNode; generalContent: ReactNode; documents: ReactNode
  additionalSections: { id: string; label: string; content: ReactNode }[]
}) {
  return <div className="min-h-screen">
    <Header title={title} subtitle={subtitle} />
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="outline"><Link href={backHref}><ArrowLeft className="mr-2 h-4 w-4" />{backLabel}</Link></Button>{actions ?? (onEdit ? <Button onClick={onEdit}><Pencil className="mr-2 h-4 w-4" />Modifier</Button> : null)}</div>
      <Card><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4"><Avatar className="size-20 shrink-0"><AvatarImage src={avatarUrl || undefined} alt={title} /><AvatarFallback className="text-lg">{avatarInitials}</AvatarFallback></Avatar><div className="min-w-0"><h2 className="break-words text-2xl font-bold">{title || "Non renseigné"}</h2><p className="mt-1 text-sm font-medium text-muted-foreground">{subtitle || "—"}</p></div></div>
        <div className="flex flex-wrap items-center gap-3">{status && <Badge variant="outline" className={status === "actif" ? "bg-coc-green/10 text-coc-green" : "bg-muted text-muted-foreground"}>{status === "actif" ? "Actif" : "Inactif"}</Badge>}</div>
      </div></CardContent></Card>
      <Tabs defaultValue="general" className="gap-4">
        <TabsList className={`grid h-auto w-full grid-cols-2 ${additionalSections.length > 2 ? "lg:grid-cols-5" : additionalSections.length === 0 ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}><TabsTrigger value="general" className="w-full">Général</TabsTrigger><TabsTrigger value="documents" className="w-full">Documents</TabsTrigger>{additionalSections.map(section => <TabsTrigger key={section.id} value={section.id} className="w-full">{section.label}</TabsTrigger>)}</TabsList>
        <TabsContent value="general">{generalContent}</TabsContent>
        <TabsContent value="documents">{documents}</TabsContent>
        {additionalSections.map(section => <TabsContent key={section.id} value={section.id}>{section.content}</TabsContent>)}
      </Tabs>
    </main>
  </div>
}
