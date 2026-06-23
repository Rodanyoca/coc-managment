"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, CheckCircle2, Clock, AlertCircle, User, Flag, MapPin } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type ActiviteDetail = {
  id: string
  titre: string
  description: string
  lieu: string
  dateDebut: string
  dateFin: string
  statut: "planifie" | "en_cours" | "termine" | "annule"
  priorite: "haute" | "moyenne" | "normale"
  responsable: string
}

const statutConfig = {
  planifie: { label: "Planifié", icon: Calendar, className: "bg-chart-1/10 text-chart-1" },
  en_cours: { label: "En cours", icon: Clock, className: "bg-chart-2/10 text-chart-2" },
  termine: { label: "Terminé", icon: CheckCircle2, className: "bg-coc-green/10 text-coc-green" },
  annule: { label: "Annulé", icon: AlertCircle, className: "bg-destructive/10 text-destructive" },
}

const prioriteConfig = {
  haute: { label: "Haute", className: "bg-destructive/10 text-destructive" },
  moyenne: { label: "Moyenne", className: "bg-chart-2/10 text-chart-2" },
  normale: { label: "Normale", className: "bg-muted text-muted-foreground" },
}

export default function ActiviteDetailClient({
  activite,
}: {
  activite: ActiviteDetail
}) {
  const StatutIcon = statutConfig[activite.statut].icon

  return (
    <div className="min-h-screen">
      <Header title={activite.titre} subtitle="Détails de l'activité" />

      <div className="p-6 space-y-6">
        <Link href="/dashboard/activites">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{activite.description || "-"}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Période</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dates</p>
                    <p className="font-medium">
                      {activite.dateDebut === activite.dateFin
                        ? activite.dateDebut
                        : `${activite.dateDebut} - ${activite.dateFin}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lieu</p>
                    <p className="font-medium">{activite.lieu || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Responsable</p>
                    <p className="font-medium text-sm">{activite.responsable || "-"}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Priorité</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", prioriteConfig[activite.priorite].className)}
                  >
                    {prioriteConfig[activite.priorite].label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatutIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Statut</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", statutConfig[activite.statut].className)}
                  >
                    {statutConfig[activite.statut].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
