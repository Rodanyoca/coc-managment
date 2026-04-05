"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Building, Briefcase } from "lucide-react"

export type OfficielDetail = {
  id: string
  nomComplet: string
  prenom: string
  nom: string
  sexe: "M" | "F"
  dateNaissance?: string
  fonction?: string
  entite?: string
  sport?: string
  federation?: string
  telephone?: string
  email?: string
  bureau?: string
  dateNomination?: string
  membreCoc?: boolean
  mandatFin?: string
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

export function OfficielDetailClient({ officiel }: { officiel: OfficielDetail }) {
  const age = getAgeFromDateString(officiel.dateNaissance)

  const subtitleParts = [officiel.fonction, officiel.entite].filter(Boolean)
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" - ") : undefined

  const mainInfo = [
    { label: "ID", value: officiel.id },
    { label: "Nom", value: officiel.nomComplet },
    { label: "Sexe", value: officiel.sexe === "M" ? "H" : "F" },
    {
      label: "Date de naissance",
      value:
        officiel.dateNaissance && age !== null
          ? `${officiel.dateNaissance} (${age} ans)`
          : officiel.dateNaissance || "-",
    },
    { label: "Fonction", value: officiel.fonction || "-" },
    {
      label: "Entité",
      value: officiel.entite ? <Badge variant="outline">{officiel.entite}</Badge> : "-",
    },
    { label: "Sport", value: officiel.sport || "-" },
    {
      label: "Fédération",
      value: officiel.federation ? <Badge variant="outline">{officiel.federation}</Badge> : "-",
    },
    { label: "Date de nomination", value: officiel.dateNomination || "-" },
    { label: "Date de fin de mandat", value: officiel.mandatFin || "-" },
    { label: "Membre COC", value: officiel.membreCoc === undefined ? "-" : officiel.membreCoc ? "Oui" : "Non" },
  ]

  const contactInfo = [
    officiel.telephone ? { label: "Telephone", value: officiel.telephone, icon: <Phone className="h-4 w-4" /> } : null,
    officiel.email ? { label: "Email", value: officiel.email, icon: <Mail className="h-4 w-4" /> } : null,
    officiel.bureau ? { label: "Bureau", value: officiel.bureau, icon: <Building className="h-4 w-4" /> } : null,
    officiel.bureau ? null : officiel.entite ? { label: "Entité", value: officiel.entite, icon: <MapPin className="h-4 w-4" /> } : null,
  ].filter(Boolean) as { label: string; value: string; icon: JSX.Element }[]

  const documents = officiel.urlPasseport ? [{ name: "Passeport", type: "URL", date: "-" }] : []

  const section = {
    id: "palmares",
    label: "Palmarès",
    content: (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Briefcase className="h-12 w-12 mb-3 opacity-30" />
        <p className="font-medium">Coming soon</p>
        <p className="text-sm">Les informations complémentaires seront disponibles bientôt.</p>
      </div>
    ),
  }

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/officiels"
      backLabel="Retour aux officiels"
      title={officiel.nomComplet}
      subtitle={subtitle}
      avatarInitials={`${officiel.prenom?.[0] || ""}${officiel.nom?.[0] || ""}`}
      avatarColorClass="bg-chart-2/10 text-chart-2"
      status={officiel.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
      additionalSections={[section]}
    />
  )
}
