"use client"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Building, Briefcase } from "lucide-react"
import { use } from "react"

const officielsData: Record<string, {
  id: string
  nom: string
  prenom: string
  fonction: string
  organisation: string
  type: "coc" | "federation"
  dateNomination: string
  mandatFin: string
  statut: "actif" | "inactif"
  telephone: string
  email: string
  bureau: string
  responsabilites: string[]
}> = {
  "1": {
    id: "1",
    nom: "Kalamba",
    prenom: "Pierre",
    fonction: "President",
    organisation: "COC",
    type: "coc",
    dateNomination: "15/06/2021",
    mandatFin: "15/06/2025",
    statut: "actif",
    telephone: "+243 81 234 5678",
    email: "p.kalamba@coc.cd",
    bureau: "Siege COC, Avenue de la Paix, Kinshasa",
    responsabilites: [
      "Representer le COC aux instances internationales",
      "Presider les reunions du Bureau Executif",
      "Valider les decisions strategiques",
      "Superviser les relations avec le CIO",
    ],
  },
  "2": {
    id: "2",
    nom: "Mbuyi",
    prenom: "Claire",
    fonction: "Secretaire General",
    organisation: "COC",
    type: "coc",
    dateNomination: "15/06/2021",
    mandatFin: "15/06/2025",
    statut: "actif",
    telephone: "+243 82 345 6789",
    email: "c.mbuyi@coc.cd",
    bureau: "Siege COC, Avenue de la Paix, Kinshasa",
    responsabilites: [
      "Gerer les affaires administratives",
      "Coordonner les activites du secretariat",
      "Assurer le suivi des correspondances",
    ],
  },
}

export default function OfficielDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const officiel = officielsData[id] || officielsData["1"]

  const mainInfo = [
    { label: "Fonction", value: <span className="font-semibold">{officiel.fonction}</span> },
    { 
      label: "Organisation", 
      value: (
        <Badge variant="outline" className={officiel.type === "coc" ? "border-primary text-primary" : ""}>
          {officiel.organisation}
        </Badge>
      ) 
    },
    { label: "Date de nomination", value: officiel.dateNomination },
    { label: "Fin de mandat", value: officiel.mandatFin },
    { label: "Type", value: officiel.type === "coc" ? "Officiel COC" : "Federation" },
  ]

  const contactInfo = [
    { label: "Telephone", value: officiel.telephone, icon: <Phone className="h-4 w-4" /> },
    { label: "Email", value: officiel.email, icon: <Mail className="h-4 w-4" /> },
    { label: "Bureau", value: officiel.bureau, icon: <Building className="h-4 w-4" /> },
  ]

  const documents = [
    { name: "Arrete de nomination", type: "PDF", date: "15/06/2021" },
    { name: "CV officiel", type: "PDF", date: "01/06/2021" },
    { name: "Photo officielle", type: "Image", date: "20/06/2021" },
  ]

  const responsabilitesSection = {
    id: "responsabilites",
    label: "Responsabilites",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Principales responsabilites liees a la fonction de {officiel.fonction}
        </p>
        {officiel.responsabilites.map((resp, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
          >
            <div className="p-1.5 rounded-full bg-chart-2/10 mt-0.5">
              <Briefcase className="h-3 w-3 text-chart-2" />
            </div>
            <p className="text-sm">{resp}</p>
          </div>
        ))}
      </div>
    ),
  }

  return (
    <ActorDetailLayout
      backHref="/dashboard/acteurs/officiels"
      backLabel="Retour aux officiels"
      title={`${officiel.prenom} ${officiel.nom}`}
      subtitle={`${officiel.fonction} - ${officiel.organisation}`}
      avatarInitials={`${officiel.prenom[0]}${officiel.nom[0]}`}
      avatarColorClass="bg-chart-2/10 text-chart-2"
      status={officiel.statut}
      mainInfo={mainInfo}
      contactInfo={contactInfo}
      documents={documents}
      additionalSections={[responsabilitesSection]}
    />
  )
}
