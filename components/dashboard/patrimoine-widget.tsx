import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Car, Laptop, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface PatrimoineItem {
  id: string
  categorie: string
  icon: React.ElementType
  nombre: number
  valeur: string
  iconBg: string
}

const patrimoine: PatrimoineItem[] = [
  {
    id: "1",
    categorie: "Immobilier",
    icon: Building2,
    nombre: 2,
    valeur: "450 000 $",
    iconBg: "bg-chart-1/10 text-chart-1",
  },
  {
    id: "2",
    categorie: "Véhicules",
    icon: Car,
    nombre: 5,
    valeur: "125 000 $",
    iconBg: "bg-chart-2/10 text-chart-2",
  },
  {
    id: "3",
    categorie: "Équipements IT",
    icon: Laptop,
    nombre: 24,
    valeur: "35 000 $",
    iconBg: "bg-chart-3/10 text-chart-3",
  },
  {
    id: "4",
    categorie: "Matériel sportif",
    icon: Package,
    nombre: 156,
    valeur: "85 000 $",
    iconBg: "bg-chart-4/10 text-chart-4",
  },
]

export function PatrimoineWidget() {
  const totalValeur = "695 000 $"

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Patrimoine</CardTitle>
          <span className="text-sm font-semibold text-primary">{totalValeur}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {patrimoine.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start gap-3">
                <div className={cn("rounded-lg p-2", item.iconBg)}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {item.categorie}
                  </p>
                  <p className="text-lg font-semibold">{item.nombre}</p>
                  <p className="text-xs text-muted-foreground">{item.valeur}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
