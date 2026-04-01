"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Stethoscope, GraduationCap } from "lucide-react"
import { use } from "react"

const medecinsData: Record<string, {
  id: string
  nom: string
  prenom: string
  specialite: string
  numeroOrdre: string
  etablissement: string
  dateDebut: string
  statut: "actif" | "inactif"
  telephone: string
  email: string
  cabinet: string
  diplomes: string[]
  competences: string[]
}> = {
  "1": {
    id: "1",
    nom: "Kasanda",
    prenom: "Dr. Robert",
    specialite: "Medecine du Sport",
    numeroOrdre: "MED-2015-4521",
    etablissement: "Centre Medical du Sport, Kinshasa",
    dateDebut: "01/06/2015",
    statut: "actif",
    telephone: "+243 81 567 8901",
    email: "r.kasanda@cms.cd",
    cabinet: "Centre Medical du Sport, Avenue Colonel Ebeya, Kinshasa",
    diplomes: [
      "Doctorat en Medecine - Universite de Kinshasa",
      "Specialisation Medecine du Sport - Paris",
      "DU Traumatologie du Sport",
    ],
    competences: [
      "Suivi medical des athletes de haut niveau",
      "Prevention des blessures sportives",
      "Reeducation fonctionnelle",
      "Controle antidopage",
      "Certificats d'aptitude sportive",
    ],
  },
  "2": {
    id: "2",
    nom: "Mbaya",
    prenom: "Dr. Sylvie",
    specialite: "Kinesitherapie",
    numeroOrdre: "KIN-2018-7823",
    etablissement: "Clinique Ngaliema",
    dateDebut: "15/03/2018",
    statut: "actif",
    telephone: "+243 82 678 9012",
    email: "s.mbaya@ngaliema.cd",
    cabinet: "Clinique Ngaliema, Avenue des Cliniques, Kinshasa",
    diplomes: [
      "Licence en Kinesitherapie",
      "Master en Reeducation Sportive",
    ],
    competences: [
      "Reeducation post-traumatique",
      "Preparation physique",
      "Massage sportif",
    ],
  },
}

export default function MedecinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const medecin = medecinsData[id] || medecinsData["1"]

  const mainInfo = [
    { label: "Specialite", value: medecin.specialite },
    { label: "Numero d'ordre", value: <Badge variant="outline">{medecin.numeroOrdre}</Badge> },
    { label: "Etablissement", value: medecin.etablissement },
    { label: "En activite depuis", value: medecin.dateDebut },
  ]

  const contactInfo = [
    { label: "Telephone", value: medecin.telephone, icon: <Phone className="h-4 w-4" /> },
    { label: "Email", value: medecin.email, icon: <Mail className="h-4 w-4" /> },
    { label: "Cabinet", value: medecin.cabinet, icon: <MapPin className="h-4 w-4" /> },
  ]

  const documents = [
    { name: "Diplome de medecine", type: "PDF", date: "15/07/2010" },
    { name: "Certificat de specialisation", type: "PDF", date: "20/09/2015" },
    { name: "Autorisation d'exercer 2024", type: "PDF", date: "01/01/2024" },
  ]

  const competencesSection = {
    id: "competences",
    label: "Competences",
    content: (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-chart-4" />
            <p className="font-medium">Diplomes et formations</p>
          </div>
          <div className="space-y-2">
            {medecin.diplomes.map((diplome, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-muted/30 text-sm"
              >
                {diplome}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="h-5 w-5 text-chart-4" />
            <p className="font-medium">Domaines de competence</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {medecin.competences.map((comp, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-chart-4/10 text-chart-4"
              >
                {comp}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    ),
  }

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/medecins"
      backLabel="Retour aux medecins"
      title={medecin.prenom + " " + medecin.nom}
      subtitle={medecin.specialite}
      avatarInitials={medecin.prenom.replace("Dr. ", "")[0] + medecin.nom[0]}
      avatarColorClass="bg-chart-4/10 text-chart-4"
      status={medecin.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
      additionalSections={[competencesSection]}
    />
  )
}
