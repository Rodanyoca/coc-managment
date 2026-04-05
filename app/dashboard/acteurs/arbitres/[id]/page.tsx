"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Shield, Calendar } from "lucide-react"
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

const arbitresData: Record<string, {
  id: string
  nom: string
  prenom: string
  sexe: "M" | "F"
  dateNaissance: string
  discipline: string
  grade: string
  numeroLicence: string
  federation: string
  dateObtention: string
  statut: "actif" | "inactif"
  telephone: string
  email: string
  adresse: string
  competitions: { nom: string; date: string; role: string }[]
  formations: string[]
}> = {
  "1": {
    id: "1",
    nom: "Ngandu",
    prenom: "Albert",
    sexe: "M",
    dateNaissance: "18/02/1984",
    discipline: "Athletisme",
    grade: "International",
    numeroLicence: "ARB-ATH-2018-001",
    federation: "FECOATH",
    dateObtention: "15/04/2018",
    statut: "actif",
    telephone: "+243 81 789 0123",
    email: "a.ngandu@fecoath.cd",
    adresse: "Commune de Limete, Kinshasa",
    competitions: [
      { nom: "Jeux Africains 2023 - Accra", date: "Aout 2023", role: "Juge de depart" },
      { nom: "Championnats Nationaux 2023", date: "Juin 2023", role: "Arbitre principal" },
      { nom: "Meeting International Kinshasa", date: "Mars 2023", role: "Chronometreur" },
      { nom: "Jeux de la Francophonie 2022", date: "Juillet 2022", role: "Juge" },
    ],
    formations: [
      "Formation IAAF Niveau 3",
      "Certification Arbitre International CAA",
      "Recyclage annuel 2024",
    ],
  },
  "2": {
    id: "2",
    nom: "Kabila",
    prenom: "Rose",
    sexe: "F",
    dateNaissance: "07/09/1989",
    discipline: "Basketball",
    grade: "National",
    numeroLicence: "ARB-BKT-2020-015",
    federation: "FECOBA",
    dateObtention: "20/09/2020",
    statut: "actif",
    telephone: "+243 82 890 1234",
    email: "r.kabila@fecoba.cd",
    adresse: "Commune de Bandalungwa, Kinshasa",
    competitions: [
      { nom: "Ligue Nationale 2023", date: "Nov 2023", role: "Arbitre" },
      { nom: "Coupe du Congo", date: "Sept 2023", role: "Arbitre assistant" },
    ],
    formations: [
      "Formation FIBA Niveau 2",
      "Certification Nationale",
    ],
  },
}

export default function ArbitreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const arbitre = arbitresData[id] || arbitresData["1"]

  const age = getAgeFromDateString(arbitre.dateNaissance)

  const gradeConfig: Record<string, string> = {
    "Regional": "bg-muted text-muted-foreground",
    "National": "bg-chart-2/10 text-chart-2",
    "International": "bg-chart-1/10 text-chart-1",
  }

  const mainInfo = [
    { label: "ID", value: arbitre.id },
    { label: "Sexe", value: arbitre.sexe === "M" ? "H" : "F" },
    {
      label: "Date de naissance",
      value:
        age === null
          ? arbitre.dateNaissance
          : `${arbitre.dateNaissance} (${age} ans)`,
    },
    { label: "Sport", value: arbitre.discipline },
    { 
      label: "Grade", 
      value: (
        <Badge variant="secondary" className={gradeConfig[arbitre.grade]}>
          <Shield className="h-3 w-3 mr-1" />
          {arbitre.grade}
        </Badge>
      ) 
    },
    { label: "Numero de licence", value: <Badge variant="outline">{arbitre.numeroLicence}</Badge> },
    { label: "Federation", value: <Badge variant="outline">{arbitre.federation}</Badge> },
    { label: "Date d'obtention", value: arbitre.dateObtention },
  ]

  const contactInfo = [
    { label: "Telephone", value: arbitre.telephone, icon: <Phone className="h-4 w-4" /> },
    { label: "Email", value: arbitre.email, icon: <Mail className="h-4 w-4" /> },
    { label: "Adresse", value: arbitre.adresse, icon: <MapPin className="h-4 w-4" /> },
  ]

  const documents = [
    { name: "Licence arbitre 2024", type: "PDF", date: "01/01/2024" },
    { name: "Diplome d'arbitre", type: "PDF", date: "15/04/2018" },
    { name: "Certificat de formation", type: "PDF", date: "10/02/2024" },
  ]

  const competitionsSection = {
    id: "competitions",
    label: "Competitions",
    content: (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-chart-5" />
            <p className="font-medium">Dernieres competitions officiees</p>
          </div>
          <div className="space-y-3">
            {arbitre.competitions.map((comp, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{comp.nom}</p>
                  <p className="text-xs text-muted-foreground">{comp.date}</p>
                </div>
                <Badge variant="secondary">{comp.role}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-chart-5" />
            <p className="font-medium">Formations et certifications</p>
          </div>
          <div className="space-y-2">
            {arbitre.formations.map((formation, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-chart-5/5 text-sm border-l-2 border-chart-5"
              >
                {formation}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/arbitres"
      backLabel="Retour aux arbitres"
      title={`${arbitre.prenom} ${arbitre.nom}`}
      subtitle={`${arbitre.discipline} - Arbitre ${arbitre.grade} | ${arbitre.sexe === "M" ? "H" : "F"}`}
      avatarInitials={`${arbitre.prenom[0]}${arbitre.nom[0]}`}
      avatarColorClass="bg-chart-5/10 text-chart-5"
      status={arbitre.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
      additionalSections={[competitionsSection]}
    />
  )
}
