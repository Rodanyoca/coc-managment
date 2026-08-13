import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Medal, Stethoscope, Scale, UserCog } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    title: "Athlètes",
    description: "Gestion des athlètes enregistrés",
    count: 245,
    icon: Medal,
    href: "/dashboard/acteurs/athletes",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    title: "Officiels",
    description: "Officiels COC et du mouvement sportif",
    count: 38,
    icon: UserCog,
    href: "/dashboard/acteurs/officiels",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    title: "Entraîneurs",
    description: "Coachs et préparateurs",
    count: 42,
    icon: Users,
    href: "/dashboard/acteurs/entraineurs",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    title: "Médecins",
    description: "Personnel médical sportif",
    count: 15,
    icon: Stethoscope,
    href: "/dashboard/acteurs/medecins",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    title: "Arbitres",
    description: "Arbitres et juges officiels",
    count: 28,
    icon: Scale,
    href: "/dashboard/acteurs/arbitres",
    color: "bg-chart-5/10 text-chart-5",
  },
]

export default function ActeursPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Acteurs" 
        subtitle="Gestion des acteurs du mouvement olympique"
      />
      
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.title} href={category.href}>
              <Card className="border-border/50 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-3 ${category.color}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold">{category.count}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-1">{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
