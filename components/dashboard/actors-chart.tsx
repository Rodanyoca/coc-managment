"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { useEffect, useState } from "react"

const data = [
  { name: "Athletes", value: 245, color: "var(--chart-1)" },
  { name: "Entraineurs", value: 42, color: "var(--chart-2)" },
  { name: "Officiels", value: 38, color: "var(--chart-3)" },
  { name: "Medecins", value: 15, color: "var(--chart-4)" },
  { name: "Arbitres", value: 28, color: "var(--chart-5)" },
]

export function ActorsChart() {
  const [mounted, setMounted] = useState(false)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Repartition des acteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] min-h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Repartition des acteurs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total des acteurs</p>
        </div>
      </CardContent>
    </Card>
  )
}
