"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Award } from "lucide-react"

export type CoachDetail = {
  id: string
  nomComplet: string
  prenom: string
  nom: string
  sexe: "M" | "F"
  dateNaissance?: string
  sport?: string
  discipline?: string
  niveau?: string
  federation?: string
  dateAffiliation?: string
  telephone?: string
  email?: string
  adresse?: string
  urlPasseport?: string | null
  statut: "actif" | "inactif"
  avatarUrl?: string | null
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

export function EntraineurDetailClient({ coach }: { coach: CoachDetail }) {
  const age = getAgeFromDateString(coach.dateNaissance)

  const subtitleParts = [coach.sport, coach.discipline, coach.niveau]
    .filter(Boolean)
    .slice(0, 3)
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" - ") : undefined

  const mainInfo = [
    { label: "ID", value: coach.id },
    { label: "Nom", value: coach.nomComplet },
    { label: "Sexe", value: coach.sexe === "M" ? "H" : "F" },
    {
      label: "Date de naissance",
      value:
        coach.dateNaissance && age !== null
          ? `${coach.dateNaissance} (${age} ans)`
          : coach.dateNaissance || "-",
    },
    { label: "Sport", value: coach.sport || "-" },
    { label: "Discipline", value: coach.discipline || "-" },
    {
      label: "Niveau",
      value: coach.niveau ? (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          <Award className="h-3 w-3 mr-1" />
          {coach.niveau}
        </Badge>
      ) : (
        "-"
      ),
    },
    {
      label: "Fédération",
      value: coach.federation ? <Badge variant="outline">{coach.federation}</Badge> : "-",
    },
    { label: "Date d'affiliation", value: coach.dateAffiliation || "-" },
  ]

  const contactInfo = [
    coach.telephone
      ? { label: "Telephone", value: coach.telephone, icon: <Phone className="h-4 w-4" /> }
      : null,
    coach.email ? { label: "Email", value: coach.email, icon: <Mail className="h-4 w-4" /> } : null,
    coach.adresse
      ? { label: "Adresse", value: coach.adresse, icon: <MapPin className="h-4 w-4" /> }
      : null,
  ].filter(Boolean) as { label: string; value: string; icon: React.JSX.Element }[]

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/entraineurs"
      backLabel="Retour aux entraîneurs"
      title={coach.nomComplet}
      subtitle={subtitle}
      avatarInitials={`${coach.prenom?.[0] || ""}${coach.nom?.[0] || ""}`}
      avatarColorClass="bg-chart-3/10 text-chart-3"
      avatarUrl={coach.avatarUrl}
      urlPasseport={coach.urlPasseport}
      actorType="entraineurs"
      actorId={coach.id}
      actorDateNaissance={coach.dateNaissance}
      actorSexe={coach.sexe}
      status={coach.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
    />
  )
}
