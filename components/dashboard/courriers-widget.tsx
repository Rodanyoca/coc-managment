"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Courrier {
  id: string
  reference: string
  objet: string
  date: string
  sens: "entrant" | "sortant"
  categorie: string
}

const courriers: Courrier[] = [
  {
    id: "1",
    reference: "COC/2026/001",
    objet: "Convocation Assemblée Générale CIO",
    date: "28 Mars 2026",
    sens: "entrant",
    categorie: "Institutionnel",
  },
  {
    id: "2",
    reference: "COC/2026/002",
    objet: "Demande de subvention - Ministère des Sports",
    date: "25 Mars 2026",
    sens: "sortant",
    categorie: "Financier",
  },
  {
    id: "3",
    reference: "COC/2026/003",
    objet: "Accréditation Jeux Olympiques 2028",
    date: "22 Mars 2026",
    sens: "entrant",
    categorie: "Compétitions",
  },
  {
    id: "4",
    reference: "COC/2026/004",
    objet: "Rapport mission Lausanne",
    date: "20 Mars 2026",
    sens: "sortant",
    categorie: "Rapport",
  },
]

export function CourriersWidget() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Courriers récents</CardTitle>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="h-3 w-3 text-coc-green" />
              12 reçus
            </span>
            <span className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-primary" />
              8 expédiés
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courriers.map((courrier) => (
            <div
              key={courrier.id}
              className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
            >
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1.5",
                  courrier.sens === "entrant"
                    ? "bg-coc-green/10 text-coc-green"
                    : "bg-primary/10 text-primary"
                )}
              >
                {courrier.sens === "entrant" ? (
                  <ArrowDownLeft className="h-3 w-3" />
                ) : (
                  <ArrowUpRight className="h-3 w-3" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {courrier.reference}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {courrier.categorie}
                  </Badge>
                </div>
                <p className="text-sm font-medium truncate">{courrier.objet}</p>
                <p className="text-xs text-muted-foreground">{courrier.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
