"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Calendar, Trophy, Target } from "lucide-react"
import { use } from "react"

const athletesData: Record<string, {
  id: string
  nom: string
  prenom: string
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

  const mainInfo = [
    { label: "Date de naissance", value: athlete.dateNaissance },
    { label: "Lieu de naissance", value: athlete.lieuNaissance },
    { label: "Discipline", value: athlete.discipline },
    { label: "Specialite", value: athlete.specialite },
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
      <div className="space-y-4">
        {athlete.palmares.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/20"
          >
            <div className="p-2 rounded-full bg-coc-yellow/10">
              <Trophy className="h-5 w-5 text-coc-yellow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item.competition}</p>
                <Badge variant="outline">{item.annee}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{item.resultat}</p>
            </div>
          </div>
        ))}
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
