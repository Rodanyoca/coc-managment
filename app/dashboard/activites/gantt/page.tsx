"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface Activite {
  id: string
  titre: string
  dateDebut: Date
  dateFin: Date
  statut: "planifie" | "en_cours" | "termine" | "annule"
  responsable: string
  couleur: string
}

const activites: Activite[] = [
  {
    id: "1",
    titre: "Assemblée Générale Ordinaire",
    dateDebut: new Date(2026, 3, 15),
    dateFin: new Date(2026, 3, 15),
    statut: "planifie",
    responsable: "Secrétariat Général",
    couleur: "bg-chart-1",
  },
  {
    id: "2",
    titre: "Formation des entraîneurs - Module 1",
    dateDebut: new Date(2026, 4, 10),
    dateFin: new Date(2026, 4, 14),
    statut: "planifie",
    responsable: "Commission Technique",
    couleur: "bg-chart-2",
  },
  {
    id: "3",
    titre: "Séminaire Anti-dopage",
    dateDebut: new Date(2026, 2, 20),
    dateFin: new Date(2026, 2, 22),
    statut: "en_cours",
    responsable: "Commission Médicale",
    couleur: "bg-chart-3",
  },
  {
    id: "4",
    titre: "Réunion Commission des Athlètes",
    dateDebut: new Date(2026, 2, 5),
    dateFin: new Date(2026, 2, 5),
    statut: "termine",
    responsable: "Commission des Athlètes",
    couleur: "bg-chart-4",
  },
  {
    id: "5",
    titre: "Journée Olympique 2026",
    dateDebut: new Date(2026, 5, 23),
    dateFin: new Date(2026, 5, 23),
    statut: "planifie",
    responsable: "Direction Générale",
    couleur: "bg-primary",
  },
  {
    id: "6",
    titre: "Audit financier annuel",
    dateDebut: new Date(2026, 1, 1),
    dateFin: new Date(2026, 1, 28),
    statut: "termine",
    responsable: "Direction Financière",
    couleur: "bg-chart-5",
  },
  {
    id: "7",
    titre: "Préparation Jeux Africains",
    dateDebut: new Date(2026, 3, 1),
    dateFin: new Date(2026, 5, 30),
    statut: "en_cours",
    responsable: "Direction Technique",
    couleur: "bg-coc-green",
  },
  {
    id: "8",
    titre: "Stage de préparation - Athlétisme",
    dateDebut: new Date(2026, 4, 1),
    dateFin: new Date(2026, 4, 31),
    statut: "planifie",
    responsable: "Fédération Athlétisme",
    couleur: "bg-chart-1",
  },
]

const moisNoms = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"
]

const statutConfig = {
  planifie: { label: "Planifié", className: "bg-chart-1/20 text-chart-1 border-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/20 text-chart-2 border-chart-2" },
  termine: { label: "Terminé", className: "bg-coc-green/20 text-coc-green border-coc-green" },
  annule: { label: "Annulé", className: "bg-destructive/20 text-destructive border-destructive" },
}

export default function GanttPage() {
  const [annee, setAnnee] = useState(2026)
  const [trimestre, setTrimestre] = useState("all")

  // Calcul des mois à afficher
  const moisAffiches = useMemo(() => {
    if (trimestre === "all") {
      return Array.from({ length: 12 }, (_, i) => i)
    }
    const t = parseInt(trimestre)
    return [(t - 1) * 3, (t - 1) * 3 + 1, (t - 1) * 3 + 2]
  }, [trimestre])

  // Calcul des jours dans chaque mois
  const joursParMois = useMemo(() => {
    return moisAffiches.map(mois => new Date(annee, mois + 1, 0).getDate())
  }, [moisAffiches, annee])

  const totalJours = joursParMois.reduce((a, b) => a + b, 0)

  // Filtrer les activités pour l'année sélectionnée
  const activitesFiltrees = useMemo(() => {
    return activites.filter(a => {
      const debutAnnee = a.dateDebut.getFullYear()
      const finAnnee = a.dateFin.getFullYear()
      return debutAnnee === annee || finAnnee === annee
    }).sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime())
  }, [annee])

  // Calculer la position et la largeur d'une barre
  const calculerBarre = (activite: Activite) => {
    const premierJourAffiche = new Date(annee, moisAffiches[0], 1)
    const dernierJourAffiche = new Date(annee, moisAffiches[moisAffiches.length - 1] + 1, 0)
    
    const debut = new Date(Math.max(activite.dateDebut.getTime(), premierJourAffiche.getTime()))
    const fin = new Date(Math.min(activite.dateFin.getTime(), dernierJourAffiche.getTime()))
    
    if (fin < premierJourAffiche || debut > dernierJourAffiche) {
      return null
    }

    // Calculer le nombre de jours depuis le premier jour affiché
    let joursAvant = 0
    for (let i = 0; i < moisAffiches.length; i++) {
      const mois = moisAffiches[i]
      if (mois < debut.getMonth()) {
        joursAvant += joursParMois[i]
      } else if (mois === debut.getMonth()) {
        joursAvant += debut.getDate() - 1
        break
      }
    }

    // Calculer la durée en jours
    const dureeMs = fin.getTime() - debut.getTime()
    const dureeJours = Math.max(1, Math.ceil(dureeMs / (1000 * 60 * 60 * 24)) + 1)

    const left = (joursAvant / totalJours) * 100
    const width = (dureeJours / totalJours) * 100

    return { left: `${left}%`, width: `${Math.max(width, 1)}%` }
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Diagramme de Gantt" 
        subtitle="Vue chronologique des activités"
      />
      
      <div className="p-6 space-y-6">
        {/* Controls */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setAnnee(a => a - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[60px] text-center">{annee}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setAnnee(a => a + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Select value={trimestre} onValueChange={setTrimestre}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Année complète</SelectItem>
                    <SelectItem value="1">T1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">T2 (Avr-Juin)</SelectItem>
                    <SelectItem value="3">T3 (Juil-Sep)</SelectItem>
                    <SelectItem value="4">T4 (Oct-Déc)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Légende */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(statutConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full border", config.className)} />
              <span className="text-sm text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Gantt Chart */}
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header - Mois */}
                <div className="flex border-b border-border bg-muted/30">
                  <div className="w-64 shrink-0 p-3 border-r border-border font-medium text-sm">
                    Activité
                  </div>
                  <div className="flex-1 flex">
                    {moisAffiches.map((mois, idx) => (
                      <div 
                        key={mois}
                        className="flex-1 p-2 text-center text-sm font-medium border-r border-border last:border-r-0"
                        style={{ minWidth: `${100 / moisAffiches.length}%` }}
                      >
                        {moisNoms[mois]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rows */}
                {activitesFiltrees.map((activite, index) => {
                  const barre = calculerBarre(activite)
                  
                  return (
                    <div 
                      key={activite.id}
                      className={cn(
                        "flex border-b border-border hover:bg-muted/20 transition-colors",
                        index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      )}
                    >
                      <div className="w-64 shrink-0 p-3 border-r border-border">
                        <div className="flex items-start gap-2">
                          <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", activite.couleur)} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{activite.titre}</p>
                            <p className="text-xs text-muted-foreground truncate">{activite.responsable}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {moisAffiches.map((mois) => (
                            <div 
                              key={mois}
                              className="flex-1 border-r border-border/30 last:border-r-0"
                            />
                          ))}
                        </div>
                        
                        {/* Bar */}
                        {barre && (
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 h-7 flex items-center"
                            style={{ left: barre.left, width: barre.width }}
                          >
                            <div 
                              className={cn(
                                "w-full h-full rounded-md flex items-center px-2 text-xs text-white font-medium truncate shadow-sm",
                                activite.couleur
                              )}
                            >
                              {activite.titre}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {activitesFiltrees.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Aucune activité pour cette période
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activitesFiltrees.length}</p>
                  <p className="text-sm text-muted-foreground">Activités affichées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-chart-2/10 text-chart-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {activitesFiltrees.filter(a => a.statut === "en_cours").length}
                  </p>
                  <p className="text-sm text-muted-foreground">En cours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-coc-green/10 text-coc-green">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {activitesFiltrees.filter(a => a.statut === "termine").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Terminées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
