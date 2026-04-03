"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Calendar, Trophy, Target } from "lucide-react"
import { use } from "react"

function getAgeFromDateString(dateString: string) {
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

const athletesData: Record<string, {
  id: string
  nom: string
  prenom: string
  sexe: "M" | "F"
  discipline: string
  specialite: string
  dateNaissance: string
  lieuNaissance: string
  federation: string
  statut: "actif" | "inactif"
  telephone: string
  email: string
  adresse: string
  taille: string
  poids: string
  palmares: { competition: string; annee: string; resultat: string }[]
}> = {
  "1": {
    id: "1",
    nom: "Makala",
    prenom: "Jean-Pierre",
    sexe: "M",
    discipline: "Athletisme",
    specialite: "100m / 200m",
    dateNaissance: "15/03/1998",
    lieuNaissance: "Kinshasa",
    federation: "FECOATH",
    statut: "actif",
    telephone: "+243 81 123 4567",
    email: "jp.makala@email.cd",
    adresse: "Commune de Gombe, Kinshasa",
    taille: "1m82",
    poids: "75 kg",
    palmares: [
      { competition: "Jeux Africains 2023", annee: "2023", resultat: "Medaille d'Or - 100m" },
      { competition: "Championnats Nationaux", annee: "2022", resultat: "1ere place - 100m et 200m" },
      { competition: "Meeting International Kinshasa", annee: "2022", resultat: "2eme place - 100m" },
    ],
  },
  "2": {
    id: "2",
    nom: "Mbemba",
    prenom: "Grace",
    sexe: "F",
    discipline: "Basketball",
    specialite: "Meneur",
    dateNaissance: "22/07/1995",
    lieuNaissance: "Lubumbashi",
    federation: "FECOBA",
    statut: "actif",
    telephone: "+243 82 234 5678",
    email: "g.mbemba@email.cd",
    adresse: "Commune de Lubumbashi",
    taille: "1m88",
    poids: "82 kg",
    palmares: [
      { competition: "AfroBasket 2023", annee: "2023", resultat: "Quart de finale" },
      { competition: "Ligue Nationale", annee: "2022", resultat: "Champion" },
    ],
  },
}

export default function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const athlete = athletesData[id] || athletesData["1"]

  const age = getAgeFromDateString(athlete.dateNaissance)

  const mainInfo = [
    { label: "Nom", value: `${athlete.prenom} ${athlete.nom}` },
    { label: "ID", value: athlete.id },
    { label: "Sexe", value: athlete.sexe === "M" ? "H" : "F" },
    {
      label: "Date de naissance",
      value: age === null ? athlete.dateNaissance : `${athlete.dateNaissance} (${age} ans)`,
    },
    { label: "Lieu de naissance", value: athlete.lieuNaissance },
    {
      label: "Discipline",
      value: athlete.specialite ? `${athlete.discipline} - ${athlete.specialite}` : athlete.discipline,
    },
    { label: "Federation", value: <Badge variant="outline">{athlete.federation}</Badge> },
    { label: "Taille", value: athlete.taille },
    { label: "Poids", value: athlete.poids },
  ]

  const contactInfo = [
    { label: "Telephone", value: athlete.telephone, icon: <Phone className="h-4 w-4" /> },
    { label: "Email", value: athlete.email, icon: <Mail className="h-4 w-4" /> },
    { label: "Adresse", value: athlete.adresse, icon: <MapPin className="h-4 w-4" /> },
  ]

  const documents = [
    { name: "Carte d'identite nationale", type: "PDF", date: "15/01/2024" },
    { name: "Licence sportive 2024", type: "PDF", date: "10/01/2024" },
    { name: "Certificat medical", type: "PDF", date: "05/01/2024" },
  ]

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
      title={`${athlete.prenom} ${athlete.nom}`}
      subtitle={`${athlete.discipline} - ${athlete.specialite}`}
      avatarInitials={`${athlete.prenom[0]}${athlete.nom[0]}`}
      avatarColorClass="bg-primary/10 text-primary"
      status={athlete.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
      additionalSections={[palmaresSection]}
    />
  )
}
