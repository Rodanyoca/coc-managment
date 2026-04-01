import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Competition {
  id: string
  nom: string
  lieu: string
  dateDebut: string
  dateFin: string
  statut: "a_venir" | "en_cours" | "termine"
  type: string
}

const competitions: Competition[] = [
  {
    id: "1",
    nom: "Jeux Olympiques Paris 2024",
    lieu: "Paris, France",
    dateDebut: "26 Juil 2024",
    dateFin: "11 Août 2024",
    statut: "termine",
    type: "Olympique",
  },
  {
    id: "2",
    nom: "Championnats d'Afrique d'Athlétisme",
    lieu: "Douala, Cameroun",
    dateDebut: "15 Juin 2026",
    dateFin: "20 Juin 2026",
    statut: "a_venir",
    type: "Continental",
  },
  {
    id: "3",
    nom: "Jeux Africains 2027",
    lieu: "Accra, Ghana",
    dateDebut: "4 Sept 2027",
    dateFin: "18 Sept 2027",
    statut: "a_venir",
    type: "Continental",
  },
]

const statusConfig = {
  a_venir: { label: "À venir", className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Terminé", className: "bg-muted text-muted-foreground" },
}

export function CompetitionsWidget() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Compétitions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitions.map((competition) => (
            <div
              key={competition.id}
              className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm">{competition.nom}</h4>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        statusConfig[competition.statut].className
                      )}
                    >
                      {statusConfig[competition.statut].label}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {competition.lieu}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {competition.dateDebut} - {competition.dateFin}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {competition.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
