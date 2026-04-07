"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Stethoscope } from "lucide-react"

export type MedecinDetail = {
  id: string
  nomComplet: string
  prenom: string
  nom: string
  sexe: "M" | "F"
  dateNaissance?: string
  specialite?: string
  grade?: string
  telephone?: string
  email?: string
  adresse?: string
  numeroOrdre?: string
  etablissement?: string
  dateAffiliation?: string
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

export function MedecinDetailClient({ medecin }: { medecin: MedecinDetail }) {
  const age = getAgeFromDateString(medecin.dateNaissance)

  const subtitleParts = [medecin.specialite, medecin.grade].filter(Boolean)
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" - ") : undefined

  const mainInfo = [
    { label: "ID", value: medecin.id },
    { label: "Nom", value: medecin.nomComplet },
    { label: "Sexe", value: medecin.sexe === "M" ? "H" : "F" },
    {
      label: "Date de naissance",
      value:
        medecin.dateNaissance && age !== null
          ? `${medecin.dateNaissance} (${age} ans)`
          : medecin.dateNaissance || "-",
    },
    { label: "Spécialité", value: medecin.specialite || "-" },
    { label: "Grade", value: medecin.grade || "-" },
    { label: "Établissement", value: medecin.etablissement || "-" },
    { label: "N° d'ordre", value: medecin.numeroOrdre || "-" },
    { label: "Date d'affiliation", value: medecin.dateAffiliation || "-" },
  ]

  const contactInfo = [
    medecin.telephone
      ? { label: "Telephone", value: medecin.telephone, icon: <Phone className="h-4 w-4" /> }
      : null,
    medecin.email ? { label: "Email", value: medecin.email, icon: <Mail className="h-4 w-4" /> } : null,
    medecin.adresse
      ? { label: "Adresse", value: medecin.adresse, icon: <MapPin className="h-4 w-4" /> }
      : null,
  ].filter(Boolean) as { label: string; value: string; icon: JSX.Element }[]

  const documents = medecin.urlPasseport ? [{ name: "Passeport", type: "URL", date: "-" }] : []

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/medecins"
      backLabel="Retour aux médecins"
      title={medecin.nomComplet}
      subtitle={subtitle}
      avatarInitials={`${medecin.prenom?.[0] || ""}${medecin.nom?.[0] || ""}`}
      avatarColorClass="bg-chart-4/10 text-chart-4"
      avatarUrl={medecin.avatarUrl}
      actorType="medecins"
      actorId={medecin.id}
      actorDateNaissance={medecin.dateNaissance}
      status={medecin.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
    />
  )
}
