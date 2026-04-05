"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  Download, 
  Edit, 
  Trash2,
  Link2,
  ExternalLink,
  Calendar,
  User,
  Building,
  Tag,
  Clock
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"

// Données simulées - en production, récupérer depuis la base de données
const courriersData: Record<string, {
  id: string
  code: string
  reference: string
  objet: string
  expediteur: string
  destinataire: string
  dateReception: string
  dateCreation: string
  sens: "entrant" | "sortant"
  categorie: string
  statut: "traite" | "en_attente" | "non_traite"
  pdf: string | null
  contenu: string
  responsable: string
  notes: string
}> = {
  "001": {
    id: "1",
    code: "001",
    reference: "COC/2026/001",
    objet: "Convocation Assemblée Générale CIO",
    expediteur: "Comité International Olympique",
    destinataire: "COC",
    dateReception: "28/03/2026",
    dateCreation: "25/03/2026",
    sens: "entrant",
    categorie: "Institutionnel",
    statut: "traite",
    pdf: "/documents/courrier-001.pdf",
    contenu: "Le Comité International Olympique a l'honneur de convoquer le Comité Olympique Congolais à la 142ème Session du CIO qui se tiendra à Lausanne, Suisse, du 15 au 18 mai 2026. Cette session portera sur l'évaluation des villes candidates pour les Jeux Olympiques 2036 et sur les réformes de l'Agenda Olympique 2030+.",
    responsable: "Secrétaire Général",
    notes: "Réponse envoyée le 02/04/2026. Délégation de 3 personnes confirmée.",
  },
  "002": {
    id: "2",
    code: "002",
    reference: "COC/2026/002",
    objet: "Demande de subvention annuelle",
    expediteur: "COC",
    destinataire: "Ministère des Sports",
    dateReception: "25/03/2026",
    dateCreation: "20/03/2026",
    sens: "sortant",
    categorie: "Financier",
    statut: "en_attente",
    pdf: "/documents/courrier-002.pdf",
    contenu: "Le Comité Olympique Congolais sollicite auprès du Ministère des Sports et Loisirs l'octroi de la subvention annuelle de fonctionnement au titre de l'exercice 2026. Cette subvention permettra de couvrir les charges de fonctionnement, la préparation des athlètes et la participation aux compétitions internationales.",
    responsable: "Direction Administrative et Financière",
    notes: "En attente de retour du Ministère. Relance prévue le 15/04/2026.",
  },
  "003": {
    id: "3",
    code: "003",
    reference: "COC/2026/003",
    objet: "Accréditation Jeux Olympiques 2028",
    expediteur: "CIO",
    destinataire: "COC",
    dateReception: "22/03/2026",
    dateCreation: "18/03/2026",
    sens: "entrant",
    categorie: "Compétitions",
    statut: "traite",
    pdf: "/documents/courrier-003.pdf",
    contenu: "Suite aux qualifications obtenues, le CIO confirme l'accréditation de la délégation congolaise pour les Jeux Olympiques de Los Angeles 2028. La liste nominative des athlètes et officiels doit être transmise avant le 31 décembre 2027.",
    responsable: "Direction Technique",
    notes: "Processus de qualification en cours. 4 athlètes qualifiés à ce jour.",
  },
  "004": {
    id: "4",
    code: "004",
    reference: "COC/2026/004",
    objet: "Rapport mission Lausanne",
    expediteur: "COC",
    destinataire: "ACNOA",
    dateReception: "20/03/2026",
    dateCreation: "15/03/2026",
    sens: "sortant",
    categorie: "Rapport",
    statut: "traite",
    pdf: null,
    contenu: "Rapport détaillé de la mission effectuée au siège du CIO à Lausanne du 10 au 14 mars 2026. La mission portait sur le programme de solidarité olympique et les préparatifs des Jeux Africains 2027.",
    responsable: "Président",
    notes: "PDF à joindre après validation du Bureau Exécutif.",
  },
  "005": {
    id: "5",
    code: "005",
    reference: "COC/2026/005",
    objet: "Invitation Séminaire Olympique Africain",
    expediteur: "ACNOA",
    destinataire: "COC",
    dateReception: "18/03/2026",
    dateCreation: "12/03/2026",
    sens: "entrant",
    categorie: "Événement",
    statut: "non_traite",
    pdf: "/documents/courrier-005.pdf",
    contenu: "L'Association des Comités Nationaux Olympiques d'Afrique invite le COC au Séminaire Olympique Africain qui se tiendra à Abuja, Nigeria, du 5 au 8 juin 2026. Thème : 'Le sport africain à l'horizon 2030'.",
    responsable: "Non assigné",
    notes: "",
  },
  "006": {
    id: "6",
    code: "006",
    reference: "COC/2026/006",
    objet: "Confirmation participation Jeux Africains",
    expediteur: "COC",
    destinataire: "Comité d'Organisation",
    dateReception: "15/03/2026",
    dateCreation: "10/03/2026",
    sens: "sortant",
    categorie: "Compétitions",
    statut: "traite",
    pdf: "/documents/courrier-006.pdf",
    contenu: "Le COC confirme la participation de la RDC aux 14èmes Jeux Africains prévus à Accra, Ghana, en septembre 2027. Une délégation préliminaire de 150 athlètes dans 18 disciplines est envisagée.",
    responsable: "Direction Technique",
    notes: "Liste définitive à soumettre 6 mois avant l'événement.",
  },
  "007": {
    id: "7",
    code: "007",
    reference: "COC/2026/007",
    objet: "Demande d'équipements sportifs",
    expediteur: "Fédération d'Athlétisme",
    destinataire: "COC",
    dateReception: "12/03/2026",
    dateCreation: "08/03/2026",
    sens: "entrant",
    categorie: "Logistique",
    statut: "en_attente",
    pdf: null,
    contenu: "La Fédération Congolaise d'Athlétisme sollicite l'appui du COC pour l'acquisition d'équipements d'entraînement (starting blocks, haies, disques, javelots) pour la préparation des championnats du monde.",
    responsable: "Commission Logistique",
    notes: "Demande transmise à la Commission Logistique pour évaluation.",
  },
  "008": {
    id: "8",
    code: "008",
    reference: "COC/2026/008",
    objet: "Convocation réunion du Bureau Exécutif",
    expediteur: "COC",
    destinataire: "Membres du Bureau",
    dateReception: "10/03/2026",
    dateCreation: "05/03/2026",
    sens: "sortant",
    categorie: "Institutionnel",
    statut: "traite",
    pdf: "/documents/courrier-008.pdf",
    contenu: "Convocation des membres du Bureau Exécutif à la réunion ordinaire du premier trimestre 2026. Ordre du jour : bilan financier 2025, préparation JO 2028, validation du plan d'action 2026.",
    responsable: "Secrétaire Général",
    notes: "Réunion tenue le 20/03/2026. PV disponible.",
  },
}

export default function CourrierDetailPage() {
  const params = useParams()
  const code = params.code as string
  const courrier = courriersData[code]

  if (!courrier) {
    return (
      <div className="min-h-screen">
        <Header title="Courrier non trouvé" subtitle="" />
        <div className="p-6">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Courrier introuvable</h2>
              <p className="text-muted-foreground mb-4">Le courrier avec le code {code} n&apos;existe pas.</p>
              <Link href="/dashboard/courriers">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la liste
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statutConfig = {
    traite: { label: "Traité", className: "bg-coc-green/10 text-coc-green" },
    en_attente: { label: "En attente", className: "bg-chart-2/10 text-chart-2" },
    non_traite: { label: "Non traité", className: "bg-destructive/10 text-destructive" },
  }

  return (
    <div className="min-h-screen">
      <Header 
        title={`Courrier #${courrier.code}`}
        subtitle={courrier.reference}
      />
      
      <div className="p-6 space-y-6">
        {/* Navigation et Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Link href="/dashboard/courriers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-full p-2",
                        courrier.sens === "entrant"
                          ? "bg-coc-green/10 text-coc-green"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {courrier.sens === "entrant" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {courrier.sens === "entrant" ? "Courrier entrant" : "Courrier sortant"}
                      </p>
                      <CardTitle className="text-xl">{courrier.objet}</CardTitle>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={cn("shrink-0", statutConfig[courrier.statut].className)}
                  >
                    {statutConfig[courrier.statut].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Métadonnées */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {courrier.sens === "entrant" ? "Expéditeur" : "Destinataire"}
                      </p>
                      <p className="font-medium">
                        {courrier.sens === "entrant" ? courrier.expediteur : courrier.destinataire}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {courrier.sens === "entrant" ? "Destinataire" : "Expéditeur"}
                      </p>
                      <p className="font-medium">
                        {courrier.sens === "entrant" ? courrier.destinataire : courrier.expediteur}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date de réception</p>
                      <p className="font-medium">{courrier.dateReception}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Catégorie</p>
                      <Badge variant="outline">{courrier.categorie}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contenu */}
                <div>
                  <h3 className="font-semibold mb-3">Contenu du courrier</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-muted-foreground leading-relaxed">{courrier.contenu}</p>
                  </div>
                </div>

                {/* Notes */}
                {courrier.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Notes et suivi</h3>
                      <div className="bg-chart-2/5 border border-chart-2/20 rounded-lg p-4">
                        <p className="text-muted-foreground">{courrier.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Document PDF */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courrier.pdf ? (
                  <div className="space-y-3">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-center">
                      <FileText className="h-12 w-12 mx-auto text-destructive mb-2" />
                      <p className="text-sm font-medium">courrier-{courrier.code}.pdf</p>
                      <p className="text-xs text-muted-foreground">PDF attaché</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <a href={courrier.pdf} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir
                        </a>
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                    <Link href={`/dashboard/courriers/${courrier.code}/lier-pdf`} className="block">
                      <Button variant="outline" className="w-full">
                        <Link2 className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-muted/50 border border-dashed border-border rounded-lg p-6 text-center">
                      <Link2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Aucun PDF attaché</p>
                      <p className="text-xs text-muted-foreground">Liez un document PDF à ce courrier</p>
                    </div>
                    <Link href={`/dashboard/courriers/${courrier.code}/lier-pdf`} className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Link2 className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations complémentaires */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Responsable</p>
                  <p className="font-medium text-sm">{courrier.responsable || "Non assigné"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Référence complète</p>
                  <p className="font-mono text-sm">{courrier.reference}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
