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

function fieldFillRate(rows: Record<string, string>[], idKey: string): number {
  const validRows = rows.filter((r) => (r[idKey] || "").trim())
  if (validRows.length === 0) return 0

  const allKeys = new Set<string>()
  for (const r of validRows) {
    for (const k of Object.keys(r)) allKeys.add(k)
  }

  const columns = Array.from(allKeys)
  if (columns.length === 0) return 0

  let filled = 0
  const total = validRows.length * columns.length
  for (const r of validRows) {
    for (const col of columns) {
      if ((r[col] || "").trim()) filled++
    }
  }

  return Math.round((filled / total) * 100)
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
    const commonSheets = [
      getSheetRows({ sheetName: "ATHLETES" }),
      getSheetRows({ sheetName: "OFFICIELS" }),
      getSheetRows({ sheetName: "ARBITRES" }),
      getSheetRows({ sheetName: "MEDECINS" }),
      getSheetRows({ sheetName: "COACHS" }),
      getSheetRows({ sheetName: "SPORT" }),
    ]
    const results = await Promise.all(commonSheets)
    ;[
      athletesRows,
      officielsRows,
      arbitresRows,
      medecinsRows,
      entraineursRows,
      sportsRows,
    ] = results
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

  const sportsList = sportsRows
    .filter((r) => (r.id_sport || "").trim())
    .map((r) => ({
      id: (r.id_sport || "").trim(),
      sport: (r.nom_sport || "").trim(),
      federation: (r.sigle_federation || "").trim(),
      type: (r.categorie_federation || "").trim(),
    }))
    .sort((a, b) => a.sport.localeCompare(b.sport, "fr"))
  const totalSports = sportsRows.filter((r) => (r.id_sport || "").trim()).length
  const disciplinesOlympiques = sportsList.filter((s) => {
    const type = s.type.toLowerCase()
    return type.includes("olympique") && !type.includes("non")
  }).length
  const disciplinesNonOlympiques = sportsList.filter((s) => {
    const type = s.type.toLowerCase()
    return type.includes("non") && type.includes("olympique")
  }).length
  const groupementsSportifsNationaux = sportsList.filter((s) =>
    s.type.toLowerCase().includes("groupement")
  ).length
  const completudeActeurs = [
    { label: "Athlètes", value: fieldFillRate(athletesRows, "id_athlete"), total: acteurs.athletes.total },
    { label: "Officiels", value: fieldFillRate(officielsRows, "id_officiel"), total: acteurs.officiels.total },
    { label: "Arbitres", value: fieldFillRate(arbitresRows, "id_arbitre"), total: acteurs.arbitres.total },
    { label: "Médecins", value: fieldFillRate(medecinsRows, "id_medecin"), total: acteurs.medecins.total },
    { label: "Entraîneurs", value: fieldFillRate(entraineursRows, "id_coach"), total: acteurs.entraineurs.total },
  ]
  const completudeGlobaleActeurs =
    completudeActeurs.length === 0
      ? 0
      : Math.round(
          completudeActeurs.reduce((sum, item) => sum + item.value, 0) / completudeActeurs.length
        )
  const performanceKpis = {
    equipesNationales: 8,
    athletesSelectionnes: 64,
    encadreurs: 18,
    participations: 12,
    resultatsEnregistres: 27,
    podiumsMedailles: 9,
  }
  const dernieresPerformances = [
    {
      sport: "Athletisme",
      discipline: "100 m",
      evenement: "Championnats d'Afrique",
      acteur: "Equipe nationale",
      resultat: "Finale",
      classement: "4e",
      date: "2026-05-18",
    },
    {
      sport: "Judo",
      discipline: "-73 kg",
      evenement: "Open international",
      acteur: "Selection COC",
      resultat: "Bronze",
      classement: "3e",
      date: "2026-04-22",
    },
    {
      sport: "Boxe",
      discipline: "Poids moyens",
      evenement: "Tournoi qualificatif",
      acteur: "Equipe nationale",
      resultat: "Quart de finale",
      classement: "5e",
      date: "2026-03-09",
    },
    {
      sport: "Handball",
      discipline: "Senior dames",
      evenement: "Coupe régionale",
      acteur: "Equipe nationale",
      resultat: "Demi-finale",
      classement: "4e",
      date: "2026-02-14",
    },
  ]

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
            <CardTitle className="text-base font-semibold">Complétude des données acteurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Complétude globale</p>
                      <p className="mt-2 text-3xl font-bold">{completudeGlobaleActeurs}%</p>
                    </div>
                    <div className="rounded-lg p-2 bg-chart-4/10 text-chart-4">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Toutes catégories d'acteurs</span>
                      <span>{completudeGlobaleActeurs}%</span>
                    </div>
                    <Progress value={completudeGlobaleActeurs} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                    {completudeActeurs.map((item) => (
                      <div key={item.label} className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-sm font-semibold">{item.value}%</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.total} dossiers</p>
                        </div>
                        <Progress value={item.value} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Cartographie des sports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Code</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Sigle fédération</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Acteurs</TableHead>
                      <TableHead className="text-right">Équipe nationale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sportsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                          Aucun sport référencé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sportsList.map((s) => (
                        <TableRow key={s.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs text-muted-foreground">{s.id || "-"}</TableCell>
                          <TableCell className="font-medium">{s.sport || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{s.federation || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{s.type || "-"}</TableCell>
                          <TableCell className="text-right text-muted-foreground">-</TableCell>
                          <TableCell className="text-right text-muted-foreground">-</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KpiCard
                title="Sports"
                value={totalSports}
                change="Référencés"
                changeType="neutral"
                icon={Activity}
                iconColor="bg-chart-2/10 text-chart-2"
              />
              <KpiCard
                title="Disciplines olympiques"
                value={disciplinesOlympiques}
                change="Total fédérations"
                changeType="neutral"
                icon={Trophy}
                iconColor="bg-chart-3/10 text-chart-3"
              />
              <KpiCard
                title="Disciplines non olympiques"
                value={disciplinesNonOlympiques}
                change="Total fédérations"
                changeType="neutral"
                icon={Calendar}
                iconColor="bg-primary/10 text-primary"
              />
              <KpiCard
                title="Groupements sportifs nationaux"
                value={groupementsSportifsNationaux}
                change="Total groupements"
                changeType="neutral"
                icon={Trophy}
                iconColor="bg-chart-1/10 text-chart-1"
              />
              <KpiCard
                title="Total acteurs"
                value={totalActeurs}
                change="Tous sports confondus"
                changeType="neutral"
                icon={User}
                iconColor="bg-coc-green/10 text-coc-green"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Performance & équipes nationales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KpiCard
                title="Équipes nationales suivies"
                value={performanceKpis.equipesNationales}
                change="Sélections actives"
                changeType="neutral"
                icon={Trophy}
                iconColor="bg-chart-1/10 text-chart-1"
              />
              <KpiCard
                title="Athlètes sélectionnés"
                value={performanceKpis.athletesSelectionnes}
                change="Effectif national"
                changeType="neutral"
                icon={User}
                iconColor="bg-primary/10 text-primary"
              />
              <KpiCard
                title="Encadreurs"
                value={performanceKpis.encadreurs}
                change="Staffs techniques"
                changeType="neutral"
                icon={UserCog}
                iconColor="bg-chart-4/10 text-chart-4"
              />
              <KpiCard
                title="Participations"
                value={performanceKpis.participations}
                change="Compétitions suivies"
                changeType="neutral"
                icon={Calendar}
                iconColor="bg-chart-2/10 text-chart-2"
              />
              <KpiCard
                title="Résultats enregistrés"
                value={performanceKpis.resultatsEnregistres}
                change="Performances saisies"
                changeType="neutral"
                icon={Activity}
                iconColor="bg-chart-3/10 text-chart-3"
              />
              <KpiCard
                title="Podiums / médailles"
                value={performanceKpis.podiumsMedailles}
                change="Résultats majeurs"
                changeType="positive"
                icon={Trophy}
                iconColor="bg-coc-green/10 text-coc-green"
              />
            </div>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Dernières performances enregistrées</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Sport</TableHead>
                      <TableHead>Discipline</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Athlète / Équipe</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead className="text-right">Classement</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dernieresPerformances.map((performance) => (
                      <TableRow key={`${performance.sport}-${performance.discipline}-${performance.date}`} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{performance.sport}</TableCell>
                        <TableCell className="text-muted-foreground">{performance.discipline}</TableCell>
                        <TableCell className="text-muted-foreground">{performance.evenement}</TableCell>
                        <TableCell className="text-muted-foreground">{performance.acteur}</TableCell>
                        <TableCell className="text-muted-foreground">{performance.resultat}</TableCell>
                        <TableCell className="text-right font-medium">{performance.classement}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{performance.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
