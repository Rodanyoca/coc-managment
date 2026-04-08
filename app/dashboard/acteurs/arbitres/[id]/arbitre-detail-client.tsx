"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Shield } from "lucide-react"

export type ArbitreDetail = {
  id: string
  nomComplet: string
  prenom: string
  nom: string
  sexe: "M" | "F"
  dateNaissance?: string
  grade?: string
  sport?: string
  federation?: string
  telephone?: string
  email?: string
  adresse?: string
  urlPasseport?: string | null
  numeroPasseport?: string
  dateDelivrancePasseport?: string
  dateExpirationPasseport?: string
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

export function ArbitreDetailClient({ arbitre }: { arbitre: ArbitreDetail }) {
  const age = getAgeFromDateString(arbitre.dateNaissance)

  const subtitleParts = [arbitre.sport, arbitre.grade].filter(Boolean)
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" - ") : undefined

  const mainInfo = [
    { label: "ID", value: arbitre.id },
    { label: "Nom", value: arbitre.nomComplet },
    { label: "Sexe", value: arbitre.sexe === "M" ? "H" : "F" },
    {
      label: "Date de naissance",
      value:
        arbitre.dateNaissance && age !== null
          ? `${arbitre.dateNaissance} (${age} ans)`
          : arbitre.dateNaissance || "-",
    },
    { label: "Sport", value: arbitre.sport || "-" },
    {
      label: "Grade",
      value: arbitre.grade ? (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          <Shield className="h-3 w-3 mr-1" />
          {arbitre.grade}
        </Badge>
      ) : (
        "-"
      ),
    },
    {
      label: "Fédération",
      value: arbitre.federation ? <Badge variant="outline">{arbitre.federation}</Badge> : "-",
    },
  ]

  const contactInfo = [
    arbitre.telephone
      ? { label: "Telephone", value: arbitre.telephone, icon: <Phone className="h-4 w-4" /> }
      : null,
    arbitre.email ? { label: "Email", value: arbitre.email, icon: <Mail className="h-4 w-4" /> } : null,
    arbitre.adresse
      ? { label: "Adresse", value: arbitre.adresse, icon: <MapPin className="h-4 w-4" /> }
      : null,
  ].filter(Boolean) as { label: string; value: string; icon: React.JSX.Element }[]

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/arbitres"
      backLabel="Retour aux arbitres"
      title={arbitre.nomComplet}
      subtitle={subtitle}
      avatarInitials={`${arbitre.prenom?.[0] || ""}${arbitre.nom?.[0] || ""}`}
      avatarColorClass="bg-chart-5/10 text-chart-5"
      avatarUrl={arbitre.avatarUrl}
      urlPasseport={arbitre.urlPasseport}
      passportInfo={[
        { label: "N° Passeport", value: arbitre.numeroPasseport || "-" },
        { label: "Délivré le", value: arbitre.dateDelivrancePasseport || "-" },
        { label: "Expire le", value: arbitre.dateExpirationPasseport || "-" },
      ]}
      actorType="arbitres"
      actorId={arbitre.id}
      actorDateNaissance={arbitre.dateNaissance}
      actorSexe={arbitre.sexe}
      status={arbitre.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
    />
  )
}
