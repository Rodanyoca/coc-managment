"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Award, Users } from "lucide-react"
import { use } from "react"

const entraineursData: Record<string, {
  id: string
  nom: string
  prenom: string
  discipline: string
  specialite: string
  niveau: string
  federation: string
  dateDebut: string
  statut: "actif" | "inactif"
  telephone: string
  email: string
  adresse: string
  certifications: string[]
  athletes: { nom: string; specialite: string }[]
}> = {
  "1": {
    id: "1",
    nom: "Mwamba",
    prenom: "Christian",
    discipline: "Athletisme",
    specialite: "Sprint",
    niveau: "International",
    federation: "FECOATH",
    dateDebut: "01/03/2015",
    statut: "actif",
    telephone: "+243 81 345 6789",
    email: "c.mwamba@fecoath.cd",
    adresse: "Commune de Kintambo, Kinshasa",
    certifications: [
      "Diplome d'Entraineur IAAF Niveau 3",
      "Certificat de Preparation Physique",
      "Formation Elite Sprint - Kenya 2019",
    ],
    athletes: [
      { nom: "Jean-Pierre Makala", specialite: "100m / 200m" },
      { nom: "Patrick Lunda", specialite: "400m" },
      { nom: "Marie Kabala", specialite: "100m haies" },
      { nom: "David Kasongo", specialite: "200m" },
    ],
  },
  "2": {
    id: "2",
    nom: "Kasongo",
    prenom: "Bernadette",
    discipline: "Basketball",
    specialite: "Preparation physique",
    niveau: "National",
    federation: "FECOBA",
    dateDebut: "15/09/2018",
    statut: "actif",
    telephone: "+243 82 456 7890",
    email: "b.kasongo@fecoba.cd",
    adresse: "Commune de Matete, Kinshasa",
    certifications: [
      "Diplome en Sciences du Sport",
      "Certificat FIBA Coach",
    ],
    athletes: [
      { nom: "Grace Mbemba", specialite: "Meneur" },
      { nom: "Paul Ilunga", specialite: "Ailier" },
    ],
  },
}

export default function EntraineurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const entraineur = entraineursData[id] || entraineursData["1"]

  const niveauConfig: Record<string, string> = {
    "National": "bg-muted text-muted-foreground",
    "Continental": "bg-chart-2/10 text-chart-2",
    "International": "bg-chart-1/10 text-chart-1",
  }

  const mainInfo = [
    { label: "ID", value: entraineur.id },
    { label: "Discipline", value: entraineur.discipline },
    { label: "Specialite", value: entraineur.specialite },
    { 
      label: "Niveau", 
      value: (
        <Badge variant="secondary" className={niveauConfig[entraineur.niveau]}>
          <Award className="h-3 w-3 mr-1" />
          {entraineur.niveau}
        </Badge>
      ) 
    },
    { label: "Federation", value: <Badge variant="outline">{entraineur.federation}</Badge> },
    { label: "En activite depuis", value: entraineur.dateDebut },
    { label: "Athletes encadres", value: `${entraineur.athletes.length} athletes` },
  ]

  const contactInfo = [
    { label: "Telephone", value: entraineur.telephone, icon: <Phone className="h-4 w-4" /> },
    { label: "Email", value: entraineur.email, icon: <Mail className="h-4 w-4" /> },
    { label: "Adresse", value: entraineur.adresse, icon: <MapPin className="h-4 w-4" /> },
  ]

  const documents = [
    { name: "Diplome d'entraineur", type: "PDF", date: "10/03/2015" },
    { name: "Licence entraineur 2024", type: "PDF", date: "05/01/2024" },
    { name: "Certificats de formation", type: "PDF", date: "20/08/2019" },
  ]

  const athletesSection = {
    id: "athletes",
    label: "Athletes",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-chart-3" />
          <p className="font-medium">{entraineur.athletes.length} athletes actuellement encadres</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entraineur.athletes.map((athlete, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {athlete.nom.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{athlete.nom}</p>
                <p className="text-xs text-muted-foreground">{athlete.specialite}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm font-medium mb-3">Certifications et formations</p>
          <div className="space-y-2">
            {entraineur.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-coc-yellow" />
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/entraineurs"
      backLabel="Retour aux entraineurs"
      title={`${entraineur.prenom} ${entraineur.nom}`}
      subtitle={`${entraineur.discipline} - ${entraineur.specialite}`}
      avatarInitials={`${entraineur.prenom[0]}${entraineur.nom[0]}`}
      avatarColorClass="bg-chart-3/10 text-chart-3"
      status={entraineur.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
      additionalSections={[athletesSection]}
    />
  )
}
