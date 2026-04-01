import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Image, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Document {
  id: string
  nom: string
  type: "pdf" | "image"
  module: string
  dateAjout: string
  taille: string
}

const documents: Document[] = [
  {
    id: "1",
    nom: "Rapport_annuel_2025.pdf",
    type: "pdf",
    module: "Courriers",
    dateAjout: "28 Mars 2026",
    taille: "2.4 MB",
  },
  {
    id: "2",
    nom: "Photo_delegation_JO.jpg",
    type: "image",
    module: "Compétitions",
    dateAjout: "25 Mars 2026",
    taille: "1.8 MB",
  },
  {
    id: "3",
    nom: "Passeport_Makala_JP.pdf",
    type: "pdf",
    module: "Acteurs",
    dateAjout: "22 Mars 2026",
    taille: "450 KB",
  },
  {
    id: "4",
    nom: "Statuts_COC_2024.pdf",
    type: "pdf",
    module: "Courriers",
    dateAjout: "20 Mars 2026",
    taille: "1.2 MB",
  },
]

export function DocumentsWidget() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Documents récents</CardTitle>
          <span className="text-xs text-muted-foreground">156 fichiers</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50 group cursor-pointer"
            >
              <div
                className={cn(
                  "rounded-lg p-2",
                  doc.type === "pdf"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-chart-4/10 text-chart-4"
                )}
              >
                {doc.type === "pdf" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.nom}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {doc.module}
                  </Badge>
                  <span>{doc.taille}</span>
                  <span>•</span>
                  <span>{doc.dateAjout}</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
