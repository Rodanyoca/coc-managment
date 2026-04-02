import { Header } from "@/components/dashboard/header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { ActorsChart } from "@/components/dashboard/actors-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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

export default function DashboardPage() {
  const acteurs = {
    athletes: { total: 245, male: 160, female: 85 },
    officiels: { total: 38, male: 24, female: 14 },
    arbitres: { total: 28, male: 18, female: 10 },
    medecins: { total: 15, male: 9, female: 6 },
    entraineurs: { total: 42, male: 32, female: 10 },
  }

  const totalActeurs = Object.values(acteurs).reduce((s, v) => s + v.total, 0)
  const totalMale = Object.values(acteurs).reduce((s, v) => s + v.male, 0)
  const totalFemale = Object.values(acteurs).reduce((s, v) => s + v.female, 0)
  const pctFemale = totalActeurs === 0 ? 0 : Math.round((totalFemale / totalActeurs) * 100)
  const pctMale = totalActeurs === 0 ? 0 : Math.round((totalMale / totalActeurs) * 100)

  const sports = {
    collectif: [
      { sport: "Football", athletes: 42, participations: 6, medals: 1 },
      { sport: "Basketball", athletes: 18, participations: 4, medals: 0 },
      { sport: "Volleyball", athletes: 16, participations: 3, medals: 0 },
    ],
    combat: [
      { sport: "Judo", athletes: 26, participations: 8, medals: 2 },
      { sport: "Boxe", athletes: 19, participations: 5, medals: 1 },
      { sport: "Lutte", athletes: 14, participations: 4, medals: 0 },
    ],
    individuel: [
      { sport: "Badminton", athletes: 12, participations: 3, medals: 0 },
      { sport: "Tennis", athletes: 10, participations: 2, medals: 0 },
      { sport: "Tennis de table", athletes: 16, participations: 4, medals: 1 },
    ],
    podium: [
      { sport: "Athlétisme", athletes: 34, participations: 9, medals: 3 },
      { sport: "Natation", athletes: 22, participations: 6, medals: 1 },
    ],
  }

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
                <ActorsChart />
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
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Sports collectifs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Sport</TableHead>
                        <TableHead className="text-right">Athl.</TableHead>
                        <TableHead className="text-right">Part.</TableHead>
                        <TableHead className="text-right">Méd.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sports.collectif.map((s) => (
                        <TableRow key={s.sport} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{s.sport}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.athletes}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.participations}</TableCell>
                          <TableCell className="text-right font-medium">{s.medals}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Sports de combat</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Sport</TableHead>
                        <TableHead className="text-right">Athl.</TableHead>
                        <TableHead className="text-right">Part.</TableHead>
                        <TableHead className="text-right">Méd.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sports.combat.map((s) => (
                        <TableRow key={s.sport} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{s.sport}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.athletes}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.participations}</TableCell>
                          <TableCell className="text-right font-medium">{s.medals}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Sports individuels</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Sport</TableHead>
                        <TableHead className="text-right">Athl.</TableHead>
                        <TableHead className="text-right">Part.</TableHead>
                        <TableHead className="text-right">Méd.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sports.individuel.map((s) => (
                        <TableRow key={s.sport} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{s.sport}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.athletes}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.participations}</TableCell>
                          <TableCell className="text-right font-medium">{s.medals}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Sports de podium</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Sport</TableHead>
                        <TableHead className="text-right">Athl.</TableHead>
                        <TableHead className="text-right">Part.</TableHead>
                        <TableHead className="text-right">Méd.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sports.podium.map((s) => (
                        <TableRow key={s.sport} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{s.sport}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.athletes}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.participations}</TableCell>
                          <TableCell className="text-right font-medium">{s.medals}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Participations"
                value={
                  Object.values(sports)
                    .flat()
                    .reduce((s, v) => s + v.participations, 0)
                }
                change="Total compétitions"
                changeType="neutral"
                icon={Trophy}
                iconColor="bg-chart-3/10 text-chart-3"
              />
              <KpiCard
                title="Médailles"
                value={Object.values(sports).flat().reduce((s, v) => s + v.medals, 0)}
                change="Cumul global"
                changeType="positive"
                icon={Trophy}
                iconColor="bg-coc-green/10 text-coc-green"
              />
              <KpiCard
                title="Athlètes suivis"
                value={Object.values(sports).flat().reduce((s, v) => s + v.athletes, 0)}
                change="Dans les sports listés"
                changeType="neutral"
                icon={User}
                iconColor="bg-primary/10 text-primary"
              />
              <KpiCard
                title="Sports"
                value={Object.values(sports).flat().length}
                change="Référencés"
                changeType="neutral"
                icon={Activity}
                iconColor="bg-chart-2/10 text-chart-2"
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
