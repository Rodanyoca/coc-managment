import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DetailCard({ title, icon: Icon, fields }: {
  title: string
  icon?: LucideIcon
  fields: { label: string; value: string | number | null | undefined }[]
}) {
  return <Card className="min-w-0">
    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg">
      {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" />}{title}
    </CardTitle></CardHeader>
    <CardContent className="space-y-3">{fields.map(field => <div key={field.label} className="flex min-w-0 items-start justify-between gap-3">
      <span className="max-w-[50%] shrink-0 break-words text-sm text-muted-foreground">{field.label}</span>
      <span className="min-w-0 max-w-[70%] whitespace-pre-wrap break-words text-right text-sm font-medium text-foreground">{field.value === null || field.value === undefined || field.value === "" ? "Non renseigné" : field.value}</span>
    </div>)}</CardContent>
  </Card>
}
