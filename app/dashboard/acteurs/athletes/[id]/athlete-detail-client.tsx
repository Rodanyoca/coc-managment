"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Trophy } from "lucide-react"

export type AthleteDetail = {
  id: string
  nomComplet: string
  prenom: string
  nom: string
  sexe: "M" | "F"
  dateNaissance?: string
  lieuNaissance?: string
  discipline?: string
  sport?: string
  federation?: string
  taille?: string
  poids?: string
  telephone?: string
  email?: string
  adresse?: string
  statut: "actif" | "inactif"
  avatarUrl?: string | null
  urlPasseport?: string | null
}

function getAgeFromDateString(dateString?: string) {
  if (!dateString) return null
  const [dd, mm, yyyy] = dateString.split("/").map((part) => Number(part))
  if (!dd || !mm || !yyyy) return null

  const birthDate = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

export function AthleteDetailClient({ athlete }: { athlete: AthleteDetail }) {
  const age = getAgeFromDateString(athlete.dateNaissance)

  const subtitleParts = [athlete.sport, athlete.discipline].filter(Boolean)
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" - ") : undefined

  const mainInfo = [
    { label: "Nom", value: athlete.nomComplet },
    { label: "ID", value: athlete.id },
    { label: "Sexe", value: athlete.sexe === "M" ? "H" : "F" },
    {
      label: "Date de naissance",
      value:
        athlete.dateNaissance && age !== null
          ? `${athlete.dateNaissance} (${age} ans)`
          : athlete.dateNaissance || "-",
    },
    { label: "Lieu de naissance", value: athlete.lieuNaissance || "-" },
    {
      label: "Discipline",
      value: subtitle || "-",
    },
    {
      label: "Federation",
      value: athlete.federation ? <Badge variant="outline">{athlete.federation}</Badge> : "-",
    },
    { label: "Taille", value: athlete.taille || "-" },
    { label: "Poids", value: athlete.poids || "-" },
  ]

  const contactInfo = [
    athlete.telephone ? { label: "Telephone", value: athlete.telephone, icon: <Phone className="h-4 w-4" /> } : null,
    athlete.email ? { label: "Email", value: athlete.email, icon: <Mail className="h-4 w-4" /> } : null,
    athlete.adresse ? { label: "Adresse", value: athlete.adresse, icon: <MapPin className="h-4 w-4" /> } : null,
  ].filter(Boolean) as { label: string; value: string; icon: JSX.Element }[]

  const documents = athlete.urlPasseport
    ? [{ name: "Passeport", type: "URL", date: "-" }]
    : []

  const palmaresSection = {
    id: "palmares",
    label: "Palmares",
    content: (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mb-3 opacity-30" />
        <p className="font-medium">Coming soon</p>
        <p className="text-sm">Le palmarès sera disponible bientôt.</p>
      </div>
    ),
  }

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/athletes"
      backLabel="Retour aux athletes"
      title={athlete.nomComplet}
      subtitle={subtitle}
      avatarInitials={`${athlete.prenom?.[0] || ""}${athlete.nom?.[0] || ""}`}
      avatarColorClass="bg-primary/10 text-primary"
      avatarUrl={athlete.avatarUrl}
      actorType="athletes"
      actorId={athlete.id}
      actorDateNaissance={athlete.dateNaissance}
      status={athlete.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
      additionalSections={[palmaresSection]}
    />
  )
}
