"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export type GanttActivite = {
  id: string
  titre: string
  annee?: string
  dateDebut: string
  dateFin: string
  statut: "planifie" | "en_cours" | "termine" | "annule"
  responsable: string
  couleur: string
}

const moisNoms = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
]

const statutConfig = {
  planifie: { label: "Planifié", className: "bg-chart-1/20 text-chart-1 border-chart-1" },
  en_cours: { label: "En cours", className: "bg-chart-2/20 text-chart-2 border-chart-2" },
  termine: { label: "Terminé", className: "bg-coc-green/20 text-coc-green border-coc-green" },
  annule: { label: "Annulé", className: "bg-destructive/20 text-destructive border-destructive" },
}

function parseDate(value: string): Date | null {
  const v = String(value ?? "").trim()
  if (!v) return null

  // Google Sheets sometimes returns dates as a serial number (days since 1899-12-30)
  // or a numeric string depending on formatting.
  if (/^\d+(?:\.\d+)?$/.test(v)) {
    const n = Number(v)
    if (Number.isFinite(n) && n > 0) {
      const ms = Math.round((n - 25569) * 86400 * 1000)
      const d = new Date(ms)
      if (!Number.isNaN(d.getTime())) return d
    }
  }

  // Try ISO / native parsing first
  const native = new Date(v)
  if (!Number.isNaN(native.getTime())) return native

  // Try dd/mm/yyyy or dd/mm/yy (optionally followed by time)
  const m = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})(?:\s+.*)?$/)
  if (m) {
    const day = Number.parseInt(m[1], 10)
    const month = Number.parseInt(m[2], 10) - 1
    const yearRaw = Number.parseInt(m[3], 10)
    const year = m[3].length === 2 ? 2000 + yearRaw : yearRaw
    const d = new Date(year, month, day)
    if (!Number.isNaN(d.getTime())) return d
  }

  return null
}

export default function GanttClient(props: { activites: GanttActivite[] }) {
  const activites = props.activites ?? []

  const anneesDisponibles = useMemo(() => {
    const set = new Set<string>()
    for (const a of activites) {
      const y = String(a.annee ?? "").trim()
      if (y) set.add(y)
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [activites])

  const initialYear = useMemo(() => {
    const current = String(new Date().getFullYear())
    if (anneesDisponibles.includes(current)) return Number.parseInt(current, 10)
    const top = anneesDisponibles[0]
    if (top) return Number.parseInt(top, 10)
    return 2026
  }, [anneesDisponibles])

  const [annee, setAnnee] = useState(initialYear)
  const [trimestre, setTrimestre] = useState("all")

  const moisAffiches = useMemo(() => {
    if (trimestre === "all") {
      return Array.from({ length: 12 }, (_, i) => i)
    }
    const t = Number.parseInt(trimestre, 10)
    return [(t - 1) * 3, (t - 1) * 3 + 1, (t - 1) * 3 + 2]
  }, [trimestre])

  const joursParMois = useMemo(() => {
    return moisAffiches.map((mois) => new Date(annee, mois + 1, 0).getDate())
  }, [moisAffiches, annee])

  const totalJours = joursParMois.reduce((a, b) => a + b, 0)

  const activitesFiltrees = useMemo(() => {
    return activites
      .map((a) => {
        const dateDebut = parseDate(a.dateDebut)
        const dateFin = parseDate(a.dateFin)
        if (!dateDebut || !dateFin) return null
        return { ...a, dateDebut, dateFin }
      })
      .filter((a): a is (GanttActivite & { dateDebut: Date; dateFin: Date }) => Boolean(a))
      .filter((a) => {
        const y = String(a.annee ?? "").trim()
        if (y) return Number.parseInt(y, 10) === annee

        const debutAnnee = a.dateDebut.getFullYear()
        const finAnnee = a.dateFin.getFullYear()
        return debutAnnee === annee || finAnnee === annee
      })
      .sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime())
  }, [activites, annee])

  const calculerBarre = (activite: { dateDebut: Date; dateFin: Date }) => {
    const premierJourAffiche = new Date(annee, moisAffiches[0], 1)
    const dernierJourAffiche = new Date(annee, moisAffiches[moisAffiches.length - 1] + 1, 0)

    const debut = new Date(Math.max(activite.dateDebut.getTime(), premierJourAffiche.getTime()))
    const fin = new Date(Math.min(activite.dateFin.getTime(), dernierJourAffiche.getTime()))

    if (fin < premierJourAffiche || debut > dernierJourAffiche) {
      return null
    }

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

    const dureeMs = fin.getTime() - debut.getTime()
    const dureeJours = Math.max(1, Math.ceil(dureeMs / (1000 * 60 * 60 * 24)) + 1)

    const left = (joursAvant / totalJours) * 100
    const width = (dureeJours / totalJours) * 100

    return { left: `${left}%`, width: `${Math.max(width, 1)}%` }
  }

  return (
    <div className="min-h-screen">
      <Header title="Diagramme de Gantt" subtitle="Vue chronologique des activités" />

      <div className="p-6 space-y-6">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setAnnee((a) => a - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[60px] text-center">{annee}</span>
                <Button variant="outline" size="icon" onClick={() => setAnnee((a) => a + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {anneesDisponibles.length > 0 && (
                  <Select value={String(annee)} onValueChange={(v) => setAnnee(Number.parseInt(v, 10))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      {anneesDisponibles.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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

        <div className="flex flex-wrap gap-4">
          {Object.entries(statutConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full border", config.className)} />
              <span className="text-sm text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="flex border-b border-border bg-muted/30">
                  <div className="w-64 shrink-0 p-3 border-r border-border font-medium text-sm">Activité</div>
                  <div className="flex-1 flex">
                    {moisAffiches.map((mois) => (
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
                        <div className="absolute inset-0 flex">
                          {moisAffiches.map((mois) => (
                            <div key={mois} className="flex-1 border-r border-border/30 last:border-r-0" />
                          ))}
                        </div>

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
                  <div className="p-8 text-center text-muted-foreground">Aucune activité pour cette période</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
                    {activitesFiltrees.filter((a) => a.statut === "en_cours").length}
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
                    {activitesFiltrees.filter((a) => a.statut === "termine").length}
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
