import { Header } from "@/components/dashboard/header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { ActorsChart } from "@/components/dashboard/actors-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getSheetRows } from "@/lib/google/sheets"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  User,
  UserRound,
  Stethoscope,
  UserCog,
  Scale,
  Venus,
  Mars,
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  HardDrive,
  Activity,
} from "lucide-react"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function normalizeGender(value: string): "M" | "F" | null {
  const v = (value || "").trim().toLowerCase()
  if (!v) return null
  if (v === "m" || v === "h" || v === "homme" || v === "masculin" || v === "male") return "M"
  if (v === "f" || v === "femme" || v === "feminin" || v === "féminin" || v === "female") return "F"
  return null
}

function countByGender(rows: Record<string, string>[], idKey: string) {
  let total = 0
  let male = 0
  let female = 0

  for (const r of rows) {
    const id = (r[idKey] || "").trim()
    if (!id) continue
    total += 1

    const g = normalizeGender(r["genre"])
    if (g === "M") male += 1
    if (g === "F") female += 1
  }

  return { total, male, female }
}

export default async function DashboardPage() {
  let loadError: string | null = null
  let athletesRows: Record<string, string>[] = []
  let officielsRows: Record<string, string>[] = []
  let arbitresRows: Record<string, string>[] = []
  let medecinsRows: Record<string, string>[] = []
  let entraineursRows: Record<string, string>[] = []
  let sportsRows: Record<string, string>[] = []

  try {
    ;[
      athletesRows,
      officielsRows,
      arbitresRows,
      medecinsRows,
      entraineursRows,
      sportsRows,
    ] = await Promise.all([
      getSheetRows({ sheetName: "ATHLETES" }),
      getSheetRows({ sheetName: "OFFICIELS" }),
      getSheetRows({ sheetName: "ARBITRES" }),
      getSheetRows({ sheetName: "MEDECINS" }),
      getSheetRows({ sheetName: "COACHS" }),
      getSheetRows({ sheetName: "SPORT" }),
    ])
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e)
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    )
  }

  const acteurs = {
    athletes: countByGender(athletesRows, "id_athlete"),
    officiels: countByGender(officielsRows, "id_officiel"),
    arbitres: countByGender(arbitresRows, "id_arbitre"),
    medecins: countByGender(medecinsRows, "id_medecin"),
    entraineurs: countByGender(entraineursRows, "id_coach"),
  }

  const acteursChartData = [
    { name: "Athletes", value: acteurs.athletes.total, color: "hsl(221, 83%, 53%)" },
    { name: "Entraineurs", value: acteurs.entraineurs.total, color: "hsl(142, 71%, 45%)" },
    { name: "Officiels", value: acteurs.officiels.total, color: "hsl(47, 100%, 50%)" },
    { name: "Medecins", value: acteurs.medecins.total, color: "hsl(262, 83%, 58%)" },
    { name: "Arbitres", value: acteurs.arbitres.total, color: "hsl(0, 84%, 60%)" },
  ]

  const totalActeurs = Object.values(acteurs).reduce((s, v) => s + v.total, 0)
  const totalMale = Object.values(acteurs).reduce((s, v) => s + v.male, 0)
  const totalFemale = Object.values(acteurs).reduce((s, v) => s + v.female, 0)
  const pctFemale = totalActeurs === 0 ? 0 : Math.round((totalFemale / totalActeurs) * 100)
  const pctMale = totalActeurs === 0 ? 0 : Math.round((totalMale / totalActeurs) * 100)

  // Group sports by categorie from the SPORTS sheet
  const sportsByCategorie: Record<string, { sport: string; federation: string }[]> = {}
  for (const r of sportsRows) {
    const id = (r.id_sport || "").trim()
    if (!id) continue
    const nom = (r.nom_sport || "").trim()
    const cat = (r.categorie || "Autres").trim()
    const fed = (r.sigle_federation || r.nom_federation || "").trim()
    if (!sportsByCategorie[cat]) sportsByCategorie[cat] = []
    sportsByCategorie[cat].push({ sport: nom, federation: fed })
  }
  const categorieKeys = Object.keys(sportsByCategorie).sort()
  const totalSports = sportsRows.filter((r) => (r.id_sport || "").trim()).length

  const completude = {
    globale: 74,
    categories: [
      { label: "Identités", value: 82 },
      { label: "Médical", value: 68 },
      { label: "Compétitions", value: 71 },
      { label: "Administratif", value: 76 },
    ],
  }

  const stockage = {
    totalGb: 5,
    usedGb: 3.2,
  }
  const stockagePct = Math.min(100, Math.round((stockage.usedGb / stockage.totalGb) * 100))

  const activites = {
    programmees: 12,
    enCours: 4,
    realisees: 18,
  }

  const competitions = {
    programmees: 3,
    enCours: 1,
    realisees: 4,
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Tableau de bord" 
        subtitle="Vue d'ensemble du Comité Olympique Congolais"
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Identification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KpiCard
                title="Total acteurs"
                value={totalActeurs}
                change="Référentiel global"
                changeType="neutral"
                icon={Users}
                iconColor="bg-chart-1/10 text-chart-1"
              />
              <KpiCard
                title="Athlètes"
                value={acteurs.athletes.total}
                change={`${acteurs.athletes.female} F / ${acteurs.athletes.male} M`}
                changeType="neutral"
                icon={User}
                iconColor="bg-primary/10 text-primary"
              />
              <KpiCard
                title="Officiels"
                value={acteurs.officiels.total}
                change={`${acteurs.officiels.female} F / ${acteurs.officiels.male} M`}
                changeType="neutral"
                icon={UserRound}
                iconColor="bg-chart-3/10 text-chart-3"
              />
              <KpiCard
                title="Arbitres"
                value={acteurs.arbitres.total}
                change={`${acteurs.arbitres.female} F / ${acteurs.arbitres.male} M`}
                changeType="neutral"
                icon={Scale}
                iconColor="bg-destructive/10 text-destructive"
              />
              <KpiCard
                title="Médecins"
                value={acteurs.medecins.total}
                change={`${acteurs.medecins.female} F / ${acteurs.medecins.male} M`}
                changeType="neutral"
                icon={Stethoscope}
                iconColor="bg-chart-2/10 text-chart-2"
              />
              <KpiCard
                title="Entraîneurs"
                value={acteurs.entraineurs.total}
                change={`${acteurs.entraineurs.female} F / ${acteurs.entraineurs.male} M`}
                changeType="neutral"
                icon={UserCog}
                iconColor="bg-chart-4/10 text-chart-4"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">Répartition globale par sexe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border/50 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Féminin</p>
                            <div className="rounded-lg p-2 bg-chart-4/10 text-chart-4">
                              <Venus className="h-4 w-4" />
                            </div>
                          </div>
                          <p className="mt-2 text-2xl font-bold">{totalFemale}</p>
                          <p className="text-xs text-muted-foreground">{pctFemale}% du total</p>
                        </div>
                        <div className="rounded-lg border border-border/50 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Masculin</p>
                            <div className="rounded-lg p-2 bg-chart-1/10 text-chart-1">
                              <Mars className="h-4 w-4" />
                            </div>
                          </div>
                          <p className="mt-2 text-2xl font-bold">{totalMale}</p>
                          <p className="text-xs text-muted-foreground">{pctMale}% du total</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Parité (F)</span>
                          <span>{pctFemale}%</span>
                        </div>
                        <Progress value={pctFemale} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">Détail H/F par catégorie</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Catégorie</TableHead>
                            <TableHead className="text-right">F</TableHead>
                            <TableHead className="text-right">M</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-muted/30">
                            <TableCell className="font-medium">Athlètes</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.athletes.female}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.athletes.male}</TableCell>
                            <TableCell className="text-right font-medium">{acteurs.athletes.total}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-muted/30">
                            <TableCell className="font-medium">Entraîneurs</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.entraineurs.female}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.entraineurs.male}</TableCell>
                            <TableCell className="text-right font-medium">{acteurs.entraineurs.total}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-muted/30">
                            <TableCell className="font-medium">Officiels</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.officiels.female}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.officiels.male}</TableCell>
                            <TableCell className="text-right font-medium">{acteurs.officiels.total}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-muted/30">
                            <TableCell className="font-medium">Arbitres</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.arbitres.female}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.arbitres.male}</TableCell>
                            <TableCell className="text-right font-medium">{acteurs.arbitres.total}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-muted/30">
                            <TableCell className="font-medium">Médecins</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.medecins.female}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{acteurs.medecins.male}</TableCell>
                            <TableCell className="text-right font-medium">{acteurs.medecins.total}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="space-y-6">
                <ActorsChart data={acteursChartData} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {categorieKeys.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun sport référencé.</p>
              )}
              {categorieKeys.map((cat) => (
                <Card key={cat} className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{cat}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Sport</TableHead>
                          <TableHead>Fédération</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sportsByCategorie[cat].map((s, i) => (
                          <TableRow key={`${cat}-${i}`} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{s.sport || "-"}</TableCell>
                            <TableCell className="text-muted-foreground">{s.federation || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KpiCard
                title="Sports"
                value={totalSports}
                change="Référencés"
                changeType="neutral"
                icon={Activity}
                iconColor="bg-chart-2/10 text-chart-2"
              />
              <KpiCard
                title="Catégories"
                value={categorieKeys.length}
                change="Groupes de sports"
                changeType="neutral"
                icon={Trophy}
                iconColor="bg-chart-3/10 text-chart-3"
              />
              <KpiCard
                title="Athlètes"
                value={acteurs.athletes.total}
                change="Tous sports confondus"
                changeType="neutral"
                icon={User}
                iconColor="bg-primary/10 text-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KpiCard
                title="Complétude globale"
                value={`${completude.globale}%`}
                change="Dossiers conformes"
                changeType="neutral"
                icon={FileText}
                iconColor="bg-chart-4/10 text-chart-4"
              />
              <KpiCard
                title="Stockage"
                value={`${stockage.usedGb}GB / ${stockage.totalGb}GB`}
                change={`${stockagePct}% utilisé`}
                changeType={stockagePct > 85 ? "negative" : "neutral"}
                icon={HardDrive}
                iconColor="bg-muted text-muted-foreground"
              />
              <KpiCard
                title="Activités programmées"
                value={activites.programmees}
                change="À venir"
                changeType="neutral"
                icon={Calendar}
                iconColor="bg-chart-1/10 text-chart-1"
              />
              <KpiCard
                title="Activités en cours"
                value={activites.enCours}
                change="En exécution"
                changeType="neutral"
                icon={Clock}
                iconColor="bg-chart-2/10 text-chart-2"
              />
              <KpiCard
                title="Activités réalisées"
                value={activites.realisees}
                change="Clôturées"
                changeType="positive"
                icon={CheckCircle2}
                iconColor="bg-coc-green/10 text-coc-green"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Taux de complétude</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Global</span>
                        <span>{completude.globale}%</span>
                      </div>
                      <Progress value={completude.globale} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {completude.categories.map((c) => (
                        <div key={c.label} className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{c.label}</span>
                            <span>{c.value}%</span>
                          </div>
                          <Progress value={c.value} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">Rapport Activités</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Programmées</p>
                        <p className="text-sm font-medium">{activites.programmees}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">En cours</p>
                        <p className="text-sm font-medium">{activites.enCours}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Réalisées</p>
                        <p className="text-sm font-medium">{activites.realisees}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">Rapport Compétitions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Programmées</p>
                        <p className="text-sm font-medium">{competitions.programmees}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">En cours</p>
                        <p className="text-sm font-medium">{competitions.enCours}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Réalisées</p>
                        <p className="text-sm font-medium">{competitions.realisees}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Stockage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Capacité totale</p>
                      <p className="text-sm font-medium">{stockage.totalGb}GB</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Utilisé</span>
                        <span>{stockage.usedGb}GB</span>
                      </div>
                      <Progress value={stockagePct} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stockagePct > 85 ? "Seuil d'alerte dépassé" : "Niveau normal"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Activités</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">Programmées</p>
                        <p className="font-medium">{activites.programmees}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">En cours</p>
                        <p className="font-medium">{activites.enCours}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">Réalisées</p>
                        <p className="font-medium">{activites.realisees}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Réalisées / Total</span>
                        <span>
                          {Math.round(
                            (activites.realisees /
                              Math.max(1, activites.programmees + activites.enCours + activites.realisees)) *
                              100
                          )}%
                        </span>
                      </div>
                      <Progress
                        value={
                          (activites.realisees /
                            Math.max(1, activites.programmees + activites.enCours + activites.realisees)) *
                          100
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
