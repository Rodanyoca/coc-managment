import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  title: string
  description: string
  time: string
  type: "courrier" | "acteur" | "competition" | "document" | "patrimoine"
}

const activities: Activity[] = [
  {
    id: "1",
    title: "Nouveau courrier reçu",
    description: "Lettre du CIO - Convocation AG 2026",
    time: "Il y a 2 heures",
    type: "courrier",
  },
  {
    id: "2",
    title: "Athlète ajouté",
    description: "Jean-Pierre Makala - Athlétisme",
    time: "Il y a 4 heures",
    type: "acteur",
  },
  {
    id: "3",
    title: "Compétition mise à jour",
    description: "Jeux Africains 2027 - Dates confirmées",
    time: "Hier",
    type: "competition",
  },
  {
    id: "4",
    title: "Document archivé",
    description: "Rapport annuel 2025 - PDF",
    time: "Il y a 2 jours",
    type: "document",
  },
  {
    id: "5",
    title: "Patrimoine ajouté",
    description: "Véhicule Toyota Land Cruiser",
    time: "Il y a 3 jours",
    type: "patrimoine",
  },
]

const typeColors = {
  courrier: "bg-chart-1/10 text-chart-1",
  acteur: "bg-chart-2/10 text-chart-2",
  competition: "bg-chart-3/10 text-chart-3",
  document: "bg-chart-4/10 text-chart-4",
  patrimoine: "bg-chart-5/10 text-chart-5",
}

const typeLabels = {
  courrier: "Courrier",
  acteur: "Acteur",
  competition: "Compétition",
  document: "Document",
  patrimoine: "Patrimoine",
}

export function RecentActivity() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Activités récentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] px-1.5 py-0", typeColors[activity.type])}
                >
                  {typeLabels[activity.type]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground/70">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
